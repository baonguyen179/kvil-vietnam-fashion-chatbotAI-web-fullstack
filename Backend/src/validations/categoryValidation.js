const Joi = require('joi');

const categoryIdSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'number.base': 'ID danh mục phải là một số nguyên!',
        'any.required': 'Thiếu ID danh mục!'
    })
});

const createCategorySchema = Joi.object({
    name: Joi.string().trim().required().messages({
        'string.empty': 'Vui lòng nhập tên danh mục!',
        'any.required': 'Vui lòng nhập tên danh mục!'
    }),
    description: Joi.string().allow('', null)
});

const updateCategorySchema = Joi.object({
    name: Joi.string().trim().allow('', null),
    description: Joi.string().allow('', null)
});

module.exports = {
    categoryIdSchema,
    createCategorySchema,
    updateCategorySchema
};