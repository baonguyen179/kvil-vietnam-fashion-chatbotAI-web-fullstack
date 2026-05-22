import React, { useState, useEffect } from 'react';
import { Loader2, Save, User, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserProfileForm = ({ initialData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        gender: true, // Let's say true = Nam, false = Nữ
        birthday: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                fullName: initialData.fullName || '',
                gender: initialData.gender === null ? true : initialData.gender,
                birthday: initialData.birthday ? new Date(initialData.birthday).toISOString().split('T')[0] : ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl">
            <div className="flex flex-col gap-6">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#888888] uppercase tracking-[1px]">Họ và tên</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#cccccc]" />
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nhập họ tên của bạn"
                            className="w-full pl-10 pr-4 py-3 bg-white border border-[#eeeeee] rounded-sm text-sm focus:outline-none focus:border-[#785254] transition-all"
                            required
                        />
                    </div>
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#888888] uppercase tracking-[1px]">Giới tính</label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="gender"
                                value="true"
                                checked={formData.gender === true || formData.gender === 'true'}
                                onChange={() => setFormData(prev => ({ ...prev, gender: true }))}
                                className="w-4 h-4 accent-[#785254] cursor-pointer"
                            />
                            <span className="text-sm text-[#1c1c19] group-hover:text-[#785254] transition-colors">Nam</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="radio"
                                name="gender"
                                value="false"
                                checked={formData.gender === false || formData.gender === 'false'}
                                onChange={() => setFormData(prev => ({ ...prev, gender: false }))}
                                className="w-4 h-4 accent-[#785254] cursor-pointer"
                            />
                            <span className="text-sm text-[#1c1c19] group-hover:text-[#785254] transition-colors">Nữ</span>
                        </label>
                    </div>
                </div>

                {/* Birthday */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#888888] uppercase tracking-[1px]">Ngày sinh</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#cccccc]" />
                        <input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-[#eeeeee] rounded-sm text-sm focus:outline-none focus:border-[#785254] transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-[#f0f0f0]">
                <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#1c1c19] text-white text-xs font-bold uppercase tracking-[2px] rounded-sm transition-all hover:bg-[#333333] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                        loading && "cursor-wait"
                    )}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Cập nhật hồ sơ
                </button>
            </div>
        </form>
    );
};

export default UserProfileForm;
