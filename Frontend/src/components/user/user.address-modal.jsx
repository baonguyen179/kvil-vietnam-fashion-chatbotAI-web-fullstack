import React, { useState, useEffect } from 'react';
import { X, Loader2, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserAddressModal = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
    const [formData, setFormData] = useState({
        receiverName: '',
        phoneNumber: '',
        province: '',
        ward: '',
        detailAddress: '',
        isDefault: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                receiverName: initialData.receiverName || '',
                phoneNumber: initialData.phoneNumber || '',
                province: initialData.province || '',
                ward: initialData.ward || '',
                detailAddress: initialData.detailAddress || '',
                isDefault: initialData.isDefault || false
            });
        } else {
            setFormData({
                receiverName: '',
                phoneNumber: '',
                province: '',
                ward: '',
                detailAddress: '',
                isDefault: false
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#eeeeee]">
                    <h3 className="text-lg font-medium text-[#1c1c19] uppercase tracking-[1px]" style={{ fontFamily: "'Noto Serif', Georgia, serif" }}>
                        {initialData ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-[#888888] hover:text-[#1c1c19] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(formData);
                    }} 
                    className="p-6 flex flex-col gap-5"
                >
                    {/* Receiver Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#888888] uppercase tracking-[1px]">Họ và tên người nhận</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#cccccc]" />
                            <input
                                type="text"
                                name="receiverName"
                                value={formData.receiverName}
                                onChange={handleChange}
                                placeholder="Nhập tên người nhận"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#eeeeee] rounded-sm text-sm focus:outline-none focus:border-[#785254] transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#888888] uppercase tracking-[1px]">Số điện thoại</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#cccccc]" />
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#eeeeee] rounded-sm text-sm focus:outline-none focus:border-[#785254] transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Province & Ward (Row) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-[#888888] uppercase tracking-[1px]">Tỉnh / Thành phố</label>
                            <input
                                type="text"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                placeholder="VD: Hà Nội"
                                className="w-full px-4 py-2.5 bg-white border border-[#eeeeee] rounded-sm text-sm focus:outline-none focus:border-[#785254] transition-all"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-[#888888] uppercase tracking-[1px]">Quận/Huyện/Phường/Xã</label>
                            <input
                                type="text"
                                name="ward"
                                value={formData.ward}
                                onChange={handleChange}
                                placeholder="VD: Quận Hoàn Kiếm"
                                className="w-full px-4 py-2.5 bg-white border border-[#eeeeee] rounded-sm text-sm focus:outline-none focus:border-[#785254] transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Detail Address */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#888888] uppercase tracking-[1px]">Địa chỉ chi tiết</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#cccccc]" />
                            <textarea
                                name="detailAddress"
                                value={formData.detailAddress}
                                onChange={handleChange}
                                placeholder="Số nhà, tên đường..."
                                rows={2}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#eeeeee] rounded-sm text-sm focus:outline-none focus:border-[#785254] transition-all resize-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Default Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer group w-fit">
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleChange}
                            className="w-4 h-4 accent-[#785254] cursor-pointer"
                        />
                        <span className="text-sm text-[#555555] group-hover:text-[#1c1c19] transition-colors">Đặt làm địa chỉ mặc định</span>
                    </label>

                    {/* Submit Button */}
                    <div className="mt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-xs font-bold uppercase tracking-[1px] text-[#888888] hover:text-[#1c1c19] transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-8 py-2.5 bg-[#1c1c19] text-white text-xs font-bold uppercase tracking-[2px] rounded-sm transition-all hover:bg-[#333333] disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                            Lưu địa chỉ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserAddressModal;
