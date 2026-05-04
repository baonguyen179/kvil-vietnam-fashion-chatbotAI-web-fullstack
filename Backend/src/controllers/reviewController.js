const reviewService = require('../service/reviewService');
const reviewHelper = require('../helpers/review.helper');
const errorCode = require('../config/errorCodes');
const { decodeId } = require('../utils/idHasher');

const reviewController = {
    // API GET: Xác thực link Token khi Frontend lần đầu tiên mở trang
    verifyReviewLink: async (req, res) => {
        const { token } = req.query;
        const decoded = reviewHelper.verifyReviewToken(token);
        
        if (!decoded) {
            return res.status(200).json({ EC: errorCode.VALIDATION_ERROR, EM: 'Link không hợp lệ hoặc hết hạn.' });
        }
        return res.status(200).json({ EC: errorCode.SUCCESS, EM: 'Hợp lệ', DT: decoded });
    },

    // API POST: Tạo đánh giá (đã qua Middleware checkReviewToken)
    handleCreateReview: async (req, res) => {
        try {
            // IDOR Protection: Tuyệt đối dùng req.reviewContext thay vì req.body
            const reviewContext = req.reviewContext; 
            const { rating, comment } = req.body;
            const files = req.files; // Array chứa file từ Multer Cloudinary

            if (!rating || rating < 1 || rating > 5) {
                return res.status(200).json({ EC: errorCode.VALIDATION_ERROR, EM: 'Vui lòng chọn số sao hợp lệ (1-5).' });
            }

            const data = await reviewService.createReview(reviewContext, files, parseInt(rating), comment);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ EC: errorCode.OTHER_ERROR, EM: 'Lỗi Server' });
        }
    },

    // API GET: Lấy danh sách hiển thị
    handleGetProductReviews: async (req, res) => {
        const rawId = req.params.id;
        const { page, limit } = req.query;

        if (!rawId) {
            return res.status(200).json({ EC: errorCode.VALIDATION_ERROR, EM: 'Thiếu ID sản phẩm' });
        }

        const decodedId = decodeId(rawId);
        const targetId = (decodedId !== null && decodedId !== undefined) ? decodedId : rawId;

        const data = await reviewService.getProductReviews(targetId, page, limit);
        return res.status(200).json(data);
    },

    /**
     * API GET: /user/orders/:id/review-tokens
     * Lấy danh sách review token cho từng sản phẩm trong đơn đã giao.
     * Chỉ trả token cho những sản phẩm CHƯA được đánh giá.
     * Yêu cầu user đăng nhập (checkUserJWT đã chạy trước đó trong user.js router).
     */
    handleGetReviewTokens: async (req, res) => {
        try {
            const orderId = req.params.id;
            const userId = req.user.id; // Từ JWT middleware

            if (!orderId) {
                return res.status(200).json({ EC: errorCode.VALIDATION_ERROR, EM: 'Thiếu ID đơn hàng.' });
            }

            const data = await reviewService.getReviewTokensForOrder(orderId, userId);
            return res.status(200).json(data);
        } catch (error) {
            console.error('>>> handleGetReviewTokens Error:', error);
            return res.status(500).json({ EC: errorCode.OTHER_ERROR, EM: 'Lỗi Server' });
        }
    },

    // API GET: Lấy danh sách đánh giá cho admin
    handleGetAdminReviews: async (req, res) => {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const data = await reviewService.getAdminReviews(page, limit, status);
            return res.status(200).json(data);
        } catch (error) {
            console.error('>>> handleGetAdminReviews Error:', error);
            return res.status(500).json({ EC: errorCode.OTHER_ERROR, EM: 'Lỗi Server' });
        }
    },

    // API PATCH: Cập nhật trạng thái đánh giá
    handleUpdateReviewStatus: async (req, res) => {
        try {
            const reviewId = req.params.id;
            const { status } = req.body;
            
            if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
                return res.status(200).json({ EC: errorCode.VALIDATION_ERROR, EM: 'Trạng thái không hợp lệ' });
            }

            const data = await reviewService.updateReviewStatus(reviewId, status);
            return res.status(200).json(data);
        } catch (error) {
            console.error('>>> handleUpdateReviewStatus Error:', error);
            return res.status(500).json({ EC: errorCode.OTHER_ERROR, EM: 'Lỗi Server' });
        }
    }
};

module.exports = reviewController;

