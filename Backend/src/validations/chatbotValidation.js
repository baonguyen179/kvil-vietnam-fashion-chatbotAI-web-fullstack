const Joi = require('joi');

const chatbotMessageSchema = Joi.object({
    message: Joi.string().trim().required().messages({
        'string.empty': 'Vui lòng nhập tin nhắn!',
        'any.required': 'Thiếu nội dung tin nhắn!'
    })
});
const getChatHistorySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50).messages({
        'number.base': 'Limit phải là số',
        'number.min': 'Limit tối thiểu là 1'
    }),
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Page phải là số'
    })
});

module.exports = { chatbotMessageSchema, getChatHistorySchema };