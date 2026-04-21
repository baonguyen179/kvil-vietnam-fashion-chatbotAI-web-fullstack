const errorCode = {
    SUCCESS: 0,           // Mọi thứ đều ổn
    OTHER_ERROR: -1,      // Lỗi logic/server chung

    // --- Nhóm Xác thực & Phân quyền ---
    UNAUTHENTICATED: 1,   // Thiếu token hoặc token bị sai/giả mạo
    UNAUTHORIZED: 2,      // Đã đăng nhập nhưng không có quyền (Vào vùng Admin)
    TOKEN_EXPIRED: 8,     // Dành riêng cho Token hết hạn -> Báo React gọi API Refresh

    // --- Nhóm Dữ liệu & Nghiệp vụ ---
    VALIDATION_ERROR: 3,  // Dữ liệu đầu vào không hợp lệ (thiếu email, sai format...)
    ALREADY_EXIST: 4,     // Dữ liệu đã tồn tại (Email đã được đăng ký)
    NOT_FOUND: 5,         // Không tìm thấy tài nguyên (Sản phẩm/Đơn hàng không tồn tại)
    OUT_OF_STOCK: 6,      // Hết hàng trong kho
    COUPON_INVALID: 7,    // Mã giảm giá không hợp lệ hoặc hết hạn
};

module.exports = errorCode;