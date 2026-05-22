import axios from "@/utils/axiosCustomize";

/**
 * Admin Role Service - Quản lý Vai trò và Quyền hạn
 */
const adminRoleService = {
    // Lấy danh sách Vai trò (kèm Permissions)
    getAllRoles: async () => {
        return await axios.get("/api/v1/admin/roles");
    },

    // Tạo Vai trò mới
    createRole: async (roleData) => {
        return await axios.post("/api/v1/admin/roles", roleData);
    },

    // Cập nhật Vai trò
    updateRole: async (roleId, roleData) => {
        return await axios.put(`/api/v1/admin/roles/${roleId}`, roleData);
    },

    // Xóa Vai trò
    deleteRole: async (roleId) => {
        return await axios.delete(`/api/v1/admin/roles/${roleId}`);
    },

    // Lấy danh sách tất cả Permissions hệ thống
    getAllPermissions: async () => {
        return await axios.get("/api/v1/admin/permissions");
    },

    // Gán danh sách Permissions cho Role
    assignPermissionsToRole: async (roleId, permissionIds) => {
        return await axios.post(`/api/v1/admin/roles/${roleId}/permissions`, { permissionIds });
    }
};

export default adminRoleService;
