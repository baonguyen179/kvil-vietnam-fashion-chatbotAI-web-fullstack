const Joi = require('joi');
const { ROLES } = require('../config/roles');

const createUserAddressSchema = Joi.object({
    receiverName: Joi.string().max(100).required().messages({
        'string.empty': 'Vui lòng nhập tên người nhận!',
        'any.required': 'Vui lòng nhập tên người nhận!'
    }),
    phoneNumber: Joi.string().pattern(/^[0-9]{10,11}$/).required().messages({
        'string.pattern.base': 'Số điện thoại không hợp lệ (Phải là 10-11 số)!',
        'string.empty': 'Vui lòng nhập số điện thoại!'
    }),
    province: Joi.string().required().messages({ 'string.empty': 'Vui lòng chọn Tỉnh/Thành phố!' }),
    ward: Joi.string().required().messages({ 'string.empty': 'Vui lòng chọn Phường/Xã!' }),
    detailAddress: Joi.string().required().messages({ 'string.empty': 'Vui lòng nhập địa chỉ chi tiết!' }),
    isDefault: Joi.boolean().allow('', null)
});
const updateUserProfileSchema = Joi.object({
    fullName: Joi.string().max(100).allow('', null).messages({
        'string.max': 'Họ tên không được vượt quá 100 ký tự!'
    }),
    gender: Joi.boolean().allow('', null).messages({
        'boolean.base': 'Giới tính phải là kiểu boolean (true/false)!'
    }),
    birthday: Joi.date().iso().allow('', null).messages({
        'date.format': 'Ngày sinh phải đúng định dạng (VD: 1999-12-31)!'
    })
});
const getAdminUserListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('', null),
    role: Joi.string().valid(...Object.values(ROLES)).allow('', null)
});
const userIdSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'number.base': 'ID người dùng phải là số nguyên!',
        'any.required': 'Vui lòng cung cấp ID người dùng trên URL!'
    })
});
const updateUserRBACSchema = Joi.object({
    roles: Joi.array().items(Joi.string().valid(...Object.values(ROLES))).min(1).required().messages({
        'array.min': 'Vui lòng cung cấp ít nhất một vai trò!',
        'any.required': 'Thiếu danh sách vai trò (roles)!'
    }),
    permissions: Joi.array().items(Joi.string()).allow(null)
});
const addressIdSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'number.base': 'ID địa chỉ phải là một số nguyên!',
        'any.required': 'Thiếu ID địa chỉ!'
    })
});
const createAdminUserSchema = Joi.object({
    loginValue: Joi.string().required().messages({
        'string.empty': 'Vui lòng nhập Email hoặc Số điện thoại!'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự!',
        'string.empty': 'Vui lòng nhập mật khẩu!'
    }),
    fullName: Joi.string().max(100).allow('', null)
});

module.exports = {
    getAdminUserListSchema,
    userIdSchema,
    updateUserRBACSchema,
    updateUserProfileSchema,
    createUserAddressSchema,
    addressIdSchema,
    createAdminUserSchema
};