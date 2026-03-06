const Joi = require('joi');

const createOrderSchema = Joi.object({
    shippingAddress: Joi.string().required().messages({
        'string.empty': 'Vui lòng nhập địa chỉ giao hàng!',
        'any.required': 'Địa chỉ giao hàng là bắt buộc!'
    }),
    paymentMethod: Joi.string().valid('COD', 'BANK_TRANSFER').required().messages({
        'any.only': 'Phương thức thanh toán chỉ hỗ trợ COD hoặc BANK_TRANSFER!',
        'any.required': 'Vui lòng chọn phương thức thanh toán!'
    }),
    couponCode: Joi.string().allow('', null), // Mã giảm giá là không bắt buộc
    deliveryMethod: Joi.string().valid('home_delivery', 'store_pickup').default('home_delivery')
});

const cancelOrderSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'number.base': 'ID đơn hàng phải là một số nguyên!',
        'any.required': 'Vui lòng cung cấp ID đơn hàng cần hủy!'
    })
});

module.exports = {
    createOrderSchema,
    cancelOrderSchema
};