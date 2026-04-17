import { Routes, Route } from 'react-router-dom';
import UserLayout from '@/layouts/UserLayout';
import PrivateRoute from '@/routes/PrivateRoute';
import PublicRoute from '@/routes/PublicRoute';
import LoginPage from '@/pages/auth/LoginPage'; 
import HomePage from '@/pages/user/HomePage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

const UserRoutes = ({ notFound }) => {
    return (
        <Routes>
            <Route path="/" element={<UserLayout />}>
                <Route index element={<HomePage />} />
            </Route>
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
            <Route 
                path="/profile" 
                element={
                    <PrivateRoute> 
                        {/* vd: <ProfilePage /> */}
                    </PrivateRoute>
                } 
            />
            <Route path="*" element={notFound} />
        </Routes>
    );
};

export default UserRoutes;
