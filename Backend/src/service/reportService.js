const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const redisHelper = require('../helpers/redis.helper');
const { QueryTypes } = require('sequelize');

// Cache TTL: 30 minutes
const REPORT_CACHE_TTL = 1800;

/**
 * Xử lý query params để lấy khoảng thời gian
 */
const processDateParams = (queryParams) => {
    let end = queryParams.endDate ? new Date(queryParams.endDate) : new Date();
    let start;
    if (queryParams.startDate) {
        start = new Date(queryParams.startDate);
    } else {
        // Mặc định là đầu tháng hiện tại của endDate
        start = new Date(end.getFullYear(), end.getMonth(), 1);
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
};

const getOverviewReport = async (queryParams) => {
    try {
        const { startDate, endDate } = processDateParams(queryParams);
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:overview:${startDate.toISOString()}:${endDate.toISOString()}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo tổng quan (cache) thành công', DT: cached };
        }

        // 1.1 Doanh thu
        // Hôm nay
        const todayRes = await db.sequelize.query(`
            SELECT COALESCE(SUM(finalAmount), 0) AS todayRevenue FROM Orders
            WHERE status='delivered' AND DATE(createdAt) = CURDATE();
        `, { type: QueryTypes.SELECT });
        const todayRevenue = parseFloat(todayRes[0]?.todayRevenue || 0);

        // Tuần này
        const weekRes = await db.sequelize.query(`
            SELECT COALESCE(SUM(finalAmount), 0) AS weekRevenue FROM Orders
            WHERE status='delivered' AND YEARWEEK(createdAt) = YEARWEEK(NOW());
        `, { type: QueryTypes.SELECT });
        const weekRevenue = parseFloat(weekRes[0]?.weekRevenue || 0);

        // Tháng này vs tháng trước
        const monthRes = await db.sequelize.query(`
            SELECT
              COALESCE(SUM(CASE WHEN MONTH(createdAt) = MONTH(NOW()) AND YEAR(createdAt) = YEAR(NOW()) THEN finalAmount ELSE 0 END), 0) AS thisMonthRevenue,
              COALESCE(SUM(CASE WHEN MONTH(createdAt) = MONTH(NOW() - INTERVAL 1 MONTH) AND YEAR(createdAt) = YEAR(NOW() - INTERVAL 1 MONTH) THEN finalAmount ELSE 0 END), 0) AS lastMonthRevenue
            FROM Orders WHERE status='delivered';
        `, { type: QueryTypes.SELECT });
        const thisMonthRevenue = parseFloat(monthRes[0]?.thisMonthRevenue || 0);
        const lastMonthRevenue = parseFloat(monthRes[0]?.lastMonthRevenue || 0);
        let growthPercent = 0;
        if (lastMonthRevenue > 0) {
            growthPercent = parseFloat(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2));
        } else if (thisMonthRevenue > 0) {
            growthPercent = 100;
        }

        // 1.2 Đơn hàng (trong khoảng thời gian)
        const ordersRes = await db.sequelize.query(`
            SELECT
              COUNT(*) AS total,
              COALESCE(SUM(status='delivered'), 0) AS success,
              COALESCE(SUM(status='cancelled'), 0) AS cancelled,
              COALESCE(SUM(status='returned'), 0) AS returned
            FROM Orders
            WHERE createdAt BETWEEN :startDate AND :endDate;
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });
        const ordersStats = {
            total: parseInt(ordersRes[0]?.total || 0, 10),
            success: parseInt(ordersRes[0]?.success || 0, 10),
            cancelled: parseInt(ordersRes[0]?.cancelled || 0, 10),
            returned: parseInt(ordersRes[0]?.returned || 0, 10)
        };

        // 1.3 Khách hàng & AOV (trong khoảng thời gian)
        // Khách mới
        const newCustRes = await db.sequelize.query(`
            SELECT COUNT(DISTINCT userId) AS count FROM Orders
            WHERE createdAt BETWEEN :startDate AND :endDate
            AND userId NOT IN (
              SELECT DISTINCT userId FROM Orders WHERE createdAt < :startDate
            );
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });
        const newCustomers = parseInt(newCustRes[0]?.count || 0, 10);

        // Khách quay lại
        const retCustRes = await db.sequelize.query(`
            SELECT COUNT(DISTINCT userId) AS count FROM Orders
            WHERE createdAt BETWEEN :startDate AND :endDate
            AND userId IN (
              SELECT userId FROM Orders GROUP BY userId HAVING COUNT(*) >= 2
            );
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });
        const returningCustomers = parseInt(retCustRes[0]?.count || 0, 10);

        // AOV
        const aovRes = await db.sequelize.query(`
            SELECT COALESCE(AVG(finalAmount), 0) AS aov FROM Orders
            WHERE status='delivered' AND createdAt BETWEEN :startDate AND :endDate;
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });
        const aov = parseFloat(aovRes[0]?.aov || 0);

        const data = {
            revenue: {
                today: todayRevenue,
                thisWeek: weekRevenue,
                thisMonth: thisMonthRevenue,
                lastMonth: lastMonthRevenue,
                growthPercent
            },
            orders: ordersStats,
            customers: {
                newCustomers,
                returningCustomers,
                aov
            }
        };

        await redisHelper.setCache(cacheKey, data, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo tổng quan thành công', DT: data };
    } catch (error) {
        console.error('>>> getOverviewReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo tổng quan', DT: null };
    }
};

const getTopProductsReport = async (queryParams) => {
    try {
        const { startDate, endDate } = processDateParams(queryParams);
        const limit = queryParams.limit || 10;
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:top-products:${startDate.toISOString()}:${endDate.toISOString()}:${limit}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo sản phẩm bán chạy (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              p.id,
              p.name,
              SUM(oi.quantity) AS totalSold
            FROM OrderItems oi
            JOIN ProductVariants pv ON pv.id = oi.variantId
            JOIN Products p ON p.id = pv.productId
            JOIN Orders o ON o.id = oi.orderId
            WHERE o.status = 'delivered'
              AND o.createdAt BETWEEN :startDate AND :endDate
            GROUP BY p.id
            ORDER BY totalSold DESC
            LIMIT ${parseInt(limit, 10)};
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            id: item.id,
            name: item.name,
            totalSold: parseInt(item.totalSold || 0, 10)
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo sản phẩm bán chạy thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getTopProductsReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo sản phẩm bán chạy', DT: null };
    }
};

const getSlowProductsReport = async (queryParams) => {
    try {
        const { startDate, endDate } = processDateParams(queryParams);
        const limit = queryParams.limit || 10;
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:slow-products:${startDate.toISOString()}:${endDate.toISOString()}:${limit}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo sản phẩm bán chậm (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              p.id,
              p.name,
              COALESCE(SUM(oi.quantity), 0) AS totalSold,
              SUM(pv.stock) AS currentStock
            FROM Products p
            JOIN ProductVariants pv ON pv.productId = p.id
            LEFT JOIN OrderItems oi ON oi.variantId = pv.id
              AND oi.orderId IN (
                SELECT id FROM Orders WHERE status='delivered'
                  AND createdAt BETWEEN :startDate AND :endDate
              )
            WHERE p.deletedAt IS NULL
            GROUP BY p.id
            HAVING currentStock > 0
            ORDER BY totalSold ASC
            LIMIT ${parseInt(limit, 10)};
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            id: item.id,
            name: item.name,
            totalSold: parseInt(item.totalSold || 0, 10),
            currentStock: parseInt(item.currentStock || 0, 10)
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo sản phẩm bán chậm thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getSlowProductsReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo sản phẩm bán chậm', DT: null };
    }
};

const getLowStockReport = async (queryParams) => {
    try {
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:low-stock`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo sắp hết hàng (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              p.name AS product,
              s.name AS size,
              c.name AS color,
              pv.stock,
              pv.sku
            FROM ProductVariants pv
            JOIN Products p ON p.id = pv.productId
            JOIN Sizes s ON s.id = pv.sizeId
            JOIN Colors c ON c.id = pv.colorId
            WHERE pv.stock < 10 AND pv.stock > 0
              AND p.deletedAt IS NULL
            ORDER BY pv.stock ASC;
        `, {
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            product: item.product,
            size: item.size,
            color: item.color,
            stock: parseInt(item.stock || 0, 10),
            sku: item.sku
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo sắp hết hàng thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getLowStockReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo sắp hết hàng', DT: null };
    }
};

const getOverstockReport = async (queryParams) => {
    try {
        const limit = queryParams.limit || 10;
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:overstock:${limit}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo chôn vốn (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              p.id,
              p.name,
              SUM(pv.stock) AS totalStock,
              COALESCE(SUM(pv.stock * il_avg.avgCost), 0) AS estimatedValue
            FROM Products p
            JOIN ProductVariants pv ON pv.productId = p.id
            LEFT JOIN (
              SELECT variantId,
                SUM(quantity * costPrice) / NULLIF(SUM(quantity), 0) AS avgCost
              FROM InventoryLogs WHERE type='IN' AND costPrice > 0
              GROUP BY variantId
            ) il_avg ON il_avg.variantId = pv.id
            WHERE p.deletedAt IS NULL
            GROUP BY p.id
            HAVING totalStock > 100
            ORDER BY totalStock DESC
            LIMIT ${parseInt(limit, 10)};
        `, {
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            id: item.id,
            name: item.name,
            totalStock: parseInt(item.totalStock || 0, 10),
            estimatedValue: parseFloat(item.estimatedValue || 0)
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo chôn vốn thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getOverstockReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo chôn vốn', DT: null };
    }
};

const getSellThroughReport = async (queryParams) => {
    try {
        const { startDate, endDate } = processDateParams(queryParams);
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:sell-through:${startDate.toISOString()}:${endDate.toISOString()}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo tốc độ bán hàng (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              p.id,
              p.name,
              COALESCE(SUM(oi.quantity), 0)                               AS sold,
              COALESCE(SUM(il_in.totalIn), 0)                             AS imported,
              ROUND(COALESCE(SUM(oi.quantity), 0) / NULLIF(COALESCE(SUM(il_in.totalIn), 0), 0) * 100, 1) AS sellThroughRate
            FROM Products p
            JOIN ProductVariants pv ON pv.productId = p.id
            LEFT JOIN (
              SELECT variantId, SUM(quantity) AS totalIn FROM InventoryLogs
              WHERE type='IN' AND createdAt BETWEEN :startDate AND :endDate
              GROUP BY variantId
            ) il_in ON il_in.variantId = pv.id
            LEFT JOIN OrderItems oi ON oi.variantId = pv.id
              AND oi.orderId IN (
                SELECT id FROM Orders WHERE status='delivered'
                  AND createdAt BETWEEN :startDate AND :endDate
              )
            WHERE p.deletedAt IS NULL
            GROUP BY p.id
            ORDER BY sellThroughRate DESC;
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            id: item.id,
            name: item.name,
            sold: parseInt(item.sold || 0, 10),
            imported: parseInt(item.imported || 0, 10),
            sellThroughRate: item.sellThroughRate !== null ? parseFloat(item.sellThroughRate) : null
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo tốc độ bán hàng thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getSellThroughReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo tốc độ bán hàng', DT: null };
    }
};

const getRevenueByCategoryReport = async (queryParams) => {
    try {
        const { startDate, endDate } = processDateParams(queryParams);
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:revenue-category:${startDate.toISOString()}:${endDate.toISOString()}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo doanh thu theo danh mục (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              cat.id,
              cat.name AS category,
              COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue
            FROM OrderItems oi
            JOIN ProductVariants pv ON pv.id = oi.variantId
            JOIN Products p ON p.id = pv.productId
            JOIN Categories cat ON cat.id = p.categoryId
            JOIN Orders o ON o.id = oi.orderId
            WHERE o.status = 'delivered'
              AND o.createdAt BETWEEN :startDate AND :endDate
            GROUP BY cat.id
            ORDER BY revenue DESC;
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            id: item.id,
            category: item.category,
            revenue: parseFloat(item.revenue || 0)
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo doanh thu theo danh mục thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getRevenueByCategoryReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo doanh thu theo danh mục', DT: null };
    }
};

const getProfitReport = async (queryParams) => {
    try {
        const { startDate, endDate } = processDateParams(queryParams);
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:profit:${startDate.toISOString()}:${endDate.toISOString()}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo lợi nhuận gộp (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              MONTH(o.createdAt)                              AS month,
              YEAR(o.createdAt)                               AS year,
              SUM(oi.price * oi.quantity)                     AS revenue,
              SUM(oi.costPrice * oi.quantity)                 AS cogs,
              SUM((oi.price - oi.costPrice) * oi.quantity)    AS grossProfit,
              ROUND(
                SUM((oi.price - oi.costPrice) * oi.quantity)
                / NULLIF(SUM(oi.price * oi.quantity), 0) * 100
              , 1)                                            AS marginPercent
            FROM Orders o
            JOIN OrderItems oi ON oi.orderId = o.id
            WHERE o.status = 'delivered'
              AND o.createdAt BETWEEN :startDate AND :endDate
            GROUP BY YEAR(o.createdAt), MONTH(o.createdAt)
            ORDER BY year DESC, month DESC;
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            month: parseInt(item.month, 10),
            year: parseInt(item.year, 10),
            revenue: parseFloat(item.revenue || 0),
            cogs: parseFloat(item.cogs || 0),
            grossProfit: parseFloat(item.grossProfit || 0),
            marginPercent: item.marginPercent !== null ? parseFloat(item.marginPercent) : 0
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo lợi nhuận gộp thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getProfitReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo lợi nhuận gộp', DT: null };
    }
};

const getTopCustomersReport = async (queryParams) => {
    try {
        const { startDate, endDate } = processDateParams(queryParams);
        const limit = queryParams.limit || 10;
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:top-customers:${startDate.toISOString()}:${endDate.toISOString()}:${limit}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo khách hàng tiêu biểu (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              u.id,
              u.fullName,
              u.email,
              COUNT(o.id)          AS orderCount,
              SUM(o.finalAmount)   AS totalSpent
            FROM Users u
            JOIN Orders o ON o.userId = u.id
            WHERE o.status = 'delivered'
              AND o.createdAt BETWEEN :startDate AND :endDate
            GROUP BY u.id
            ORDER BY totalSpent DESC
            LIMIT ${parseInt(limit, 10)};
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            id: item.id,
            fullName: item.fullName,
            email: item.email,
            orderCount: parseInt(item.orderCount || 0, 10),
            totalSpent: parseFloat(item.totalSpent || 0)
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo khách hàng tiêu biểu thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getTopCustomersReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo khách hàng tiêu biểu', DT: null };
    }
};

const getCouponPerformanceReport = async (queryParams) => {
    try {
        const { startDate, endDate } = processDateParams(queryParams);
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:coupon-perf:${startDate.toISOString()}:${endDate.toISOString()}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo hiệu quả mã giảm giá (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              c.id,
              c.code,
              c.discountType,
              c.discountValue,
              COUNT(o.id)              AS usedCount,
              SUM(o.discountAmount)    AS totalDiscounted,
              SUM(o.finalAmount)       AS revenueGenerated
            FROM Coupons c
            JOIN Orders o ON o.couponId = c.id
            WHERE o.status = 'delivered'
              AND o.createdAt BETWEEN :startDate AND :endDate
            GROUP BY c.id
            ORDER BY usedCount DESC;
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            id: item.id,
            code: item.code,
            discountType: item.discountType,
            discountValue: parseFloat(item.discountValue || 0),
            usedCount: parseInt(item.usedCount || 0, 10),
            totalDiscounted: parseFloat(item.totalDiscounted || 0),
            revenueGenerated: parseFloat(item.revenueGenerated || 0)
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo hiệu quả mã giảm giá thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getCouponPerformanceReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo hiệu quả mã giảm giá', DT: null };
    }
};

const getTopProfitProductsReport = async (queryParams) => {
    try {
        const { startDate, endDate } = processDateParams(queryParams);
        const limit = queryParams.limit || 10;
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:top-profit:${startDate.toISOString()}:${endDate.toISOString()}:${limit}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo top lợi nhuận (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              p.id,
              p.name,
              SUM(oi.quantity) AS totalSold,
              SUM(oi.price * oi.quantity) AS revenue,
              SUM(oi.costPrice * oi.quantity) AS cogs,
              SUM((oi.price - oi.costPrice) * oi.quantity) AS profit
            FROM OrderItems oi
            JOIN ProductVariants pv ON pv.id = oi.variantId
            JOIN Products p ON p.id = pv.productId
            JOIN Orders o ON o.id = oi.orderId
            WHERE o.status = 'delivered'
              AND o.createdAt BETWEEN :startDate AND :endDate
              AND p.deletedAt IS NULL
            GROUP BY p.id
            ORDER BY profit DESC
            LIMIT ${parseInt(limit, 10)};
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            id: item.id,
            name: item.name,
            totalSold: parseInt(item.totalSold || 0, 10),
            revenue: parseFloat(item.revenue || 0),
            cogs: parseFloat(item.cogs || 0),
            profit: parseFloat(item.profit || 0)
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo top lợi nhuận thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getTopProfitProductsReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo top lợi nhuận', DT: null };
    }
};

const getTopReturnedProductsReport = async (queryParams) => {
    try {
        const { startDate, endDate } = processDateParams(queryParams);
        const limit = queryParams.limit || 10;
        const refresh = queryParams.refresh === 'true' || queryParams.refresh === true;

        const cacheKey = `admin:report:top-returned:${startDate.toISOString()}:${endDate.toISOString()}:${limit}`;
        if (!refresh) {
            const cached = await redisHelper.getCache(cacheKey);
            if (cached) return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo tỉ lệ hoàn trả (cache) thành công', DT: cached };
        }

        const data = await db.sequelize.query(`
            SELECT
              p.id,
              p.name,
              COALESCE(SUM(CASE WHEN o.status = 'returned' THEN oi.quantity ELSE 0 END), 0) AS returnedQty,
              COALESCE(SUM(CASE WHEN o.status IN ('delivered', 'returned') THEN oi.quantity ELSE 0 END), 0) AS soldQty,
              ROUND(
                COALESCE(SUM(CASE WHEN o.status = 'returned' THEN oi.quantity ELSE 0 END), 0) /
                NULLIF(COALESCE(SUM(CASE WHEN o.status IN ('delivered', 'returned') THEN oi.quantity ELSE 0 END), 0), 0) * 100,
                1
              ) AS returnRate
            FROM OrderItems oi
            JOIN ProductVariants pv ON pv.id = oi.variantId
            JOIN Products p ON p.id = pv.productId
            JOIN Orders o ON o.id = oi.orderId
            WHERE o.status IN ('delivered', 'returned')
              AND o.createdAt BETWEEN :startDate AND :endDate
              AND p.deletedAt IS NULL
            GROUP BY p.id
            HAVING soldQty > 0
            ORDER BY returnRate DESC, returnedQty DESC
            LIMIT ${parseInt(limit, 10)};
        `, {
            replacements: { startDate, endDate },
            type: QueryTypes.SELECT
        });

        const formatted = data.map(item => ({
            id: item.id,
            name: item.name,
            returnedQty: parseInt(item.returnedQty || 0, 10),
            soldQty: parseInt(item.soldQty || 0, 10),
            returnRate: parseFloat(item.returnRate || 0)
        }));

        await redisHelper.setCache(cacheKey, formatted, REPORT_CACHE_TTL);
        return { EC: errorCode.SUCCESS, EM: 'Lấy báo cáo tỉ lệ hoàn trả thành công', DT: formatted };
    } catch (error) {
        console.error('>>> getTopReturnedProductsReport Error:', error);
        return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ khi lấy báo cáo tỉ lệ hoàn trả', DT: null };
    }
};

module.exports = {
    getOverviewReport,
    getTopProductsReport,
    getSlowProductsReport,
    getLowStockReport,
    getOverstockReport,
    getSellThroughReport,
    getRevenueByCategoryReport,
    getProfitReport,
    getTopCustomersReport,
    getCouponPerformanceReport,
    getTopProfitProductsReport,
    getTopReturnedProductsReport
};
