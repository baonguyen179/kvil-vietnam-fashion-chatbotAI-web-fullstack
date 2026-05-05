import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import couponService from '@/services/couponService';

const UserAnnouncementBar = ({ onHeightChange }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [coupons, setCoupons] = useState([]);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await couponService.getPublicCoupons();
                if (res && res.EC === 0 && res.DT && res.DT.length > 0) {
                    setCoupons(res.DT);
                } else {
                    setIsVisible(false);
                }
            } catch (error) {
                console.error("Lỗi khi lấy mã giảm giá:", error);
                setIsVisible(false);
            }
        };
        fetchCoupons();
    }, []);

    useEffect(() => {
        if (onHeightChange) {
            onHeightChange(isVisible ? 32 : 0); // 32px is h-8
        }
    }, [isVisible, onHeightChange]);

    if (!isVisible || coupons.length === 0) return null;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const getDiscountText = (coupon) => {
        if (coupon.discountType === 'percent') {
            let text = `giảm ${coupon.discountValue}%`;
            if (coupon.maxDiscountAmount) {
                text += ` (tối đa ${formatCurrency(coupon.maxDiscountAmount)})`;
            }
            return text;
        }
        return `giảm ${formatCurrency(coupon.discountValue)}`;
    };

    // Tạo chuỗi thông báo liên tục
    const message = coupons.map(c => 
        `🔥 NHẬP MÃ: [${c.code}] ${getDiscountText(c)} cho đơn từ ${formatCurrency(c.minOrderValue)}!`
    ).join(' 🚀 ');

    return (
        <div className="relative w-full h-8 bg-[#785254] text-white flex items-center overflow-hidden z-60">
            <div className="flex-1 overflow-hidden whitespace-nowrap">
                <div className="inline-block animate-marquee pl-[100%]">
                    <span className="text-xs md:text-sm font-medium tracking-wider">
                        {message}
                    </span>
                </div>
            </div>
            <button 
                onClick={() => setIsVisible(false)}
                className="absolute right-0 top-0 bottom-0 px-3 bg-[#785254] hover:bg-[#5c3e40] transition-colors flex items-center justify-center z-10"
                title="Đóng thông báo"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export default UserAnnouncementBar;
