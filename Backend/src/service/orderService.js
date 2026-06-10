const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const redisHelper = require('../helpers/redis.helper');
const vnpayService = require('./vnpayService'); 
const emailHelper = require('../helpers/email.helper');
const { Op } = require('sequelize');
const slugify = require('slugify');
const ORDER_CACHE_TTL = process.env.ORDER_CACHE_TTL || 1800; // 30 phút

const getAvgCostPrice = async (variantId) => {
    try {
        const logs = await db.InventoryLog.findAll({
            where: { variantId, type: 'IN', costPrice: { [Op.gt]: 0 } }
        });
        const totalQty = logs.reduce((s, l) => s + l.quantity, 0);
        const totalCost = logs.reduce((s, l) => s + (l.quantity * parseFloat(l.costPrice)), 0);
        return totalQty > 0 ? (totalCost / totalQty) : 0;
    } catch (error) {
        console.error(">>> Lỗi getAvgCostPrice:", error);
        return 0;
    }
};



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
            attributes: ['id', 'status', 'finalAmount', 'paymentMethod', 'paymentStatus', 'shippingAddress', 'createdAt', 'userId']
        });

        if (!order) return { EM: 'Đơn hàng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        
        // Bảo mật: Nếu đơn hàng thuộc về một User đã login, yêu cầu dùng luồng login
        if (order.userId) return { EM: 'Đơn hàng này được đặt bởi thành viên. Vui lòng đăng nhập để xem chi tiết!', EC: errorCode.VALIDATION_ERROR, DT: '' };

        // [SENIOR] Chuẩn hóa số điện thoại để so khớp (Loại bỏ mọi ký tự không phải số)
        const normalizedInputPhone = phone.replace(/\D/g, '');
        const normalizedAddress = order.shippingAddress.replace(/\D/g, '');

        if (!normalizedInputPhone || !normalizedAddress.includes(normalizedInputPhone)) {
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
                    { shippingAddress: { [Op.like]: `%${phone.replace(/\D/g, '')}%` } },
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
                include: [{
                    model: db.Product,
                    as: 'product',
                    attributes: ['id', 'basePrice', 'discountPercent']
                }],
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

            // [SENIOR] Calculate actual purchase price considering discounts
            const basePrice = lockedVariant.price || lockedVariant.product?.basePrice || 0;
            const discountPercent = lockedVariant.product?.discountPercent || 0;
            const purchasePrice = basePrice * (1 - discountPercent / 100);

            totalBeforeDiscount += (purchasePrice * item.quantity);

            const avgCost = await getAvgCostPrice(item.variantId);
            orderItemsData.push({
                variantId: item.variantId,
                quantity: item.quantity,
                price: purchasePrice, // Save the discounted price as the historical purchase price
                costPrice: avgCost
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
        currentStep = 'Lưu chi tiết OrderItems & Ghi Log Kho';
        await db.OrderItem.bulkCreate(itemsToInsert, { transaction: t });

        // [IMPROVED LOG] Ghi log kho kèm mã đơn hàng rõ ràng (Trạng thái Tạm giữ)
        const logTasks = orderItemsData.map(item => {
            return db.InventoryLog.create({
                variantId: item.variantId,
                userId: userId,
                type: 'HOLD',
                quantity: item.quantity,
                note: `Tạm giữ xuất kho cho đơn hàng #${newOrder.id} - ${userId ? 'KH đăng nhập' : 'Khách vãng lai'}`
            }, { transaction: t });
        });
        await Promise.all(logTasks);

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

                // [IMPROVED LOG] Ghi log hoàn trả kho do hủy đơn kèm mã đơn (Hủy tạm giữ)
                await db.InventoryLog.create({
                    variantId: item.variantId,
                    userId: userId,
                    type: 'UNHOLD',
                    quantity: item.quantity,
                    note: `Hủy tạm giữ do khách hủy đơn hàng #${orderId}`
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
        const cacheKey = `order:detail:v2:user:${userId}:${orderId}`;
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
                    attributes: ['id', 'quantity', 'price'], // Giá gốc lúc mua và số lượng
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
                                    attributes: ['id', 'name'],
                                    include: [
                                        {
                                            model: db.ProductImage,
                                            as: 'images',
                                            where: { isMain: true },
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
                    id: item.id,
                    productId: product?.id,
                    slug: product?.name ? slugify(product.name, { lower: true, locale: 'vi' }) : '',
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
        const include = [
            {
                model: db.User,
                as: 'user',
                attributes: ['id', 'fullName', 'phone', 'email']
            }
        ];

        if (queryParams.includeItems === 'true' || queryParams.includeItems === true) {
            include.push({
                model: db.OrderItem,
                as: 'orderItems',
                attributes: ['id', 'quantity', 'price'],
                include: [
                    {
                        model: db.ProductVariant,
                        as: 'variant',
                        attributes: ['sku', 'productId'],
                        include: [
                            { model: db.Product, as: 'product', attributes: ['name'] },
                            { model: db.Color, as: 'color', attributes: ['name'] },
                            { model: db.Size, as: 'size', attributes: ['name'] }
                        ]
                    }
                ]
            });
        }

        const { count, rows } = await db.Order.findAndCountAll({
            where: whereCondition,
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            attributes: ['id', 'totalBeforeDiscount', 'shippingFee','shippingAddress', 'discountAmount', 'finalAmount', 'paymentMethod', 'paymentStatus', 'deliveryMethod', 'status', 'createdAt'],
            include: include,
            distinct: true
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
const updateOrderStatus = async (orderId, newStatus, adminId = null) => {
    const t = await db.sequelize.transaction();
    let currentStep = 'Khởi tạo updateOrderStatus';
    let needLogOut = false;

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

                    let logType = 'RETURN';
                    let logNote = `Hoàn kho do Admin/Hệ thống hủy đơn hàng #${orderId}`;
                    // Nếu đơn chưa từng xuất kho thực tế (vẫn ở pending hoặc confirmed) thì chỉ ghi nhận UNHOLD (Hủy tạm giữ)
                    if (order.status === 'pending' || order.status === 'confirmed') {
                        logType = 'UNHOLD';
                        logNote = `Hủy tạm giữ (chưa xuất kho) do Admin/Hệ thống hủy đơn hàng #${orderId}`;
                    }

                    // Ghi log hoàn trả kho do Admin hủy đơn kèm mã đơn
                    await db.InventoryLog.create({
                        variantId: item.variantId,
                        userId: adminId, 
                        type: logType,
                        quantity: item.quantity,
                        costPrice: logType === 'RETURN' ? item.costPrice : 0,
                        note: logNote
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
            
            // [LOG OUT] Ghi log xuất kho vật lý thực tế:
            // - Giao tận nơi (home_delivery): xuất kho khi bắt đầu vận chuyển (shipping)
            // - Nhận tại cửa hàng (store_pickup): xuất kho khi khách nhận hàng (delivered)
            // - Phòng hờ giao tận nơi bị nhảy thẳng từ confirmed -> delivered: vẫn ghi log OUT
            if (newStatus === 'shipping' && order.status !== 'shipping' && order.status !== 'delivered') {
                needLogOut = true;
            } else if (newStatus === 'delivered' && order.status !== 'shipping' && order.status !== 'delivered') {
                needLogOut = true;
            }

            if (needLogOut) {
                const orderItems = await db.OrderItem.findAll({ where: { orderId: orderId }, transaction: t });
                for (let item of orderItems) {
                    await db.InventoryLog.create({
                        variantId: item.variantId,
                        userId: adminId,
                        type: 'OUT',
                        quantity: item.quantity,
                        note: order.deliveryMethod === 'store_pickup'
                            ? `Xuất kho trực tiếp (Khách nhận tại cửa hàng) cho đơn hàng #${orderId}`
                            : `Xuất kho bàn giao ĐVVC cho đơn hàng #${orderId}`
                    }, { transaction: t });
                }
            }

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
        
        if (newStatus === 'cancelled' || needLogOut) {
            cacheClearTasks.push(redisHelper.delByPattern('product:inventory:logs:*'));
        }

        await Promise.all(cacheClearTasks);

        // [PROACTIVE UX] Gửi email mời đánh giá nếu đơn hàng đã giao
        if (newStatus === 'delivered') {
            try {
                let userEmail = '';
                if (orderUserId) {
                    const userObj = await db.User.findByPk(orderUserId);
                    userEmail = userObj?.email;
                } else if (order.shippingAddress) {
                    try {
                        const addrObj = JSON.parse(order.shippingAddress);
                        if (addrObj.email) userEmail = addrObj.email;
                    } catch(e){}
                }

                if (userEmail) {
                    // Inject service để lấy token
                    const reviewService = require('./reviewService');
                    const reviewData = await reviewService.getReviewTokensForOrder(orderId, orderUserId);
                    if (reviewData.EC === 0 && reviewData.DT?.items?.length > 0) {
                        const emailHelper = require('../helpers/email.helper');
                        emailHelper.sendReviewRequestEmail(userEmail, order, reviewData.DT.items);
                    }
                }
            } catch (emailErr) {
                console.error(">>> [UX Error] Không thể gửi email mời đánh giá:", emailErr);
            }
        }

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
            // [SENIOR FIX] Trả về mã lỗi thực tế của VNPay thay vì ép về '00'
            return { EM: 'Giao dịch không thành công tại VNPay', EC: responseCode, DT: '' };
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
                include: [{ model: db.OrderItem, as: 'orderItems' }]
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

        // Cập nhật trạng thái yêu cầu
        await request.update({ status: status }, { transaction: t });

        // [REFACTORED] Bước 1: CSKH duyệt → Chỉ đổi trạng thái, KHÔNG cộng kho, KHÔNG hoàn tiền
        // Chờ Thủ kho nhận hàng vật lý và xác nhận ở Bước 2 (confirmReturnReceived)
        if (status === 'APPROVED') {
            await db.Order.update(
                { status: 'return_approved' }, 
                { where: { id: request.orderId }, transaction: t }
            );
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

        const statusLabel = status === 'APPROVED' ? 'chấp nhận (Chờ nhận hàng hoàn)' : 'từ chối';
        return { EM: `Đã ${statusLabel} yêu cầu trả hàng!`, EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        await t.rollback();
        console.error(">>> Lỗi updateReturnStatus:", error);
        return { EM: 'Lỗi server khi cập nhật trạng thái trả hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

// Phí ship ngược cố định khi khách trả hàng
const RETURN_SHIPPING_FEE = 15000;

/**
 * [Bước 2] Thủ kho xác nhận đã nhận hàng hoàn trả vật lý
 * - stockCondition = 'good': Hàng nguyên vẹn → Cộng kho bán lẻ
 * - stockCondition = 'defective': Hàng lỗi/hỏng → Ghi log kho phế phẩm, KHÔNG cộng kho bán lẻ
 * - Sau khi xác nhận → Kích hoạt hoàn tiền (VNPay Partial Refund hoặc ghi nhận chờ hoàn COD)
 */
const confirmReturnReceived = async (returnRequestId, warehouseUserId, stockCondition) => {
    const t = await db.sequelize.transaction();
    try {
        const request = await db.ReturnRequest.findOne({
            where: { id: returnRequestId },
            include: [{ 
                model: db.Order, 
                as: 'order', 
                include: [{ model: db.OrderItem, as: 'orderItems' }]
            }],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!request) {
            await t.rollback();
            return { EM: 'Yêu cầu trả hàng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        if (request.status !== 'APPROVED') {
            await t.rollback();
            return { EM: 'Yêu cầu này chưa được CSKH duyệt hoặc đã xử lý!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        const order = request.order;
        if (!order || order.status !== 'return_approved') {
            await t.rollback();
            return { EM: 'Đơn hàng không ở trạng thái chờ nhận hàng hoàn!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        // Xử lý tồn kho dựa trên tình trạng hàng vật lý
        if (order.orderItems && order.orderItems.length > 0) {
            for (const item of order.orderItems) {
                if (stockCondition === 'good') {
                    // Hàng nguyên vẹn → Cộng lại kho bán lẻ (stock trực tuyến)
                    await db.ProductVariant.increment('stock', { 
                        by: item.quantity, 
                        where: { id: item.variantId }, 
                        transaction: t 
                    });

                    await db.InventoryLog.create({
                        variantId: item.variantId,
                        userId: warehouseUserId,
                        type: 'RETURN',
                        quantity: item.quantity,
                        costPrice: item.costPrice || 0,
                        note: `Hoàn kho bán lẻ (hàng nguyên vẹn) — Đơn #${request.orderId}`
                    }, { transaction: t });
                } else {
                    // Hàng lỗi/hỏng → Ghi log kho phế phẩm, KHÔNG cộng kho bán lẻ
                    await db.InventoryLog.create({
                        variantId: item.variantId,
                        userId: warehouseUserId,
                        type: 'RETURN_DEFECTIVE',
                        quantity: item.quantity,
                        costPrice: item.costPrice || 0,
                        note: `Nhập kho phế phẩm (hàng lỗi/hỏng) — Đơn #${request.orderId}`
                    }, { transaction: t });
                }
            }
        }

        // Chuyển trạng thái đơn hàng sang 'returned' (hoàn tất quy trình trả hàng)
        await order.update({ status: 'returned' }, { transaction: t });

        // Xử lý hoàn tiền dựa trên phương thức thanh toán
        if (order.paymentMethod === 'VNPAY' && order.paymentStatus === true) {
            // [PARTIAL REFUND] Hoàn tiền VNPay trừ phí ship ngược 15.000đ
            const lastSuccessTrans = await db.PaymentTransaction.findOne({
                where: { orderId: request.orderId, status: 'SUCCESS' },
                order: [['createdAt', 'DESC']]
            });

            if (lastSuccessTrans) {
                const refundAmount = Math.max(0, Number(order.finalAmount) - RETURN_SHIPPING_FEE);

                const refundRes = await vnpayService.refundTransaction({
                    orderId: request.orderId,
                    amount: refundAmount,
                    transDate: lastSuccessTrans.createdAt.toISOString().slice(0, 19).replace(/[-T:]/g, ""),
                    user: 'SYSTEM_ADMIN_REFUND',
                    vnp_TransactionNo: lastSuccessTrans.transactionId
                });

                await db.PaymentTransaction.create({
                    orderId: request.orderId,
                    provider: 'VNPAY',
                    transactionId: refundRes.vnp_TransactionNo || 'REFUND_REQ',
                    amount: refundRes.vnp_ResponseCode === '00' ? refundAmount : 0,
                    status: refundRes.vnp_ResponseCode === '00' ? 'REFUNDED' : 'REFUND_FAILED'
                }, { transaction: t });
            }
        } else if (order.paymentMethod === 'COD' && order.paymentStatus === true) {
            // [COD REFUND] Ghi nhận giao dịch hoàn tiền (Kế toán chuyển khoản thủ công)
            const refundAmount = Math.max(0, Number(order.finalAmount) - RETURN_SHIPPING_FEE);
            await db.PaymentTransaction.create({
                orderId: request.orderId,
                provider: 'COD_REFUND',
                transactionId: `COD_REFUND_${request.orderId}_${Date.now()}`,
                amount: -refundAmount, // Số âm = tiền ra (hoàn trả cho khách)
                status: 'PENDING' // Chờ Kế toán xác nhận đã chuyển khoản
            }, { transaction: t });
        }

        // Cập nhật trạng thái ReturnRequest
        await request.update({ status: 'REFUNDED' }, { transaction: t });

        await t.commit();

        // Xóa cache liên quan
        await Promise.all([
            redisHelper.delByPattern('order:list:admin:*'),
            redisHelper.delByPattern(`order:list:user:${request.userId}:*`),
            redisHelper.delCache(`order:detail:user:${request.userId}:${request.orderId}`),
            redisHelper.delByPattern('product:detail:*'),
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('product:inventory:logs:*'),
            redisHelper.delByPattern('order:payment:transactions:*')
        ]);

        const conditionLabel = stockCondition === 'good' ? 'nguyên vẹn (đã cộng kho)' : 'lỗi/hỏng (kho phế phẩm)';
        return { 
            EM: `Xác nhận nhận hàng hoàn thành công! Tình trạng: ${conditionLabel}`, 
            EC: errorCode.SUCCESS, 
            DT: '' 
        };

    } catch (error) {
        await t.rollback();
        console.error(">>> Lỗi confirmReturnReceived:", error);
        return { EM: 'Lỗi server khi xác nhận nhận hàng hoàn', EC: errorCode.OTHER_ERROR, DT: '' };
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
    getPaymentTransactionsAdmin, getReturnRequestsAdmin, updateReturnStatus, confirmReturnReceived,
    getVNPayPaymentUrl, syncOrderWithVNPay, getGuestVNPayPaymentUrl, getGuestOrderDetail, recoverGuestOrderIds,
    getUserOrdersShort
};

