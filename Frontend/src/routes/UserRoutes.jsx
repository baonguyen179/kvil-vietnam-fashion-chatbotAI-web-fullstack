import { Routes, Route } from 'react-router-dom';
import UserLayout from '@/layouts/UserLayout';
import AccountLayout from '@/layouts/AccountLayout';
import PrivateRoute from '@/routes/PrivateRoute';
import PublicRoute from '@/routes/PublicRoute';
import LoginPage from '@/pages/auth/LoginPage'; 
import HomePage from '@/pages/user/HomePage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import OrderHistory from '@/pages/user/Account/OrderHistory';
import ProfilePage from '@/pages/user/Account/ProfilePage';

const UserRoutes = ({ notFound }) => {

    return (
        <Routes>
            <Route path="/" element={<UserLayout />}>
                <Route index element={<HomePage />} />
                
                <Route 
                    path="account" 
                    element={
                        <PrivateRoute>
                            <AccountLayout />
                        </PrivateRoute>
                    }
                >
                    <Route index element={<OrderHistory />} />
                    <Route path="profile" element={<ProfilePage />} /> 
                    <Route path="addresses" element={<OrderHistory />} />

                </Route>
            </Route>

            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            <Route path="*" element={notFound} />
        </Routes>
    );
};

export default UserRoutes;
