import axios from "@/utils/axiosCustomize";

const BASE = "/api/v1/admin/coupons";

const couponService = {
    /**
     * Lấy danh sách mã giảm giá (Admin)
     * @param {Object} params - { page, limit, isActive, search }
     */
    getAdminCoupons: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
        );
        return await axios.get(BASE, { params: cleanParams });
    },

    /**
     * Tạo mã giảm giá mới
     * @param {Object} data - Coupon payload
     */
    createCoupon: async (data) => {
        return await axios.post(BASE, data);
    },

    /**
     * Cập nhật mã giảm giá
     * @param {number} id
     * @param {Object} data - Partial coupon update
     */
    updateCoupon: async (id, data) => {
        return await axios.put(`${BASE}/${id}`, data);
    },

    /**
     * Xóa mềm mã giảm giá
     * @param {number} id
     */
    deleteCoupon: async (id) => {
        return await axios.delete(`${BASE}/${id}`);
    },

    /**
     * [PUBLIC] Kiểm tra mã giảm giá
     * @param {string} code 
     * @param {number} orderValue 
     */
    applyCoupon: async (code, orderValue) => {
        return await axios.get("/api/v1/coupons/check", {
            params: { code, orderValue }
        });
    }
};


export default couponService;
