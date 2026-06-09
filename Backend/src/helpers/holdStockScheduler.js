const db = require('../models/index');
const { Op } = require('sequelize');
const redisHelper = require('./redis.helper');

// Cấu hình ngưỡng timeout (đơn vị: phút)
const VNPAY_HOLD_TIMEOUT_MINUTES = 15;
const COD_HOLD_TIMEOUT_MINUTES = 60 * 24; // 24 giờ
const SCHEDULER_INTERVAL_MS = 5 * 60 * 1000; // Chạy mỗi 5 phút

/**
 * [HOLD STOCK SCHEDULER]
 * Tự động hủy đơn hàng quá hạn chưa thanh toán/xác nhận và giải phóng tồn kho.
 * - VNPay: Hủy sau 15 phút nếu chưa nhận được IPN thành công.
 * - COD: Hủy sau 24 giờ nếu Sales chưa xác nhận đơn.
 */
const releaseExpiredHoldStock = async () => {
    const now = new Date();

    // Tính mốc thời gian hết hạn
    const vnpayDeadline = new Date(now.getTime() - VNPAY_HOLD_TIMEOUT_MINUTES * 60 * 1000);
    const codDeadline = new Date(now.getTime() - COD_HOLD_TIMEOUT_MINUTES * 60 * 1000);

    const t = await db.sequelize.transaction();
    try {
        // Tìm tất cả đơn hàng quá hạn: VNPay pending + chưa thanh toán + quá 15 phút
        // HOẶC COD pending + quá 24 giờ
        const expiredOrders = await db.Order.findAll({
            where: {
                status: 'pending',
                [Op.or]: [
                    {
                        paymentMethod: 'VNPAY',
                        paymentStatus: false,
                        createdAt: { [Op.lt]: vnpayDeadline }
                    },
                    {
                        paymentMethod: 'COD',
                        createdAt: { [Op.lt]: codDeadline }
                    }
                ]
            },
            include: [{
                model: db.OrderItem,
                as: 'orderItems',
                attributes: ['id', 'variantId', 'quantity']
            }],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (expiredOrders.length === 0) {
            await t.rollback();
            return;
        }

        console.log(`>>> [HOLD STOCK SCHEDULER] Phát hiện ${expiredOrders.length} đơn hàng quá hạn. Bắt đầu xử lý...`);

        for (const order of expiredOrders) {
            const timeoutType = order.paymentMethod === 'VNPAY'
                ? `VNPay quá ${VNPAY_HOLD_TIMEOUT_MINUTES} phút`
                : `COD quá ${COD_HOLD_TIMEOUT_MINUTES / 60} giờ`;

            // 1. Chuyển trạng thái đơn sang cancelled
            await order.update({ status: 'cancelled' }, { transaction: t });

            // 2. Hoàn trả tồn kho (UNHOLD) cho từng sản phẩm
            if (order.orderItems && order.orderItems.length > 0) {
                for (const item of order.orderItems) {
                    const variant = await db.ProductVariant.findOne({
                        where: { id: item.variantId },
                        transaction: t,
                        lock: t.LOCK.UPDATE
                    });

                    if (variant) {
                        await variant.increment('stock', { by: item.quantity, transaction: t });

                        // Ghi log kho (UNHOLD) — Giải phóng tạm giữ do quá hạn
                        await db.InventoryLog.create({
                            variantId: item.variantId,
                            userId: null, // Hệ thống tự động
                            type: 'UNHOLD',
                            quantity: item.quantity,
                            note: `[AUTO] Hủy tạm giữ do đơn #${order.id} quá hạn (${timeoutType})`
                        }, { transaction: t });
                    }
                }
            }

            // 3. Hoàn trả lượt dùng Coupon (nếu có)
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

            console.log(`>>> [HOLD STOCK SCHEDULER] Đã hủy đơn #${order.id} (${timeoutType}) — Giải phóng ${order.orderItems.length} sản phẩm.`);
        }

        await t.commit();

        // Xóa cache liên quan sau khi hủy hàng loạt
        await Promise.all([
            redisHelper.delByPattern('dashboard:stats:*'),
            redisHelper.delByPattern('order:list:admin:*'),
            redisHelper.delByPattern('product:detail:*'),
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('product:bestsellers:*'),
            redisHelper.delByPattern('product:inventory:logs:*')
        ]);

        console.log(`>>> [HOLD STOCK SCHEDULER] Hoàn tất. Đã xử lý ${expiredOrders.length} đơn quá hạn.`);

    } catch (error) {
        await t.rollback();
        console.error('>>> [HOLD STOCK SCHEDULER] Lỗi nghiêm trọng:', error.message);
    }
};

/**
 * Khởi động Scheduler — Gọi 1 lần duy nhất khi server start
 */
const startHoldStockScheduler = () => {
    console.log(`>>> [HOLD STOCK SCHEDULER] Đã khởi động. Quét mỗi ${SCHEDULER_INTERVAL_MS / 60000} phút.`);
    console.log(`    - VNPay timeout: ${VNPAY_HOLD_TIMEOUT_MINUTES} phút`);
    console.log(`    - COD timeout: ${COD_HOLD_TIMEOUT_MINUTES / 60} giờ`);

    // Chạy lần đầu sau 30 giây (chờ DB connection ổn định)
    setTimeout(() => {
        releaseExpiredHoldStock();
    }, 30 * 1000);

    // Chạy định kỳ
    setInterval(releaseExpiredHoldStock, SCHEDULER_INTERVAL_MS);
};

module.exports = { startHoldStockScheduler };
