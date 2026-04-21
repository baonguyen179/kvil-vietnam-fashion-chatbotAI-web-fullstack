const Joi = require('joi');

const createRoleSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.empty': 'Tên vai trò không được để trống',
        'any.required': 'Tên vai trò là bắt buộc'
    }),
    description: Joi.string().allow('', null)
});

const updateRoleSchema = Joi.object({
    name: Joi.string().allow('', null),
    description: Joi.string().allow('', null)
});

const assignPermissionsSchema = Joi.object({
    permissionIds: Joi.array().items(Joi.number()).required().messages({
        'array.base': 'Lỗi định dạng danh sách quyền',
        'any.required': 'Danh sách quyền là bắt buộc'
    })
});

const roleIdSchema = Joi.object({
    id: Joi.number().integer().required()
});

module.exports = {
    createRoleSchema,
    updateRoleSchema,
    assignPermissionsSchema,
    roleIdSchema
};
