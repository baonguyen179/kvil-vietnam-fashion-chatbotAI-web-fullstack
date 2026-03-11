const Joi = require('joi');

const chatbotMessageSchema = Joi.object({
    message: Joi.string()
        .trim()
        .min(1)
        .max(500) // Giới hạn 500 ký tự để tối ưu Token và tránh spam
        .required()
        .messages({
            'string.empty': 'Vui lòng nhập tin nhắn!',
            'string.min': 'Tin nhắn quá ngắn, bạn nhắn thêm gì đó đi!',
            'string.max': 'Tin nhắn không được vượt quá 500 ký tự để đảm bảo AI xử lý chính xác nhất!',
            'any.required': 'Thiếu nội dung tin nhắn!'
        })
});

const getChatHistorySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50).messages({
        'number.base': 'Limit phải là số',
        'number.min': 'Limit tối thiểu là 1',
        'number.max': 'Mỗi lần lấy tối đa 100 tin nhắn thôi bạn nhé'
    }),
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Page phải là số'
    })
});

module.exports = { chatbotMessageSchema, getChatHistorySchema };