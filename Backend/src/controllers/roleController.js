const roleService = require('../service/roleService');
const roleValidation = require('../validations/roleValidation');
const errorCode = require('../config/errorCodes');

const handleGetAllRoles = async (req, res) => {
    try {
        const data = await roleService.getAllRolesWithPermissions();
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Error in handleGetAllRoles:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleCreateRole = async (req, res) => {
    try {
        const { error, value } = roleValidation.createRoleSchema.validate(req.body);
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await roleService.createRole(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Error in handleCreateRole:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleUpdateRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        const { error: idError } = roleValidation.roleIdSchema.validate({ id: roleId });
        if (idError) return res.status(200).json({ EM: 'ID vai trò không hợp lệ', EC: errorCode.VALIDATION_ERROR, DT: '' });

        const { error, value } = roleValidation.updateRoleSchema.validate(req.body);
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await roleService.updateRole(roleId, value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Error in handleUpdateRole:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleDeleteRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        const { error } = roleValidation.roleIdSchema.validate({ id: roleId });
        if (error) return res.status(200).json({ EM: 'ID vai trò không hợp lệ', EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await roleService.deleteRole(roleId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Error in handleDeleteRole:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleAssignPermissionsToRole = async (req, res) => {
    try {
        const roleId = req.params.id;
        const { error: idError } = roleValidation.roleIdSchema.validate({ id: roleId });
        if (idError) return res.status(200).json({ EM: 'ID vai trò không hợp lệ', EC: errorCode.VALIDATION_ERROR, DT: '' });

        const { error, value } = roleValidation.assignPermissionsSchema.validate(req.body);
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await roleService.assignPermissionsToRole(roleId, value.permissionIds);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Error in handleAssignPermissionsToRole:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetAllPermissions = async (req, res) => {
    try {
        const data = await roleService.getAllPermissions();
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Error in handleGetAllPermissions:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}

module.exports = {
    handleGetAllRoles,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
    handleAssignPermissionsToRole,
    handleGetAllPermissions
};
