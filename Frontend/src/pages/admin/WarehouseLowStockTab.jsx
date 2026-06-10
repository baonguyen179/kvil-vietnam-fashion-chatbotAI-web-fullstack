import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tooltip, Tag, Typography, App } from 'antd';
import { AlertOutlined, EditOutlined } from '@ant-design/icons';
import inventoryService from '@/services/inventoryService';

const { Text } = Typography;

const WarehouseLowStockTab = ({ canAdjust, onAdjust, refreshTrigger }) => {
    const { message } = App.useApp();
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLowStock = async () => {
        setLoading(true);
        try {
            const res = await inventoryService.getLowStockVariants(10);
            if (res && res.EC === 0) {
                setVariants(res.DT || []);
            } else {
                message.error(res.EM || 'Không tải được danh sách cảnh báo tồn kho');
            }
        } catch (error) {
            console.error('>>> Error fetching low stock variants:', error);
            message.error('Lỗi kết nối khi tải danh sách cảnh báo tồn kho');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLowStock();
    }, [refreshTrigger]);

    const columns = [
        {
            title: 'Mã SKU',
            dataIndex: 'sku',
            key: 'sku',
            render: (sku) => <Text code strong>{sku}</Text>
        },
        {
            title: 'Sản phẩm',
            dataIndex: ['product', 'name'],
            key: 'productName',
            render: (name) => <Text strong>{name}</Text>
        },
        {
            title: 'Màu sắc',
            dataIndex: ['color', 'name'],
            key: 'color',
            render: (color) => color || '---'
        },
        {
            title: 'Kích cỡ',
            dataIndex: ['size', 'name'],
            key: 'size',
            render: (size) => size || '---'
        },
        {
            title: 'Tồn kho hiện tại',
            dataIndex: 'stock',
            key: 'stock',
            align: 'center',
            sorter: (a, b) => a.stock - b.stock,
            render: (stock) => {
                let color = 'red';
                if (stock > 5) color = 'warning';
                return (
                    <Tag color={color} style={{ fontWeight: 'bold', fontSize: '13px', padding: '2px 8px' }}>
                        {stock} sản phẩm
                    </Tag>
                );
            }
        },
        {
            title: 'Thao tác nhanh',
            key: 'action',
            align: 'center',
            width: 150,
            render: (_, record) => {
                const btn = (
                    <Button
                        type="dashed"
                        icon={<EditOutlined />}
                        disabled={!canAdjust}
                        onClick={() => onAdjust({ variantId: record.id, variant: record })}
                        size="small"
                        style={{ color: canAdjust ? '#722ed1' : undefined, borderColor: canAdjust ? '#722ed1' : undefined }}
                    >
                        Điều chỉnh
                    </Button>
                );

                if (!canAdjust) {
                    return (
                        <Tooltip title="Bạn không có quyền điều chỉnh kho hàng (Yêu cầu: inventory.update)">
                            <div>{btn}</div>
                        </Tooltip>
                    );
                }
                return btn;
            }
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-red-50/50 p-4 border border-red-100 rounded-xl">
                <Space>
                    <AlertOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                    <div>
                        <Text strong style={{ color: '#cf1322', fontSize: '15px' }}>Ngưỡng Cảnh Báo Tồn Kho</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Các biến thể có lượng tồn dưới 10 sản phẩm sẽ tự động hiển thị ở đây để kịp thời lập kế hoạch nhập kho.
                        </Text>
                    </div>
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={variants}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng cộng ${total} biến thể tồn kho thấp`
                }}
                className="custom-admin-table"
            />
        </div>
    );
};

export default WarehouseLowStockTab;
