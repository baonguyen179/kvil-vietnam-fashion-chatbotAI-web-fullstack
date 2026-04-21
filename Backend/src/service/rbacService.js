const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const redisHelper = require('../helpers/redis.helper');
const { ROLES } = require('../config/roles');

/**
 * RBAC Service - Quản lý tập trung logic phân quyền (Roles & Permissions)
 */

/**
 * Lấy danh sách đầy đủ Vai trò và Quyền hạn của một người dùng
 * @param {number} userId 
 * @returns {object} { roles: [], permissions: [] }
 */
const getUserFullDetails = async (userId) => {
    try {
        const user = await db.User.findOne({
            where: { id: userId },
            include: [
                {
                    model: db.Role,
                    as: 'roles',
                    include: [{ model: db.Permission, as: 'permissions' }]
                },
                {
                    model: db.Permission,
                    as: 'individualPermissions'
                }
            ],
            distinct: true // Tránh nhân bản bản ghi khi join N-N
        });

        if (!user) return { roles: [], permissions: [] };

        // 1. Lấy danh sách tên vai trò
        let roleNames = user.roles?.map(r => r.name) || [];
        let allPermissions = [];

        // YÊU CẦU ĐẶC BIỆT: Nếu có role SUPER_ADMIN, lấy TẤT CẢ quyền và chỉ giữ lại role này
        if (roleNames.includes(ROLES.SUPER_ADMIN)) {
            roleNames = [ROLES.SUPER_ADMIN];
            const allDbPermissions = await db.Permission.findAll({ attributes: ['name'], raw: true });
            allPermissions = allDbPermissions.map(p => p.name);
        } else {
            // 2. Gộp quyền từ Roles và Quyền cá nhân cho các user thường
            const rolePermissions = user.roles?.flatMap(r => r.permissions?.map(p => p.name) || []) || [];
            const individualPermissions = user.individualPermissions?.map(p => p.name) || [];

            // Sử dụng Set để loại bỏ trùng lặp
            allPermissions = [...new Set([...rolePermissions, ...individualPermissions])];
        }

        return {
            roles: roleNames,
            permissions: allPermissions,
            raw: {
                roles: user.roles || [],
                individualPermissions: user.individualPermissions || []
            }
        };
    } catch (error) {
        console.error(">>> Error in rbacService.getUserFullDetails:", error);
        throw error;
    }
};

/**
 * Đồng bộ hóa (Sync) quyền hạn cá nhân cho người dùng
 * @param {number} userId 
 * @param {number[]} permissionIds 
 */
const syncUserPermissions = async (userId, permissionIds) => {
    try {
        // Xóa hết quyền cũ
        await db.UserPermission.destroy({ where: { userId } });

        // Thêm quyền mới
        if (permissionIds && permissionIds.length > 0) {
            const data = permissionIds.map(pId => ({
                userId,
                permissionId: pId,
                createdAt: new Date(),
                updatedAt: new Date()
            }));
            await db.UserPermission.bulkCreate(data);
        }

        // Xóa cache profile của user để cập nhật dữ liệu mới
        await redisHelper.delCache(`user:profile:${userId}`);
        return { EM: 'Cập nhật quyền hạn cá nhân thành công!', EC: errorCode.SUCCESS };
    } catch (error) {
        console.error(">>> Error in rbacService.syncUserPermissions:", error);
        return { EM: 'Lỗi khi cập nhật quyền hạn cá nhân', EC: errorCode.OTHER_ERROR };
    }
};

/**
 * Đồng bộ hóa (Sync) vai trò cho người dùng
 * @param {number} userId 
 * @param {number[]} roleIds 
 */
const syncUserRoles = async (userId, roleIds) => {
    try {
        await db.UserRole.destroy({ where: { userId } });

        if (roleIds && roleIds.length > 0) {
            const data = roleIds.map(rId => ({
                userId,
                roleId: rId,
                createdAt: new Date(),
                updatedAt: new Date()
            }));
            await db.UserRole.bulkCreate(data);
        }

        await redisHelper.delCache(`user:profile:${userId}`);
        return { EM: 'Cập nhật vai trò thành công!', EC: errorCode.SUCCESS };
    } catch (error) {
        console.error(">>> Error in rbacService.syncUserRoles:", error);
        return { EM: 'Lỗi khi cập nhật vai trò', EC: errorCode.OTHER_ERROR };
    }
};

module.exports = {
    getUserFullDetails,
    syncUserPermissions,
    syncUserRoles
};
