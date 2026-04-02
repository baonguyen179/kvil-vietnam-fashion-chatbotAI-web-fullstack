const db = require('../models/index');
const errorCode = require('../config/errorCodes');

const redisHelper = require('../helpers/redis.helper');
const ORDER_CACHE_TTL = process.env.ORDER_CACHE_TTL || 1800; // 30 phút

const createOrder = async (userId, data) => {
    const t = await db.sequelize.transaction();
    let currentStep = 'Khởi tạo hàm createOrder';
    try {
        const { paymentMethod, couponCode, deliveryMethod } = data;
        let cartItems = [];
        let finalShippingAddress = data.shippingAddress; // Mặc định cho user đã login
        let cartId = null;

        if (userId) {
            // ================= USER ĐÃ LOGIN =================
            currentStep = 'Query Giỏ hàng của User';
            const cart = await db.Cart.findOne({
                where: { userId: userId },
                include: [{ model: db.CartItem, as: 'cartItems' }],
                transaction: t
            });

            if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
                await t.rollback();
                return { EM: 'Giỏ hàng trống, không thể đặt hàng!', EC: errorCode.VALIDATION_ERROR, DT: '' };
            }
            cartItems = cart.cartItems;
            cartId = cart.id;
        } else {
            // ================= KHÁCH VÃNG LAI =================
            currentStep = 'Lấy thông tin từ payload của khách';
            if (!data.items || data.items.length === 0) {
                await t.rollback();
                return { EM: 'Giỏ hàng trống, không thể đặt hàng!', EC: errorCode.VALIDATION_ERROR, DT: '' };
            }
            cartItems = data.items;
            // Tạo địa chỉ giao hàng đầy đủ cho khách
            const { fullName, phone, email } = data.guestInfo;
            finalShippingAddress = `${fullName} - ${phone}\n${email}\n${data.shippingAddress}`;
        }

        let totalBeforeDiscount = 0;
        let orderItemsData = [];

        currentStep = 'Kiểm tra tồn kho và Khóa dòng';
        for (let item of cartItems) {
            const lockedVariant = await db.ProductVariant.findOne({
                where: { id: item.variantId },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!lockedVariant) {
                await t.rollback();
                return { EM: `Sản phẩm (Variant ID: ${item.variantId}) không tồn tại!`, EC: errorCode.NOT_FOUND, DT: '' };
            }

            if (item.quantity > lockedVariant.stock) {
                await t.rollback();
                return {
                    EM: `Sản phẩm '${lockedVariant.sku}' không đủ tồn kho! Chỉ còn ${lockedVariant.stock}.`,
                    EC: errorCode.OUT_OF_STOCK,
                    DT: ''
                };
            }

            const price = lockedVariant.price;
            totalBeforeDiscount += (price * item.quantity);

            orderItemsData.push({
                variantId: item.variantId,
                quantity: item.quantity,
                price: price
            });

            await lockedVariant.decrement('stock', { by: item.quantity, transaction: t });
        }

        let shippingFee = 0;
        if (deliveryMethod === 'home_delivery') {
            shippingFee = totalBeforeDiscount >= 500000 ? 0 : 30000;
        }

        let discountAmount = 0;
        let couponId = null;

        if (couponCode) {
            // Logic xử lý coupon giữ nguyên...
            const coupon = await db.Coupon.findOne({ where: { code: couponCode, isActive: true } });
            if (!coupon) {
                await t.rollback();
                return { EM: 'Mã giảm giá không hợp lệ hoặc đã hết hạn!', EC: errorCode.NOT_FOUND, DT: '' };
            }
            if (totalBeforeDiscount < coupon.minOrderValue) {
                await t.rollback();
                return { EM: `Đơn hàng phải từ ${coupon.minOrderValue}đ mới được áp dụng mã này!`, EC: errorCode.VALIDATION_ERROR, DT: '' };
            }

            if (coupon.discountType === 'fixed') {
                discountAmount = coupon.discountValue;
            } else if (coupon.discountType === 'percent') {
                discountAmount = (totalBeforeDiscount * coupon.discountValue) / 100;
                if (discountAmount > coupon.maxDiscountAmount) {
                    discountAmount = coupon.maxDiscountAmount;
                }
            }
            couponId = coupon.id;
        }

        let finalAmount = totalBeforeDiscount + shippingFee - discountAmount;
        if (finalAmount < 0) finalAmount = 0;

        currentStep = 'Tạo đơn hàng vào bảng Orders';
        const newOrder = await db.Order.create({
            userId: userId, // Sẽ là null nếu là khách
            couponId: couponId,
            totalBeforeDiscount: totalBeforeDiscount,
            shippingFee: shippingFee,
            discountAmount: discountAmount,
            finalAmount: finalAmount,
            paymentMethod: paymentMethod,
            paymentStatus: false,
            shippingAddress: finalShippingAddress,
            deliveryMethod: deliveryMethod,
            status: 'pending'
        }, { transaction: t });

        const itemsToInsert = orderItemsData.map(item => ({
            ...item,
            orderId: newOrder.id
        }));
        currentStep = 'Lưu chi tiết OrderItems';
        await db.OrderItem.bulkCreate(itemsToInsert, { transaction: t });

        if (userId && cartId) {
            currentStep = 'Xóa dữ liệu Giỏ hàng của User';
            await db.CartItem.destroy({
                where: { cartId: cartId },
                transaction: t
            });
        }

        await t.commit();
        //  Xóa toàn bộ Cache liên quan sau khi tạo đơn thành công
        const cacheClearTasks = [
            redisHelper.delByPattern('dashboard:stats:*'), // Xóa cache thống kê như yêu cầu
            redisHelper.delByPattern('order:list:admin:*'), // Admin cần thấy đơn mới
            redisHelper.delByPattern('product:bestsellers:*'), // Bestseller có thể thay đổi
            redisHelper.delByPattern('product:detail:*'), // Tồn kho giảm -> Xóa cache SP
            redisHelper.delByPattern('products:list:*'), // Tồn kho giảm -> Xóa cache danh sách SP
        ];
        if (userId) {
            cacheClearTasks.push(redisHelper.delByPattern(`order:list:user:${userId}:*`));
            cacheClearTasks.push(redisHelper.delCache(`cart:user:${userId}`));
        }
        await Promise.all(cacheClearTasks);

        return { EM: 'Đặt hàng thành công!', EC: errorCode.SUCCESS, DT: newOrder };

    } catch (error) {
        await t.rollback();
        console.error(`\n[CRITICAL ERROR] Lỗi tại createOrder!`);
        console.error(`- User ID: ${userId || 'Guest'}`);
        console.error(`- Input Data:`, data);
        console.error(`- CHẾT TẠI BƯỚC:  ${currentStep} `);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi đặt hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const cancelOrder = async (userId, orderId) => {
    const t = await db.sequelize.transaction();
    let currentStep = 'Khởi tạo hàm cancelOrder';

    try {
        currentStep = 'Tìm đơn hàng & Check IDOR';
        const order = await db.Order.findOne({
            where: { id: orderId, userId: userId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!order) {
            await t.rollback();
            return {
                EM: 'Đơn hàng không tồn tại hoặc không thuộc về bạn!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        currentStep = 'Kiểm tra trạng thái được phép hủy';
        if (order.status !== 'pending') {
            await t.rollback();
            return {
                EM: `Không thể hủy! Đơn hàng đang ở trạng thái: ${order.status}`,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        currentStep = 'Đổi trạng thái thành cancelled (Soft Delete)';
        await order.update({ status: 'cancelled' }, { transaction: t });

        currentStep = 'Lấy chi tiết các món hàng trong đơn';
        const orderItems = await db.OrderItem.findAll({
            where: { orderId: orderId },
            transaction: t
        });

        currentStep = 'Hoàn trả tồn kho (Restock)';
        for (let item of orderItems) {
            const variant = await db.ProductVariant.findOne({
                where: { id: item.variantId },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (variant) {
                await variant.increment('stock', { by: item.quantity, transaction: t });
            }
        }

        currentStep = 'Hoàn trả lượt dùng của Mã giảm giá (Nếu có)';
        if (order.couponId) {
            const coupon = await db.Coupon.findOne({
                where: { id: order.couponId },
                transaction: t,
                lock: t.LOCK.UPDATE
            });
            if (coupon && coupon.usedCount > 0) {
                await coupon.decrement('usedCount', { by: 1, transaction: t });
            }
        }

        await t.commit();
        await Promise.all([
            redisHelper.delByPattern('dashboard:stats:*'),
            redisHelper.delByPattern('order:list:admin:*'),
            redisHelper.delByPattern(`order:list:user:${userId}:*`),
            redisHelper.delCache(`order:detail:user:${userId}:${orderId}`), // Xóa cache chi tiết đơn này
            redisHelper.delByPattern('product:bestsellers:*'),
            redisHelper.delByPattern('product:detail:*'), // Tồn kho tăng lại
            redisHelper.delByPattern('products:list:*')
        ]);
        return {
            EM: 'Đã hủy đơn hàng thành công!',
            EC: errorCode.SUCCESS,
            DT: ''
        };
    } catch (error) {
        await t.rollback();
        console.error(`\n[CRITICAL ERROR] Lỗi tại cancelOrder!`);
        console.error(`- User ID: ${userId} | Order ID: ${orderId}`);
        console.error(`- CHẾT TẠI BƯỚC:  ${currentStep} `);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);

        return { EM: 'Lỗi server khi hủy đơn hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const getUserOrders = async (userId, queryParams) => {
    let currentStep = 'Khởi tạo getUserOrders';
    try {
        currentStep = 'Xử lý tham số phân trang & trạng thái';

        const cacheKey = `order:list:user:${userId}:${JSON.stringify(queryParams)}`;
        const cachedData = await redisHelper.getCache(cacheKey);
        if (cachedData)
            return {
                EM: 'Lấy danh sách đơn hàng (Cache) thành công!',
                EC: errorCode.SUCCESS,
                DT: cachedData
            };

        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 10;
        const offset = (page - 1) * limit;
        const status = queryParams.status;

        currentStep = 'Xây dựng điều kiện Query (Chống IDOR)';
        let whereCondition = { userId: userId };
        if (status) {
            whereCondition.status = status;
        }

        currentStep = 'Query DB lấy danh sách Orders';
        const { count, rows } = await db.Order.findAndCountAll({
            where: whereCondition,
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            attributes: { exclude: ['updatedAt'] }
        });

        const totalPages = Math.ceil(count / limit);
        const result = {
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            orders: rows
        };

        await redisHelper.setCache(cacheKey, result, ORDER_CACHE_TTL);

        return {
            EM: 'Lấy danh sách đơn hàng thành công!',
            EC: errorCode.SUCCESS,
            DT: result
        };
    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại getUserOrders!`);
        console.error(`- User ID: ${userId}`);
        console.error(`- CHẾT TẠI BƯỚC:  ${currentStep} `);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi lấy danh sách đơn hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const getUserOrderDetail = async (userId, orderId) => {
    let currentStep = 'Khởi tạo getUserOrderDetail';
    try {
        const cacheKey = `order:detail:user:${userId}:${orderId}`;
        const cachedData = await redisHelper.getCache(cacheKey);
        if (cachedData) return {
            EM: 'Lấy chi tiết đơn hàng (Cache) thành công!',
            EC: errorCode.SUCCESS,
            DT: cachedData
        };
        currentStep = 'Query lấy chi tiết Order và chắt lọc các cột cần thiết';
        const order = await db.Order.findOne({
            where: { id: orderId, userId: userId },
            attributes: ['id', 'status', 'finalAmount', 'paymentMethod', 'createdAt'],
            include: [
                {
                    model: db.OrderItem,
                    as: 'orderItems',
                    attributes: ['quantity', 'price'], // Giá gốc lúc mua và số lượng
                    include: [
                        {
                            model: db.ProductVariant,
                            as: 'variant',
                            attributes: ['size', 'color'], // Chỉ lấy size và màu
                            include: [
                                {
                                    model: db.Product,
                                    as: 'product',
                                    attributes: ['id', 'name'], // Chỉ lấy tên sản phẩm
                                    include: [
                                        {
                                            model: db.ProductImage,
                                            as: 'images', // Nối sang bảng ảnh
                                            where: { isMain: true }, // Chỉ lấy ảnh đại diện
                                            attributes: ['imageUrl'], // Chỉ lấy link ảnh
                                            required: false // Lỡ SP chưa có ảnh thì không bị lỗi mất đơn hàng
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!order) {
            return { EM: 'Đơn hàng không tồn tại hoặc bạn không có quyền xem!', EC: errorCode.NOT_FOUND, DT: '' };
        }
        console.log(">>> SOI DATA RAW:", JSON.stringify(order, null, 2));
        currentStep = 'Data Shaping (Định dạng lại JSON cho Frontend dễ đọc)';
        // Gọt đẽo lại cấu trúc JSON
        const formattedData = {
            orderId: order.id,
            status: order.status,
            finalAmount: order.finalAmount,
            paymentMethod: order.paymentMethod,
            orderDate: order.createdAt,
            // Lặp qua các món hàng để làm phẳng (flatten) dữ liệu
            items: order.orderItems.map(item => {
                // Check an toàn lỡ sản phẩm chưa up ảnh
                let mainImage = '';
                if (item.variant.product.images && item.variant.product.images.length > 0) {
                    mainImage = item.variant.product.images[0].imageUrl;
                }

                return {
                    productName: item.variant.product.name,
                    size: item.variant.size,
                    color: item.variant.color,
                    quantity: item.quantity,
                    originalPrice: item.price,
                    imageUrl: mainImage // Trả về 1 link ảnh duy nhất
                };
            })
        };

        // LƯU CACHE
        await redisHelper.setCache(cacheKey, formattedData, ORDER_CACHE_TTL);
        return { EM: 'Lấy chi tiết đơn hàng thành công!', EC: errorCode.SUCCESS, DT: formattedData };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại getUserOrderDetail!`);
        console.error(`- User ID: ${userId} | Order ID: ${orderId}`);
        console.error(`- CHẾT TẠI BƯỚC:  ${currentStep} `);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi lấy chi tiết đơn hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const getAdminOrders = async (queryParams) => {
    let currentStep = 'Khởi tạo getAdminOrders';
    try {
        const cacheKey = `order:list:admin:${JSON.stringify(queryParams)}`;
        const cachedData = await redisHelper.getCache(cacheKey);
        if (cachedData) return {
            EM: 'Lấy danh sách đơn (Cache) thành công!',
            EC: errorCode.SUCCESS,
            DT: cachedData
        };

        currentStep = 'Xử lý tham số phân trang & bộ lọc';
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 10;
        const offset = (page - 1) * limit;

        let whereCondition = {};

        if (queryParams.status) whereCondition.status = queryParams.status;
        if (queryParams.paymentStatus !== undefined && queryParams.paymentStatus !== null && queryParams.paymentStatus !== '') {
            whereCondition.paymentStatus = queryParams.paymentStatus;
        }
        if (queryParams.paymentMethod) whereCondition.paymentMethod = queryParams.paymentMethod;
        if (queryParams.deliveryMethod) whereCondition.deliveryMethod = queryParams.deliveryMethod;

        currentStep = 'Query DB lấy danh sách Orders kèm thông tin User';
        const { count, rows } = await db.Order.findAndCountAll({
            where: whereCondition,
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            attributes: ['id', 'totalBeforeDiscount', 'shippingFee', 'discountAmount', 'finalAmount', 'paymentMethod', 'paymentStatus', 'deliveryMethod', 'status', 'createdAt'],
            include: [
                {
                    model: db.User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'phone', 'email']
                }
            ]
        });

        currentStep = 'Tính toán phân trang';
        const totalPages = Math.ceil(count / limit);
        const result = {
            totalItems: count,
            totalPages: totalPages,
            currentPage: page,
            orders: rows
        };
        await redisHelper.setCache(cacheKey, result, ORDER_CACHE_TTL);
        return {
            EM: 'Lấy danh sách đơn hàng thành công!',
            EC: errorCode.SUCCESS,
            DT: result
        };
    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại getAdminOrders!`);
        console.error(`- Query Params:`, queryParams);
        console.error(`- CHẾT TẠI BƯỚC: ${currentStep}`);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi lấy danh sách đơn hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const updateOrderStatus = async (orderId, newStatus) => {
    const t = await db.sequelize.transaction();
    let currentStep = 'Khởi tạo updateOrderStatus';

    try {
        currentStep = 'Tìm đơn hàng và khóa dòng dữ liệu';
        const order = await db.Order.findOne({
            where: { id: orderId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!order) {
            await t.rollback();
            return { EM: 'Không tìm thấy đơn hàng!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        if (order.status === newStatus) {
            await t.rollback();
            return { EM: 'Trạng thái mới giống hệt trạng thái cũ!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        if (order.status === 'cancelled') {
            await t.rollback();
            return { EM: 'Đơn hàng đã bị hủy, không thể thay đổi trạng thái khác!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        currentStep = 'Kiểm tra kịch bản Admin hủy đơn (Cần Restock)';
        if (newStatus === 'cancelled') {
            await order.update({ status: 'cancelled' }, { transaction: t });

            const orderItems = await db.OrderItem.findAll({ where: { orderId: orderId }, transaction: t });

            currentStep = 'Hoàn trả tồn kho (Restock)';
            for (let item of orderItems) {
                const variant = await db.ProductVariant.findOne({
                    where: { id: item.variantId },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });
                if (variant) {
                    await variant.increment('stock', { by: item.quantity, transaction: t });
                }
            }

            currentStep = 'Hoàn trả lượt mã giảm giá (Nếu có)';
            if (order.couponId) {
                const coupon = await db.Coupon.findOne({ where: { id: order.couponId }, transaction: t, lock: t.LOCK.UPDATE });
                if (coupon && coupon.usedCount > 0) {
                    await coupon.decrement('usedCount', { by: 1, transaction: t });
                }
            }
        } else {
            currentStep = 'Cập nhật trạng thái luân chuyển bình thường';
            await order.update({ status: newStatus }, { transaction: t });
        }

        await t.commit();

        const orderUserId = order.userId;
        const cacheClearTasks = [
            redisHelper.delByPattern('dashboard:stats:*'), // Xóa cache Dashboard
            redisHelper.delByPattern('order:list:admin:*')
        ];

        if (orderUserId) {
            cacheClearTasks.push(redisHelper.delByPattern(`order:list:user:${orderUserId}:*`));
            cacheClearTasks.push(redisHelper.delCache(`order:detail:user:${orderUserId}:${orderId}`));
        }
        // Nếu Admin chuyển sang Hủy -> Cần xóa thêm cache Sản phẩm vì có Restock
        if (newStatus === 'cancelled') {
            cacheClearTasks.push(redisHelper.delByPattern('product:detail:*'));
            cacheClearTasks.push(redisHelper.delByPattern('products:list:*'));
            cacheClearTasks.push(redisHelper.delByPattern('product:bestsellers:*'));
        }

        await Promise.all(cacheClearTasks);
        return { EM: `Cập nhật trạng thái thành ${newStatus} thành công!`, EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        await t.rollback();
        console.error(`\n[CRITICAL ERROR] Lỗi tại updateOrderStatus!`);
        console.error(`- Order ID: ${orderId} | New Status: ${newStatus}`);
        console.error(`- CHẾT TẠI BƯỚC: ${currentStep} `);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi cập nhật trạng thái đơn hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const updatePaymentStatus = async (orderId, paymentStatus) => {
    let currentStep = 'Khởi tạo updatePaymentStatus';
    try {
        currentStep = 'Tìm đơn hàng trong Database';
        const order = await db.Order.findOne({
            where: { id: orderId }
        });

        if (!order) {
            return { EM: 'Không tìm thấy đơn hàng!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        if (order.paymentStatus === paymentStatus) {
            return {
                EM: `Trạng thái thanh toán hiện tại đã là ${paymentStatus}!`,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        currentStep = 'Tiến hành cập nhật paymentStatus';
        await order.update({ paymentStatus: paymentStatus });
        // Xóa cache liên quan
        const orderUserId = order.userId;
        const cacheClearTasks = [
            redisHelper.delByPattern('dashboard:stats:*'), // Xóa cache Dashboard
            redisHelper.delByPattern('order:list:admin:*')
        ];
        if (orderUserId) {
            cacheClearTasks.push(redisHelper.delByPattern(`order:list:user:${orderUserId}:*`));
            cacheClearTasks.push(redisHelper.delCache(`order:detail:user:${orderUserId}:${orderId}`));
        }
        await Promise.all(cacheClearTasks);

        const statusText = paymentStatus ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN';

        return {
            EM: `Đã cập nhật đơn hàng thành: ${statusText}!`,
            EC: errorCode.SUCCESS,
            DT: ''
        };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại updatePaymentStatus!`);
        console.error(`- Order ID: ${orderId} | New Payment Status: ${paymentStatus}`);
        console.error(`- CHẾT TẠI BƯỚC: ${currentStep} `);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi cập nhật trạng thái thanh toán', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const getBestSellerProductIds = async (limit = 5) => {
    try {
        const cacheKey = `product:bestsellers:${limit}`;
        const cached = await redisHelper.getCache(cacheKey);
        if (cached) return cached;

        const result = await db.OrderItem.findAll({
            attributes: [
                [db.sequelize.col("variant.product.id"), "productId"],
                [db.sequelize.fn("SUM", db.sequelize.col("OrderItem.quantity")), "totalSold"]
            ],
            include: [
                {
                    model: db.ProductVariant,
                    as: "variant",
                    attributes: [],
                    include: [
                        {
                            model: db.Product,
                            as: "product",
                            attributes: []
                        }
                    ]
                }
            ],
            group: ["variant.product.id"],
            order: [[db.sequelize.literal("totalSold"), "DESC"]],
            limit: limit,
            raw: true
        });

        const finalResult = result.map(item => item.productId);

        // 🚨 LƯU CACHE
        await redisHelper.setCache(cacheKey, finalResult, ORDER_CACHE_TTL);
        return finalResult;

    } catch (e) {
        console.error("Lỗi getBestSellerProductIds:", e);
        return [];
    }
};
module.exports = {
    createOrder, cancelOrder, getUserOrders, getUserOrderDetail,
    getAdminOrders, updateOrderStatus, updatePaymentStatus, getBestSellerProductIds
};