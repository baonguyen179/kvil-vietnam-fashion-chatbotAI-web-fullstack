const Joi = require('joi');

const getDashboardStatsSchema = Joi.object({
    startDate: Joi.date().iso().messages({
        'date.format': 'Ngày bắt đầu phải đúng định dạng ISO (VD: 2026-03-01)!'
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
        'date.min': 'Ngày kết thúc phải lớn hơn ngày bắt đầu!'
    })
});

module.exports = {
    getDashboardStatsSchema
};