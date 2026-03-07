const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const { Op } = require('sequelize');

const getDashboardStats = async (queryParams) => {
    let currentStep = 'Khởi tạo getDashboardStats';
    try {
        currentStep = 'Xác định khoảng thời gian thống kê';
        // Mặc định lấy 30 ngày gần nhất nếu Admin không truyền
        const end = queryParams.endDate ? new Date(queryParams.endDate) : new Date();
        const start = queryParams.startDate ? new Date(queryParams.startDate) : new Date(new Date().setDate(end.getDate() - 30));

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const dateCondition = { createdAt: { [Op.between]: [start, end] } };

        currentStep = 'Query 1: Lấy số liệu Tổng quan (Summary Cards)';
        // Tổng doanh thu (Chỉ tính các đơn đã Giao thành công)
        const totalRevenue = await db.Order.sum('finalAmount', {
            where: { ...dateCondition, status: 'delivered' }
        }) || 0;

        // Tổng số đơn hàng (Trừ đơn bị hủy)
        const totalOrders = await db.Order.count({
            where: { ...dateCondition, status: { [Op.ne]: 'cancelled' } }
        });

        // Số đơn đang chờ xử lý
        const pendingOrders = await db.Order.count({
            where: { ...dateCondition, status: 'pending' }
        });

        currentStep = 'Query 2: Lấy dữ liệu vẽ biểu đồ (Gom nhóm theo ngày)';
        const chartData = await db.Order.findAll({
            attributes: [
                [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'date'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount'],
                [db.sequelize.fn('SUM', db.sequelize.col('finalAmount')), 'revenue']
            ],
            where: {
                ...dateCondition,
                status: 'delivered'
            },
            group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
            order: [[db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'ASC']],
            raw: true
        });

        return {
            EM: 'Lấy dữ liệu thống kê thành công!',
            EC: errorCode.SUCCESS,
            DT: {
                summary: {
                    totalRevenue: parseInt(totalRevenue),
                    totalOrders,
                    pendingOrders
                },
                chart: chartData
            }
        };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại getDashboardStats!`);
        console.error(`- CHẾT TẠI BƯỚC: ${currentStep}`);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi lấy dữ liệu thống kê', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}

module.exports = {
    getDashboardStats
};