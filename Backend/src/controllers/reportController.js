const reportService = require('../service/reportService');
const reportValidation = require('../validations/reportValidation');
const errorCode = require('../config/errorCodes');

const handleGetOverview = async (req, res) => {
    try {
        const { error, value } = reportValidation.getReportSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        const data = await reportService.getOverviewReport(value);
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetOverview):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetTopProducts = async (req, res) => {
    try {
        const { error, value } = reportValidation.getReportSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        const data = await reportService.getTopProductsReport(value);
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetTopProducts):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetSlowProducts = async (req, res) => {
    try {
        const { error, value } = reportValidation.getReportSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        const data = await reportService.getSlowProductsReport(value);
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetSlowProducts):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetLowStock = async (req, res) => {
    try {
        const { error, value } = reportValidation.getReportSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        const data = await reportService.getLowStockReport(value);
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetLowStock):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetOverstock = async (req, res) => {
    try {
        const { error, value } = reportValidation.getReportSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        const data = await reportService.getOverstockReport(value);
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetOverstock):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetSellThrough = async (req, res) => {
    try {
        const { error, value } = reportValidation.getReportSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        const data = await reportService.getSellThroughReport(value);
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetSellThrough):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetRevenueByCategory = async (req, res) => {
    try {
        const { error, value } = reportValidation.getReportSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        const data = await reportService.getRevenueByCategoryReport(value);
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetRevenueByCategory):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetProfit = async (req, res) => {
    try {
        const { error, value } = reportValidation.getReportSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        const data = await reportService.getProfitReport(value);
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetProfit):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetTopCustomers = async (req, res) => {
    try {
        const { error, value } = reportValidation.getReportSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        const data = await reportService.getTopCustomersReport(value);
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetTopCustomers):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetCouponPerformance = async (req, res) => {
    try {
        const { error, value } = reportValidation.getReportSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        const data = await reportService.getCouponPerformanceReport(value);
        return res.status(200).json(data);
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetCouponPerformance):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

module.exports = {
    handleGetOverview,
    handleGetTopProducts,
    handleGetSlowProducts,
    handleGetLowStock,
    handleGetOverstock,
    handleGetSellThrough,
    handleGetRevenueByCategory,
    handleGetProfit,
    handleGetTopCustomers,
    handleGetCouponPerformance
};
