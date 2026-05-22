import React from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserOrderCard = ({ order, onViewDetail, onCancel, onRePay, onReturn, repayLoadingId, formatCurrency, formatDate, getStatusBadge }) => {
    return (
        <div className="bg-white border border-[#eeeeee] rounded-sm p-6 hover:shadow-md transition-shadow group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#f9f9f9]">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#f9f9f9] rounded-sm">
                        <ShoppingBag className="w-5 h-5 text-[#785254]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#1c1c19]">Mã đơn: #{order.id}</p>
                        <p className="text-xs text-[#888888]">{formatDate(order.createdAt)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <div className="h-4 w-px bg-[#eeeeee] hidden md:block" />
                    <p className="text-lg font-bold text-[#785254]">{formatCurrency(order.finalAmount)}</p>
                </div>
            </div>
            <div className="flex items-center justify-end flex-wrap gap-3 pt-4">
                <button
                    onClick={() => onViewDetail(order.id)}
                    className="px-4 py-2 text-xs font-medium border border-[#eeeeee] hover:bg-[#f9f9f9] transition-colors rounded-sm"
                >
                    Xem chi tiết
                </button>

                {/* [SENIOR] Chức năng thanh toán lại cho đơn VNPAY chưa thanh toán */}
                {order.status === 'pending' && 
                 order.paymentMethod === 'VNPAY' && 
                 order.paymentStatus === false && (
                    <button
                        onClick={() => onRePay(order.id)}
                        disabled={repayLoadingId === order.id}
                        className={cn(
                            "px-4 py-2 text-xs font-bold text-white transition-all rounded-sm shadow-sm flex items-center gap-2",
                            repayLoadingId === order.id ? "bg-[#5a3d3f] cursor-not-allowed opacity-80" : "bg-[#785254] hover:bg-[#5a3d3f]"
                        )}
                    >
                        {repayLoadingId === order.id ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Đang chuyển hướng...
                            </>
                        ) : (
                            'Thanh toán lại'
                        )}
                    </button>
                )}

                {order.status === 'pending' && (
                    <button
                        onClick={() => onCancel(order.id)}
                        className="px-4 py-2 text-xs font-medium text-red-600 border border-red-100 hover:bg-red-50 transition-colors rounded-sm"
                    >
                        Hủy đơn
                    </button>
                )}

                {/* [SENIOR] Chức năng trả hàng cho đơn đã nhận */}
                {order.status === 'delivered' && (
                    <button
                        onClick={() => onReturn(order.id)}
                        className="px-4 py-2 text-xs font-medium text-[#504444] border border-[#eeeeee] hover:bg-gray-50 transition-colors rounded-sm flex items-center gap-2"
                    >
                        Yêu cầu trả hàng
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserOrderCard;
