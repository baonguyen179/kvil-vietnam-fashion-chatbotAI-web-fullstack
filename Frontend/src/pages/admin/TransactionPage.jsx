import React, { useState, useEffect } from 'react';
import { Table, Select, Space, Tag, Card, Typography, App, Row, Col, Badge, Input, Button } from 'antd';
import { 
    CreditCardOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    ClockCircleOutlined,
    SearchOutlined,
    ReloadOutlined,
    DollarCircleOutlined
} from '@ant-design/icons';
import paymentService from '@/services/paymentService';
import dayjs from 'dayjs';
import './AdminShared.css';

const { Option } = Select;
const { Title, Text } = Typography;

const STATUS_CONFIG = {
    'SUCCESS': { color: 'success', label: 'Thành công', icon: <CheckCircleOutlined /> },
    'FAILED': { color: 'error', label: 'Thất bại', icon: <CloseCircleOutlined /> },
    'PENDING': { color: 'warning', label: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
};

const TransactionPage = () => {
    const { message } = App.useApp();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        status: undefined,
        provider: undefined,
        orderId: '',
    });

    const fetchTransactions = async (page = 1, limit = 10, status = undefined, provider = undefined, orderId = '') => {
        setLoading(true);
        try {
            const res = await paymentService.getPaymentTransactions(page, limit, provider, status, orderId);
            if (res && res.EC === 0) {
                setTransactions(res.DT.transactions);
                setPagination({
                    current: page,
                    pageSize: limit,
                    total: res.DT.totalRows,
                });
            } else {
                message.error(res.EM || "Lấy danh sách giao dịch thất bại!");
            }
        } catch (error) {
            console.error(">>> Error fetching transactions:", error);
            message.error("Lỗi khi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange = (newPagination) => {
        fetchTransactions(newPagination.current, newPagination.pageSize, filters.status, filters.provider, filters.orderId);
    };

    const handleStatusFilter = (value) => {
        setFilters(prev => ({ ...prev, status: value }));
        fetchTransactions(1, pagination.pageSize, value, filters.provider, filters.orderId);
    };

    const handleOrderIdSearch = (value) => {
        setFilters(prev => ({ ...prev, orderId: value }));
        fetchTransactions(1, pagination.pageSize, filters.status, filters.provider, value);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (orderId) => <Text strong>#{orderId}</Text>,
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'provider',
            key: 'provider',
            render: (provider) => (
                <Tag color="geekblue" icon={<CreditCardOutlined />}>
                    {provider}
                </Tag>
            ),
        },
        {
            title: 'Mã GD / Local ID',
            dataIndex: 'transactionId',
            key: 'transactionId',
            render: (id) => <Text copyable type="secondary">{id}</Text>,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                </Text>
            ),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = STATUS_CONFIG[status] || { color: 'default', label: status, icon: <ClockCircleOutlined /> };
                return (
                    <Badge status={config.color} text={config.label} />
                );
            },
        },
        {
            title: 'Thời gian giao dịch',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <Text type="secondary">
                    {dayjs(date).format('DD/MM/YYYY HH:mm:ss')}
                </Text>
            ),
        },
    ];

    return (
        <div className="p-6">
            <Row gutter={[24, 24]} className="mb-6">
                <Col xs={24} sm={12} md={8}>
                    <Card variant="borderless" className="shadow-sm rounded-xl bg-blue-50">
                        <Space>
                            <div className="p-3 bg-blue-500 rounded-lg text-white">
                                <DollarCircleOutlined style={{ fontSize: '24px' }} />
                            </div>
                            <div>
                                <Text type="secondary">Tổng giao dịch</Text>
                                <Title level={4} style={{ margin: 0 }}>{pagination.total}</Title>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Card variant="borderless" className="shadow-sm rounded-xl">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Space orientation="vertical" size={0}>
                            <Title level={3} style={{ margin: 0 }}>Lịch sử Giao dịch</Title>
                            <Text type="secondary">Quản lý và đối soát các giao dịch thanh toán trực tuyến</Text>
                        </Space>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Input
                                placeholder="Tìm theo Order ID"
                                prefix={<SearchOutlined />}
                                style={{ width: 200 }}
                                onPressEnter={(e) => handleOrderIdSearch(e.target.value)}
                                size="large"
                                allowClear
                            />
                            <Select
                                placeholder="Trạng thái"
                                allowClear
                                style={{ width: 150 }}
                                onChange={handleStatusFilter}
                                size="large"
                            >
                                <Option value="SUCCESS">Thành công</Option>
                                <Option value="FAILED">Thất bại</Option>
                                <Option value="PENDING">Chờ xử lý</Option>
                            </Select>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={() => fetchTransactions(1, pagination.pageSize, filters.status, filters.provider, filters.orderId)}
                                size="large"
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={transactions}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                    }}
                    onChange={handleTableChange}
                    className="custom-admin-table"
                />
            </Card>
        </div>
    );
};

export default TransactionPage;
