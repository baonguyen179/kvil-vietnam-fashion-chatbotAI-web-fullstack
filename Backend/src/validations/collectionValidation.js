const Joi = require('joi');

const createCollectionSchema = Joi.object({
    name: Joi.string().min(3).max(255).required().messages({
        'any.required': 'Tên bộ sưu tập là bắt buộc!',
        'string.empty': 'Vui lòng không để trống tên!'
    }),
    description: Joi.string().allow('', null),
    // Khi gửi bằng form-data, boolean có thể bị biến thành chuỗi "true"/"false", 
    // Joi sẽ tự động ép kiểu (cast) về dạng boolean chuẩn cho ta.
    isActive: Joi.boolean().default(true).messages({
        'boolean.base': 'Trạng thái isActive không hợp lệ!'
    })
});
const updateCollectionSchema = Joi.object({
    name: Joi.string().min(3).max(255).messages({
        'string.base': 'Tên bộ sưu tập phải là chuỗi ký tự!',
        'string.min': 'Tên bộ sưu tập phải có ít nhất 3 ký tự!',
        'string.max': 'Tên bộ sưu tập không được vượt quá 255 ký tự!'
    }),
    description: Joi.string().allow('', null),
    isActive: Joi.boolean().messages({
        'boolean.base': 'Trạng thái isActive không hợp lệ!'
    })
});
const addProductsToCollectionSchema = Joi.object({
    productIds: Joi.array().items(Joi.number().integer()).required().messages({
        'array.base': 'Danh sách sản phẩm (productIds) phải là một mảng (array)!',
        'array.includes': 'ID sản phẩm trong mảng phải là số nguyên!',
        'any.required': 'Vui lòng cung cấp danh sách ID sản phẩm (productIds)!'
    })
});
module.exports = { createCollectionSchema, updateCollectionSchema, addProductsToCollectionSchema };