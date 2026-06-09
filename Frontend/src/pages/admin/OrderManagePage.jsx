import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    Table, Button, Space, Tag, message as antdMessage, Card, Typography,
    Tooltip, Badge, Select, Popconfirm, Flex, App
} from 'antd';
import {
    EyeOutlined, CheckCircleOutlined, CloseCircleOutlined,
    ReloadOutlined, FilterOutlined
} from '@ant-design/icons';
import orderService from '@/services/orderService';
import AdminOrderDetailDrawer from '@/components/admin/admin.order.detail.drawer';
import {
    ORDER_STATUS_CONFIG,
    PAYMENT_METHOD_LABELS,
    DELIVERY_METHOD_LABELS,
    ORDER_STATUS_OPTIONS,
    PAYMENT_STATUS_OPTIONS,
    PAYMENT_METHOD_OPTIONS,
    DELIVERY_METHOD_OPTIONS,
    ALLOWED_NEXT_STATUS,
    getAllowedNextStatus,
} from '@/constants/orderConstants';

const { Title, Text } = Typography;

const formatCurrency = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? '—' : `${num.toLocaleString('vi-VN')}đ`;
};

const formatDate = (val) =>
    val ? new Date(val).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

const OrderManagePage = () => {
    const { message, modal } = App.useApp();
    const user = useSelector(state => state.auth.user);
    const { roles = [] } = user || {};
    const isSuperAdmin = roles.includes('SUPER_ADMIN');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null); 

    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: '',
        paymentMethod: '',
        deliveryMethod: '',
    });

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = useCallback(async (page = 1, limit = 10, activeFilters = filters) => {
        setLoading(true);
        try {
            const params = { page, limit, ...activeFilters };
            if (params.paymentStatus === 'true')  params.paymentStatus = true;
            if (params.paymentStatus === 'false') params.paymentStatus = false;

            const res = await orderService.getAdminOrders(params);
            if (res && res.EC === 0) {
                setOrders(res.DT.orders || []);
                setPagination(prev => ({
                    ...prev,
                    current: res.DT.currentPage,
                    total: res.DT.totalItems,
                }));
            } else {
                message.error(res?.EM || 'Không lấy được danh sách đơn hàng!');
            }
        } catch {
            message.error('Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchOrders(1, pagination.pageSize, filters);
    }, []); 

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        fetchOrders(1, pagination.pageSize, newFilters);
    };

    const handleResetFilters = () => {
        const reset = { status: '', paymentStatus: '', paymentMethod: '', deliveryMethod: '' };
        setFilters(reset);
        fetchOrders(1, pagination.pageSize, reset);
    };

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));
        fetchOrders(newPagination.current, newPagination.pageSize, filters);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // Kiểm tra quyền chuyển đổi trạng thái (chỉ SUPER_ADMIN được đi lùi/đổi tự do, các role khác chỉ được đi tiếp 1 bước hoặc hủy đơn)
        const isCurrent = newStatus === order.status;
        const isAllowed = isSuperAdmin || 
            isCurrent || 
            getAllowedNextStatus(order.status, order.deliveryMethod).includes(newStatus);

        if (!isAllowed) {
            message.warning('Bạn không có quyền chuyển đổi ngược hoặc nhảy cóc trạng thái đơn hàng!');
            return;
        }

        // [Yêu cầu 3] Xử lý Hủy đơn với Confirm Dialog
        if (newStatus === 'cancelled') {
            modal.confirm({
                title: 'Xác nhận hủy đơn',
                content: `Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không?`,
                okText: 'Hủy đơn',
                cancelText: 'Quay lại',
                okButtonProps: { danger: true },
                onOk: () => performUpdateStatus(orderId, newStatus)
            });
            return;
        }

        // [Yêu cầu 2] Ràng buộc logic chuyển trạng thái
        // COD: Chỉ cho phép chuyển sang 'delivered' khi đã thanh toán
        if (order.paymentMethod === 'COD' && newStatus === 'delivered' && !order.paymentStatus) {
            message.warning('Phải xác nhận đã thanh toán trên hệ thống trước khi chuyển sang Đã giao!');
            return;
        }

        // VNPAY: Không cho phép đổi sang bất kỳ trạng thái nào (trừ hủy) nếu chưa thanh toán
        if (order.paymentMethod === 'VNPAY' && !order.paymentStatus) {
            message.warning('Đơn VNPAY chưa hoàn tất thanh toán! Bạn chỉ có thể Hủy đơn.');
            return;
        }

        performUpdateStatus(orderId, newStatus);
    };

    const performUpdateStatus = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const res = await orderService.updateOrderStatus(orderId, newStatus);
            if (res && res.EC === 0) {
                message.success(res.EM || 'Cập nhật trạng thái thành công!');
                setOrders(prev =>
                    prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
                );
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, status: newStatus }));
                }
            } else {
                message.error(res?.EM || 'Cập nhật thất bại!');
            }
        } catch {
            message.error('Lỗi kết nối khi cập nhật trạng thái');
        } finally {
            setUpdatingId(null);
        }
    };
// console.log(selectedOrder)
    const handleUpdatePayment = async (orderId, newPaymentStatus) => {
        setUpdatingId(orderId);
        try {
            const res = await orderService.updatePaymentStatus(orderId, newPaymentStatus);
            if (res && res.EC === 0) {
                message.success(res.EM || 'Cập nhật thanh toán thành công!');
                setOrders(prev =>
                    prev.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o)
                );
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, paymentStatus: newPaymentStatus }));
                }
            } else {
                message.error(res?.EM || 'Cập nhật thất bại!');
            }
        } catch {
            message.error('Lỗi kết nối khi cập nhật thanh toán');
        } finally {
            setUpdatingId(null);
        }
    };

    /**
     * Callback từ AdminOrderDetailDrawer sau khi sync VNPay thành công.
     * Cập nhật paymentStatus = true cho đơn trong local state mà không reload.
     */
    const handleSyncSuccess = (orderId) => {
        setOrders(prev =>
            prev.map(o => o.id === orderId ? { ...o, paymentStatus: true } : o)
        );
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => ({ ...prev, paymentStatus: true }));
        }
    };

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 55,
            render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1,
        },
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id) => <Text className="font-mono font-semibold text-blue-600">#{id}</Text>,
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => record.user ? (
                <div>
                    <Text strong className="block leading-snug">{record.user.fullName}</Text>
                    <Text type="secondary" className="text-xs">{record.user.phone || record.user.email}</Text>
                </div>
            ) : (
                <Text type="secondary" className="italic text-xs">Khách vãng lai</Text>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'finalAmount',
            key: 'finalAmount',
            width: 130,
            render: (val) => (
                <Text className="text-red-500 font-semibold">{formatCurrency(val)}</Text>
            ),
        },
        {
            title: 'Thanh toán',
            key: 'payment',
            width: 160,
            render: (_, record) => (
                <Flex vertical gap={2}>
                    <Tag color={record.paymentMethod === 'COD' ? 'default' : 'geekblue'} className="text-xs">
                        {PAYMENT_METHOD_LABELS[record.paymentMethod] || record.paymentMethod}
                    </Tag>
                    <Badge
                        status={record.paymentStatus ? 'success' : 'warning'}
                        text={
                            <span className={`text-xs ${record.paymentStatus ? 'text-green-600' : 'text-orange-500'}`}>
                                {record.paymentStatus ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                        }
                    />
                </Flex>
            ),
        },
        {
            title: 'Giao hàng',
            dataIndex: 'deliveryMethod',
            key: 'deliveryMethod',
            width: 130,
            render: (val) => (
                <Tag color={val === 'home_delivery' ? 'cyan' : 'volcano'} className="text-xs">
                    {DELIVERY_METHOD_LABELS[val] || val}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status) => {
                const cfg = ORDER_STATUS_CONFIG[status] || {};
                return <Tag color={cfg.color}>{cfg.label || status}</Tag>;
            },
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 130,
            render: formatDate,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 160,
            render: (_, record) => {
                const isCancelled = record.status === 'cancelled';
                const isUpdating = updatingId === record.id;

                return (
                    <Space size="small">
                        {/* Xem chi tiết */}
                        <Tooltip title="Xem chi tiết">
                            <Button
                                type="text" shape="circle"
                                icon={<EyeOutlined />}
                                className="text-blue-500 hover:bg-blue-50"
                                onClick={() => { setSelectedOrder(record); setDrawerOpen(true); }}
                            />
                        </Tooltip>

                        {/* Cập nhật status nhanh: chỉ hiện các bước tiếp theo hợp lệ */}
                        {!isCancelled && (
                            <Tooltip title="Chuyển trạng thái tiếp theo">
                                <Select
                                    value={record.status}
                                    size="small"
                                    style={{ width: 130 }}
                                    loading={isUpdating}
                                    disabled={isUpdating}
                                    popupMatchSelectWidth={false}
                                    onChange={(val) => {
                                        handleUpdateStatus(record.id, val);
                                    }}
                                    options={Object.entries(ORDER_STATUS_CONFIG)
                                        .map(([key, cfg]) => {
                                            const isCurrent = key === record.status;
                                            const isAllowed = isSuperAdmin || 
                                                isCurrent || 
                                                getAllowedNextStatus(record.status, record.deliveryMethod).includes(key);

                                            return {
                                                value: key,
                                                label: (
                                                    <Space size={4}>
                                                        <Badge color={cfg.badgeColor} />
                                                        {cfg.label}
                                                    </Space>
                                                ),
                                                disabled: isCurrent || !isAllowed,
                                            };
                                        })
                                    }
                                />
                            </Tooltip>
                        )}

                        {/* Toggle thanh toán nhanh */}
                        <Tooltip title={record.paymentStatus ? 'Đánh dấu Chưa thanh toán' : 'Đánh dấu Đã thanh toán'}>
                            <Popconfirm
                                title={record.paymentStatus ? 'Hoàn tác thanh toán?' : 'Xác nhận đã thanh toán?'}
                                onConfirm={() => handleUpdatePayment(record.id, !record.paymentStatus)}
                                okText="Đồng ý"
                                cancelText="Hủy"
                                okButtonProps={record.paymentStatus ? { danger: true } : {}}
                            >
                                <Button
                                    type="text" shape="circle"
                                    loading={isUpdating}
                                    icon={record.paymentStatus
                                        ? <CloseCircleOutlined className="text-orange-500" />
                                        : <CheckCircleOutlined className="text-green-500" />
                                    }
                                    className="hover:bg-gray-100"
                                />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const hasActiveFilter = Object.values(filters).some(v => v !== '');

    return (
        <Card className="shadow-md rounded-xl border-none">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <Title level={4} className="m-0">Quản lý Đơn hàng</Title>
                    <p className="text-gray-500 mt-1 mb-0">
                        Xem, lọc và cập nhật trạng thái tất cả đơn hàng trong hệ thống
                    </p>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchOrders(pagination.current, pagination.pageSize, filters)}
                    loading={loading}
                >
                    Làm mới
                </Button>
            </div>

            {/* ── Bộ lọc ── */}
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Space align="center" className="mr-1">
                    <FilterOutlined className="text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">Bộ lọc:</span>
                </Space>

                <Select
                    placeholder="Trạng thái đơn"
                    className="w-[160px]"
                    value={filters.status}
                    onChange={(v) => handleFilterChange('status', v)}
                    options={ORDER_STATUS_OPTIONS}
                />
                <Select
                    placeholder="Thanh toán"
                    className="w-[160px]"
                    value={filters.paymentStatus}
                    onChange={(v) => handleFilterChange('paymentStatus', v)}
                    options={PAYMENT_STATUS_OPTIONS}
                />
                <Select
                    placeholder="Hình thức thanh toán"
                    className="w-[195px]"
                    value={filters.paymentMethod}
                    onChange={(v) => handleFilterChange('paymentMethod', v)}
                    options={PAYMENT_METHOD_OPTIONS}
                />
                <Select
                    placeholder="Hình thức giao"
                    className="w-[165px]"
                    value={filters.deliveryMethod}
                    onChange={(v) => handleFilterChange('deliveryMethod', v)}
                    options={DELIVERY_METHOD_OPTIONS}
                />

                {hasActiveFilter && (
                    <Button danger size="small" onClick={handleResetFilters} className="self-center">
                        Xóa bộ lọc
                    </Button>
                )}
            </div>

            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                onChange={handleTableChange}
                bordered
                scroll={{ x: 1000 }}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} đơn hàng`,
                }}
                rowClassName={(record) =>
                    record.status === 'cancelled' ? 'opacity-60 bg-red-50' : ''
                }
            />

            <AdminOrderDetailDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                order={selectedOrder}
                onUpdateStatus={handleUpdateStatus}
                onUpdatePayment={handleUpdatePayment}
                updatingId={updatingId}
                onSyncSuccess={handleSyncSuccess}
                isSuperAdmin={isSuperAdmin}
            />
        </Card>
    );
};

export default OrderManagePage;
