import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle2, ShoppingBag, ArrowRight, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import orderService from '@/services/orderService';

const OrderSuccessPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyAndFetch = async () => {
            setLoading(true);
            
            // [SECURITY] Check session storage for guest session validity
            const lastOrderId = sessionStorage.getItem('KOISAN_LAST_ORDER_ID');
            const isGuestAuthorised = lastOrderId === orderId;

            // Simple check: If not logged in and ID doesn't match last order, block.
            if (!isAuthenticated && !isGuestAuthorised) {
                setError("UNAUTHORIZED");
                setLoading(false);
                return;
            }

            try {
                // If authenticated, we can fetch real details (Backend verifies userId)
                if (isAuthenticated) {
                    const res = await orderService.getUserOrderDetail(orderId);
                    if (res && res.EC === 0) {
                        setOrderData(res.DT);
                    } else {
                        // Even if guest session is valid, if we can't fetch detail (no guest API), 
                        // we still show the success message but with limited info.
                        setOrderData({ orderId });
                    }
                } else {
                    // For guests, we don't have a detail API, so we just use the ID from URL (since session matched)
                    setOrderData({ orderId });
                }
            } catch (err) {
                console.error("Fetch order detail error:", err);
                setOrderData({ orderId });
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            verifyAndFetch();
        }
    }, [orderId, isAuthenticated]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-xs uppercase tracking-widest text-gray-400">Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (error === "UNAUTHORIZED") {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <ShieldAlert size={64} className="mx-auto text-red-500 opacity-20" />
                    <h2 className="text-xl font-bold text-gray-800">Truy cập bị từ chối</h2>
                    <p className="text-sm text-gray-500">
                        Bạn không có quyền xem thông tin đơn hàng này hoặc phiên làm việc đã hết hạn.
                    </p>
                    <Button asChild className="bg-black text-white rounded-none w-full h-12">
                        <Link to="/">Quay lại trang chủ</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-12">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={48} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-light text-[#1c1c19] uppercase tracking-wider" style={{ fontFamily: "'Lora', serif" }}>
                        Đặt hàng thành công!
                    </h1>
                    <p className="text-gray-400 text-sm italic">
                        Cảm ơn bạn đã tin tưởng KOISAN. Một email xác nhận đã được gửi đi.
                    </p>
                </div>

                <div className="bg-[#fbfbfb] p-8 rounded-none border border-[#eeeeee] space-y-6">
                    <div className="space-y-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Mã đơn hàng</p>
                        <p className="text-xl font-bold text-[#1c1c19]">#{orderId}</p>
                    </div>

                    {orderData?.finalAmount && (
                        <div className="pt-4 border-t border-[#eeeeee] flex justify-between items-center text-sm">
                            <span className="text-gray-500">Tổng cộng:</span>
                            <span className="font-bold text-blue-600">{orderData.finalAmount?.toLocaleString()}₫</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {isAuthenticated ? (
                        <Button asChild className="h-14 bg-black text-white hover:bg-zinc-800 rounded-none w-full uppercase tracking-widest text-xs font-bold">
                            <Link to="/account/orders" className="flex items-center justify-center gap-2">
                                Xem lịch sử đơn hàng
                                <ArrowRight size={16} />
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild className="h-14 bg-black text-white hover:bg-zinc-800 rounded-none w-full uppercase tracking-widest text-xs font-bold">
                            <Link to="/" className="flex items-center justify-center gap-2">
                                <ShoppingBag size={16} />
                                Tiếp tục mua sắm
                            </Link>
                        </Button>
                    )}
                    
                    <Button asChild variant="outline" className="h-12 border-[#eeeeee] text-[#504444] hover:bg-gray-50 rounded-none w-full text-xs uppercase tracking-widest">
                        <Link to="/">Về trang chủ</Link>
                    </Button>
                </div>

                <p className="text-[10px] text-gray-400">
                    Mọi thắc mắc vui lòng liên hệ hotline: <b>1900 xxxx</b>
                </p>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
