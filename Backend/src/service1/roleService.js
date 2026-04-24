const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const { ROLES } = require('../config/roles');
const redisHelper = require('../helpers/redis.helper');

/**
 * Role Service - Quản lý CRUD Vai trò và Gán quyền
 */

const getAllRolesWithPermissions = async () => {
    try {
        const roles = await db.Role.findAll({
            include: [{
                model: db.Permission,
                as: 'permissions',
                attributes: ['id', 'name', 'module', 'description'],
                through: { attributes: [] }
            }],
            order: [['id', 'ASC']]
        });

        return { EM: 'Lấy danh sách vai trò thành công!', EC: errorCode.SUCCESS, DT: roles };
    } catch (error) {
        console.error(">>> Error in roleService.getAllRolesWithPermissions:", error);
        return { EM: 'Lỗi server khi lấy danh sách vai trò', EC: errorCode.OTHER_ERROR, DT: [] };
    }
};

const createRole = async (data) => {
    try {
        const existingRole = await db.Role.findOne({ where: { name: data.name } });
        if (existingRole) {
            return { EM: 'Tên vai trò này đã tồn tại!', EC: errorCode.ALREADY_EXIST, DT: '' };
        }

        const newRole = await db.Role.create({
            name: data.name,
            description: data.description
        });

        return { EM: 'Tạo vai trò mới thành công!', EC: errorCode.SUCCESS, DT: newRole };
    } catch (error) {
        console.error(">>> Error in roleService.createRole:", error);
        return { EM: 'Lỗi server khi tạo vai trò', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const updateRole = async (id, data) => {
    try {
        const role = await db.Role.findByPk(id);
        if (!role) return { EM: 'Không tìm thấy vai trò!', EC: errorCode.NOT_FOUND, DT: '' };

        // Bảo vệ SUPER_ADMIN không được đổi tên
        if (role.name === ROLES.SUPER_ADMIN && data.name && data.name !== ROLES.SUPER_ADMIN) {
            return { EM: 'Không được phép đổi tên vai trò SUPER_ADMIN!', EC: errorCode.UNAUTHORIZED, DT: '' };
        }

        await role.update(data);
        return { EM: 'Cập nhật vai trò thành công!', EC: errorCode.SUCCESS, DT: role };
    } catch (error) {
        console.error(">>> Error in roleService.updateRole:", error);
        return { EM: 'Lỗi server khi cập nhật vai trò', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const deleteRole = async (id) => {
    try {
        const role = await db.Role.findByPk(id);
        if (!role) return { EM: 'Không tìm thấy vai trò!', EC: errorCode.NOT_FOUND, DT: '' };

        // Bảo vệ SUPER_ADMIN không được xóa
        if (role.name === ROLES.SUPER_ADMIN) {
            return { EM: 'Không được phép xóa vai trò SUPER_ADMIN!', EC: errorCode.UNAUTHORIZED, DT: '' };
        }

        await role.destroy();
        return { EM: 'Xóa vai trò thành công!', EC: errorCode.SUCCESS, DT: '' };
    } catch (error) {
        console.error(">>> Error in roleService.deleteRole:", error);
        return { EM: 'Lỗi server khi xóa vai trò', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const assignPermissionsToRole = async (roleId, permissionIds) => {
    try {
        const role = await db.Role.findByPk(roleId);
        if (!role) return { EM: 'Không tìm thấy vai trò!', EC: errorCode.NOT_FOUND, DT: '' };

        // Bảo vệ quyền hạn của SUPER_ADMIN không được thay đổi
        if (role.name === ROLES.SUPER_ADMIN) {
            return { EM: 'Không được phép thay đổi quyền hạn mặc định của SUPER_ADMIN!', EC: errorCode.UNAUTHORIZED, DT: '' };
        }

        // Xóa hết quyền cũ của Role đó
        await db.RolePermission.destroy({ where: { roleId: roleId } });

        // Thêm quyền mới
        if (permissionIds && permissionIds.length > 0) {
            const data = permissionIds.map(pId => ({
                roleId: roleId,
                permissionId: pId,
                createdAt: new Date(),
                updatedAt: new Date()
            }));
            await db.RolePermission.bulkCreate(data);
        }

        // Với cơ chế JWT, quyền hạn thay đổi chỉ có hiệu lực sau khi user refresh token hoặc login lại.
        // Tuy nhiên ta nên xóa cache profile của các user có role này nếu cần thiết (phức tạp hơn).
        // Tạm thời ta chỉ thông báo thành công.
        
        return { EM: 'Gán quyền cho vai trò thành công!', EC: errorCode.SUCCESS, DT: '' };
    } catch (error) {
        console.error(">>> Error in roleService.assignPermissionsToRole:", error);
        return { EM: 'Lỗi server khi gán quyền', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const getAllPermissions = async () => {
    try {
        const permissions = await db.Permission.findAll({
            order: [['module', 'ASC'], ['id', 'ASC']]
        });
        return { EM: 'Lấy danh sách quyền thành công!', EC: errorCode.SUCCESS, DT: permissions };
    } catch (error) {
        console.error(">>> Error in roleService.getAllPermissions:", error);
        return { EM: 'Lỗi server!', EC: errorCode.OTHER_ERROR, DT: [] };
    }
}

module.exports = {
    getAllRolesWithPermissions,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionsToRole,
    getAllPermissions
};
