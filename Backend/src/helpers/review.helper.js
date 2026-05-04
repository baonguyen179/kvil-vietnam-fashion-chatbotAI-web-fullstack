const jwt = require('jsonwebtoken');

const vnBadWords = [
  'đm', 'vcl', 'vl', 'lừa đảo', 'chó',
  'đéo', 'cc', 'clm', 'cút', 'ngu',
  'khốn', 'bựa', 'rác', 'dở hơi', 'tào lao',
  'xàm', 'vớ vẩn', 'bậy', 'đồ ngu', 'ngu vcl',
  'óc chó', 'đồ chó', 'cặn bã', 'bẩn', 'vô học',
  'ăn hại', 'phế vật', 'vô dụng', 'mất dạy', 'hâm',
  'điên', 'khùng', 'bệnh hoạn', 'xạo', 'làm màu'
];

const reviewHelper = {
    // Tạo token đính kèm link email
    generateReviewToken: (orderItemId, productId, userId) => {
        const payload = { orderItemId, productId, userId };
        // Token tồn tại 7 ngày để khách có thời gian đánh giá
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    },

    verifyReviewToken: (token) => {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return null;
        }
    },

    /**
     * [SENIOR FIX] Tự xây dựng hàm lọc từ cấm thay vì dùng thư viện 'bad-words' (ESM)
     * giúp tránh lỗi "exports is not defined" trong môi trường CommonJS.
     */
    isCleanContent: (text) => {
        if (!text) return true;
        const lowerText = text.toLowerCase();
        
        // Kiểm tra xem có chứa từ cấm nào không
        return !vnBadWords.some(word => {
            // Sử dụng regex với boundary để tránh bắt nhầm từ con (vd: 'ngu' trong 'nguồn')
            // Tuy nhiên với tiếng Việt syllable-based, ta có thể check đơn giản hoặc dùng regex
            const regex = new RegExp(`(^|\\s|[^a-zA-ZÀ-ỹ])${word}($|\\s|[^a-zA-ZÀ-ỹ])`, 'i');
            return regex.test(lowerText);
        });
    }
};

module.exports = reviewHelper;
