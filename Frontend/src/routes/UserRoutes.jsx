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
import AddressPage from '@/pages/user/Account/AddressPage';
import ChangePasswordPage from '@/pages/user/Account/ChangePasswordPage';
import AboutPage from '@/pages/user/AboutPage';
import AboutStory from '@/pages/user/About/AboutStory';
import PolicyContent from '@/pages/user/About/PolicyContent';
import ProductsLayout from '@/pages/user/Products/ProductsLayout';
import ProductList from '@/pages/user/Products/ProductList';
import ProductDetailPage from '@/pages/user/Products/ProductDetailPage';
import { lazy } from 'react';

const CartPage = lazy(() => import('@/pages/user/Cart/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/user/Checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('@/pages/user/Checkout/OrderSuccessPage'));
const VNPayReturnPage = lazy(() => import('@/pages/user/Checkout/VNPayReturnPage'));




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
