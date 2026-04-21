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
const sendOtpSchema = Joi.object({
    email: Joi.string().trim().pattern(/^\S+@\S+\.\S+$/).required().messages({
        'any.required': 'Vui lòng cung cấp email!',
        'string.empty': 'Vui lòng cung cấp email!',
        'string.pattern.base': 'Email không đúng định dạng!'
    })
});

const resetPasswordOtpSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    otp: Joi.string().length(6).required().messages({
        'string.length': 'Mã OTP phải có đúng 6 chữ số!',
        'any.required': 'Vui lòng nhập mã OTP!'
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự!',
        'any.required': 'Vui lòng nhập mật khẩu mới!'
    })
});
module.exports = {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    sendOtpSchema,
    resetPasswordOtpSchema
};