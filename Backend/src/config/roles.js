/**
 * Định nghĩa các Hằng số Role để sử dụng trong toàn bộ hệ thống.
 * Giúp tránh lỗi chính tả và dễ dàng bảo trì khi cần thay đổi tên Role.
 */
const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    SALES: 'SALES',
    ACCOUNTANT: 'ACCOUNTANT',
    CUSTOMER: 'CUSTOMER'
};

/**
 * Danh sách các Role có quyền truy cập vào các tài nguyên Admin (/api/v1/admin/*)
 */
const ADMIN_ROLES = [
    ROLES.SUPER_ADMIN,
    ROLES.SALES,
    ROLES.ACCOUNTANT
];

module.exports = {
    ROLES,
    ADMIN_ROLES
};
