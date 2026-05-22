import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService from '@/services/userService';
import { updateUser } from '@/redux/slices/authSlice';
import UserProfileForm from '@/components/user/user.profile-form';
import { Loader2 } from 'lucide-react';

const ProfilePage = () => {
    const dispatch = useDispatch();
    const { triggerRefresh } = useOutletContext();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await userService.getUserProfile();
            if (res && res.EC === 0) {
                setProfile(res.DT);
            }
        } catch (error) {
            toast.error(error?.EM || 'Không thể tải thông tin cá nhân');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (formData) => {
        setUpdating(true);
        try {
            const res = await userService.updateUserProfile(formData);
            if (res && res.EC === 0) {
                toast.success('Cập nhật hồ sơ thành công!');
                setProfile(res.DT);
                // Cập nhật Redux để Header phản ánh thay đổi ngay lập tức
                dispatch(updateUser(res.DT));
                
                // Kích hoạt làm mới cho các component sibling (như UserAccountSummary)
                if (triggerRefresh) triggerRefresh();
            } else {
                toast.error(res.EM || 'Cập nhật thất bại');
            }
        } catch (error) {
            toast.error(error?.EM || 'Lỗi hệ thống khi cập nhật hồ sơ');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#785254]" />
                <p className="text-sm text-[#888888]">Đang tải thông tin cá nhân...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <h2 className="text-2xl font-medium tracking-[2px] text-[#1c1c19] uppercase" style={{ fontFamily: "'Noto Serif', Georgia, serif" }}>
                Thông tin cá nhân
            </h2>
            
            <UserProfileForm 
                initialData={profile} 
                onSubmit={handleUpdateProfile} 
                loading={updating} 
            />
        </div>
    );
};

export default ProfilePage;
