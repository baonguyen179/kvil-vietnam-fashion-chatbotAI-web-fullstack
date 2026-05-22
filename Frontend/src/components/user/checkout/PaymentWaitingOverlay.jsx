import React from 'react';
import { Loader2, ExternalLink, CheckCircle, RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/redux/slices/cartSlice';

const PaymentWaitingOverlay = ({ orderId, onCancel }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleConfirmSuccess = () => {
        dispatch(clearCart());
        navigate(`/order-success/${orderId}`);
    };

    return (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative flex justify-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg">
                        <ExternalLink size={20} className="text-blue-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-light text-[#1c1c19] uppercase tracking-widest" style={{ fontFamily: "'Lora', serif" }}>
                        Đang chờ thanh toán
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Vui lòng hoàn tất thanh toán tại tab VNPay vừa được mở. 
                        Đừng đóng trình duyệt trong quá trình này.
                    </p>
                </div>

                <div className="bg-gray-50 border border-[#eeeeee] p-6 rounded-none space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Mã đơn hàng:</span>
                        <span className="font-bold text-[#1c1c19]">#{orderId}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button 
                        onClick={handleConfirmSuccess}
                        className="h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={18} />
                        Tôi đã thanh toán xong
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        onClick={onCancel}
                        className="h-12 text-gray-500 hover:bg-gray-50 rounded-none text-xs flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={16} />
                        Thanh toán gặp sự cố? Thử lại
                    </Button>
                </div>

                <p className="text-[10px] text-gray-400 italic">
                    Hệ thống sẽ tự động cập nhật trạng thái sau khi bạn hoàn thành giao dịch. 
                    Nếu gặp bất kỳ khó khăn nào, vui lòng liên hệ CSKH.
                </p>
            </div>
        </div>
    );
};

export default PaymentWaitingOverlay;
