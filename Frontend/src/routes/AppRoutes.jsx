import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Suspense } from 'react';

import NotFound from '@/components/NotFound';
import UserRoutes from './UserRoutes';
import AdminRoutes from './AdminRoutes';



const AppRoutes = () => {
    return (
        // fallback = {< LoadingSpinner />}
        <Suspense fallback="...is loading">
            <Routes>
                <Route path="/*" element={<UserRoutes notFound={<NotFound />} />} />
                <Route path="/admin/*" element={<AdminRoutes notFound={<NotFound />} />} />
            </Routes>
            <ToastContainer position="top-center" />
        </Suspense>
    )
};

export default AppRoutes;