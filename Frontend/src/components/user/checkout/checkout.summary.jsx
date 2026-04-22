import React, { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import couponService from '@/services/couponService';

const CheckoutSummary = ({ 
    cartItems, 
    totalPrice, 
    shippingFee, 
    onCouponApplied,
    appliedCoupon,
    setAppliedCoupon 
}) => {
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplyingCoupon(true);
        try {
            const res = await couponService.applyCoupon(couponCode, totalPrice);
            if (res && res.EC === 0) {
                setAppliedCoupon(res.DT);
                onCouponApplied(res.DT);
                toast.success("Áp dụng mã giảm giá thành công!");
            } else {
                toast.error(res.EM || "Mã giảm giá không hợp lệ");
            }
        } catch (error) {
            toast.error("Lỗi khi áp dụng mã giảm giá");
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const discountAmount = React.useMemo(() => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.discountType === 'fixed') return appliedCoupon.discountValue;
        const percentDiscount = (totalPrice * appliedCoupon.discountValue) / 100;
        return Math.min(percentDiscount, appliedCoupon.maxDiscountAmount || Infinity);
    }, [appliedCoupon, totalPrice]);

    const finalTotal = totalPrice + shippingFee - discountAmount;

    return (
        <div className="space-y-8">
            <h2 className="text-lg font-medium mb-8 lg:hidden">Đơn hàng của bạn</h2>
            
            {/* Product List */}
            <div className="space-y-4">
                {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
                            <img 
                                src={item.variant?.image || item.variant?.product?.images?.[0]?.imageUrl || 'https://placehold.co/100x100?text=SP'} 
                                alt={item.variant?.product?.name} 
                                className="w-full h-full object-cover"
                            />
                            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-[10px] font-semibold text-white">
                                {item.quantity}
                            </span>
                        </div>
                        <div className="flex-1 flex flex-col gap-0.5">
                            <p className="text-sm font-medium line-clamp-1">{item.variant?.product?.name}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">{item.variant?.sku}</p>
                        </div>
                        <p className="text-sm font-medium">
                            {(item.variant?.price * item.quantity).toLocaleString()}₫
                        </p>
                    </div>
                ))}
            </div>

            <Separator className="bg-gray-200" />

            {/* Coupon Code */}
            <div className="flex gap-2">
                <Input 
                    placeholder="Mã giảm giá" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-12 border-[#eeeeee] focus:border-black rounded-none bg-white"
                />
                <Button 
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    className="h-12 px-6 bg-[#c8c8c8] text-white rounded-none hover:bg-black transition-all"
                >
                    {isApplyingCoupon ? "..." : "Sử dụng"}
                </Button>
            </div>
            {appliedCoupon && (
                <div className="p-3 bg-green-50 border border-green-100 text-green-700 text-xs flex justify-between items-center animate-in zoom-in-95 duration-200">
                    <span>Mã giảm giá: <b>{appliedCoupon.code}</b></span>
                    <button onClick={() => setAppliedCoupon(null)} className="underline hover:no-underline">Hủy</button>
                </div>
            )}

            <Separator className="bg-gray-200" />

            {/* Totals */}
            <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{totalPrice.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span>{shippingFee > 0 ? `${shippingFee.toLocaleString()}₫` : '—'}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Giảm giá</span>
                        <span>-{discountAmount.toLocaleString()}₫</span>
                    </div>
                )}
                
                {shippingFee > 0 && totalPrice < 500000 && (
                    <p className="text-[11px] text-orange-600 font-medium italic">
                        * Miễn phí giao hàng cho đơn hàng trên 500k
                    </p>
                )}

                <Separator className="bg-gray-200 my-4" />

                <div className="flex justify-between items-end">
                    <span className="text-base font-medium">Tổng cộng</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-gray-400 text-xs">VND</span>
                        <span className="text-2xl font-bold tracking-tight">
                            {finalTotal.toLocaleString()}₫
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummary;
