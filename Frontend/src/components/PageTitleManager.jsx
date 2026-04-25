import { usePageTitle } from '@/hooks/usePageTitle';

/**
 * PageTitleManager - Component không render gì ra DOM.
 * Đặt một lần duy nhất trong AppRoutes để tự động
 * cập nhật document.title khi người dùng chuyển trang.
 *
 * ✅ SRP: Chỉ chịu trách nhiệm quản lý tiêu đề trang.
 * ✅ Zero re-render: Không render DOM nên không ảnh hưởng hiệu năng.
 */
const PageTitleManager = () => {
    usePageTitle();
    return null;
};

export default PageTitleManager;
