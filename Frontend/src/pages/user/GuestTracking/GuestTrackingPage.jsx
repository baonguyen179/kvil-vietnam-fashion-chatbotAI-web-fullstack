import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, Calendar, CreditCard, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import orderService from '@/services/orderService';
import { toast } from 'react-toastify';



/**
 * [SENIOR PAGE] Guest Order Tracking
 * Allows guest users to lookup their order status and re-pay if needed.
 */
const GuestTrackingPage = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ 
        orderId: searchParams.get('orderId')?.replace('#', '') || '', 
        phone: searchParams.get('phone') || sessionStorage.getItem('KOISAN_LAST_ORDER_PHONE') || '' 
    });
    const [isLoading, setIsLoading] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState(null);

    const [isRecoverMode, setIsRecoverMode] = useState(false);
    const [recoverData, setRecoverData] = useState({ email: '', phone: '' });

    // Tự động tìm kiếm nếu có đủ thông tin từ URL
    useEffect(() => {
        if (formData.orderId && formData.phone) {
            handleLookup();
        }
    }, []);

    const handleLookup = async (e) => {
        if (e) e.preventDefault();
        const { orderId, phone } = formData;
        
        if (!orderId || !phone) {
            if (e) toast.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        setIsLoading(true);
        setError(null);
        setOrderData(null);

        try {
            const res = await orderService.getGuestOrderDetail(orderId, phone);
            if (res && res.EC === 0) {
                setOrderData(res.DT);
                if (e) toast.success("Đã tìm thấy thông tin đơn hàng!");
            } else {
                setError(res.EM || "Không tìm thấy đơn hàng phù hợp.");
            }
        } catch (err) {
            console.error("Lookup error:", err);
            setError("Có lỗi xảy ra trong quá trình tra cứu. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleRecover = async (e) => {
        e.preventDefault();
        if (!recoverData.email || !recoverData.phone) {
            toast.error("Vui lòng nhập đầy đủ Email và Số điện thoại!");
            return;
        }

        setIsLoading(true);
        try {
            const res = await orderService.recoverGuestOrderIds(recoverData.email, recoverData.phone);
            if (res && res.EC === 0) {
                toast.success(res.EM || "Yêu cầu đã được gửi! Vui lòng kiểm tra email của bạn.");
                setIsRecoverMode(false);
            } else {
                toast.error(res.EM || "Không tìm thấy đơn hàng nào.");
            }
        } catch (err) {
            toast.error("Lỗi hệ thống khi khôi phục mã đơn.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRepay = async () => {
        if (!orderData) return;
        try {
            setIsLoading(true);
            const phone = formData.phone; // Dùng phone lúc lookup
            const res = await orderService.getGuestVNPayUrl(orderData.orderId, phone);
            if (res && res.EC === 0 && res.DT) {
                window.location.href = res.DT;
            } else {
                toast.error(res.EM || "Không thể tạo link thanh toán.");
            }
        } catch (err) {
            toast.error("Lỗi hệ thống khi tạo yêu cầu thanh toán.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': { text: 'Chờ xác nhận', color: 'text-amber-500 bg-amber-50 border-amber-100' },
            'confirmed': { text: 'Đã xác nhận', color: 'text-blue-500 bg-blue-50 border-blue-100' },
            'shipping': { text: 'Đang giao hàng', color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
            'delivered': { text: 'Đã giao hàng', color: 'text-green-500 bg-green-50 border-green-100' },
            'returning': { text: 'Yêu cầu trả hàng', color: 'text-orange-500 bg-orange-50 border-orange-100' },
            'returned': { text: 'Đã hoàn trả', color: 'text-gray-500 bg-gray-50 border-gray-100' },
            'cancelled': { text: 'Đã hủy', color: 'text-red-500 bg-red-50 border-red-100' },
        };
        return labels[status] || { text: status, color: 'text-gray-500 bg-gray-50 border-gray-100' };
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header Section */}
            <div className="bg-[#fbfbfb] border-b py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-4 text-center space-y-4">
                    <h1 className="text-3xl md:text-5xl font-light text-[#1c1c19] uppercase tracking-tighter" style={{ fontFamily: "'Lora', serif" }}>
                        {isRecoverMode ? "Khôi phục Mã đơn hàng" : "Tra cứu đơn hàng"}
                    </h1>
                    <p className="max-w-2xl mx-auto text-gray-500 text-sm md:text-base font-light font-sans tracking-wide">
                        {isRecoverMode 
                            ? "Nhập Email và Số điện thoại đặt hàng để nhận lại danh sách mã đơn hàng qua hộp thư."
                            : "Dành cho khách hàng chưa đăng ký thành viên. Vui lòng nhập Mã đơn hàng và Số điện thoại bạn đã sử dụng khi đặt hàng."
                        }
                    </p>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Main Form Panel */}
                    <div className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                        {!isRecoverMode ? (
                            <form onSubmit={handleLookup} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c19]">Mã đơn hàng (ví dụ: #123)</label>
                                    <Input 
                                        placeholder="Nhập mã đơn hàng của bạn..."
                                        className="h-14 rounded-none border-gray-200 focus:ring-0 focus:border-black text-sm"
                                        value={formData.orderId}
                                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value.replace('#', '') })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c19]">Số điện thoại</label>
                                    <Input 
                                        placeholder="Số điện thoại dùng để đặt hàng..."
                                        className="h-14 rounded-none border-gray-200 focus:ring-0 focus:border-black text-sm"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full h-14 bg-[#1c1c19] text-white rounded-none uppercase tracking-widest font-bold text-xs hover:bg-zinc-800 transition-all group"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Tra cứu ngay
                                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        )}
                                    </Button>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => setIsRecoverMode(true)}
                                        className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors"
                                    >
                                        Quên mã đơn hàng?
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleRecover} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c19]">Email đặt hàng</label>
                                    <Input 
                                        type="email"
                                        placeholder="Nhập email bạn đã dùng để đặt hàng..."
                                        className="h-14 rounded-none border-gray-200 focus:ring-0 focus:border-black text-sm"
                                        value={recoverData.email}
                                        onChange={(e) => setRecoverData({ ...recoverData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#1c1c19]">Số điện thoại</label>
                                    <Input 
                                        placeholder="Số điện thoại dùng để đặt hàng..."
                                        className="h-14 rounded-none border-gray-200 focus:ring-0 focus:border-black text-sm"
                                        value={recoverData.phone}
                                        onChange={(e) => setRecoverData({ ...recoverData, phone: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col gap-4">
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full h-14 bg-blue-600 text-white rounded-none uppercase tracking-widest font-bold text-xs hover:bg-blue-700 transition-all"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Gửi lại mã vào Email"}
                                    </Button>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => setIsRecoverMode(false)}
                                        className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors"
                                    >
                                        Quay lại tra cứu
                                    </button>
                                </div>
                            </form>
                        )}


                        <div className="bg-blue-50 p-6 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                                <AlertCircle size={14} />
                                Lưu ý quan trọng
                            </h4>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Nếu bạn đã đăng ký tài khoản, vui lòng Đăng nhập để xem lịch sử đơn hàng chi tiết và đầy đủ hơn.
                            </p>
                        </div>
                    </div>

                    {/* Result Panel */}
                    <div className="lg:col-span-7">
                        {orderData ? (
                            <div className="border border-[#eeeeee] p-8 md:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Chi tiết đơn hàng</p>
                                        <h2 className="text-2xl font-bold text-[#1c1c19]">#{orderData.orderId}</h2>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                        getStatusLabel(orderData.status).color
                                    )}>
                                        {getStatusLabel(orderData.status).text}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full text-gray-400">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Ngày đặt hàng</p>
                                                <p className="text-sm font-medium">{new Date(orderData.orderDate).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full text-gray-400">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Địa chỉ giao hàng</p>
                                                <p className="text-sm font-medium truncate max-w-[200px]" title={orderData.address}>
                                                    {orderData.address}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-full text-gray-400">
                                                <CreditCard size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Phương thức thanh toán</p>
                                                <p className="text-sm font-medium uppercase">{orderData.paymentMethod}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 flex items-center justify-center rounded-full",
                                                orderData.paymentStatus ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                                            )}>
                                                <CreditCard size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Trạng thái thanh toán</p>
                                                <p className={cn(
                                                    "text-sm font-bold uppercase",
                                                    orderData.paymentStatus ? "text-green-600" : "text-red-500"
                                                )}>
                                                    {orderData.paymentStatus ? "Đã thanh toán" : "Chưa thanh toán"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#fbfbfb] p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Tổng tiền</p>
                                        <p className="text-3xl font-bold text-[#1c1c19]">{orderData.finalAmount?.toLocaleString()}₫</p>
                                    </div>

                                    {!orderData.paymentStatus && orderData.status !== 'cancelled' && (
                                        <Button 
                                            onClick={handleRepay}
                                            disabled={isLoading}
                                            className="h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-none px-10 uppercase tracking-widest font-bold text-xs"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" /> : "Thanh toán ngay"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : error ? (
                            <div className="h-full min-h-[400px] border border-dashed border-red-200 bg-red-50/30 flex flex-col items-center justify-center text-center p-8 space-y-4">
                                <Search size={48} className="text-red-200" />
                                <h3 className="text-lg font-medium text-red-900">Không tìm thấy thông tin</h3>
                                <p className="text-sm text-red-600 max-w-xs">{error}</p>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-8 space-y-4">
                                <Search size={48} className="text-gray-100" />
                                <h3 className="text-lg font-medium text-gray-400">Kết quả tra cứu</h3>
                                <p className="text-sm text-gray-400 max-w-xs">Nhập thông tin bên trái để bắt đầu tra cứu đơn hàng của bạn.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple CN helper since we are not using full tailwind-merge everywhere
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default GuestTrackingPage;
