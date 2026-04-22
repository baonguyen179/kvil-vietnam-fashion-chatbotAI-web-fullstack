import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import orderService from '@/services/orderService';
import { toast } from 'react-toastify';

const VNPayReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [orderInfo, setOrderInfo] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const hasVerified = useRef(false);

    useEffect(() => {
        const verifyPayment = async () => {
            if (hasVerified.current) return;
            hasVerified.current = true;

            const params = Object.fromEntries([...searchParams]);
            // console.log(">>> [VNPAY RETURN PAGE] Query Params:", params);
            
            try {
                const res = await orderService.verifyVNPayReturn(params);
                // console.log(">>> [VNPAY RETURN PAGE] Verify Result:", res);

                if (res && res.EC === 0) {
                    setStatus('success');
                    setOrderInfo({
                        id: params.vnp_TxnRef,
                        amount: parseInt(params.vnp_Amount) / 100,
                        bank: params.vnp_BankCode,
                        transId: params.vnp_TransactionNo
                    });
                } else {
                    setStatus('error');
                    setErrorMessage(res.EM || 'Thanh toán không thành công');
                    setOrderInfo({
                        id: params.vnp_TxnRef
                    });
                }
            } catch (error) {
                setStatus('error');
                setErrorMessage('Lỗi hệ thống khi xác thực giao dịch');
                console.error(">>> [VNPAY RETURN PAGE] CRITICAL ERROR:", error);
            }

        };

        verifyPayment();
    }, [searchParams]);

    const handleRepay = async () => {
        if (!orderInfo?.id) return;
        
        try {
            // Đối với Guest, cần số điện thoại. 
            // Tuy nhiên ở trang này ta không có số điện thoại.
            // Giải pháp: Backend nên trả về một phần thông tin đơn hàng nếu verify fail.
            // Hoặc yêu cầu user vào lại trang tra cứu đơn hàng (nếu là guest).
            
            // Tạm thời hiển thị thông báo hướng dẫn nếu không có đủ thông tin
            toast.info("Vui lòng sử dụng tính năng 'Tra cứu đơn hàng' để thực hiện thanh toán lại.");
            // navigate('/order-lookup'); // Nếu có trang này
        } catch (error) {
            toast.error("Không thể khởi tạo lại thanh toán lúc này.");
        }
    };

    if (status === 'verifying') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <h1 className="text-xl font-medium text-gray-800">Đang xác thực giao dịch...</h1>
                <p className="text-gray-500 text-sm mt-2">Vui lòng không đóng trình duyệt hoặc tải lại trang.</p>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-white px-4 py-12">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center gap-4">
                    <div className={status === 'success' ? "w-20 h-20 bg-green-50 rounded-full flex items-center justify-center" : "w-20 h-20 bg-red-50 rounded-full flex items-center justify-center"}>
                        {status === 'success' ? (
                            <CheckCircle2 size={48} className="text-green-500" />
                        ) : (
                            <XCircle size={48} className="text-red-500" />
                        )}
                    </div>
                    
                    <h1 className="text-3xl font-light text-[#1c1c19] uppercase tracking-wider" style={{ fontFamily: "'Lora', serif" }}>
                        {status === 'success' ? 'Thanh toán thành công!' : 'Thành toán thất bại'}
                    </h1>
                    
                    <p className="text-gray-500 text-sm">
                        {status === 'success' 
                            ? 'Cảm ơn bạn đã tin tưởng KOISAN. Giao dịch của bạn đã được ghi nhận.' 
                            : errorMessage || 'Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán.'}
                    </p>
                </div>

                {orderInfo && (
                    <div className="bg-gray-50 p-6 rounded-none border border-dashed border-gray-200 text-left space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 uppercase tracking-widest text-[10px]">Mã đơn hàng</span>
                            <span className="font-bold text-[#1c1c19]">#{orderInfo.id}</span>
                        </div>
                        {status === 'success' && (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 uppercase tracking-widest text-[10px]">Số tiền</span>
                                    <span className="font-medium">{orderInfo.amount?.toLocaleString()}₫</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 uppercase tracking-widest text-[10px]">Ngân hàng</span>
                                    <span className="font-medium">{orderInfo.bank}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 uppercase tracking-widest text-[10px]">Mã giao dịch</span>
                                    <span className="font-medium">{orderInfo.transId}</span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {status === 'success' ? (
                        <Button asChild className="h-12 bg-black text-white hover:bg-zinc-800 rounded-none w-full">
                            <Link to="/account" className="flex items-center justify-center gap-2">
                                Xem lịch sử đơn hàng
                                <ArrowRight size={16} />
                            </Link>
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleRepay}
                            className="h-12 bg-blue-600 text-white hover:bg-blue-700 rounded-none w-full flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Thực hiện thanh toán lại
                        </Button>
                    )}

                    <Button asChild variant="outline" className="h-12 border-[#eeeeee] text-[#504444] hover:bg-gray-50 rounded-none w-full">
                        <Link to="/" className="flex items-center justify-center gap-2">
                            <ShoppingBag size={16} />
                            Tiếp tục mua sắm
                        </Link>
                    </Button>
                </div>

                <p className="text-[11px] text-gray-400 italic">
                    {status === 'success' 
                        ? 'Một email xác nhận đã được gửi đến địa chỉ của bạn.' 
                        : 'Nếu bạn đã bị trừ tiền nhưng thấy thông báo này, vui lòng liên hệ CSKH để được hỗ trợ.'}
                </p>
            </div>
        </div>
    );
};

export default VNPayReturnPage;
