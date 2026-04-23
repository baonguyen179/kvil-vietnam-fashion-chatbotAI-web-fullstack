import { Routes, Route } from 'react-router-dom';
import UserLayout from '@/layouts/UserLayout';
import AccountLayout from '@/layouts/AccountLayout';
import PrivateRoute from '@/routes/PrivateRoute';
import PublicRoute from '@/routes/PublicRoute';
import { lazy } from 'react';

const HomePage = lazy(() => import('@/pages/user/HomePage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const OrderHistory = lazy(() => import('@/pages/user/Account/OrderHistory'));
const ProfilePage = lazy(() => import('@/pages/user/Account/ProfilePage'));
const AddressPage = lazy(() => import('@/pages/user/Account/AddressPage'));
const ChangePasswordPage = lazy(() => import('@/pages/user/Account/ChangePasswordPage'));
const AboutPage = lazy(() => import('@/pages/user/AboutPage'));
const AboutStory = lazy(() => import('@/pages/user/About/AboutStory'));
const PolicyContent = lazy(() => import('@/pages/user/About/PolicyContent'));
const ProductsLayout = lazy(() => import('@/pages/user/Products/ProductsLayout'));
const ProductList = lazy(() => import('@/pages/user/Products/ProductList'));
const ProductDetailPage = lazy(() => import('@/pages/user/Products/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/user/Cart/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/user/Checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('@/pages/user/Checkout/OrderSuccessPage'));
const VNPayReturnPage = lazy(() => import('@/pages/user/Checkout/VNPayReturnPage'));
const GuestTrackingPage = lazy(() => import('@/pages/user/GuestTracking/GuestTrackingPage'));

const UserRoutes = ({ notFound }) => {

    return (
        <Routes>
            <Route path="/" element={<UserLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />}>
                    <Route index element={<AboutStory />} />
                    <Route path="chinh-sach-doi-tra" element={<PolicyContent />} />
                    <Route path="chinh-sach-bao-mat" element={<PolicyContent />} />
                    <Route path="dieu-khoan-dich-vu" element={<PolicyContent />} />
                    <Route path="chinh-sach-thanh-toan" element={<PolicyContent />} />
                    <Route path="chinh-sach-giao-nhan-van-chuyen" element={<PolicyContent />} />
                </Route>

                <Route path="collections" element={<ProductsLayout />}>
                    <Route index element={<ProductList />} />
                    <Route path=":slug" element={<ProductList />} />
                </Route>


                <Route path="products/:id/:slug?" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="order/vnpay-return" element={<VNPayReturnPage />} />
                <Route path="tra-cuu-don-hang" element={<GuestTrackingPage />} />

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
                    <Route path="addresses" element={<AddressPage />} />
                    <Route path="change-password" element={<ChangePasswordPage />} />
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
