const db = require('../models/index');
const errorCode = require('../config/errorCodes');

const createOrder = async (userId, data) => {
    const t = await db.sequelize.transaction();
    let currentStep = 'Khởi tạo hàm createOrder';
    try {
        const { shippingAddress, paymentMethod, couponCode, deliveryMethod } = data;
        currentStep = 'Query Giỏ hàng của User';
        const cart = await db.Cart.findOne({
            where: { userId: userId },
            include: [{
                model: db.CartItem,
                as: 'cartItems'
            }]
        });

        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
            await t.rollback();
            return { EM: 'Giỏ hàng trống, không thể đặt hàng!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        let totalBeforeDiscount = 0;
        let orderItemsData = [];

        currentStep = 'Kiểm tra tồn kho và Khóa dòng';
        for (let item of cart.cartItems) {
            //  Tìm và khóa cứng (Lock) Variant này lại để chống Race Condition
            const lockedVariant = await db.ProductVariant.findOne({
                where: { id: item.variantId },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!lockedVariant) {
                await t.rollback();
                return { EM: `Sản phẩm (Variant ID: ${item.variantId}) không tồn tại!`, EC: errorCode.NOT_FOUND, DT: '' };
            }

            // Kiểm tra số lượng tồn kho dựa trên data vừa được khóa
            if (item.quantity > lockedVariant.stock) {
                await t.rollback();
                return {
                    EM: `Sản phẩm (Variant ID: ${item.variantId}) không đủ tồn kho! Chỉ còn ${lockedVariant.stock}.`,
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
            const coupon = await db.Coupon.findOne({ where: { code: couponCode, isActive: true } });
            if (!coupon) {
                await t.rollback();
                return { EM: 'Mã giảm giá không hợp lệ hoặc đã hết hạn!', EC: errorCode.NOT_FOUND, DT: '' };
            }
            if (totalBeforeDiscount < coupon.minOrderValue) {
                await t.rollback();
                return { EM: `Đơn hàng phải từ ${coupon.minOrderValue}đ mới được áp dụng mã này!`, EC: errorCode.VALIDATION_ERROR, DT: '' };
            }

            // Tính tiền giảm dựa trên loại mã
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
            userId: userId,
            couponId: couponId,
            totalBeforeDiscount: totalBeforeDiscount,
            shippingFee: shippingFee,
            discountAmount: discountAmount,
            finalAmount: finalAmount,
            paymentMethod: paymentMethod,
            paymentStatus: false, // Mặc định là chưa thanh toán
            shippingAddress: shippingAddress,
            deliveryMethod: deliveryMethod,
            status: 'pending' // Chờ duyệt
        }, { transaction: t });

        const itemsToInsert = orderItemsData.map(item => ({
            ...item,
            orderId: newOrder.id
        }));
        currentStep = 'Lưu chi tiết OrderItems';
        await db.OrderItem.bulkCreate(itemsToInsert, { transaction: t });

        currentStep = 'Xóa dữ liệu Giỏ hàng';
        await db.CartItem.destroy({
            where: { cartId: cart.id },
            transaction: t
        });

        await t.commit();

        return { EM: 'Đặt hàng thành công!', EC: errorCode.SUCCESS, DT: newOrder };

    } catch (error) {
        await t.rollback();
        cconsole.error(`\n[CRITICAL ERROR] Lỗi tại createOrder!`);
        console.error(`- User ID: ${userId}`);
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
        return { EM: 'Đã hủy đơn hàng thành công!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        await t.rollback();
        console.error(`\n[CRITICAL ERROR] Lỗi tại cancelOrder!`);
        console.error(`- User ID: ${userId} | Order ID: ${orderId}`);
        console.error(`- CHẾT TẠI BƯỚC:  ${currentStep} `);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);

        return { EM: 'Lỗi server khi hủy đơn hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}

module.exports = { createOrder, cancelOrder };