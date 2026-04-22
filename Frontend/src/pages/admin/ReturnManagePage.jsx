import React, { useState, useEffect, useCallback } from 'react';
import { 
    Table, 
    Tag, 
    Button, 
    Space, 
    Card, 
    Typography, 
    Modal, 
    notification, 
    Image, 
    Descriptions, 
    Divider,
    Select,
    Tooltip
} from 'antd';
import { 
    EyeOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined,
    SyncOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import orderService from '@/services/orderService';

const { Title, Text } = Typography;
const { Option } = Select;

const ReturnManagePage = () => {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [total, setTotal] = useState(0);
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        status: undefined
    });

    // Detail Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await orderService.getAdminReturnRequests(params);
            if (res && res.EC === 0) {
                setRequests(res.DT.requests);
                setTotal(res.DT.totalRows);
            } else {
                notification.error({
                    message: 'Lỗi',
                    description: res.EM || 'Không thể lấy danh sách yêu cầu trả hàng'
                });
            }
        } catch (error) {
            console.error(">>> Fetch Return Requests Error:", error);
            notification.error({
                message: 'Lỗi',
                description: 'Đã xảy ra lỗi khi kết nối với máy chủ'
            });
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleUpdateStatus = async (id, status) => {
        const statusLabel = status === 'APPROVED' ? 'Chấp nhận' : 'Từ chối';
        
        Modal.confirm({
            title: `Xác nhận ${statusLabel}`,
            content: `Bạn có chắc chắn muốn ${statusLabel.toLowerCase()} yêu cầu trả hàng này không?`,
            okText: 'Xác nhận',
            cancelText: 'Bỏ qua',
            okButtonProps: { 
                danger: status === 'REJECTED',
                loading: actionLoading 
            },
            onOk: async () => {
                setActionLoading(true);
                try {
                    const res = await orderService.updateReturnRequestStatus(id, status);
                    if (res && res.EC === 0) {
                        notification.success({
                            message: 'Thành công',
                            description: res.EM
                        });
                        setIsModalOpen(false);
                        fetchRequests();
                    } else {
                        notification.error({
                            message: 'Thất bại',
                            description: res.EM
                        });
                    }
                } catch (error) {
                    notification.error({
                        message: 'Lỗi',
                        description: 'Lỗi hệ thống khi cập nhật trạng thái'
                    });
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    const columns = [
        {
            title: 'Mã Yêu Cầu',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Text strong>#REQ-{id}</Text>,
            width: 120,
        },
        {
            title: 'Đơn Hàng',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (orderId) => <Text>#ORD-{orderId}</Text>,
            width: 120,
        },
        {
            title: 'Khách Hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{user?.fullName || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{user?.phone}</Text>
                </Space>
            ),
        },
        {
            title: 'Tổng Tiền',
            dataIndex: 'order',
            key: 'amount',
            render: (order) => (
                <Text strong text-danger>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order?.finalAmount || 0)}
                </Text>
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'gold';
                let label = 'Chờ duyệt';
                if (status === 'APPROVED') { color = 'green'; label = 'Đã duyệt'; }
                if (status === 'REJECTED') { color = 'red'; label = 'Từ chối'; }
                if (status === 'REFUNDED') { color = 'blue'; label = 'Đã hoàn tiền'; }
                return <Tag color={color}>{label.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Xem chi tiết">
                        <Button 
                            type="primary" 
                            icon={<EyeOutlined />} 
                            onClick={() => {
                                setSelectedItem(record);
                                setIsModalOpen(true);
                            }} 
                        />
                    </Tooltip>
                    {record.status === 'PENDING' && (
                        <>
                            <Tooltip title="Chấp nhận">
                                <Button 
                                    style={{ color: '#52c41a', borderColor: '#52c41a' }}
                                    icon={<CheckCircleOutlined />} 
                                    onClick={() => handleUpdateStatus(record.id, 'APPROVED')}
                                />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button 
                                    danger
                                    icon={<CloseCircleOutlined />} 
                                    onClick={() => handleUpdateStatus(record.id, 'REJECTED')}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={3} style={{ margin: 0 }}>
                        <FileTextOutlined style={{ marginRight: 8 }} />
                        Quản Lý Yêu Cầu Trả Hàng
                    </Title>
                    <Space>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            style={{ width: 200 }}
                            allowClear
                            onChange={(val) => setParams(prev => ({ ...prev, status: val, page: 1 }))}
                        >
                            <Option value="PENDING">Đang chờ duyệt</Option>
                            <Option value="APPROVED">Đã phê duyệt</Option>
                            <Option value="REJECTED">Đã từ chối</Option>
                            <Option value="REFUNDED">Đã hoàn tiền</Option>
                        </Select>
                        <Button 
                            icon={<SyncOutlined spin={loading} />} 
                            onClick={() => fetchRequests()}
                        >
                            Làm mới
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={requests}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: params.page,
                        pageSize: params.limit,
                        total: total,
                        onChange: (page) => setParams(prev => ({ ...prev, page })),
                        showSizeChanger: false
                    }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title={<Title level={4}>Chi Tiết Yêu Cầu #{selectedItem?.id}</Title>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>Đóng</Button>,
                    selectedItem?.status === 'PENDING' && (
                        <Button 
                            key="reject" 
                            danger 
                            onClick={() => handleUpdateStatus(selectedItem.id, 'REJECTED')}
                        >
                            Từ chối
                        </Button>
                    ),
                    selectedItem?.status === 'PENDING' && (
                        <Button 
                            key="approve" 
                            type="primary" 
                            onClick={() => handleUpdateStatus(selectedItem.id, 'APPROVED')}
                        >
                            Chấp nhận & Hoàn kho
                        </Button>
                    )
                ]}
                width={800}
            >
                {selectedItem && (
                    <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Mã Đơn Hàng" span={2}>
                                <Text strong>#ORD-{selectedItem.orderId}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách Hàng">
                                {selectedItem.user?.fullName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số Điện Thoại">
                                {selectedItem.user?.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email" span={2}>
                                {selectedItem.user?.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương Thức TT">
                                {selectedItem.order?.paymentMethod}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá Trị Đơn">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedItem.order?.finalAmount || 0)}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Lý Do Trả Hàng</Divider>
                        <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
                            <Text italic>"{selectedItem.reason}"</Text>
                        </div>

                        <Divider orientation="left">Hình Ảnh Minh Chứng</Divider>
                        <Space wrap size={[16, 16]}>
                            {(() => {
                                try {
                                    const images = JSON.parse(selectedItem.images || '[]');
                                    return images.length > 0 ? images.map((img, idx) => (
                                        <Image
                                            key={idx}
                                            width={150}
                                            src={img}
                                            placeholder={<div style={{ width: 150, height: 150, background: '#eee' }} />}
                                        />
                                    )) : <Text type="secondary">Không có hình ảnh đính kèm</Text>;
                                } catch (e) {
                                    return <Text type="secondary">Không thể load hình ảnh</Text>;
                                }
                            })()}
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ReturnManagePage;
