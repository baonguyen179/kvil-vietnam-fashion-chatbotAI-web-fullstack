import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AboutPage = () => {
    // Danh sách menu điều hướng SEO-Friendly
    const sidebarLinks = [
        { label: 'Về KOISAN', href: '/about' },
        { label: 'Chính sách đổi trả', href: '/about/chinh-sach-doi-tra' },
        { label: 'Chính sách bảo mật', href: '/about/chinh-sach-bao-mat' },
        { label: 'Điều khoản dịch vụ', href: '/about/dieu-khoan-dich-vu' },
        { label: 'Chính sách thanh toán', href: '/about/chinh-sach-thanh-toan' },
        { label: 'Chính sách vận chuyển', href: '/about/chinh-sach-giao-nhan-van-chuyen' }
    ];

    return (
        <div className="w-full bg-white pt-10 pb-24 px-6 md:px-12 lg:px-20 min-h-screen">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24">
                
                {/* Thanh bên trái (Sidebar) */}
                <aside className="md:col-span-3">
                    <div className="sticky top-40 border border-[#eeeeee] p-8 rounded-sm">
                        <div className="mb-6 text-center">
                            <h2 className="text-[12px] font-bold tracking-[0.2em] text-[#1c1c19] uppercase mb-4">
                                Danh mục
                            </h2>
                            <div className="h-px w-full bg-[#070707]" />
                        </div>
                        
                        <nav className="flex flex-col gap-4">
                            {sidebarLinks.map((link) => (
                                <NavLink
                                    key={link.label}
                                    to={link.href}
                                    end={link.href === '/about'}
                                    className={({ isActive }) => 
                                        cn(
                                            "text-[11px] tracking-wider transition-colors duration-300 text-left",
                                            isActive 
                                                ? "text-[#1c1c19] font-bold" 
                                                : "text-[#888888] hover:text-[#1c1c19]"
                                        )
                                    }
                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Khu vực nội dung chính bên phải */}
                <main className="md:col-span-9 flex flex-col gap-20">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AboutPage;
