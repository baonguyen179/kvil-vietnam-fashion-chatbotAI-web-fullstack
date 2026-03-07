const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().trim().pattern(/^\S+@\S+\.\S+$/).required().messages({
        'any.required': 'Missing required parameters!',
        'string.empty': 'Missing required parameters!',
        'string.pattern.base': 'Invalid email format!'
    }),
    phone: Joi.string().trim().pattern(/^\d{10,11}$/).required().messages({
        'any.required': 'Missing required parameters!',
        'string.empty': 'Missing required parameters!',
        'string.pattern.base': 'Invalid phone number format!'
    }),
    password: Joi.string().min(6).required().messages({
        'any.required': 'Missing required parameters!',
        'string.empty': 'Missing required parameters!',
        'string.min': 'The password must be more than 6 letters.'
    }),
    fullName: Joi.string().trim().required().messages({
        'any.required': 'Missing required parameters!',
        'string.empty': 'Missing required parameters!'
    })
});

const loginSchema = Joi.object({
    loginValue: Joi.string().trim().required().messages({
        'any.required': 'Missing required parameters!',
        'string.empty': 'Missing required parameters!'
    }),
    password: Joi.string().min(6).required().messages({
        'any.required': 'Missing required parameters!',
        'string.empty': 'Missing required parameters!',
        'string.min': 'The password must be more than 6 letters.'
    })
});

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
        'any.required': 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới!',
        'string.empty': 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới!'
    }),
    newPassword: Joi.string().min(6).invalid(Joi.ref('oldPassword')).required().messages({
        'any.required': 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới!',
        'string.empty': 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới!',
        'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự!',
        'any.invalid': 'Mật khẩu mới không được trùng với mật khẩu cũ!' // Tự động check trùng PW cũ!
    })
});

module.exports = {
    registerSchema,
    loginSchema,
    changePasswordSchema
};