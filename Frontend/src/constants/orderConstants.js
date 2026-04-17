/**
 * Constants dùng chung cho Order trên toàn bộ ứng dụng Admin.
 * Khi backend thay đổi enum, chỉ cần sửa tại đây.
 */

export const ORDER_STATUS_CONFIG = {
    pending:   { label: 'Chờ xác nhận', color: 'orange',  badgeColor: '#f97316' },
    confirmed: { label: 'Đã xác nhận',  color: 'blue',    badgeColor: '#3b82f6' },
    shipping:  { label: 'Đang giao',    color: 'purple',   badgeColor: '#a855f7' },
    delivered: { label: 'Đã giao',      color: 'green',    badgeColor: '#22c55e' },
    cancelled: { label: 'Đã hủy',       color: 'red',      badgeColor: '#ef4444' },
};

export const PAYMENT_METHOD_LABELS = {
    COD:           'Tiền mặt (COD)',
    BANK_TRANSFER: 'Chuyển khoản',
};

export const DELIVERY_METHOD_LABELS = {
    home_delivery: 'Giao tận nơi',
    store_pickup:  'Nhận tại cửa hàng',
};

// Các trạng thái có thể được filter trên bảng
export const ORDER_STATUS_OPTIONS = [
    { value: '',          label: 'Tất cả trạng thái' },
    { value: 'pending',   label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipping',  label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' },
];

export const PAYMENT_STATUS_OPTIONS = [
    { value: '',     label: 'Tất cả thanh toán' },
    { value: 'true', label: 'Đã thanh toán' },
    { value: 'false',label: 'Chưa thanh toán' },
];

export const PAYMENT_METHOD_OPTIONS = [
    { value: '',              label: 'Tất cả hình thức TT' },
    { value: 'COD',           label: 'Tiền mặt (COD)' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
];

export const DELIVERY_METHOD_OPTIONS = [
    { value: '',               label: 'Tất cả hình thức giao' },
    { value: 'home_delivery',  label: 'Giao tận nơi' },
    { value: 'store_pickup',   label: 'Nhận tại cửa hàng' },
];
