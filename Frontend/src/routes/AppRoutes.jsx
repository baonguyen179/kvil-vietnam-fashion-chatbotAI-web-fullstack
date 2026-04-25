import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Suspense } from 'react';

import NotFound from '@/components/NotFound';
import UserRoutes from './UserRoutes';
import AdminRoutes from './AdminRoutes';
import PrivateRoute from './PrivateRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageTitleManager from '@/components/PageTitleManager';

const AppRoutes = () => {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            {/* Quản lý tiêu đề trang tự động theo route - không render DOM */}
            <PageTitleManager />
            <Routes>
                <Route path="/*" element={<UserRoutes notFound={<NotFound />} />} />
                <Route 
                    path="/admin/*" 
                    element={
                        <PrivateRoute allowedRoles={['SUPER_ADMIN','SALES','ACCOUNTANT']}>
                            <AdminRoutes notFound={<NotFound />} />
                        </PrivateRoute>
                    } 
                />
            </Routes>
            <ToastContainer position="top-left" />
        </Suspense>
    )
};

export default AppRoutes;