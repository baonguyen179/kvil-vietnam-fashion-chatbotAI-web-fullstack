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
const getOrderListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('pending', 'confirmed', 'shipping', 'delivered', 'cancelled').allow('', null)
});

const getOrderDetailSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'number.base': 'ID đơn hàng phải là một số nguyên!',
        'any.required': 'Vui lòng cung cấp ID đơn hàng!'
    })
});
const getAdminOrderListSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('pending', 'confirmed', 'shipping', 'delivered', 'cancelled').allow('', null),
    paymentStatus: Joi.boolean().allow('', null), // true: Đã thanh toán, false: Chưa thanh toán
    paymentMethod: Joi.string().valid('COD', 'BANK_TRANSFER').allow('', null),
    deliveryMethod: Joi.string().valid('store_pickup', 'home_delivery').allow('', null)
});
const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'shipping', 'delivered', 'cancelled').required().messages({
        'any.only': 'Trạng thái chỉ được phép là: pending, confirmed, shipping, delivered, cancelled!',
        'any.required': 'Vui lòng cung cấp trạng thái mới (status)!'
    })
});
const updatePaymentStatusSchema = Joi.object({
    paymentStatus: Joi.boolean().required().messages({
        'boolean.base': 'Trạng thái thanh toán phải là kiểu boolean (true/false)!',
        'any.required': 'Vui lòng cung cấp trạng thái thanh toán!'
    })
});
module.exports = {
    createOrderSchema,
    cancelOrderSchema,
    getOrderListSchema,
    getOrderDetailSchema,
    getAdminOrderListSchema,
    updateOrderStatusSchema,
    updatePaymentStatusSchema
};