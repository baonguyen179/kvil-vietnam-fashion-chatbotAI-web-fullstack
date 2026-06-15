import React, { useState } from 'react';
import { Drawer, Descriptions, Tag, Badge, Divider, Space, Typography, Button, Popconfirm, Select, App, Alert, Table } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, SyncOutlined } from '@ant-design/icons';
import { ORDER_STATUS_CONFIG, PAYMENT_METHOD_LABELS, DELIVERY_METHOD_LABELS, ALLOWED_NEXT_STATUS, getAllowedNextStatus } from '@/constants/orderConstants';
import orderService from '@/services/orderService';

const { Text, Title } = Typography;

// Sequelize trả DECIMAL dạng string → parseFloat để an toàn
const formatCurrency = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? '—' : `${num.toLocaleString('vi-VN')}đ`;
};

const AdminOrderDetailDrawer = ({ open, onClose, order, onUpdateStatus, onUpdatePayment, updatingId, onSyncSuccess, isSuperAdmin }) => {
    const { message } = App.useApp();
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null); // { type: 'success'|'error'|'info', text: string }

    if (!order) return null;

    // Reset kết quả cũ mỗi khi mở đơn mới
    // (Drawer không unmount nên cần reset thủ công khi order thay đổi)

    const isVNPayPending = order.paymentMethod === 'VNPAY' && !order.paymentStatus;

    const handleSyncVNPay = async () => {
        setSyncing(true);
        setSyncResult(null);
        try {
            const res = await orderService.syncVNPayStatus(order.id);

            if (res && res.EC === 0) {
                // Thành công: VNPay xác nhận giao dịch đã thanh toán
                setSyncResult({ type: 'success', text: res.EM || 'Đồng bộ thành công! Đơn hàng đã được xác nhận thanh toán.' });
                message.success(res.EM || 'Đồng bộ VNPay thành công!');
                // Cập nhật paymentStatus lên parent để bảng phản ánh ngay, không cần reload
                if (typeof onSyncSuccess === 'function') {
                    onSyncSuccess(order.id);
                }
            } else {
                // VNPay trả về nhưng GD chưa thành công hoặc còn pending
                const info = res?.DT;
                const statusText = info?.vnp_TransactionStatus
                    ? ` (Mã trạng thái GD: ${info.vnp_TransactionStatus})`
                    : '';
                setSyncResult({
                    type: 'warning',
                    text: (res?.EM || 'Giao dịch chưa hoàn tất theo VNPay.') + statusText,
                });
                message.warning(res?.EM || 'VNPay chưa ghi nhận thanh toán.');
            }
        } catch (err) {
            console.error('>>> handleSyncVNPay error:', err);
            setSyncResult({ type: 'error', text: 'Lỗi kết nối. Vui lòng thử lại sau.' });
            message.error('Lỗi kết nối đến máy chủ khi đồng bộ VNPay.');
        } finally {
            setSyncing(false);
        }
    };
    // console.log("order: ", order);

    const statusCfg = ORDER_STATUS_CONFIG[order.status] || {};
    const isCancelled = order.status === 'cancelled';

    // Tính % giảm giá thực tế để hiển thị (parseFloat để đảm bảo là number)
    const totalBefore = parseFloat(order.totalBeforeDiscount) || 0;
    const discountAmt = parseFloat(order.discountAmount) || 0;
    const shippingFee = parseFloat(order.shippingFee) || 0;
    const discountRate = totalBefore > 0 ? ((discountAmt / totalBefore) * 100).toFixed(1) : 0;

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={
                <Space>
                    <span className="font-semibold text-base">Chi tiết Đơn hàng</span>
                    <Tag color="blue" className="font-mono">#{order.id}</Tag>
                </Space>
            }
            size="large"
            styles={{ body: { paddingTop: 8 } }}
            extra={
                <Button onClick={onClose}>Đóng</Button>
            }
        >
            {/* === Trạng thái tổng quan === */}
            <div className="flex gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 text-center border-r border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Trạng thái đơn</div>
                    <Tag color={statusCfg.color} className="text-sm font-medium">
                        {statusCfg.label}
                    </Tag>
                </div>
                <div className="flex-1 text-center border-r border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Thanh toán</div>
                    <Badge
                        status={order.paymentStatus ? 'success' : 'warning'}
                        text={
                            <span className={`text-sm font-medium ${order.paymentStatus ? 'text-green-600' : 'text-orange-500'}`}>
                                {order.paymentStatus ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                        }
                    />
                </div>
                <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 mb-1">Tổng thanh toán</div>
                    <span className="text-red-500 font-bold text-base">
                        {formatCurrency(order.finalAmount)}
                    </span>
                </div>
            </div>

            {/* === Thông tin khách hàng === */}
            <Title level={5} className="mb-2">
                <UserOutlined className="mr-2 text-blue-500" />
                Thông tin khách hàng
            </Title>
            {order.user ? (
                <Descriptions bordered size="small" column={1} className="mb-4">
                    <Descriptions.Item label={<><UserOutlined className="mr-1" />Họ tên</>}>
                        <Text strong>{order.user.fullName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={<><PhoneOutlined className="mr-1" />Điện thoại</>}>
                        {order.user.phone || <Text type="secondary">—</Text>}
                    </Descriptions.Item>
                    <Descriptions.Item label={<><MailOutlined className="mr-1" />Email</>}>
                        {order.user.email}
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-sm text-amber-700">
                    Đơn hàng từ khách vãng lai (không có tài khoản)
                </div>
            )}

            {/* === Thông tin đơn hàng === */}
            <Title level={5} className="mb-2">
                <EnvironmentOutlined className="mr-2 text-green-500" />
                Thông tin đơn hàng
            </Title>
            <Descriptions bordered size="small" column={1} className="mb-4">
                <Descriptions.Item label="Mã đơn hàng">
                    <Text className="font-mono font-semibold">#{order.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức giao">
                    {DELIVERY_METHOD_LABELS[order.deliveryMethod] || order.deliveryMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                    <Tag color={order.paymentMethod === 'COD' ? 'default' : 'geekblue'}>
                        {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ giao hàng">
                    <Text style={{ whiteSpace: 'pre-line' }}>{order.shippingAddress || '—'}</Text>
                </Descriptions.Item>
            </Descriptions>

            {/* === Danh sách sản phẩm === */}
            <Title level={5} className="mb-2">📦 Sản phẩm trong đơn</Title>
            <div className="border rounded-lg overflow-hidden mb-4 bg-white">
                <Table
                    dataSource={order.orderItems || []}
                    columns={[
                        {
                            title: 'Sản phẩm',
                            key: 'product',
                            render: (_, item) => {
                                const variant = item.variant || {};
                                const product = variant.product || {};
                                return (
                                    <div>
                                        <div className="font-semibold text-sm">{product.name || 'N/A'}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            SKU: <Tag color="blue" className="text-[10px] py-0 px-1 font-mono">{variant.sku}</Tag>
                                            <span className="mx-1">·</span>
                                            Màu: {variant.color?.name || 'N/A'}
                                            <span className="mx-1">·</span>
                                            Size: {variant.size?.name || 'N/A'}
                                        </div>
                                    </div>
                                );
                            }
                        },
                        {
                            title: 'Đơn giá',
                            dataIndex: 'price',
                            key: 'price',
                            width: 110,
                            align: 'right',
                            render: (price) => formatCurrency(price)
                        },
                        {
                            title: 'SL',
                            dataIndex: 'quantity',
                            key: 'quantity',
                            width: 50,
                            align: 'center',
                            render: (qty) => <span className="font-semibold">x{qty}</span>
                        },
                        {
                            title: 'Thành tiền',
                            key: 'total',
                            width: 120,
                            align: 'right',
                            render: (_, item) => formatCurrency(parseFloat(item.price) * item.quantity)
                        }
                    ]}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className="custom-order-items-table"
                />
            </div>

            {/* === Thanh toán === */}
            <Title level={5} className="mb-2">💰 Chi tiết thanh toán</Title>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span>{formatCurrency(totalBefore)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                        {shippingFee === 0 ? 'Miễn phí' : `+${formatCurrency(shippingFee)}`}
                    </span>
                </div>
                {discountAmt > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Giảm giá ({discountRate}%)</span>
                        <span>-{formatCurrency(discountAmt)}</span>
                    </div>
                )}
                <Divider className="my-2" />
                <div className="flex justify-between font-bold text-base">
                    <span>Tổng thanh toán</span>
                    <span className="text-red-500">{formatCurrency(order.finalAmount)}</span>
                </div>
            </div>

            {/* === Cập nhật nhanh (trong Drawer) === */}
            <Title level={5} className="mb-2">⚙️ Cập nhật nhanh</Title>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <div className="text-xs text-gray-500 mb-1">Trạng thái đơn hàng</div>
                    <Select
                        value={order.status}
                        disabled={isCancelled || updatingId === order.id}
                        loading={updatingId === order.id}
                        className="w-full"
                        onChange={(val) => onUpdateStatus(order.id, val)}
                        options={Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => {
                            const isCurrent = key === order.status;
                            const isAllowed = isSuperAdmin || 
                                isCurrent || 
                                getAllowedNextStatus(order.status, order.deliveryMethod).includes(key);

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
                        })}
                    />
                    {isCancelled && (
                        <div className="text-xs text-red-400 mt-1">Đơn đã hủy, không thể thay đổi</div>
                    )}
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-1">Trạng thái thanh toán</div>
                    <Popconfirm
                        title={order.paymentStatus ? 'Đánh dấu Chưa thanh toán?' : 'Đánh dấu Đã thanh toán?'}
                        description={`Xác nhận cập nhật trạng thái thanh toán cho đơn #${order.id}?`}
                        onConfirm={() => onUpdatePayment(order.id, !order.paymentStatus)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                        okButtonProps={order.paymentStatus ? { danger: true } : {}}
                        disabled={updatingId === order.id}
                    >
                        <Button
                            block
                            type={order.paymentStatus ? 'default' : 'primary'}
                            danger={order.paymentStatus}
                            loading={updatingId === order.id}
                            className={!order.paymentStatus ? 'bg-green-600 hover:bg-green-700 border-green-600' : ''}
                        >
                            {order.paymentStatus ? 'Đánh dấu Chưa thanh toán' : 'Đánh dấu Đã thanh toán'}
                        </Button>
                    </Popconfirm>
                </div>
            </div>

            {/* === [VNPay QueryDR] Đồng bộ trạng thái từ cổng thanh toán === */}
            {isVNPayPending && (
                <>
                    <Divider dashed className="my-4" />
                    <Title level={5} className="mb-1 flex items-center gap-2">
                        <SyncOutlined className="text-blue-500" />
                        Đồng bộ trạng thái VNPay
                    </Title>
                    <p className="text-xs text-gray-500 mb-3">
                        Truy vấn trực tiếp lên cổng VNPay (QueryDR) để kiểm tra giao dịch.
                        Dùng khi IPN bị mất hoặc khách tắt trình duyệt quá sớm.
                    </p>

                    {/* Hiển thị kết quả của lần sync gần nhất */}
                    {syncResult && (
                        <Alert
                            type={syncResult.type === 'warning' ? 'warning' : syncResult.type}
                            title={
                                syncResult.type === 'success' ? 'Đồng bộ thành công'
                                : syncResult.type === 'warning' ? 'Chưa xác nhận thanh toán'
                                : 'Lỗi kết nối'
                            }
                            description={syncResult.text}
                            showIcon
                            className="mb-3"
                            closable
                            onClose={() => setSyncResult(null)}
                        />
                    )}

                    <Popconfirm
                        title="Đồng bộ với VNPay?"
                        description={
                            <span className="text-xs">
                                Hệ thống sẽ truy vấn lịch sử giao dịch của đơn{' '}
                                <strong>#{order.id}</strong> từ VNPay.<br />
                                Nếu giao dịch thành công, đơn sẽ được tự động xác nhận.
                            </span>
                        }
                        onConfirm={handleSyncVNPay}
                        okText="Đồng bộ ngay"
                        cancelText="Hủy"
                        disabled={syncing}
                    >
                        <Button
                            block
                            icon={<SyncOutlined spin={syncing} />}
                            loading={syncing}
                            disabled={syncing}
                            style={{
                                background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
                                borderColor: '#1677ff',
                                color: '#fff',
                                fontWeight: 500,
                            }}
                        >
                            {syncing ? 'Đang truy vấn VNPay...' : 'Kiểm tra & Đồng bộ VNPay'}
                        </Button>
                    </Popconfirm>
                </>
            )}
        </Drawer>
    );
};

export default AdminOrderDetailDrawer;
