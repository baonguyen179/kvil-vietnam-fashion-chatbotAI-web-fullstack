import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Components
import CheckoutShipping from '@/components/user/checkout/checkout.shipping';
import CheckoutPayment from '@/components/user/checkout/checkout.payment';
import CheckoutSummary from '@/components/user/checkout/checkout.summary';
import PaymentWaitingOverlay from '@/components/user/checkout/PaymentWaitingOverlay';

// Hooks
import useCheckout from '@/hooks/useCheckout';
import userService from '@/services/userService';

const CheckoutPage = () => {
    const {
        formData, setFormData,
        appliedCoupon, setAppliedCoupon,
        isSubmitting,
        isVerifyingSession, setIsVerifyingSession,
        isWaitingPayment, setIsWaitingPayment,
        pendingOrderId,
        shippingFee,
        totalPrice,
        cartItems,
        isAuthenticated,
        savedAddresses,
        locationData,
        handleSubmitOrder
    } = useCheckout();

    // 1. Verify Session on Mount
    useEffect(() => {
        const verifySession = async () => {
            if (isAuthenticated) {
                setIsVerifyingSession(true);
                try {
                    await userService.getUserProfile();
                } catch (error) {
                    console.error("Session verification failed:", error);
                } finally {
                    setIsVerifyingSession(false);
                }
            }
        };
        verifySession();
    }, [isAuthenticated, setIsVerifyingSession]);

    // 2. Loading State (Senior UX)
    if (isVerifyingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white flex-col gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">Đang xác thực phiên làm việc</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1440px] mx-auto px-4 md:px-12 lg:px-24 py-12">
                {/* Navigation */}
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
                        <Link to="/cart" className="hover:text-black transition-colors">Giỏ hàng</Link>
                        <ChevronRight size={10} />
                        <span className="text-black font-bold">Thông tin giao hàng</span>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* LEFT: Shipping & Payment */}
                    <div className="lg:col-span-7 space-y-12">
                        <CheckoutShipping 
                            isAuthenticated={isAuthenticated}
                            savedAddresses={savedAddresses}
                            formData={formData}
                            setFormData={setFormData}
                            locationData={locationData}
                        />

                        <CheckoutPayment 
                            paymentMethod={formData.paymentMethod}
                            setPaymentMethod={(val) => setFormData(prev => ({...prev, paymentMethod: val}))}
                        />

                        {/* Footer Actions */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-[#eeeeee]">
                            <Link to="/cart" className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-black transition-colors uppercase tracking-widest">
                                <ChevronLeft size={16} />
                                Quay lại giỏ hàng
                            </Link>

                            <Button 
                                onClick={handleSubmitOrder}
                                disabled={isSubmitting}
                                className="w-full md:w-auto h-14 px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-bold uppercase tracking-widest text-xs shadow-xl shadow-blue-100 transition-all active:scale-95"
                            >
                                {isSubmitting ? "Đang khởi tạo..." : "Hoàn tất đơn hàng"}
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:col-span-5 bg-[#fbfbfb] border-l border-[#eeeeee] -mx-4 md:-mx-12 lg:mx-0 px-4 md:px-12 py-12 lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
                        <CheckoutSummary 
                            cartItems={cartItems}
                            totalPrice={totalPrice}
                            shippingFee={shippingFee}
                            appliedCoupon={appliedCoupon}
                            setAppliedCoupon={setAppliedCoupon}
                            onCouponApplied={(coupon) => setAppliedCoupon(coupon)}
                        />
                    </div>
                </div>
            </div>
            
            {/* [NEW] Strategic Overlays */}
            {isSubmitting && (
                <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-110 flex items-center justify-center flex-col gap-3 animate-in fade-in duration-300">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em] animate-pulse">Đang chuẩn bị đơn hàng</p>
                </div>
            )}

            {isWaitingPayment && (
                <PaymentWaitingOverlay 
                    orderId={pendingOrderId} 
                    onCancel={() => setIsWaitingPayment(false)}
                />
            )}
        </div>
    );
};

export default CheckoutPage;
