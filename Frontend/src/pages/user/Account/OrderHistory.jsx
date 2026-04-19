import React, { useState, useEffect, useCallback } from 'react';
import userService from '@/services/userService';
import { toast } from 'react-toastify';
import { ShoppingBag, X, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserOrderTabs from '@/components/user/user.order-tabs';
import UserOrderCard from '@/components/user/user.order-card';
import UserOrderDetailModal from '@/components/user/user.order-detail-modal';
import UserOrderCancelDialog from '@/components/user/user.order-cancel-dialog';

const statusTabs = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ thanh toán', value: 'pending' },
    { label: 'Vận chuyển', value: 'shipping' },
    { label: 'Hoàn thành', value: 'delivered' },
    { label: 'Đã hủy', value: 'cancelled' },
];

const OrderHistory = () => {
    const [status, setStatus] = useState('');
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 0 });
    const [loading, setLoading] = useState(false);

    // Detail Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [orderIdToCancel, setOrderIdToCancel] = useState(null);

    const fetchOrders = useCallback(async (page = 1, currentStatus = status) => {
        setLoading(true);
        try {
            const res = await userService.getUserOrders({ page, limit: 5, status: currentStatus });
            if (res && res.EC === 0) {
                setOrders(res.DT.orders);
                setPagination({
                    page: res.DT.currentPage,
                    limit: 5,
                    totalPages: res.DT.totalPages
                });
            }
        } catch (error) {
            toast.error(error?.EM || 'Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        fetchOrders(1, status);
    }, [fetchOrders, status]);

    const handleViewDetail = async (orderId) => {
        setDetailLoading(true);
        setIsDetailOpen(true);
        try {
            const res = await userService.getUserOrderDetail(orderId);
            if (res && res.EC === 0) {
                setSelectedOrder(res.DT);
            }
        } catch (error) {
            toast.error(error?.EM || 'Không thể tải chi tiết đơn hàng');
            setIsDetailOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        setOrderIdToCancel(orderId);
        setIsCancelDialogOpen(true);
    };

    const confirmCancelOrder = async () => {
        if (!orderIdToCancel) return;

        try {
            const res = await userService.cancelOrder(orderIdToCancel);
            if (res && res.EC === 0) {
                toast.success('Hủy đơn hàng thành công');
                fetchOrders(pagination.page, status);
                if (isDetailOpen) setIsDetailOpen(false);
            } else {
                toast.error(res.EM);
            }
        } catch (error) {
            toast.error(error?.EM || 'Lỗi khi hủy đơn hàng');
        } finally {
            setIsCancelDialogOpen(false);
            setOrderIdToCancel(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (statusValue) => {
        const styles = {
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
            shipping: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            delivered: 'bg-green-50 text-green-700 border-green-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200',
        };
        const labels = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            shipping: 'Đang giao hàng',
            delivered: 'Đã hoàn thành',
            cancelled: 'Đã hủy',
        };
        return (
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", styles[statusValue])}>
                {labels[statusValue] || statusValue}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-8 pb-20">
            <h2 className="text-2xl font-medium tracking-[2px] text-[#1c1c19] uppercase" style={{ fontFamily: "'Noto Serif', Georgia, serif" }}>
                Đơn hàng của tôi
            </h2>
            <UserOrderTabs 
                status={status} 
                setStatus={setStatus} 
                statusTabs={statusTabs} 
            />
            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#785254]" />
                        <p className="text-sm text-[#888888]">Đang tải đơn hàng...</p>
                    </div>
                ) : orders.length > 0 ? (
                    orders.map((order) => (
                        <UserOrderCard 
                            key={order.id}
                            order={order}
                            onViewDetail={handleViewDetail}
                            onCancel={handleCancelOrder}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            getStatusBadge={getStatusBadge}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-[#f9f9f9] rounded-sm border border-[#eeeeee] gap-3">
                        <AlertCircle className="w-10 h-10 text-[#cccccc]" />
                        <p className="text-[#504444] text-sm italic font-light">
                            Bạn chưa có đơn hàng nào ở trạng thái này.
                        </p>
                        <button 
                            onClick={() => setStatus('')}
                            className="text-xs text-[#785254] underline mt-2"
                        >
                            Xem tất cả đơn hàng
                        </button>
                    </div>
                )}
            </div>
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => fetchOrders(i + 1)}
                            className={cn(
                                "w-10 h-10 flex items-center justify-center text-sm rounded-sm transition-all",
                                pagination.page === i + 1 
                                    ? "bg-[#785254] text-white" 
                                    : "bg-white border border-[#eeeeee] text-[#888888] hover:border-[#785254] hover:text-[#785254]"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
            <UserOrderDetailModal 
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                selectedOrder={selectedOrder}
                detailLoading={detailLoading}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                getStatusBadge={getStatusBadge}
                onCancel={handleCancelOrder}
            />
            <UserOrderCancelDialog 
                isOpen={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
                onConfirm={confirmCancelOrder}
            />
        </div>
    );
};


export default OrderHistory;
