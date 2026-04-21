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

// ======================================================
// [ADMIN] SCHEMAS - QUẢN LÝ & GIÁM SÁT CHATBOT
// ======================================================

/**
 * Schema validate query params cho lấy danh sách sessions
 * Hỗ trợ: phân trang, tìm kiếm theo nội dung, lọc theo ngày, lọc theo loại (user/guest)
 */
const adminGetSessionsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1)
        .messages({ 'number.base': 'Page phải là số nguyên', 'number.min': 'Page tối thiểu là 1' }),
    limit: Joi.number().integer().min(1).max(100).default(20)
        .messages({
            'number.base': 'Limit phải là số nguyên',
            'number.min': 'Limit tối thiểu là 1',
            'number.max': 'Limit tối đa là 100'
        }),
    search: Joi.string().trim().max(200).optional().allow('', null)
        .messages({ 'string.max': 'Từ khóa tìm kiếm không được vượt quá 200 ký tự' }),
    type: Joi.string().valid('all', 'user', 'guest').default('all')
        .messages({ 'any.only': 'type chỉ chấp nhận: all, user, guest' }),
    startDate: Joi.date().iso().optional().allow('', null)
        .messages({ 'date.format': 'startDate phải đúng định dạng ISO (YYYY-MM-DD)' }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().allow('', null)
        .messages({
            'date.format': 'endDate phải đúng định dạng ISO (YYYY-MM-DD)',
            'date.min': 'endDate phải sau hoặc bằng startDate'
        }),
});

/**
 * Schema validate params cho lấy chi tiết 1 session
 */
const adminGetSessionDetailSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1)
        .messages({ 'number.base': 'Page phải là số nguyên' }),
    limit: Joi.number().integer().min(1).max(200).default(50)
        .messages({ 'number.max': 'Limit tối đa 200 tin nhắn mỗi trang' }),
});

/**
 * Schema validate userId phải là số nguyên dương
 */
const adminUserIdParamSchema = Joi.object({
    userId: Joi.number().integer().positive().required()
        .messages({
            'number.base': 'userId phải là số nguyên',
            'number.positive': 'userId phải là số dương',
            'any.required': 'Thiếu userId'
        })
});

module.exports = {
    chatbotMessageSchema,
    getChatHistorySchema,
    adminGetSessionsSchema,
    adminGetSessionDetailSchema,
    adminUserIdParamSchema,
};