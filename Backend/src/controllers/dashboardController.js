const dashboardService = require('../service/dashboardService');
const dashboardValidation = require('../validations/dashboardValidation');
const errorCode = require('../config/errorCodes');

const handleGetDashboardStats = async (req, res) => {
    try {
        const { error, value } = dashboardValidation.getDashboardStatsSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await dashboardService.getDashboardStats(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleGetDashboardStats):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}

module.exports = {
    handleGetDashboardStats
};