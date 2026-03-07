const couponService = require('../service/couponService');
const couponValidation = require('../validations/couponValidation');
const errorCode = require('../config/errorCodes');

const handleCreateCoupon = async (req, res) => {
    try {
        const { error, value } = couponValidation.createCouponSchema.validate(req.body);
        if (error) {
            return res.status(200).json({
                EM: error.details[0].message,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            });
        }

        const data = await couponService.createCoupon(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleCreateCoupon):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetAdminCoupons = async (req, res) => {
    try {
        const { error, value } = couponValidation.getCouponListSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await couponService.getAdminCoupons(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleGetAdminCoupons):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleUpdateCoupon = async (req, res) => {
    try {
        const id = req.params.id;

        const { error: idError } = couponValidation.couponIdSchema.validate({ id });
        if (idError) return res.status(200).json({
            EM: idError.details[0].message,
            EC: errorCode.VALIDATION_ERROR,
            DT: ''
        });

        const { error: bodyError, value } = couponValidation.updateCouponSchema.validate(req.body);
        if (bodyError) return res.status(200).json({
            EM: bodyError.details[0].message,
            EC: errorCode.VALIDATION_ERROR,
            DT: ''
        });

        const data = await couponService.updateCoupon(id, value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdateCoupon):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleDeleteCoupon = async (req, res) => {
    try {
        const id = req.params.id;

        const { error } = couponValidation.couponIdSchema.validate({ id });
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await couponService.deleteCoupon(id);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleDeleteCoupon):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
module.exports = {
    handleCreateCoupon, handleUpdateCoupon, handleDeleteCoupon, handleGetAdminCoupons
};