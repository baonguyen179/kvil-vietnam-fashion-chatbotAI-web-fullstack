import axios from "@/utils/axiosCustomize";

const reviewService = {
    /**
     * Xác thực token đính kèm trong link email trước khi render form đánh giá.
     * @param {string} token - JWT token từ query param ?token=...
     */
    verifyReviewToken: async (token) => {
        return await axios.get(`/api/v1/reviews/verify-token`, {
            params: { token }
        });
    },

    /**
     * Lấy danh sách đánh giá (APPROVED) theo sản phẩm.
     * @param {number|string} productId
     * @param {number} page
     * @param {number} limit
     */
    getProductReviews: async (productId, page = 1, limit = 5) => {
        return await axios.get(`/api/v1/products/${productId}/reviews`, {
            params: { page, limit }
        });
    },

    /**
     * Gửi đánh giá (yêu cầu JWT token trong Authorization header).
     * Dữ liệu gửi dưới dạng FormData để hỗ trợ upload ảnh.
     * @param {string} token - JWT review token
     * @param {{ rating: number, comment?: string, images?: File[] }} payload
     */
    createReview: async (token, { rating, comment, images = [] }) => {
        const formData = new FormData();
        formData.append('rating', rating);
        if (comment) formData.append('comment', comment);
        images.forEach(file => formData.append('images', file));

        return await axios.post(`/api/v1/reviews`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    /**
     * Lấy danh sách token đánh giá cho từng sản phẩm trong đơn hàng đã giao.
     * Yêu cầu user đăng nhập (axios sẽ tự gắn auth token).
     * @param {number|string} orderId
     */
    getReviewTokensForOrder: async (orderId) => {
        return await axios.get(`/api/v1/user/orders/${orderId}/review-tokens`);
    },

    getAdminReviews: async (page = 1, limit = 10, status = '') => {
        return await axios.get(`/api/v1/admin/reviews`, {
            params: { page, limit, status }
        });
    },

    updateReviewStatus: async (reviewId, status) => {
        return await axios.patch(`/api/v1/admin/reviews/${reviewId}/status`, { status });
    }
};

export default reviewService;
