const Joi = require('joi');

const addToCartSchema = Joi.object({
    variantId: Joi.number().integer().required().messages({
        'number.base': 'Variant ID phải là một số (Integer)!',
        'any.required': 'Thiếu ID biến thể sản phẩm (variantId)!'
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'Số lượng (quantity) phải là một số!',
        'number.min': 'Số lượng mua ít nhất phải là 1!',
        'any.required': 'Vui lòng nhập số lượng (quantity)!'
    })
});

const updateCartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required().messages({
        'number.min': 'Số lượng tối thiểu là 1!',
        'any.required': 'Vui lòng nhập số lượng mới!'
    })
});

module.exports = {
    addToCartSchema,
    updateCartItemSchema
};