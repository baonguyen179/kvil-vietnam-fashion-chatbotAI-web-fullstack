import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { performLogout } from '@/redux/slices/authSlice';
import { cn } from '@/lib/utils';
import { User, MapPin, ShoppingBag } from 'lucide-react';
import UserAccountSummary from '@/components/user/user.account-summary';

const AccountLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleLogout = async () => {
        await dispatch(performLogout());
        navigate('/login');
    };

    const sidebarLinks = [
        {
            label: 'Danh sách đơn hàng',
            path: '/account',
            icon: <ShoppingBag className="w-4 h-4" />
        },
        {
            label: 'Thông tin cá nhân',
            path: '/account/profile',
            icon: <User className="w-4 h-4" />
        },
        {
            label: 'Danh sách địa chỉ',
            path: '/account/addresses',
            icon: <MapPin className="w-4 h-4" />
        },
        {
            label: 'Đổi mật khẩu',
            path: '/account/change-password',
            icon: <Lock className="w-4 h-4" />
        }
    ];


    return (
        <div className="w-full bg-white min-h-[600px] py-12 px-6 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
                <aside className="md:col-span-3 flex flex-col gap-8">
                    <div className="pb-4 border-b border-[#eeeeee]">
                        <h1 className="text-2xl font-normal text-[#1c1c19]" style={{ fontFamily: "'Lora', serif" }}>
                            Tài khoản của bạn
                        </h1>
                    </div>
                    
                    <nav className="flex flex-col gap-4">
                        {sidebarLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) => 
                                    cn(
                                        "flex items-center gap-3 text-sm transition-all duration-300 py-1",
                                        isActive 
                                            ? "text-[#785254] font-medium" // Màu đỏ gạch/nâu nhạt khi active
                                            : "text-[#888888] hover:text-[#1c1c19]"
                                    )
                                }
                                end={link.path === '/account'}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 text-sm text-[#888888] hover:text-red-600 transition-all duration-300 py-1 text-left"
                        >
                            Đăng xuất
                        </button>
                    </nav>
                </aside>

                <main className="md:col-span-6">
                    <Outlet context={{ triggerRefresh }} />
                </main>

                <UserAccountSummary refreshKey={refreshKey} />
            </div>
        </div>
    );
};

export default AccountLayout;



