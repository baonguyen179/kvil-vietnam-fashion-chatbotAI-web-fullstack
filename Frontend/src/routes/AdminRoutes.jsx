import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import UserManagePage from '@/pages/admin/UserManagePage';
import CategoryManagePage from '@/pages/admin/CategoryManagePage';
import ProductManagePage from '@/pages/admin/ProductManagePage';

const AdminRoutes = ({ notFound }) => {
    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<div>Trang quản trị (Admin Dashboard)</div>} />
                <Route path="users" element={<UserManagePage />} />
                <Route path="categories" element={<CategoryManagePage />} />
                <Route path="products" element={<ProductManagePage />} />
            </Route>
            <Route path="*" element={notFound} />
        </Routes>
    );
};

export default AdminRoutes;
