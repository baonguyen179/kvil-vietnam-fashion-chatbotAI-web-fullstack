import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import UserManagePage from '@/pages/admin/UserManagePage';
import CategoryManagePage from '@/pages/admin/CategoryManagePage';
import ProductManagePage from '@/pages/admin/ProductManagePage';
import CollectionManagePage from '@/pages/admin/CollectionManagePage';
import OrderManagePage from '@/pages/admin/OrderManagePage';

const AdminRoutes = ({ notFound }) => {
    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<div>Trang quản trị (Admin Dashboard)</div>} />
                <Route path="users" element={<UserManagePage />} />
                <Route path="categories" element={<CategoryManagePage />} />
                <Route path="products" element={<ProductManagePage />} />
                <Route path="collections" element={<CollectionManagePage />} />
                <Route path="orders" element={<OrderManagePage />} />
            </Route>
            <Route path="*" element={notFound} />
        </Routes>
    );
};

export default AdminRoutes;

