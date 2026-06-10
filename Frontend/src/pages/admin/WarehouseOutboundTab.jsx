import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tooltip, Typography, App } from 'antd';
import { CarOutlined, EyeOutlined } from '@ant-design/icons';
import orderService from '@/services/orderService';
import dayjs from 'dayjs';

const { Text } = Typography;

const WarehouseOutboundTab = ({ canShip, onActionSuccess }) => {
    const { message } = App.useApp();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    const fetchOutboundOrders = async (page = 1, limit = 5) => {
        setLoading(true);
        try {
            const res = await orderService.getAdminOrders({
                page,
                limit,
                status: 'confirmed',
                deliveryMethod: 'home_delivery',
                includeItems: true
            });
            if (res && res.EC === 0) {
                setOrders(res.DT.orders || []);
                setPagination({
                    current: page,
                    pageSize: limit,
                    total: res.DT.totalItems || 0,
                });
            } else {
                message.error(res.EM || 'Không tải được danh sách đơn hàng chờ giao ĐVVC');
            }
        } catch (error) {
            console.error('>>> Error fetching outbound orders:', error);
            message.error('Lỗi kết nối khi tải danh sách đơn hàng chờ giao ĐVVC');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOutboundOrders(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange = (newPagination) => {
        fetchOutboundOrders(newPagination.current, newPagination.pageSize);
    };

    const handleShipOrder = async (orderId) => {
        try {
            const res = await orderService.updateOrderStatus(orderId, 'shipping');
            if (res && res.EC === 0) {
                message.success('Bàn giao đơn hàng cho ĐVVC thành công!');
                onActionSuccess();
                fetchOutboundOrders(pagination.current, pagination.pageSize);
            } else {
                message.error(res.EM || 'Cập nhật trạng thái đơn hàng thất bại');
            }
        } catch (error) {
            console.error('>>> Error shipping order:', error);
            message.error('Lỗi khi cập nhật trạng thái đơn hàng');
        }
    };

    const expandedRowRender = (record) => {
        const columns = [
            {
                title: 'Tên Sản phẩm',
                dataIndex: ['variant', 'product', 'name'],
                key: 'productName',
                render: (text) => <Text strong>{text || 'N/A'}</Text>
            },
            {
                title: 'Mã SKU',
                dataIndex: ['variant', 'sku'],
                key: 'sku',
                render: (sku) => <Text code>{sku}</Text>
            },
            {
                title: 'Màu sắc',
                dataIndex: ['variant', 'color', 'name'],
                key: 'color',
                render: (color) => color || '---'
            },
            {
                title: 'Kích cỡ',
                dataIndex: ['variant', 'size', 'name'],
                key: 'size',
                render: (size) => size || '---'
            },
            {
                title: 'Số lượng',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'center',
                render: (qty) => <Text type="warning" strong>{qty}</Text>
            },
            {
                title: 'Đơn giá',
                dataIndex: 'price',
                key: 'price',
                align: 'right',
                render: (price) => `${Number(price).toLocaleString('vi-VN')} đ`
            }
        ];

        return (
            <Table
                columns={columns}
                dataSource={record.orderItems || []}
                pagination={false}
                rowKey="id"
                size="small"
                bordered
                className="bg-gray-50/50"
            />
        );
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (id) => <Text strong style={{ color: '#1890ff' }}>#{id}</Text>
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Space orientation="vertical" size={0}>
                    <Text strong>{user?.fullName || 'Khách vãng lai'}</Text>
                    {user?.phone && <Text type="secondary" style={{ fontSize: '12px' }}>SĐT: {user.phone}</Text>}
                </Space>
            )
        },
        {
            title: 'Thời gian đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
        },
        {
            title: 'Địa chỉ giao hàng',
            dataIndex: 'shippingAddress',
            key: 'shippingAddress',
            ellipsis: true,
            render: (addr) => (
                <Tooltip title={addr}>
                    <span>{addr || '---'}</span>
                </Tooltip>
            )
        },
        {
            title: 'Tổng thanh toán',
            dataIndex: 'finalAmount',
            key: 'finalAmount',
            align: 'right',
            render: (amount) => <Text strong>{Number(amount).toLocaleString('vi-VN')} đ</Text>
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 150,
            render: (_, record) => {
                const btn = (
                    <Button
                        type="primary"
                        icon={<CarOutlined />}
                        disabled={!canShip}
                        onClick={() => handleShipOrder(record.id)}
                        size="small"
                        style={{ backgroundColor: canShip ? '#faad14' : undefined, borderColor: canShip ? '#faad14' : undefined }}
                    >
                        Đã bàn giao
                    </Button>
                );

                if (!canShip) {
                    return (
                        <Tooltip title="Bạn không có quyền bàn giao vận chuyển (Yêu cầu: orders.update_ship)">
                            <div>{btn}</div>
                        </Tooltip>
                    );
                }
                return btn;
            }
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            pagination={{
                ...pagination,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20'],
                showTotal: (total) => `Tổng cộng ${total} đơn hàng chờ giao`
            }}
            onChange={handleTableChange}
            expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.orderItems && record.orderItems.length > 0
            }}
            className="custom-admin-table"
        />
    );
};

export default WarehouseOutboundTab;
