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
                        setOrderData({ orderId });
                    }
                } else {
                    // [GUEST] Try to fetch info using phone from session
                    const guestPhone = sessionStorage.getItem('KOISAN_LAST_ORDER_PHONE');
                    if (guestPhone) {
                        const res = await orderService.getGuestOrderDetail(orderId, guestPhone);
                        if (res && res.EC === 0) {
                            setOrderData(res.DT);
                        } else {
                            setOrderData({ orderId });
                        }
                    } else {
                        setOrderData({ orderId });
                    }
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
                        <div className="pt-4 border-t border-[#eeeeee] space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 uppercase text-[10px] tracking-widest">Tổng cộng:</span>
                                <span className="font-bold text-blue-600">{orderData.finalAmount?.toLocaleString()}₫</span>
                            </div>
                            
                            {!orderData.paymentStatus && orderData.status !== 'cancelled' && (
                                <div className="p-4 bg-orange-50 border border-orange-100 space-y-3">
                                    <p className="text-[10px] text-orange-800 uppercase font-bold tracking-widest">Chưa hoàn tất thanh toán</p>
                                    <Button 
                                        onClick={async () => {
                                            const phone = sessionStorage.getItem('KOISAN_LAST_ORDER_PHONE');
                                            try {
                                                const res = await orderService.getGuestVNPayUrl(orderId, phone);
                                                if (res && res.EC === 0 && res.DT) {
                                                    window.location.href = res.DT;
                                                }
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none uppercase text-[10px] font-bold tracking-widest h-10 shadow-lg shadow-blue-100"
                                    >
                                        Thanh toán ngay
                                    </Button>
                                </div>
                            )}
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
                            <Link to="/collections" className="flex items-center justify-center gap-2">
                                <ShoppingBag size={16} />
                                Tiếp tục mua sắm
                            </Link>
                        </Button>
                    )}

                    {!isAuthenticated && (
                        <div className="bg-blue-50/50 p-6 rounded-none border border-blue-100 text-left space-y-3">
                            <p className="text-[10px] font-bold text-blue-900 uppercase tracking-widest flex items-center gap-2 italic">
                                <ShieldAlert size={14} />
                                Ghi chú dành cho khách vãng lai
                            </p>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Đơn hàng của bạn đã được ghi nhận. Bạn có thể theo dõi tiến độ giao hàng hoặc thanh toán lại bất cứ lúc nào bằng cách sử dụng tính năng <b>"Tra cứu đơn hàng"</b> trên thanh menu hoặc dưới chân trang.
                            </p>
                            <div className="flex flex-col gap-2 pt-2">
                                <Button asChild variant="link" className="text-blue-600 p-0 h-auto text-[11px] justify-start uppercase font-bold tracking-tighter hover:text-blue-800">
                                    <Link to={`/tra-cuu-don-hang?orderId=${orderId}`}>Đi tới trang tra cứu ngay</Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    <Button asChild variant="outline" className="h-12 border-[#eeeeee] text-[#504444] hover:bg-gray-50 rounded-none w-full text-xs uppercase tracking-widest">
                        <Link to="/">Về trang chủ</Link>
                    </Button>
                </div>


                <p className="text-[10px] text-gray-400">
                    Mọi thắc mắc vui lòng liên hệ hotline: <b>0225.3846.118</b>
                </p>

            </div>
        </div>
    );
};

export default OrderSuccessPage;
