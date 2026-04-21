import React, { useState, useEffect } from 'react';
import { Table, Select, Space, Tag, Card, Typography, App, Row, Col, Badge, Input, Button, Tooltip } from 'antd';
import { 
    HistoryOutlined, 
    ArrowUpOutlined, 
    ArrowDownOutlined, 
    ReloadOutlined,
    UserOutlined,
    InboxOutlined
} from '@ant-design/icons';
import inventoryService from '@/services/inventoryService';
import dayjs from 'dayjs';
import './AdminShared.css';

const { Option } = Select;
const { Title, Text } = Typography;

const TYPE_CONFIG = {
    'IN': { color: 'green', label: 'Nhập kho', icon: <ArrowUpOutlined /> },
    'OUT': { color: 'volcano', label: 'Xuất kho', icon: <ArrowDownOutlined /> },
    'RETURN': { color: 'blue', label: 'Hoàn trả', icon: <ReloadOutlined /> },
};

const InventoryLogPage = () => {
    const { message } = App.useApp();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        type: undefined,
        variantId: undefined,
    });

    const fetchLogs = async (page = 1, limit = 10, type = undefined, variantId = undefined) => {
        setLoading(true);
        try {
            const res = await inventoryService.getInventoryLogs(page, limit, type, variantId);
            if (res && res.EC === 0) {
                setLogs(res.DT.logs);
                setPagination({
                    current: page,
                    pageSize: limit,
                    total: res.DT.totalRows,
                });
            } else {
                message.error(res.EM || "Lấy lịch sử kho hàng thất bại!");
            }
        } catch (error) {
            console.error(">>> Error fetching logs:", error);
            message.error("Lỗi khi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(pagination.current, pagination.pageSize, filters.type, filters.variantId);
    }, []);

    const handleTableChange = (newPagination) => {
        fetchLogs(newPagination.current, newPagination.pageSize, filters.type, filters.variantId);
    };

    const handleTypeFilter = (value) => {
        setFilters(prev => ({ ...prev, type: value }));
        fetchLogs(1, pagination.pageSize, value, filters.variantId);
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (date) => (
                <Text type="secondary">
                    {dayjs(date).format('DD/MM/YYYY HH:mm:ss')}
                </Text>
            ),
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        },
        {
            title: 'Loại biến động',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const config = TYPE_CONFIG[type] || { color: 'default', label: type, icon: <HistoryOutlined /> };
                return (
                    <Tag color={config.color} icon={config.icon} className="px-2 py-1 rounded-md border-0 uppercase font-medium">
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Sản phẩm / SKU',
            key: 'product',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.variant?.product?.name || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        SKU: <Tag color="blue" size="small">{record.variant?.sku}</Tag>
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            render: (qty, record) => {
                const isPositive = record.type === 'IN' || record.type === 'RETURN';
                return (
                    <Text strong style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
                        {isPositive ? '+' : '-'}{qty}
                    </Text>
                );
            },
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                user ? (
                    <Tooltip title={user.email}>
                        <Space>
                            <UserOutlined />
                            <Text>{user.fullName}</Text>
                        </Space>
                    </Tooltip>
                ) : <Text type="secondary">Hệ thống / Admin</Text>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            ellipsis: true,
            render: (note) => <Text type="secondary">{note || '---'}</Text>
        },
    ];

    return (
        <div className="p-6">
            <Card variant="borderless" className="shadow-sm rounded-xl">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Space orientation="vertical" size={0}>
                            <Title level={3} style={{ margin: 0 }}>Lịch sử Biến động Kho</Title>
                            <Text type="secondary">Theo dõi chi tiết các lần Nhập, Xuất và Hoàn trả hàng hóa</Text>
                        </Space>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Select
                                placeholder="Lọc theo loại"
                                allowClear
                                style={{ width: 160 }}
                                onChange={handleTypeFilter}
                                size="large"
                            >
                                <Option value="IN"><ArrowUpOutlined style={{ color: '#52c41a' }} /> Nhập kho</Option>
                                <Option value="OUT"><ArrowDownOutlined style={{ color: '#f5222d' }} /> Xuất kho</Option>
                                <Option value="RETURN"><ReloadOutlined style={{ color: '#1890ff' }} /> Hoàn trả</Option>
                            </Select>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={() => fetchLogs(pagination.current, pagination.pageSize, filters.type, filters.variantId)}
                                size="large"
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng cộng ${total} bản ghi`,
                    }}
                    onChange={handleTableChange}
                    className="custom-admin-table"
                />
            </Card>
        </div>
    );
};

export default InventoryLogPage;
