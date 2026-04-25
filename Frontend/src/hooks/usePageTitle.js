import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// ============================================================================
// TITLE MAP: Route pattern -> Tiêu đề trang
// Thứ tự quan trọng: kiểm tra pattern cụ thể trước, tổng quát sau
// ============================================================================
const ROUTE_TITLE_MAP = [
    // --- AUTH ---
    { pattern: /^\/login$/,                   title: 'Đăng nhập' },
    { pattern: /^\/register$/,                title: 'Đăng ký tài khoản' },
    { pattern: /^\/forgot-password$/,         title: 'Quên mật khẩu' },

    // --- ACCOUNT ---
    { pattern: /^\/account\/profile$/,        title: 'Thông tin tài khoản' },
    { pattern: /^\/account\/addresses$/,      title: 'Địa chỉ giao hàng' },
    { pattern: /^\/account\/change-password$/,title: 'Đổi mật khẩu' },
    { pattern: /^\/account$/,                 title: 'Lịch sử đơn hàng' },

    // --- CHECKOUT ---
    { pattern: /^\/order\/vnpay-return/,      title: 'Kết quả thanh toán VNPay' },
    { pattern: /^\/order-success\//,          title: 'Đặt hàng thành công' },
    { pattern: /^\/checkout$/,                title: 'Thanh toán' },
    { pattern: /^\/cart$/,                    title: 'Giỏ hàng' },

    // --- PRODUCTS & COLLECTIONS ---
    { pattern: /^\/products\//,               title: 'Chi tiết sản phẩm' },
    { pattern: /^\/collections\//,            title: 'Bộ sưu tập' },
    { pattern: /^\/collections$/,             title: 'Tất cả sản phẩm' },

    // --- STATIC PAGES ---
    { pattern: /^\/lien-he$/,                 title: 'Liên hệ' },
    { pattern: /^\/tra-cuu-don-hang$/,        title: 'Tra cứu đơn hàng' },
    { pattern: /^\/about\/chinh-sach-doi-tra$/,    title: 'Chính sách đổi trả' },
    { pattern: /^\/about\/chinh-sach-bao-mat$/,    title: 'Chính sách bảo mật' },
    { pattern: /^\/about\/dieu-khoan-dich-vu$/,    title: 'Điều khoản dịch vụ' },
    { pattern: /^\/about\/chinh-sach-thanh-toan$/,  title: 'Chính sách thanh toán' },
    { pattern: /^\/about\//,                  title: 'Giới thiệu' },
    { pattern: /^\/about$/,                   title: 'Giới thiệu' },

    // --- ADMIN ---
    { pattern: /^\/admin\/orders$/,           title: 'Admin - Đơn hàng' },
    { pattern: /^\/admin\/products$/,         title: 'Admin - Sản phẩm' },
    { pattern: /^\/admin\/inventory$/,        title: 'Admin - Kho hàng' },
    { pattern: /^\/admin\/users$/,            title: 'Admin - Người dùng' },
    { pattern: /^\/admin\/coupons$/,          title: 'Admin - Mã giảm giá' },
    { pattern: /^\/admin\/chatbot$/,          title: 'Admin - Chatbot AI' },
    { pattern: /^\/admin\/collections$/,      title: 'Admin - Bộ sưu tập' },
    { pattern: /^\/admin\/transactions$/,     title: 'Admin - Giao dịch' },
    { pattern: /^\/admin\/returns$/,          title: 'Admin - Hoàn trả' },
    { pattern: /^\/admin$/,                   title: 'Trang quản trị' },

    // --- HOME (fallback cuối cùng) ---
    { pattern: /^\/$/,                        title: 'Trang chủ' },
];

const BRAND_NAME = 'KOISAN';
const DEFAULT_TITLE = BRAND_NAME;

/**
 * Tìm tiêu đề phù hợp với pathname hiện tại.
 * Trả về title đầy đủ dạng "Tên trang | KOISAN".
 */
const resolveTitle = (pathname) => {
    for (const { pattern, title } of ROUTE_TITLE_MAP) {
        if (pattern.test(pathname)) {
            return `${title} | ${BRAND_NAME}`;
        }
    }
    return DEFAULT_TITLE;
};

/**
 * Hook cập nhật document.title theo route.
 * Sử dụng trong PageTitleManager - KHÔNG cần gọi từ từng page riêng lẻ.
 */
const usePageTitle = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const title = resolveTitle(pathname);
        document.title = title;

        // Cleanup: khôi phục title mặc định khi unmount (edge-case)
        return () => {
            document.title = DEFAULT_TITLE;
        };
    }, [pathname]);
};

export { usePageTitle, resolveTitle, BRAND_NAME };
export default usePageTitle;
