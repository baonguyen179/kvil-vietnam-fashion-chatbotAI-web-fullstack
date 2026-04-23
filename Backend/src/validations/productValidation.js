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
    type: Joi.string().valid('IN', 'OUT', 'RETURN').allow('', null),
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

module.exports = {
    productIdSchema,
    imageIdSchema,
    productBodySchema,
    getAllProductsSchema,
    searchSchema,
    getInventoryLogsSchema,
    variantSchema
};