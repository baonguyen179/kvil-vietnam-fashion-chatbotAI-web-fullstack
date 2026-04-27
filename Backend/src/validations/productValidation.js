const Joi = require('joi');

const productIdSchema = Joi.object({
    id: Joi.alternatives().try(
        Joi.number().integer(),
        Joi.string()
    ).required().messages({
        'any.required': 'Thiếu ID sản phẩm!'
    })
});

const imageIdSchema = Joi.object({
    imageId: Joi.number().integer().required().messages({
        'number.base': 'ID hình ảnh phải là số nguyên!',
        'any.required': 'Thiếu ID hình ảnh!'
    })
});

const productBodySchema = Joi.object({
    name: Joi.string().allow('', null),
    basePrice: Joi.number().min(0).allow('', null),
    categoryId: Joi.number().integer().allow('', null)
}).unknown(true);

const getAllProductsSchema = Joi.object({
    page: Joi.number().integer().min(1).allow('', null).messages({
        'number.base': 'Số trang phải là số nguyên!',
        'number.min': 'Số trang tối thiểu là 1!'
    }),
    limit: Joi.number().integer().min(1).allow('', null).messages({
        'number.base': 'Giới hạn hiển thị phải là số nguyên!',
        'number.min': 'Giới hạn tối thiểu là 1!'
    }),
    categoryId: Joi.number().integer().allow('', null),
    sort: Joi.string().valid('price_asc', 'price_desc', 'newest', 'oldest').allow('', null)
}).unknown(true);

const searchSchema = Joi.object({
    keyword: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).allow('', null),
    limit: Joi.number().integer().min(1).allow('', null)
}).unknown(true);

const getInventoryLogsSchema = Joi.object({
    page: Joi.number().integer().min(1).allow('', null),
    limit: Joi.number().integer().min(1).allow('', null),
    type: Joi.string().valid('IN', 'OUT', 'RETURN', 'HOLD', 'UNHOLD', 'ADJUST').allow('', null),
    variantId: Joi.number().integer().allow('', null),
    startDate: Joi.string().isoDate().allow('', null),
    endDate: Joi.string().isoDate().allow('', null)
}).unknown(true);

const variantSchema = Joi.object({
    colorId: Joi.number().integer().required().messages({ 'any.required': 'Vui lòng cung cấp Màu sắc (ID)!' }),
    sizeId: Joi.number().integer().required().messages({ 'any.required': 'Vui lòng cung cấp Kích cỡ (ID)!' }),
    sku: Joi.string().required().messages({ 'any.required': 'Vui lòng cung cấp mã SKU!' }),
    stock: Joi.number().integer().min(0).required().messages({
        'number.base': 'Số lượng kho phải là số!',
        'number.min': 'Số lượng kho không được nhỏ hơn 0!',
        'any.required': 'Vui lòng nhập số lượng tồn kho!'
    }),
    price: Joi.number().min(0).allow('', null)
}).unknown(true);

const updateVariantSchema = Joi.object({
    colorId: Joi.number().integer().allow('', null),
    sizeId: Joi.number().integer().allow('', null),
    sku: Joi.string().allow('', null),
    price: Joi.number().min(0).allow('', null)
    // Cố ý bỏ qua trường 'stock' vì stock phải được quản lý thông qua InventoryLogs
}).unknown(true);

/**
 * Schema cho chức năng "Bút toán đảo" (Compensating Transaction / Stock Adjustment)
 * Admin dùng để sửa sai mà không xóa dữ liệu gốc.
 */
const adjustInventorySchema = Joi.object({
    variantId: Joi.number().integer().required().messages({
        'any.required': 'Vui lòng chọn biến thể sản phẩm cần điều chỉnh!',
        'number.base': 'ID biến thể phải là số nguyên!'
    }),
    // delta có thể âm (điều chỉnh giảm) hoặc dương (điều chỉnh tăng)
    // Nhưng không cho phép = 0 vì không có ý nghĩa nghiệp vụ
    delta: Joi.number().integer().not(0).required().messages({
        'any.required': 'Vui lòng nhập số lượng cần điều chỉnh!',
        'number.base': 'Số lượng phải là số nguyên!',
        'any.invalid': 'Số lượng điều chỉnh không được bằng 0!'
    }),
    note: Joi.string().min(10).max(500).required().messages({
        'any.required': 'Vui lòng ghi rõ lý do điều chỉnh kho (tối thiểu 10 ký tự)!',
        'string.min': 'Lý do điều chỉnh phải có ít nhất {#limit} ký tự!',
        'string.max': 'Lý do điều chỉnh không được quá {#limit} ký tự!'
    })
});

module.exports = {
    productIdSchema,
    imageIdSchema,
    productBodySchema,
    getAllProductsSchema,
    searchSchema,
    getInventoryLogsSchema,
    variantSchema,
    updateVariantSchema,
    adjustInventorySchema
};