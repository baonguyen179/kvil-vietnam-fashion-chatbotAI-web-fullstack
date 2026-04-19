import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Suspense } from 'react';

import NotFound from '@/components/NotFound';
import UserRoutes from './UserRoutes';
import AdminRoutes from './AdminRoutes';

import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
    return (
        // fallback = {< LoadingSpinner />}
        <Suspense fallback="...is loading">
            <Routes>
                <Route path="/*" element={<UserRoutes notFound={<NotFound />} />} />
                <Route 
                    path="/admin/*" 
                    element={
                        <PrivateRoute allowedRoles={['ADMIN']}>
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