import React from 'react';
import { MapPin, Phone, User, Trash2, Edit3, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserAddressCard = ({ address, onEdit, onDelete, onSetDefault, loading }) => {
    const { id, receiverName, phoneNumber, province, ward, detailAddress, isDefault } = address;

    return (
        <div 
            className={cn(
                "group relative bg-white p-6 rounded-sm border transition-all duration-300",
                isDefault 
                    ? "border-[#785254] shadow-sm" 
                    : "border-[#eeeeee] hover:border-[#cccccc] hover:shadow-md"
            )}
        >
            {/* Default Badge */}
            {isDefault && (
                <div className="absolute top-0 right-0 bg-[#785254] text-white text-[10px] font-bold uppercase tracking-[1px] px-3 py-1 rounded-bl-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Mặc định
                </div>
            )}

            <div className="flex flex-col gap-4">
                {/* Header: Name & Phone */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#888888]" />
                        <span className="text-sm font-bold text-[#1c1c19] uppercase tracking-[0.5px]">
                            {receiverName}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#888888]" />
                        <span className="text-sm text-[#555555]">
                            {phoneNumber}
                        </span>
                    </div>
                </div>

                {/* Address Details */}
                <div className="flex gap-2 last:mb-0">
                    <MapPin className="w-4 h-4 text-[#785254] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                        <p className="text-sm text-[#1c1c19] leading-6">
                            {detailAddress}
                        </p>
                        <p className="text-sm text-[#888888]">
                            {ward}, {province}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-[#f5f5f5]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onEdit(address)}
                            className="flex items-center gap-1.5 text-xs font-medium text-[#1c1c19] hover:text-[#785254] transition-colors"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Chỉnh sửa
                        </button>
                        
                        {!isDefault && (
                            <button
                                onClick={() => onDelete(id)}
                                className="flex items-center gap-1.5 text-xs font-medium text-[#888888] hover:text-red-600 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Xóa
                            </button>
                        )}
                    </div>

                    {!isDefault && (
                        <button
                            onClick={() => onSetDefault(id)}
                            disabled={loading}
                            className="text-[10px] font-bold text-[#785254] border border-[#785254] px-3 py-1.5 rounded-sm uppercase tracking-[0.5px] hover:bg-[#785254] hover:text-white transition-all active:scale-[0.95]"
                        >
                            Đặt mặc định
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserAddressCard;
