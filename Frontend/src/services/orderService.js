import axios from "@/utils/axiosCustomize";

const BASE = "/api/v1/admin/orders";

const orderService = {
    /**
     * Lấy danh sách đơn hàng (Admin)
     * @param {Object} params - { page, limit, status, paymentStatus, paymentMethod, deliveryMethod }
     */
    getAdminOrders: async (params = {}) => {
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

    /**
     * [ADMIN] Lấy danh sách yêu cầu trả hàng
     * @param {Object} params - { page, limit, status }
     */
    getAdminReturnRequests: async (params = {}) => {
        return await axios.get(`${BASE}/returns`, { params });
    },

    /**
     * [ADMIN] Cập nhật trạng thái yêu cầu trả hàng
     * @param {number} id - Request ID
     * @param {'APPROVED'|'REJECTED'} status
     */
    updateReturnRequestStatus: async (id, status) => {
        return await axios.patch(`${BASE}/returns/${id}/status`, { status });
    },

    /**
     * Tạo đơn hàng mới (Dành cho cả User và Guest)
     * @param {Object} orderData 
     */
    createOrder: async (orderData) => {
        return await axios.post("/api/v1/user/orders", orderData);
    },

    /**
     * Lấy link thanh toán VNPay cho User (Login)
     * @param {number} orderId 
     */
    getVNPayUrl: async (orderId) => {
        return await axios.get(`/api/v1/user/orders/${orderId}/payment-url`);
    },

    /**
     * Lấy link thanh toán VNPay cho Guest
     * @param {number} orderId 
     * @param {string} phone 
     */
    getGuestVNPayUrl: async (orderId, phone) => {
        return await axios.post("/api/v1/order/vnpay-url/guest", { orderId, phone });
    },

    /**
     * Tra cứu thông tin đơn hàng khách vãng lai
     * @param {number} orderId 
     * @param {string} phone 
     */
    getGuestOrderDetail: async (orderId, phone) => {
        return await axios.get(`/api/v1/order/guest/${orderId}`, { params: { phone } });
    },

    /**
     * Yêu cầu gửi lại danh sách mã đơn hàng cho khách vãng lai qua Email
     * @param {string} email 
     * @param {string} phone 
     */
    recoverGuestOrderIds: async (email, phone) => {
        return await axios.post("/api/v1/order/guest/recover", { email, phone });
    },



    /**
     * Xác thực kết quả thanh toán trả về từ VNPay
     * @param {Object} queryParams 
     */
    verifyVNPayReturn: async (queryParams) => {
        return await axios.get("/api/v1/vnpay/return", { params: queryParams });
    },

    /**
     * [ADMIN] Đồng bộ trạng thái đơn hàng với VNPay (QueryDR)
     * Dùng khi IPN bị mất hoặc khách tắt trình duyệt quá sớm
     * @param {number} orderId - Order ID cần kiểm tra
     */
    syncVNPayStatus: async (orderId) => {
        return await axios.patch(`${BASE}/${orderId}/vnpay-sync`);
    },
};




export default orderService;
