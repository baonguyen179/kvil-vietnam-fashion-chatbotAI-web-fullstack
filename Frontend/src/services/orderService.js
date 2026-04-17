import axios from "@/utils/axiosCustomize";

// Centralized config - dễ bảo trì khi backend thay đổi
const BASE = "/api/v1/admin/orders";

const orderService = {
    /**
     * Lấy danh sách đơn hàng (Admin)
     * @param {Object} params - { page, limit, status, paymentStatus, paymentMethod, deliveryMethod }
     */
    getAdminOrders: async (params = {}) => {
        // Loại bỏ các key undefined/null/''/rỗng để tránh gửi param thừa
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
        );
        return await axios.get(BASE, { params: cleanParams });
    },

    /**
     * Cập nhật trạng thái đơn hàng
     * @param {number} id - Order ID
     * @param {'pending'|'confirmed'|'shipping'|'delivered'|'cancelled'} status
     */
    updateOrderStatus: async (id, status) => {
        return await axios.patch(`${BASE}/${id}/status`, { status });
    },

    /**
     * Cập nhật trạng thái thanh toán
     * @param {number} id - Order ID
     * @param {boolean} paymentStatus - true: Đã thanh toán, false: Chưa thanh toán
     */
    updatePaymentStatus: async (id, paymentStatus) => {
        return await axios.patch(`${BASE}/${id}/payment`, { paymentStatus });
    },
};

export default orderService;
