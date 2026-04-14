import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';

const AdminRoutes = ({ notFound }) => {
    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<div>Trang quản trị (Admin Dashboard)</div>} />
            </Route>
            <Route path="*" element={notFound} />
        </Routes>
    );
};

export default AdminRoutes;
