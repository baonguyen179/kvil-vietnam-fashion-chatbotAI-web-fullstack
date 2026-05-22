import React, { useState, useEffect } from 'react';
import { Table, Select, Space, Card, Typography, App, Row, Col, Badge, Button, Image, Popconfirm, Avatar } from 'antd';
import { 
    StarOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    ClockCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import reviewService from '@/services/reviewService';
import dayjs from 'dayjs';
import './AdminShared.css';

const { Option } = Select;
const { Title, Text } = Typography;

const STATUS_CONFIG = {
    'APPROVED': { color: 'success', label: 'Đã duyệt' },
    'REJECTED': { color: 'error', label: 'Từ chối' },
    'PENDING': { color: 'warning', label: 'Chờ duyệt' },
};

const ReviewManagePage = () => {
    const { message } = App.useApp();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [statusFilter, setStatusFilter] = useState(undefined);

    const fetchReviews = async (page = 1, limit = 10, status = undefined) => {
        setLoading(true);
        try {
            const res = await reviewService.getAdminReviews(page, limit, status);
            if (res && res.EC === 0) {
                setReviews(res.DT.reviews);
                setPagination({
                    current: page,
                    pageSize: limit,
                    total: res.DT.totalItems,
                });
            } else {
                message.error(res.EM || "Lấy danh sách đánh giá thất bại!");
            }
        } catch (error) {
            console.error(">>> Error fetching reviews:", error);
            message.error("Lỗi khi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange = (newPagination) => {
        fetchReviews(newPagination.current, newPagination.pageSize, statusFilter);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        fetchReviews(1, pagination.pageSize, value);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await reviewService.updateReviewStatus(id, newStatus);
            if (res && res.EC === 0) {
                message.success('Cập nhật trạng thái thành công');
                fetchReviews(pagination.current, pagination.pageSize, statusFilter);
            } else {
                message.error(res.EM || 'Cập nhật thất bại');
            }
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const columns = [
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Space>
                    <Avatar>{user?.fullName?.[0]?.toUpperCase() || 'U'}</Avatar>
                    <div className="flex flex-col">
                        <Text strong>{user?.fullName || 'Khách ẩn danh'}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{user?.email || ''}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            render: (product) => <Text strong>{product?.name || 'Sản phẩm đã xóa'}</Text>,
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => (
                <Space>
                    <Text strong style={{ color: '#faad14' }}>{rating}</Text>
                    <StarOutlined style={{ color: '#faad14' }} />
                </Space>
            ),
            sorter: (a, b) => a.rating - b.rating,
        },
        {
            title: 'Nội dung',
            dataIndex: 'comment',
            key: 'comment',
            width: '25%',
            render: (comment, record) => (
                <div className="flex flex-col gap-2">
                    <Text italic={!comment}>{comment || 'Không có nhận xét'}</Text>
                    {record.images && record.images.length > 0 && (
                        <div className="flex gap-2 mt-1">
                            {record.images.map((img, idx) => (
                                <Image
                                    key={idx}
                                    src={img.imageUrl}
                                    width={40}
                                    height={40}
                                    className="object-cover rounded-sm border border-gray-200"
                                    preview={{ mask: false }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = STATUS_CONFIG[status] || { color: 'default', label: status };
                return <Badge status={config.color} text={config.label} />;
            },
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <Text type="secondary">
                    {dayjs(date).format('DD/MM/YYYY HH:mm')}
                </Text>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    {record.status !== 'APPROVED' && (
                        <Popconfirm
                            title="Duyệt đánh giá này?"
                            onConfirm={() => handleUpdateStatus(record.id, 'APPROVED')}
                            okText="Duyệt"
                            cancelText="Hủy"
                        >
                            <Button size="small" type="primary" icon={<CheckCircleOutlined />}>
                                Duyệt
                            </Button>
                        </Popconfirm>
                    )}
                    {record.status !== 'REJECTED' && (
                        <Popconfirm
                            title="Từ chối đánh giá này?"
                            onConfirm={() => handleUpdateStatus(record.id, 'REJECTED')}
                            okText="Từ chối"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button size="small" danger icon={<CloseCircleOutlined />}>
                                Từ chối
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <Card variant="borderless" className="shadow-sm rounded-xl">
                <Row justify="space-between" align="middle" className="mb-6">
                    <Col>
                        <Space orientation="vertical" size={0}>
                            <Title level={3} style={{ margin: 0 }}>Quản lý Đánh giá</Title>
                            <Text type="secondary">Duyệt và kiểm soát nội dung đánh giá từ khách hàng</Text>
                        </Space>
                    </Col>
                    <Col>
                        <Space size="middle">
                            <Select
                                placeholder="Lọc theo trạng thái"
                                allowClear
                                style={{ width: 180 }}
                                onChange={handleStatusFilter}
                                size="large"
                            >
                                <Option value="PENDING">Chờ duyệt</Option>
                                <Option value="APPROVED">Đã duyệt</Option>
                                <Option value="REJECTED">Đã từ chối</Option>
                            </Select>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={() => fetchReviews(1, pagination.pageSize, statusFilter)}
                                size="large"
                            >
                                Làm mới
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={reviews}
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

export default ReviewManagePage;
