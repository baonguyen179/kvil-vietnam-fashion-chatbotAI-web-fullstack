import { Routes, Route } from 'react-router-dom';
import UserLayout from '@/layouts/UserLayout';
import AdminLayout from '@/layouts/AdminLayout';
import { ToastContainer } from 'react-toastify';
import { Suspense } from 'react';

const NotFound = () => {
    return (
        <Alert key='danger' variant='danger'>
            404 Not Found Data With Your Current URL.
            <Alert.Link href="/">Go home.</Alert.Link>
        </Alert>
    )
};
const AppRoutes = () => {
    return (
        // fallback = {< LoadingSpinner />}
        <Suspense fallback="...is loading">
            <Routes>
                <Route path="/" element={<UserLayout />}>
                    {/* Các route con sẽ được render vào thẻ <Outlet /> trong Layout */}
                    <Route index element={<div>Trang chủ (HomePage Component)</div>} />
                    {/* <Route path="about" element={<AboutPage />} /> */}

                </Route>

                {/* Nhóm các route dành cho quản trị viên (Admin) */}
                <Route path="/admin" element={<AdminLayout />}>
                    {/* Các route con của admin sẽ render vào <Outlet /> trong AdminLayout */}
                    <Route index element={<div>Trang quản trị (Admin Dashboard)</div>} />
                    {/* <Route path="users" element={<ManageUsers />} /> */}
                </Route>

                {/* Route 404 cho các đường dẫn không tồn tại */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer position="top-center" />
        </Suspense>
    )
};

export default AppRoutes;