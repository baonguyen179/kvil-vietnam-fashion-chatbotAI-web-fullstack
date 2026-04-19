import React from 'react';
import { X, Loader2 } from 'lucide-react';

const UserOrderDetailModal = ({ 
    isOpen, 
    onClose, 
    selectedOrder, 
    detailLoading, 
    formatDate, 
    formatCurrency, 
    getStatusBadge,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-[#eeeeee]">
                    <h3 className="text-xl font-medium text-[#1c1c19]" style={{ fontFamily: "'Noto Serif', Georgia, serif" }}>
                        Chi tiết đơn hàng #{selectedOrder?.orderId}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-[#f9f9f9] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[#888888]" />
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-1 p-6">
                    {detailLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[#785254]" />
                            <p className="text-sm text-[#888888]">Đang tải dữ liệu...</p>
                        </div>
                    ) : selectedOrder && (
                        <div className="flex flex-col gap-6">
                            {/* Items List */}
                            <div className="flex flex-col gap-4">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 pb-4 border-b border-[#f9f9f9] last:border-0 last:pb-0">
                                        <div className="w-20 h-24 bg-[#f9f9f9] rounded-sm overflow-hidden shrink-0">
                                            <img 
                                                src={item.imageUrl || 'https://via.placeholder.com/150?text=No+Image'} 
                                                alt={item.productName} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h4 className="text-sm font-medium text-[#1c1c19]">{item.productName}</h4>
                                                <p className="text-xs text-[#888888] mt-1 uppercase">
                                                    Phân loại: {item.color} / {item.size}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <p className="text-xs text-[#888888]">Số lượng: x{item.quantity}</p>
                                                <p className="text-sm font-bold text-[#1c1c19]">{formatCurrency(item.originalPrice)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="bg-[#f9f9f9] p-4 rounded-sm flex flex-col gap-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#888888]">Ngày đặt:</span>
                                    <span className="text-[#1c1c19] font-medium">{formatDate(selectedOrder.orderDate)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#888888]">Phương thức:</span>
                                    <span className="text-[#1c1c19] font-medium uppercase">{selectedOrder.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#888888]">Trạng thái:</span>
                                    <span>{getStatusBadge(selectedOrder.status)}</span>
                                </div>
                                <div className="h-px bg-[#eeeeee] my-1" />
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-base font-bold text-[#1c1c19]">Tổng thanh toán:</span>
                                    <span className="text-xl font-bold text-[#785254]">{formatCurrency(selectedOrder.finalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[#eeeeee] flex justify-end gap-3">
                    {selectedOrder?.status === 'pending' && (
                        <button
                            onClick={() => onCancel(selectedOrder.orderId)}
                            className="px-6 py-2.5 text-sm font-medium text-red-600 border border-red-100 hover:bg-red-50 transition-colors rounded-sm"
                        >
                            Hủy đơn hàng
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-medium bg-[#1c1c19] text-white hover:bg-[#333333] transition-colors rounded-sm"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserOrderDetailModal;
