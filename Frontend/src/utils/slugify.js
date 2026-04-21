/**
 * Tiện ích chuyển đổi chuỗi thành SEO Slug (URL-friendly)
 * Ví dụ: "Áo Blazer Nam Màu Xanh" -> "ao-blazer-nam-mau-xanh"
 */

export const slugify = (text) => {
    if (!text) return "";

    return text
        .toString()
        .normalize("NFD")                   // Tách các dấu tiếng Việt
        .replace(/[\u0300-\u036f]/g, "")    // Xóa các ký tự dấu
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")               // Thay khoảng trắng bằng gạch ngang
        .replace(/[^\w-]+/g, "")            // Xóa ký tự đặc biệt
        .replace(/--+/g, "-");              // Thay nhiều gạch ngang liên tiếp bằng 1 cái
};
