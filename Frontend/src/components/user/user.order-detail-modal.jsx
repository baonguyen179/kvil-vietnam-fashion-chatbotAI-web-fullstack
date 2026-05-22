import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, Star, CheckCircle2, ExternalLink } from 'lucide-react';
import reviewService from '@/services/reviewService';
import { toast } from 'react-toastify';
import { encodeId } from '@/utils/idHasher';

/**
 * [SRP] Modal chi tiết đơn hàng.
 *
 * Flow đánh giá (đã fix):
 * - Mỗi item có nút "Đánh giá" riêng.
 * - Khi click: fetch tokens (nếu chưa có) → navigate /danh-gia?token=... ngay lập tức.
 * - Loại bỏ 2-step UX gây nhầm lẫn (nút footer chỉ hiện khi đã fetch xong).
 */
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
    const navigate = useNavigate();
    // Map: orderItemId → { token, reviewed } (cache sau khi fetch)
    const [reviewTokenMap, setReviewTokenMap] = useState(null);
    const [tokenLoading, setTokenLoading] = useState(false);

    // -----------------------------------------------
    // Fetch toàn bộ tokens 1 lần duy nhất cho đơn hàng
    // -----------------------------------------------
    const ensureTokensLoaded = useCallback(async (currentOrderId) => {
        if (reviewTokenMap !== null && reviewTokenMap._orderId === currentOrderId) return reviewTokenMap; // cache hit

        setTokenLoading(true);
        try {
            const res = await reviewService.getReviewTokensForOrder(currentOrderId);
            if (res?.EC === 0) {
                // Build map: orderItemId → item
                const map = { _orderId: currentOrderId };
                (res.DT?.items || []).forEach(item => {
                    map[item.orderItemId] = item;
                });
                setReviewTokenMap(map);
                return map;
            } else {
                toast.error(res?.EM || 'Không thể tải thông tin đánh giá.');
                return null;
            }
        } catch {
            toast.error('Lỗi kết nối khi tải thông tin đánh giá.');
            return null;
        } finally {
            setTokenLoading(false);
        }
    }, [reviewTokenMap]);

    // [TỐI ƯU UX] Tự động tải token ngay khi mở modal nếu đơn hàng đã giao
    useEffect(() => {
        if (!isOpen) {
            setReviewTokenMap(null); // Clear cache khi đóng modal
            return;
        }
        
        if (selectedOrder?.status === 'delivered') {
            ensureTokensLoaded(selectedOrder.orderId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, selectedOrder?.status, selectedOrder?.orderId]);

    // -----------------------------------------------
    // Click nút "Đánh giá" trên từng item
    // -----------------------------------------------
    const handleReviewItem = useCallback(async (orderItemId) => {
        const map = await ensureTokensLoaded(selectedOrder.orderId);
        if (!map) return;

        const info = map[orderItemId];

        if (!info) {
            toast.error('Không tìm thấy thông tin đánh giá cho sản phẩm này.');
            return;
        }
        if (info.reviewed) {
            toast.info('Bạn đã đánh giá sản phẩm này rồi.');
            return;
        }
        if (!info.token) {
            toast.warning('Không có token hợp lệ cho sản phẩm này.');
            return;
        }

        onClose(); // đóng modal trước khi navigate
        navigate(`/danh-gia?token=${info.token}`);
    }, [ensureTokensLoaded, navigate, onClose]);

    // -----------------------------------------------
    // Helpers
    // -----------------------------------------------
    const handleClose = useCallback(() => {
        setReviewTokenMap(null); // reset để lần sau mở lại fetch mới
        onClose();
    }, [onClose]);

    const handleNavigateToProduct = useCallback((productId, slug) => {
        if (!productId) return;
        handleClose();
        navigate(`/products/${encodeId(productId)}/${slug || ''}`);
    }, [handleClose, navigate]);

    // -----------------------------------------------
    // Render guards
    // -----------------------------------------------
    if (!isOpen) return null;

    const isDelivered = selectedOrder?.status === 'delivered';

    // Helper: lấy trạng thái của item từ cache
    const getItemReviewState = (orderItemId) => {
        if (!reviewTokenMap) return 'unknown'; // chưa fetch
        const info = reviewTokenMap[orderItemId];
        if (!info) return 'unavailable';
        if (info.reviewed) return 'reviewed';
        return 'pending'; // có thể đánh giá
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-sm shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#eeeeee]">
                    <h3
                        className="text-xl font-medium text-[#1c1c19]"
                        style={{ fontFamily: "'Noto Serif', Georgia, serif" }}
                    >
                        Chi tiết đơn hàng #{selectedOrder?.orderId}
                    </h3>
                    <button onClick={handleClose} className="p-2 hover:bg-[#f9f9f9] rounded-full transition-colors">
                        <X className="w-5 h-5 text-[#888888]" />
                    </button>
                </div>

                {/* Body */}
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
                                {selectedOrder.items.map((item, idx) => {
                                    const reviewState = isDelivered ? getItemReviewState(item.id) : null;

                                    return (
                                        <div key={idx} className="flex gap-4 pb-4 border-b border-[#f9f9f9] last:border-0 last:pb-0">

                                            {/* Product Image — clickable */}
                                            <div
                                                className="w-20 h-24 bg-[#f9f9f9] rounded-sm overflow-hidden shrink-0 cursor-pointer group"
                                                onClick={() => handleNavigateToProduct(item.productId, item.slug)}
                                                title="Xem sản phẩm"
                                            >
                                                <img
                                                    src={item.imageUrl || 'https://via.placeholder.com/150?text=No+Image'}
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h4
                                                        className="text-sm font-medium text-[#1c1c19] cursor-pointer hover:text-[#785254] transition-colors inline-flex items-center gap-1"
                                                        onClick={() => handleNavigateToProduct(item.productId, item.slug)}
                                                    >
                                                        {item.productName}
                                                        {item.productId && <ExternalLink size={11} className="opacity-40" />}
                                                    </h4>
                                                    <p className="text-xs text-[#888888] mt-1 uppercase">
                                                        Phân loại: {item.color} / {item.size}
                                                    </p>
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    <p className="text-xs text-[#888888]">Số lượng: x{item.quantity}</p>
                                                    <p className="text-sm font-bold text-[#1c1c19]">{formatCurrency(item.originalPrice)}</p>
                                                </div>

                                                {/* Review state cho từng item */}
                                                {isDelivered && (
                                                    <div className="mt-2">
                                                        {reviewState === 'reviewed' && (
                                                            <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                                                                <CheckCircle2 size={13} />
                                                                <span>Đã đánh giá</span>
                                                            </div>
                                                        )}
                                                        {(reviewState === 'pending' || reviewState === 'unknown') && (
                                                            <button
                                                                onClick={() => handleReviewItem(item.id)}
                                                                disabled={tokenLoading}
                                                                className="self-start flex items-center gap-1.5 text-xs font-semibold text-[#785254] border border-[#785254] hover:bg-[#785254] hover:text-white px-3 py-1 rounded-full transition-all disabled:opacity-50 disabled:cursor-wait"
                                                            >
                                                                {tokenLoading ? (
                                                                    <Loader2 size={11} className="animate-spin" />
                                                                ) : (
                                                                    <Star size={11} fill="currentColor" />
                                                                )}
                                                                Đánh giá
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
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

                {/* Footer */}
                <div className="p-6 border-t border-[#eeeeee] flex justify-end items-center gap-3">
                    {selectedOrder?.status === 'pending' && (
                        <button
                            onClick={() => onCancel(selectedOrder.orderId)}
                            className="px-6 py-2.5 text-sm font-medium text-red-600 border border-red-100 hover:bg-red-50 transition-colors rounded-sm"
                        >
                            Hủy đơn hàng
                        </button>
                    )}
                    <button
                        onClick={handleClose}
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
