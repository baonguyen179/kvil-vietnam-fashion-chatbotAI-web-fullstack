const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const { Op } = require('sequelize');
const redisHelper = require('../helpers/redis.helper');
const { ROLES } = require('../config/roles');

// TTL cho dashboard stats — mặc định 5 phút
const DASHBOARD_CACHE_TTL = parseInt(process.env.DASHBOARD_CACHE_TTL, 10) || 300;

const toDateStr = (d) => d.toISOString().slice(0, 10);

const getDashboardStats = async (queryParams) => {
    let currentStep = 'Khởi tạo getDashboardStats';
    try {
        currentStep = 'Xác định khoảng thời gian thống kê';
        const end   = queryParams.endDate   ? new Date(queryParams.endDate)   : new Date();
        const start = queryParams.startDate ? new Date(queryParams.startDate) : new Date(new Date().setDate(end.getDate() - 30));

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Dùng chuỗi ngày (YYYY-MM-DD) thay vì timestamp ms:
        //  Tăng cache hit rate khi frontend gọi nhiều lần trong cùng 1 ngày
        const cacheKey = `dashboard:stats:${toDateStr(start)}:${toDateStr(end)}`;

        const cachedData = await redisHelper.getCache(cacheKey);
        if (cachedData) {
            return {
                EM: 'Lấy dữ liệu thống kê (Cache) thành công!',
                EC: errorCode.SUCCESS,
                DT: cachedData
            };
        }

        const dateCondition = { createdAt: { [Op.between]: [start, end] } };

        currentStep = 'Promise.all — chạy song song tất cả queries';
        // Chạy SONG SONG tất cả queries thay vì tuần tự → giảm ~70% thời gian chờ DB
        const [
            totalRevenue,
            totalOrders,
            pendingOrders,
            newCustomers,
            totalProducts,
            chartData,
            orderStatusBreakdown,
            totalCostResult,
            dailyCostData,
        ] = await Promise.all([

            // [1] Tổng doanh thu — chỉ đơn đã giao thành công
            db.Order.sum('finalAmount', {
                where: { ...dateCondition, status: 'delivered' }
            }),

            // [2] Tổng đơn hàng (trừ đơn bị hủy)
            db.Order.count({
                where: { ...dateCondition, status: { [Op.ne]: 'cancelled' } }
            }),

            // [3] Đơn đang chờ xử lý
            db.Order.count({
                where: { ...dateCondition, status: 'pending' }
            }),

            // [4] Khách hàng mới đăng ký trong khoảng thời gian
            db.User.count({
                include: [{
                    model: db.Role,
                    as: 'roles',
                    where: { name: ROLES.CUSTOMER }
                }],
                where: dateCondition,
                distinct: true
            }),

            // [5] Tổng sản phẩm đang có trong hệ thống
            db.Product.count(),

            // [6] Dữ liệu biểu đồ doanh thu theo ngày
            db.Order.findAll({
                attributes: [
                    [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'date'],
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount'],
                    [db.sequelize.fn('SUM', db.sequelize.col('finalAmount')), 'revenue']
                ],
                where: { ...dateCondition, status: 'delivered' },
                group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
                order: [[db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'ASC']],
                raw: true
            }),

            // [7] Phân tích trạng thái đơn hàng (để vẽ pie chart)
            db.Order.findAll({
                attributes: [
                    'status',
                    [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
                ],
                where: dateCondition,
                group: ['status'],
                raw: true
            }),

            // [8] Tổng giá vốn của các đơn đã giao thành công
            db.OrderItem.findAll({
                attributes: [
                    [db.sequelize.fn('SUM', db.sequelize.literal('OrderItem.costPrice * OrderItem.quantity')), 'totalCost']
                ],
                include: [{
                    model: db.Order,
                    as: 'order',
                    where: { ...dateCondition, status: 'delivered' },
                    attributes: []
                }],
                raw: true
            }),

            // [9] Giá vốn theo ngày
            db.OrderItem.findAll({
                attributes: [
                    [db.sequelize.fn('DATE', db.sequelize.col('OrderItem.createdAt')), 'date'],
                    [db.sequelize.fn('SUM', db.sequelize.literal('OrderItem.costPrice * OrderItem.quantity')), 'totalCost']
                ],
                include: [{
                    model: db.Order,
                    as: 'order',
                    where: { ...dateCondition, status: 'delivered' },
                    attributes: []
                }],
                group: [db.sequelize.fn('DATE', db.sequelize.col('OrderItem.createdAt'))],
                raw: true
            })
        ]);

        const totalCost = parseFloat(totalCostResult?.[0]?.totalCost || 0);
        const grossProfit = parseFloat(totalRevenue || 0) - totalCost;
        const profitMargin = totalRevenue > 0 ? (grossProfit / parseFloat(totalRevenue)) * 100 : 0;

        const costMap = new Map();
        (dailyCostData || []).forEach(row => {
            const formattedDate = row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date);
            costMap.set(formattedDate, parseFloat(row.totalCost || 0));
        });

        const formattedChartData = chartData.map(row => {
            const dateStr = row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date);
            const revenue = parseFloat(row.revenue || 0);
            const cost = costMap.get(dateStr) || 0;
            const profit = revenue - cost;
            return {
                date: row.date,
                orderCount: parseInt(row.orderCount, 10),
                revenue,
                totalCost: cost,
                grossProfit: profit
            };
        });

        const resultData = {
            summary: {
                totalRevenue: parseFloat(totalRevenue || 0),
                totalCost,
                grossProfit,
                profitMargin,
                totalOrders,
                pendingOrders,
                newCustomers,
                totalProducts,
            },
            chart: formattedChartData,
            orderStatusBreakdown: orderStatusBreakdown.map(row => ({
                status: row.status,
                count: parseInt(row.count, 10),
            })),
            period: {
                startDate: toDateStr(start),
                endDate: toDateStr(end),
            },
            generatedAt: new Date().toISOString(),
        };

        await redisHelper.setCache(cacheKey, resultData, DASHBOARD_CACHE_TTL);

        return {
            EM: 'Lấy dữ liệu thống kê thành công!',
            EC: errorCode.SUCCESS,
            DT: resultData
        };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại getDashboardStats!`);
        console.error(`- CHẾT TẠI BƯỚC: ${currentStep}`);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi lấy dữ liệu thống kê', EC: errorCode.OTHER_ERROR, DT: null };
    }
};

module.exports = {
    getDashboardStats
};