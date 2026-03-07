const Joi = require('joi');

const createCouponSchema = Joi.object({
    code: Joi.string().uppercase().required().messages({
        'string.empty': 'Mã code không được để trống!',
        'any.required': 'Vui lòng nhập mã code (VD: KM_HE_2026)!'
    }),
    discountType: Joi.string().valid('fixed', 'percent').required().messages({
        'any.only': 'Loại giảm giá chỉ được là fixed (cố định) hoặc percent (phần trăm)!'
    }),
    discountValue: Joi.number().min(0).required(),
    minOrderValue: Joi.number().min(0).default(0),
    maxDiscountAmount: Joi.number().min(0).allow(null, ''), // Chỉ dùng khi type là percent
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
        'date.min': 'Ngày kết thúc phải lớn hơn ngày bắt đầu!'
    }),
    usageLimit: Joi.number().integer().min(1).required(),
    isActive: Joi.boolean().default(true)
});
const getCouponListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    isActive: Joi.boolean().allow('', null), // Lọc theo trạng thái bật/tắt
    search: Joi.string().allow('', null) // Tìm kiếm theo mã code (VD: KM_HE)
});
const updateCouponSchema = Joi.object({
    code: Joi.string().uppercase().messages({
        'string.empty': 'Mã code không được để trống!'
    }),
    discountType: Joi.string().valid('fixed', 'percent'),
    discountValue: Joi.number().min(0),
    minOrderValue: Joi.number().min(0),
    maxDiscountAmount: Joi.number().min(0).allow(null, ''),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
        'date.min': 'Ngày kết thúc phải lớn hơn ngày bắt đầu!'
    }),
    usageLimit: Joi.number().integer().min(1),
    isActive: Joi.boolean()
});

const couponIdSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'number.base': 'ID mã giảm giá phải là số nguyên!',
        'any.required': 'Vui lòng cung cấp ID mã giảm giá trên URL!'
    })
});
module.exports = {
    createCouponSchema, updateCouponSchema, couponIdSchema, getCouponListSchema
};