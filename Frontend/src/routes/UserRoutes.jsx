import { Routes, Route } from 'react-router-dom';
import UserLayout from '@/layouts/UserLayout';

const UserRoutes = ({ notFound }) => {
    return (
        <Routes>
            <Route path="/" element={<UserLayout />}>
                <Route index element={<div>Trang chủ (HomePage Component)</div>} />
            </Route>
            <Route path="*" element={notFound} />
        </Routes>
    );
};

export default UserRoutes;
