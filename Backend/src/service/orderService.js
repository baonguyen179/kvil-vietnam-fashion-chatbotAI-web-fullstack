const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const redisHelper = require('../helpers/redis.helper');
const vnpayService = require('./vnpayService'); 
const emailHelper = require('../helpers/email.helper');
const { Op } = require('sequelize');
const ORDER_CACHE_TTL = process.env.ORDER_CACHE_TTL || 1800; // 30 phút



/**
 * Hàm lấy Link thanh toán VNPAY cho đơn hàng sẵn có (Repay)
 * Đảm bảo tính linh hoạt khi đơn cũ chưa được trả tiền
 */
const getVNPayPaymentUrl = async (req, orderId, userId) => {
    try {
        const order = await db.Order.findOne({
            where: { id: orderId, userId: userId }
        });

        if (!order) return { EM: 'Đơn hàng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        if (order.paymentStatus === true) return { EM: 'Đơn hàng này đã được thanh toán rồi!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        if (order.status === 'cancelled') return { EM: 'Đơn hàng đã bị hủy, không thể thanh toán!', EC: errorCode.VALIDATION_ERROR, DT: '' };

        const paymentUrl = vnpayService.generatePaymentUrl(req, order.id, order.finalAmount);
        
        // Ghi lại log PENDING để theo dõi phiên thanh toán
        await db.PaymentTransaction.create({
            orderId: order.id,
            provider: 'VNPAY',
            transactionId: 'INITIATED',
            amount: order.finalAmount,
            status: 'PENDING'
        });

        return { EM: 'Tạo link thanh toán thành công!', EC: errorCode.SUCCESS, DT: paymentUrl };
    } catch (error) {
        console.error(">>> Lỗi getVNPayPaymentUrl:", error);
        return { EM: 'Lỗi server khi tạo link thanh toán', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

/**
 * [SENIOR FEATURE] Lấy Link thanh toán cho khách vãng lai (Security: ID + Phone)
 * Giải quyết bài toán khách vãng lai lỡ tắt browser muốn trả tiền lại
 */
const getGuestVNPayPaymentUrl = async (req, orderId, phone) => {
    try {
        const order = await db.Order.findOne({
            where: { id: orderId }
        });

        if (!order) return { EM: 'Đơn hàng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        
        // Bảo mật: Nếu đơn hàng thuộc về một User đã login, yêu cầu dùng luồng login
        if (order.userId) return { EM: 'Đơn hàng này yêu cầu đăng nhập để thanh toán!', EC: errorCode.VALIDATION_ERROR, DT: '' };

        if (order.paymentStatus === true) return { EM: 'Đơn hàng này đã được thanh toán rồi!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        if (order.status === 'cancelled') return { EM: 'Đơn hàng đã bị hủy, không thể thanh toán!', EC: errorCode.VALIDATION_ERROR, DT: '' };

        // Kiểm tra khớp số điện thoại trong shippingAddress (Guest phone nằm trong chuỗi này)
        if (!order.shippingAddress.includes(phone)) {
            return { EM: 'Thông tin xác thực (Số điện thoại) không chính xác!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        const paymentUrl = vnpayService.generatePaymentUrl(req, order.id, order.finalAmount);
        
        // Ghi lại log PENDING
        await db.PaymentTransaction.create({
            orderId: order.id,
            provider: 'VNPAY',
            transactionId: 'GUEST_INITIATED',
            amount: order.finalAmount,
            status: 'PENDING'
        });

        return { EM: 'Tạo link thanh toán thành công!', EC: errorCode.SUCCESS, DT: paymentUrl };
    } catch (error) {
        console.error(">>> Lỗi getGuestVNPayPaymentUrl:", error);
        return { EM: 'Lỗi server khi tạo link thanh toán cho khách', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

/**
 * [SENIOR FEATURE] Lấy chi tiết đơn hàng cho khách vãng lai (Xác thực ID + Phone)
 */
const getGuestOrderDetail = async (orderId, phone) => {
    try {
        const order = await db.Order.findOne({
            where: { id: orderId },
            attributes: ['id', 'status', 'finalAmount', 'paymentMethod', 'paymentStatus', 'shippingAddress', 'createdAt']
        });

        if (!order) return { EM: 'Đơn hàng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        
        // Bảo mật: Nếu đơn hàng thuộc về một User đã login, yêu cầu dùng luồng login
        if (order.userId) return { EM: 'Đơn hàng này yêu cầu đăng nhập để xem chi tiết!', EC: errorCode.VALIDATION_ERROR, DT: '' };

        // Kiểm tra khớp số điện thoại trong shippingAddress
        if (!order.shippingAddress.includes(phone)) {
            return { EM: 'Thông tin xác thực (Số điện thoại) không chính xác!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        // Return flattened data for frontend
        const formattedData = {
            orderId: order.id,
            status: order.status,
            finalAmount: order.finalAmount,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderDate: order.createdAt,
            address: order.shippingAddress
        };

        return { EM: 'Lấy thông tin đơn hàng thành công!', EC: errorCode.SUCCESS, DT: formattedData };
    } catch (error) {
        console.error(">>> Lỗi getGuestOrderDetail:", error);
        return { EM: 'Lỗi server khi tra cứu đơn hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

/**
 * [SENIOR FEATURE] Khôi phục danh sách mã đơn hàng qua Email cho khách vãng lai
 */
const recoverGuestOrderIds = async (email, phone) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const orders = await db.Order.findAll({
            where: {
                userId: null, // Chỉ tìm đơn của khách
                createdAt: { [Op.gte]: thirtyDaysAgo },
                [Op.and]: [
                    { shippingAddress: { [Op.like]: `%${phone}%` } },
                    { shippingAddress: { [Op.like]: `%${email}%` } }
                ]
            },
            attributes: ['id', 'status', 'finalAmount', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 10 // Giới hạn 10 đơn gần nhất để email gọn gàng
        });

        if (!orders || orders.length === 0) {
            return { EM: 'Không tìm thấy đơn hàng nào khớp với thông tin này trong 30 ngày qua.', EC: errorCode.NOT_FOUND, DT: '' };
        }

        // Gửi email
        await emailHelper.sendOrderIdListEmail(email, orders);

        return { EM: 'Danh sách mã đơn đã được gửi vào Email của bạn!', EC: errorCode.SUCCESS, DT: '' };
    } catch (error) {
        console.error(">>> Lỗi recoverGuestOrderIds:", error);
        return { EM: 'Lỗi server khi khôi phục mã đơn hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};



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

            // [NEW] Ghi log xuất hàng
            await db.InventoryLog.create({
                variantId: item.variantId,
                userId: userId, // Có thể null nếu là khách
                type: 'OUT',
                quantity: item.quantity,
                note: `Xuất kho cho đơn hàng mới của ${userId ? 'User ID: ' + userId : 'Khách vãng lai'}`
            }, { transaction: t });
        }

        let shippingFee = 0;
        if (deliveryMethod === 'home_delivery') {
            shippingFee = totalBeforeDiscount >= 500000 ? 0 : 30000;
        }

        let discountAmount = 0;
        let couponId = null;

        if (couponCode) {
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
            redisHelper.delByPattern('coupons:admin:list:*'),
            redisHelper.delByPattern('product:inventory:logs:*') // Mới: Cập nhật lịch sử kho
        ];
        if (userId) {
            cacheClearTasks.push(redisHelper.delByPattern(`order:list:user:${userId}:*`));
            cacheClearTasks.push(redisHelper.delCache(`cart:user:${userId}`));
        }
        await Promise.all(cacheClearTasks);

        // [PROACTIVE UX] Gửi email xác nhận ngay lập tức cho cả User và Guest
        try {
            let userEmail = '';
            let userPhone = '';

            if (userId) {
                const userData = await db.User.findByPk(userId);
                userEmail = userData?.email;
                userPhone = userData?.phone;
            } else if (data.guestInfo) {
                userEmail = data.guestInfo.email;
                userPhone = data.guestInfo.phone;
            }

            if (userEmail) {
                // Ta truyền thêm phone vào object đơn hàng để helper tạo link tra cứu chính xác
                const orderForEmail = {
                    ...newOrder.get({ plain: true }),
                    phone: userPhone 
                };
                emailHelper.sendOrderConfirmationEmail(userEmail, orderForEmail);
            }
        } catch (emailError) {
            console.error(">>> [UX Error] Không thể gửi email xác nhận ngay:", emailError);
        }

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

                // [NEW] Ghi log hoàn trả kho do hủy đơn
                await db.InventoryLog.create({
                    variantId: item.variantId,
                    userId: userId,
                    type: 'RETURN',
                    quantity: item.quantity,
                    note: `Hoàn kho do khách hủy đơn #${orderId}`
                }, { transaction: t });
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
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('coupons:admin:list:*'),
            redisHelper.delByPattern('product:inventory:logs:*') // Mới: Cập nhật lịch sử kho
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
                            attributes: ['colorId', 'sizeId'], // Chỉ lấy id để ánh xạ
                            include: [
                                { model: db.Color, as: 'color', attributes: ['name'] },
                                { model: db.Size, as: 'size', attributes: ['name'] },
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
        // console.log(">>> SOI DATA RAW:", JSON.stringify(order, null, 2));
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
                // Check an toàn lỡ sản phẩm bị xóa hoặc chưa up ảnh
                let mainImage = '';
                const product = item.variant?.product;
                
                if (product?.images && product.images.length > 0) {
                    mainImage = product.images[0].imageUrl;
                }

                return {
                    productName: product?.name || 'Sản phẩm không còn tồn tại',
                    size: item.variant?.size?.name || 'N/A',
                    color: item.variant?.color?.name || 'N/A',
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
            attributes: ['id', 'totalBeforeDiscount', 'shippingFee','shippingAddress', 'discountAmount', 'finalAmount', 'paymentMethod', 'paymentStatus', 'deliveryMethod', 'status', 'createdAt'],
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

                    // [NEW] Ghi log hoàn trả kho do Admin hủy đơn
                    await db.InventoryLog.create({
                        variantId: item.variantId,
                        userId: null, // Admin thực hiện, nếu có req.user.id thì nên truyền vào, nhưng hiện tại hàm này chưa nhận adminId
                        type: 'RETURN',
                        quantity: item.quantity,
                        note: `Hoàn kho do hệ thống/Admin hủy đơn #${orderId}`
                    }, { transaction: t });
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
            cacheClearTasks.push(redisHelper.delByPattern('product:inventory:logs:*')); // Mới: Cập nhật lịch sử kho
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
const processVNPayPayment = async (orderId, amount, responseCode, fullQuery) => {
    console.log(`>>> [SERVICE processVNPayPayment] Start: OrderID=${orderId}, Amount=${amount}, Code=${responseCode}`);
    const t = await db.sequelize.transaction();
    try {
        // 1. Tìm đơn hàng
        const order = await db.Order.findOne({
            where: { id: orderId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!order) {
            console.error(`>>> [SERVICE processVNPayPayment] ERROR: Order ${orderId} not found`);
            await t.rollback();
            return { EM: 'Order not found', EC: '01', DT: '' };
        }

        console.log(`>>> [SERVICE processVNPayPayment] Order Found: ID=${order.id}, DB_Amount=${order.finalAmount}, Current_PaymentStatus=${order.paymentStatus}`);

        // 2. Kiểm tra số tiền (VNPay amount đã được /100 ở controller)
        if (Number(order.finalAmount) !== Number(amount)) {
            console.error(`>>> [SERVICE processVNPayPayment] ERROR: Amount mismatch. DB=${order.finalAmount}, VNPay=${amount}`);
            await t.rollback();
            return { EM: 'Invalid amount', EC: '04', DT: '' };
        }

        // 3. Kiểm tra xem đơn hàng đã được xử lý thanh toán chưa (Tránh trùng lặp IPN)
        if (order.paymentStatus === true) {
            console.warn(`>>> [SERVICE processVNPayPayment] WARNING: Order ${orderId} already paid. Skipping update.`);
            await t.rollback();
            return { EM: 'Order already confirmed', EC: '02', DT: '' };
        }

        // 4. Kiểm tra mã phản hồi thành công từ VNPay (00 là thành công)
        if (responseCode === '00') {
            console.log(`>>> [SERVICE processVNPayPayment] Payment Success. Updating order ${orderId}...`);
            // Cập nhật trạng thái thanh toán và đơn hàng
            await order.update({
                paymentStatus: true,
                status: 'confirmed'
            }, { transaction: t });

            // Ghi log giao dịch
            const trans = await db.PaymentTransaction.create({
                orderId: order.id,
                provider: 'VNPAY',
                transactionId: fullQuery.vnp_TransactionNo,
                amount: amount,
                status: 'SUCCESS'
            }, { transaction: t });

            console.log(`>>> [SERVICE processVNPayPayment] Transaction Logged:`, trans.id);

            await t.commit();
            console.log(`>>> [SERVICE processVNPayPayment] Transaction Committed. Clearing cache...`);

            // Xóa cache
            await Promise.all([
                redisHelper.delByPattern('dashboard:stats:*'),
                redisHelper.delByPattern('order:list:admin:*'),
                redisHelper.delByPattern(`order:list:user:${order.userId || 'guest'}:*`),
                redisHelper.delCache(`order:detail:user:${order.userId || 'guest'}:${orderId}`),
                redisHelper.delByPattern('order:payment:transactions:*')
            ]);

            return { EM: 'Success', EC: '00', DT: '' };
        } else {
            console.warn(`>>> [SERVICE processVNPayPayment] Payment Failed at VNPay. Code=${responseCode}. Logging failure...`);
            // Giao dịch thất bại tại VNPay
            await db.PaymentTransaction.create({
                orderId: order.id,
                provider: 'VNPAY',
                transactionId: fullQuery.vnp_TransactionNo || 'N/A',
                amount: amount,
                status: 'FAILED'
            }, { transaction: t });

            await t.commit();
            return { EM: 'Transaction Failed Logged', EC: '00', DT: '' };
        }

    } catch (error) {
        await t.rollback();
        console.error(">>> [SERVICE processVNPayPayment] CRITICAL ERROR:", error);
        return { EM: 'Internal server error', EC: '99', DT: '' };
    }
};


const getPaymentTransactionsAdmin = async (query) => {
    try {
        const { page, limit, provider, status, orderId } = query;
        const cacheKey = `order:payment:transactions:${JSON.stringify(query)}`;
        const cached = await redisHelper.getCache(cacheKey);
        if (cached) return { EM: 'Lấy danh sách giao dịch (Cache) thành công', EC: errorCode.SUCCESS, DT: cached };

        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (provider) whereCondition.provider = provider;
        if (status) whereCondition.status = status;
        if (orderId) whereCondition.orderId = orderId;

        const { count, rows } = await db.PaymentTransaction.findAndCountAll({
            where: whereCondition,
            offset: offset,
            limit: limit,
            order: [['createdAt', 'DESC']],
            include: [{ model: db.Order, as: 'order', attributes: ['finalAmount', 'status'] }]
        });

        const result = {
            totalRows: count,
            totalPages: Math.ceil(count / limit),
            transactions: rows
        };

        await redisHelper.setCache(cacheKey, result, 900); // Cache 15 phút

        return {
            EM: 'Lấy danh sách giao dịch thành công',
            EC: errorCode.SUCCESS,
            DT: result
        };
    } catch (error) {
        console.error(">>> Lỗi getPaymentTransactionsAdmin:", error);
        return { EM: 'Lỗi server khi lấy danh sách giao dịch', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const getReturnRequestsAdmin = async (query) => {
    try {
        const { page, limit, status } = query;
        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (status) whereCondition.status = status;

        const { count, rows } = await db.ReturnRequest.findAndCountAll({
            where: whereCondition,
            offset: offset,
            limit: limit,
            order: [['createdAt', 'DESC']],
            include: [
                { model: db.Order, as: 'order', attributes: ['finalAmount', 'paymentMethod'] },
                { model: db.User, as: 'user', attributes: ['fullName', 'email', 'phone'] }
            ]
        });

        return {
            EM: 'Lấy danh sách yêu cầu trả hàng thành công',
            EC: errorCode.SUCCESS,
            DT: { totalRows: count, totalPages: Math.ceil(count / limit), requests: rows }
        };
    } catch (error) {
        console.error(">>> Lỗi getReturnRequestsAdmin:", error);
        return { EM: 'Lỗi server khi lấy danh sách yêu cầu trả hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const updateReturnStatus = async (id, status, adminId) => {
    const t = await db.sequelize.transaction();
    try {
        const request = await db.ReturnRequest.findOne({
            where: { id: id },
            include: [{ 
                model: db.Order, 
                as: 'order', 
                include: [{ model: db.OrderItem, as: 'orderItems' }] // Sửa lại thành as: 'orderItems' cho đúng model
            }],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!request) {
            await t.rollback();
            return { EM: 'Yêu cầu không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        if (request.status !== 'PENDING') {
            await t.rollback();
            return { EM: 'Yêu cầu này đã được xử lý trước đó!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        // Cập nhập trạng thái yêu cầu
        await request.update({ status: status }, { transaction: t });

        // Nếu DUYỆT (APPROVED) -> Đổi trạng thái Đơn hàng thành 'returned' và HOÀN KHO
        if (status === 'APPROVED') {
            await db.Order.update({ status: 'returned' }, { where: { id: request.orderId }, transaction: t });

            // Hoàn kho cho từng sản phẩm trong đơn hàng
            if (request.order && request.order.orderItems) {
                for (const item of request.order.orderItems) {
                    await db.ProductVariant.increment('stock', { by: item.quantity, where: { id: item.variantId }, transaction: t });
                    
                    // Ghi log kho (RETURN)
                    await db.InventoryLog.create({
                        variantId: item.variantId,
                        userId: adminId, 
                        type: 'RETURN',
                        quantity: item.quantity,
                        note: `Hoàn kho do duyệt trả hàng đơn #${request.orderId}`
                    }, { transaction: t });
                }
            }

            // [SENIOR OPTIMIZATION] - Tự động hoàn tiền qua VNPAY nếu đơn thanh toán qua cổng này
            if (request.order && request.order.paymentMethod === 'VNPAY' && request.order.paymentStatus === true) {
                const lastSuccessTrans = await db.PaymentTransaction.findOne({
                    where: { orderId: request.orderId, status: 'SUCCESS' },
                    order: [['createdAt', 'DESC']]
                });

                if (lastSuccessTrans) {
                    const refundRes = await vnpayService.refundTransaction({
                        orderId: request.orderId,
                        amount: lastSuccessTrans.amount,
                        transDate: lastSuccessTrans.createdAt.toISOString().slice(0, 19).replace(/[-T:]/g, ""),
                        user: 'SYSTEM_ADMIN_REFUND',
                        vnp_TransactionNo: lastSuccessTrans.transactionId
                    });

                    await db.PaymentTransaction.create({
                        orderId: request.orderId,
                        provider: 'VNPAY',
                        transactionId: refundRes.vnp_TransactionNo || 'REFUND_REQ',
                        amount: lastSuccessTrans.amount,
                        status: refundRes.vnp_ResponseCode === '00' ? 'REFUNDED' : 'REFUND_FAILED'
                    }, { transaction: t });
                }
            }
        } 
        else if (status === 'REJECTED') {
            await db.Order.update({ status: 'delivered' }, { where: { id: request.orderId }, transaction: t });
        }

        await t.commit();
        await Promise.all([
            redisHelper.delByPattern('order:list:admin:*'),
            redisHelper.delByPattern(`order:list:user:${request.userId}:*`),
            redisHelper.delCache(`order:detail:user:${request.userId}:${request.orderId}`)
        ]);

        return { EM: `Đã ${status === 'APPROVED' ? 'chấp nhận' : 'từ chối'} yêu cầu trả hàng!`, EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        await t.rollback();
        console.error(">>> Lỗi updateReturnStatus:", error);
        return { EM: 'Lỗi server khi cập nhật trạng thái trả hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

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
const requestReturnOrder = async (userId, orderId, data) => {
    const t = await db.sequelize.transaction();
    try {
        const { reason, images } = data; // images là mảng JSON các link ảnh Cloudinary

        const order = await db.Order.findOne({
            where: { id: orderId, userId: userId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!order) {
            await t.rollback();
            return { EM: 'Đơn hàng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        if (order.status !== 'delivered') {
            await t.rollback();
            return { EM: 'Chỉ đơn hàng đã giao thành công mới có thể yêu cầu trả hàng!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        // Tạo bản ghi ReturnRequest
        await db.ReturnRequest.create({
            orderId: orderId,
            userId: userId,
            reason: reason,
            images: JSON.stringify(images),
            status: 'PENDING'
        }, { transaction: t });

        // Cập nhật trạng thái đơn hàng
        await order.update({ status: 'returning' }, { transaction: t });

        await t.commit();
        await Promise.all([
            redisHelper.delByPattern('order:list:admin:*'),
            redisHelper.delByPattern(`order:list:user:${userId}:*`),
            redisHelper.delCache(`order:detail:user:${userId}:${orderId}`)
        ]);

        return { EM: 'Gửi yêu cầu trả hàng thành công!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        await t.rollback();
        console.error(">>> Lỗi requestReturnOrder:", error);
        return { EM: 'Lỗi server khi gửi yêu cầu trả hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}

const createPaymentTransaction = async (orderId, paymentData) => {
    try {
        const { provider, transactionId, amount, status } = paymentData;

        const transaction = await db.PaymentTransaction.create({
            orderId,
            provider,
            transactionId,
            amount,
            status: status || 'PENDING'
        });

        return { EM: 'Ghi nhận giao dịch thành công!', EC: errorCode.SUCCESS, DT: transaction };
    } catch (error) {
        console.error(">>> Lỗi createPaymentTransaction:", error);
        return { EM: 'Lỗi server khi ghi nhận giao dịch', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}

/**
 * [SENIOR FEATURE] Đồng bộ trạng thái đơn hàng với VNPAY (QueryDR)
 * Dành cho Admin tra soát khi IPN bị mất hoặc khách hàng tắt web quá sớm
 */
const syncOrderWithVNPay = async (orderId) => {
    try {
        const order = await db.Order.findOne({ where: { id: orderId } });
        if (!order) return { EM: 'Đơn hàng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        if (order.paymentStatus === true) return { EM: 'Đơn hàng đã được xác nhận thanh toán rồi!', EC: errorCode.SUCCESS, DT: '' };

        // Tìm giao dịch khởi tạo gần nhất để lấy ngày tạo (VNPAY cần ngày tạo GD để query)
        const lastTrans = await db.PaymentTransaction.findOne({
            where: { orderId: orderId },
            order: [['createdAt', 'DESC']]
        });
        
        if (!lastTrans) return { EM: 'Không tìm thấy lịch sử thanh toán cho đơn này!', EC: errorCode.NOT_FOUND, DT: '' };

        const createDate = lastTrans.createdAt.toISOString().slice(0, 19).replace(/[-T:]/g, "");
        const queryRes = await vnpayService.queryTransaction(orderId, createDate);

        // Kiểm tra mã phản hồi của VNPAY về trạng thái giao dịch
        // vnp_TransactionStatus '00' là thành công
        if (queryRes.vnp_ResponseCode === '00' && (queryRes.vnp_TransactionStatus === '00' || queryRes.vnp_TransactionStatus === '02')) {
            const amount = parseInt(queryRes.vnp_Amount) / 100;
            // Tiến hành cập nhật trạng thái đơn hàng như luồng IPN
            return await processVNPayPayment(orderId, amount, '00', queryRes);
        }

        return { 
            EM: `Kết quả từ VNPAY: ${queryRes.vnp_Message || 'Giao dịch không thành công hoặc chưa hoàn tất'}`, 
            EC: errorCode.VALIDATION_ERROR, 
            DT: queryRes 
        };
    } catch (error) {
        console.error(">>> Lỗi syncOrderWithVNPay:", error);
        return { EM: 'Lỗi server khi đối soát VNPAY', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}

/**
 * [CHATBOT TOOL] Lấy danh sách đơn hàng rút gọn kèm chi tiết sản phẩm cho chatbot
 */
const getUserOrdersShort = async (userId) => {
    try {
        const orders = await db.Order.findAll({
            where: { userId },
            limit: 3,
            order: [['createdAt', 'DESC']],
            include: [{
                model: db.OrderItem,
                as: 'orderItems',
                include: [{
                    model: db.ProductVariant,
                    as: 'variant',
                    include: [
                        { model: db.Product, as: 'product' },
                        { model: db.Color, as: 'color', attributes: ['name'] },
                        { model: db.Size, as: 'size', attributes: ['name'] }
                    ]
                }]
            }],
            attributes: ['id', 'status', 'finalAmount', 'paymentStatus', 'createdAt']
        });

        if (!orders || orders.length === 0) return null;

        return orders.map(order => ({
            orderId: order.id,
            status: order.status,
            paymentStatus: order.paymentStatus ? "Đã thanh toán" : "Chưa thanh toán",
            total: order.finalAmount,
            date: order.createdAt,
            items: order.orderItems.map(item => ({
                name: item.variant?.product?.name,
                color: item.variant?.color?.name,
                size: item.variant?.size?.name,
                quantity: item.quantity
            }))
        }));
    } catch (error) {
        console.error(">>> Lỗi getUserOrdersShort:", error);
        return null;
    }
};

module.exports = {
    createOrder, cancelOrder, getUserOrders, getUserOrderDetail,
    getAdminOrders, updateOrderStatus, updatePaymentStatus, getBestSellerProductIds,
    requestReturnOrder, createPaymentTransaction, processVNPayPayment,
    getPaymentTransactionsAdmin, getReturnRequestsAdmin, updateReturnStatus,
    getVNPayPaymentUrl, syncOrderWithVNPay, getGuestVNPayPaymentUrl, getGuestOrderDetail, recoverGuestOrderIds,
    getUserOrdersShort
};
