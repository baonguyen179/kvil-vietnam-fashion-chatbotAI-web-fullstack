import React, { useState, useEffect } from 'react';
import userService from '@/services/userService';
import { Loader2 } from 'lucide-react';

const UserAccountSummary = ({ refreshKey }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Chỉ hiện loading ở lần đầu, các lần update sau fetch ngầm để tránh flash UI
                if (!userData) setLoading(true); 
                
                const res = await userService.getUserProfile();
                // console.log("res user profile: ",res);
                if (res && res.DT) {
                    setUserData(res.DT);
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [refreshKey]);

    if (loading) {
        return (
            <aside className="md:col-span-3 flex flex-col items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#888888]" />
            </aside>
        );
    }

    return (
        <aside className="md:col-span-3 flex flex-col gap-6">
            <h3 className="text-xs tracking-[2px] font-bold text-[#1c1c19] uppercase">
                TỔNG TIN TÀI KHOẢN
            </h3>
            
            <div className="bg-[#f9f9f9] p-6 rounded-sm border border-[#f0f0f0] flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#888888] uppercase tracking-[1px]">Tên tài khoản</span>
                    <p className="text-[#1c1c19] font-medium">{userData?.fullName || 'Khách hàng'}</p>
                </div>
                
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#888888] uppercase tracking-[1px]">Email</span>
                    <p className="text-[#1c1c19] text-sm break-all">{userData?.email || 'N/A'}</p>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#888888] uppercase tracking-[1px]">Điện thoại</span>
                    <p className="text-[#1c1c19] text-sm">{userData?.phone || 'Chưa cập nhật'}</p>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#888888] uppercase tracking-[1px]">Ngày sinh</span>
                    <p className="text-[#1c1c19] text-sm">
                        {userData?.birthday ? new Date(userData.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </p>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#888888] uppercase tracking-[1px]">Giới tính</span>
                    <p className="text-[#1c1c19] text-sm">
                        {userData?.gender === true ? 'Nam' : userData?.gender === false ? 'Nữ' : 'Khác'}
                    </p>
                </div>
                
                <div className="mt-2 pt-4 border-t border-[#eeeeee]">
                    <p className="text-xs text-[#888888] italic">
                        Chào mừng bạn trở lại!
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default UserAccountSummary;

