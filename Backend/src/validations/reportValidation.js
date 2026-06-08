const Joi = require('joi');

const getReportSchema = Joi.object({
    startDate: Joi.date().iso().allow('', null).messages({
        'date.format': 'Ngày bắt đầu phải đúng định dạng ISO (VD: 2026-03-01)!'
    }),
    endDate: Joi.date().iso().allow('', null).min(Joi.ref('startDate')).messages({
        'date.min': 'Ngày kết thúc phải lớn hơn ngày bắt đầu!'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).allow('', null),
    refresh: Joi.any().allow('', null) // Có thể là boolean hoặc string 'true'/'false'
});

module.exports = {
    getReportSchema
};
