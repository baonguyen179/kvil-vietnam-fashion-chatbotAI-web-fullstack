const Joi = require('joi');

const productIdSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'number.base': 'ID sản phẩm phải là số nguyên!',
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

const searchSchema = Joi.object({
    keyword: Joi.string().allow('', null),
    page: Joi.number().integer().min(1).allow('', null),
    limit: Joi.number().integer().min(1).allow('', null)
}).unknown(true);

module.exports = {
    productIdSchema,
    imageIdSchema,
    productBodySchema,
    searchSchema
};