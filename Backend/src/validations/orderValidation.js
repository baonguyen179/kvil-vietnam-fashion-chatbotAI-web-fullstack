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
const createGuestOrderSchema = Joi.object({
    shippingAddress: Joi.string().required().messages({
        'string.empty': 'Vui lòng nhập địa chỉ giao hàng!',
        'any.required': 'Địa chỉ giao hàng là bắt buộc!'
    }),
    paymentMethod: Joi.string().valid('COD', 'BANK_TRANSFER').required().messages({
        'any.only': 'Phương thức thanh toán chỉ hỗ trợ COD hoặc BANK_TRANSFER!',
        'any.required': 'Vui lòng chọn phương thức thanh toán!'
    }),
    couponCode: Joi.string().allow('', null),
    deliveryMethod: Joi.string().valid('home_delivery', 'store_pickup').default('home_delivery'),

    // Thông tin khách hàng vãng lai
    guestInfo: Joi.object({
        fullName: Joi.string().required().messages({
            'string.empty': 'Vui lòng nhập họ và tên!',
            'any.required': 'Họ và tên là bắt buộc!'
        }),
        phone: Joi.string().required().messages({
            'string.empty': 'Vui lòng nhập số điện thoại!',
            'any.required': 'Số điện thoại là bắt buộc!'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Email không hợp lệ!',
            'any.required': 'Email là bắt buộc!'
        }),
    }).required(),

    // Sản phẩm khách mua (thay vì lấy từ giỏ hàng trong DB)
    items: Joi.array().items(Joi.object({
        variantId: Joi.number().integer().required(),
        quantity: Joi.number().integer().min(1).required()
    })).min(1).required().messages({
        'array.min': 'Giỏ hàng không được rỗng!',
        'any.required': 'Vui lòng cung cấp danh sách sản phẩm!'
    })
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
    status: Joi.string().valid('pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'returning', 'returned').allow('', null)
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
    status: Joi.string().valid('pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'returning', 'returned').allow('', null),
    paymentStatus: Joi.boolean().allow('', null), // true: Đã thanh toán, false: Chưa thanh toán
    paymentMethod: Joi.string().valid('COD', 'BANK_TRANSFER').allow('', null),
    deliveryMethod: Joi.string().valid('store_pickup', 'home_delivery').allow('', null)
});
const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'returning', 'returned').required().messages({
        'any.only': 'Trạng thái chỉ được phép là: pending, confirmed, shipping, delivered, cancelled, returning, returned!',
        'any.required': 'Vui lòng cung cấp trạng thái mới (status)!'
    })
});
const updatePaymentStatusSchema = Joi.object({
    paymentStatus: Joi.boolean().required().messages({
        'boolean.base': 'Trạng thái thanh toán phải là kiểu boolean (true/false)!',
        'any.required': 'Vui lòng cung cấp trạng thái thanh toán!'
    })
});
const returnOrderRequestSchema = Joi.object({
    reason: Joi.string().required().min(10).messages({
        'string.empty': 'Vui lòng cung cấp lý do đổi trả!',
        'string.min': 'Lý do đổi trả phải có ít nhất 10 ký tự!',
        'any.required': 'Lý do đổi trả là bắt buộc!'
    }),
    images: Joi.array().items(Joi.string().uri()).min(1).required().messages({
        'array.min': 'Vui lòng cung cấp ít nhất 1 ảnh minh họa sản phẩm lỗi!',
        'any.required': 'Ảnh minh họa là bắt buộc!'
    })
});

const getPaymentTransactionsSchema = Joi.object({
    page: Joi.number().integer().min(1).allow('', null),
    limit: Joi.number().integer().min(1).allow('', null),
    provider: Joi.string().valid('VNPAY').allow('', null),
    status: Joi.string().valid('SUCCESS', 'FAILED', 'PENDING').allow('', null),
    orderId: Joi.number().integer().allow('', null)
}).unknown(true);

module.exports = {
    createOrderSchema,
    createGuestOrderSchema,
    cancelOrderSchema,
    getOrderListSchema,
    getOrderDetailSchema,
    getAdminOrderListSchema,
    updateOrderStatusSchema,
    updatePaymentStatusSchema,
    returnOrderRequestSchema,
    getPaymentTransactionsSchema
};