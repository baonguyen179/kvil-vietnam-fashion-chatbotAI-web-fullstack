import axios from "@/utils/axiosCustomize";

const userService = {
    getAdminUsers: async (queryParams) => {
        const { page = 1, limit = 10, search = '', role = '' } = queryParams;
        return await axios.get("/api/v1/admin/users", {
            params: {
                page,
                limit,
                search,
                role
            }
        });
    },
    updateUserRole: async (userId, newRole) => {
        return await axios.patch(`/api/v1/admin/users/${userId}/role`, { role: newRole });
    }
}

export default userService;
