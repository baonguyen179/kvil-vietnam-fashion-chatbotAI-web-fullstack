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
    },

    // [ORDERS] - USER ORDER MANAGEMENT
    getUserOrders: async (queryParams) => {
        return await axios.get("/api/v1/user/orders", { params: queryParams });
    },

    getUserOrderDetail: async (orderId) => {
        return await axios.get(`/api/v1/user/orders/${orderId}`);
    },

    cancelOrder: async (orderId) => {
        return await axios.put(`/api/v1/user/orders/${orderId}/cancel`);
    },

    // [PROFILE] - USER PROFILE MANAGEMENT
    getUserProfile: async () => {
        return await axios.get("/api/v1/user/profile");
    },

    updateUserProfile: async (profileData) => {
        return await axios.put("/api/v1/user/profile", profileData);
    }
}



export default userService;
