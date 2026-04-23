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
        // Gửi mảng roles để tương thích với hạ tầng multi-role mới
        return await axios.patch(`/api/v1/admin/users/${userId}/role`, { 
            roles: [newRole],
            permissions: [] 
        });
    },

    createAdminUser: async (userData) => {
        return await axios.post("/api/v1/admin/users", userData);
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
    },

    // [ADDRESSES] - USER ADDRESS MANAGEMENT
    getUserAddresses: async () => {
        return await axios.get("/api/v1/user/addresses");
    },

    createNewAddress: async (addressData) => {
        return await axios.post("/api/v1/user/addresses", addressData);
    },

    updateUserAddress: async (addressId, addressData) => {
        return await axios.put(`/api/v1/user/addresses/${addressId}`, addressData);
    },

    deleteUserAddress: async (addressId) => {
        return await axios.delete(`/api/v1/user/addresses/${addressId}`);
    },

    setDefaultAddress: async (addressId) => {
        return await axios.patch(`/api/v1/user/addresses/${addressId}/default`);
    },

    requestReturnOrder: async (orderId, formData) => {
        return await axios.post(`/api/v1/user/orders/${orderId}/return`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    }
}



export default userService;
