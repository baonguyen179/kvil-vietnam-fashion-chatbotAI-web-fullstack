const reviewHelper = require('../helpers/review.helper');
const errorCode = require('../config/errorCodes');

const checkReviewToken = (req, res, next) => {
    // Yêu cầu Frontend gửi JWT token của link đánh giá vào Header (Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ EC: errorCode.UNAUTHENTICATED, EM: 'Thiếu Token đánh giá' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = reviewHelper.verifyReviewToken(token);

    if (!decoded) {
        return res.status(403).json({ EC: errorCode.UNAUTHORIZED, EM: 'Đường link đánh giá đã hết hạn hoặc không hợp lệ.' });
    }

    // Nhúng trực tiếp vào req để Controller sử dụng (Tuyệt đối không lấy ID từ body)
    req.reviewContext = decoded;
    next();
};

module.exports = { checkReviewToken };
