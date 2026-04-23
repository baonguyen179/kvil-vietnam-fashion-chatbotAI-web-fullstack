import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import AdminLayout from '@/layouts/AdminLayout';

// Lazy loading các trang admin để tối ưu hiệu suất
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const UserManagePage = lazy(() => import('@/pages/admin/UserManagePage'));
const CategoryManagePage = lazy(() => import('@/pages/admin/CategoryManagePage'));
const ProductManagePage = lazy(() => import('@/pages/admin/ProductManagePage'));
const CollectionManagePage = lazy(() => import('@/pages/admin/CollectionManagePage'));
const OrderManagePage = lazy(() => import('@/pages/admin/OrderManagePage'));
const CouponManagePage = lazy(() => import('@/pages/admin/CouponManagePage'));
const ColorSizeManagePage = lazy(() => import('@/pages/admin/ColorSizeManagePage'));
const ChatbotManagePage = lazy(() => import('@/pages/admin/ChatbotManagePage'));
const InventoryLogPage = lazy(() => import('@/pages/admin/InventoryLogPage'));
const TransactionPage = lazy(() => import('@/pages/admin/TransactionPage'));
const RoleManagePage = lazy(() => import('@/pages/admin/RoleManagePage'));
const ReturnManagePage = lazy(() => import('@/pages/admin/ReturnManagePage'));

// Thành phần bảo vệ Route dựa trên Role
// Thành phần bảo vệ Route dựa trên Role và Permission
const AdminGuard = ({ allowedRoles, requiredPermission, children }) => {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const { roles = [], permissions = [] } = user || {};

    // Luôn cho phép SUPER_ADMIN truy cập mọi nơi (hoặc tùy biến nếu cần chặt chẽ hơn)
    if (roles.includes('SUPER_ADMIN')) return children;

    // Kiểm tra theo Quyền (Permission) - Ưu tiên hàng đầu
    if (requiredPermission && permissions.includes(requiredPermission)) {
        return children;
    }

    // Kiểm tra theo Vai trò (Role) - Dành cho các trang tổng quát
    if (allowedRoles && roles.some(role => allowedRoles.includes(role))) {
        return children;
    }

    // Nếu không thỏa mãn bất kỳ điều kiện nào, đẩy về trang chủ Admin
    return <Navigate to="/admin" replace />;
};

const AdminRoutes = ({ notFound }) => {
    return (
        <Suspense 
            fallback={
                <div className="h-screen w-full flex items-center justify-center bg-gray-50/50">
                    <div className="text-center">
                        <Spin size="large" />
                        <div className="mt-4 text-gray-500 font-medium">Đang tải dữ liệu...</div>
                    </div>
                </div>
            }
        >
            <Routes>
                <Route path="/" element={<AdminLayout />}>
                    {/* Dashboard Thống kê */}
                    <Route index element={
                        <AdminGuard requiredPermission="dashboard.read">
                            <DashboardPage />
                        </AdminGuard>
                    } />

                    {/* Quản lý người dùng: Nhân sự & Phân quyền */}
                    <Route path="users" element={
                        <AdminGuard requiredPermission="users.manage">
                            <UserManagePage />
                        </AdminGuard>
                    } />

                    {/* Quản lý Vai trò & Quyền hạn (Chỉ SUPER_ADMIN) */}
                    <Route path="roles" element={
                        <AdminGuard allowedRoles={['SUPER_ADMIN']}>
                            <RoleManagePage />
                        </AdminGuard>
                    } />

                    {/* Sản phẩm & Danh mục */}
                    <Route path="categories" element={
                        <AdminGuard requiredPermission="products.read">
                            <CategoryManagePage />
                        </AdminGuard>
                    } />
                    <Route path="products" element={
                        <AdminGuard requiredPermission="products.read">
                            <ProductManagePage />
                        </AdminGuard>
                    } />
                    <Route path="collections" element={
                        <AdminGuard requiredPermission="products.read">
                            <CollectionManagePage />
                        </AdminGuard>
                    } />
                    <Route path="attributes" element={
                        <AdminGuard requiredPermission="products.read">
                            <ColorSizeManagePage />
                        </AdminGuard>
                    } />

                    {/* Kho hàng */}
                    <Route path="inventory" element={
                        <AdminGuard requiredPermission="inventory.read">
                            <InventoryLogPage />
                        </AdminGuard>
                    } />

                    {/* Đơn hàng */}
                    <Route path="orders" element={
                        <AdminGuard requiredPermission="orders.read">
                            <OrderManagePage />
                        </AdminGuard>
                    } />
                    <Route path="orders/returns" element={
                        <AdminGuard requiredPermission="orders.read">
                            <ReturnManagePage />
                        </AdminGuard>
                    } />

                    {/* Giao dịch thanh toán */}
                    <Route path="transactions" element={
                        <AdminGuard requiredPermission="payments.read">
                            <TransactionPage />
                        </AdminGuard>
                    } />

                    {/* Mã giảm giá (Coupons) */}
                    <Route path="coupons" element={
                        <AdminGuard requiredPermission="coupons.manage">
                            <CouponManagePage />
                        </AdminGuard>
                    } />

                    {/* Chatbot AI */}
                    <Route path="chatbot" element={
                        <AdminGuard requiredPermission="chatbot.read">
                            <ChatbotManagePage />
                        </AdminGuard>
                    } />
                </Route>
                <Route path="*" element={notFound} />
            </Routes>
        </Suspense>
    );
};

export default AdminRoutes;
