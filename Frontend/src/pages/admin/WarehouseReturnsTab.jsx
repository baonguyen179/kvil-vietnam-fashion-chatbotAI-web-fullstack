import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tooltip, Typography, App, Modal, Radio, Image, Descriptions, Divider, Tag } from 'antd';
import { CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import orderService from '@/services/orderService';
import dayjs from 'dayjs';

const { Text } = Typography;

const WarehouseReturnsTab = ({ canReceiveReturn, onActionSuccess }) => {
    const { message } = App.useApp();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });

    // Confirmation Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmingId, setConfirmingId] = useState(null);
    const [stockCondition, setStockCondition] = useState('good');
    const [submitting, setSubmitting] = useState(false);

    const fetchReturnRequests = async (page = 1, limit = 5) => {
        setLoading(true);
        try {
            const res = await orderService.getAdminReturnRequests({
                page,
                limit,
                status: 'APPROVED'
            });
            if (res && res.EC === 0) {
                setRequests(res.DT.requests || []);
                setPagination({
                    current: page,
                    pageSize: limit,
                    total: res.DT.totalRows || 0,
                });
            } else {
                message.error(res.EM || 'Không tải được danh sách yêu cầu trả hàng');
            }
        } catch (error) {
            console.error('>>> Error fetching return requests:', error);
            message.error('Lỗi kết nối khi tải danh sách yêu cầu trả hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturnRequests(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange = (newPagination) => {
        fetchReturnRequests(newPagination.current, newPagination.pageSize);
    };

    const handleOpenConfirm = (id) => {
        setConfirmingId(id);
        setStockCondition('good');
        setIsModalOpen(true);
    };

    const handleConfirmReceived = async () => {
        setSubmitting(true);
        try {
            const res = await orderService.confirmReturnReceived(confirmingId, { stockCondition });
            if (res && res.EC === 0) {
                message.success('Xác nhận nhận hàng hoàn thành công!');
                setIsModalOpen(false);
                onActionSuccess();
                fetchReturnRequests(pagination.current, pagination.pageSize);
            } else {
                message.error(res.EM || 'Xác nhận thất bại');
            }
        } catch (error) {
            console.error('>>> Error confirming return receipt:', error);
            message.error('Lỗi hệ thống khi xác nhận nhận hàng hoàn');
        } finally {
            setSubmitting(false);
        }
    };

    const parseBankInfo = (reason) => {
        if (!reason) return null;
        const match = reason.match(/^\[Thông tin hoàn tiền:\s*([^\]]+)\]/);
        if (!match) return null;
        const parts = match[1].split(' - ');
        return {
            bankName: parts[0] || 'N/A',
            accountNumber: parts[1] || 'N/A',
            accountHolder: parts[2] || 'N/A'
        };
    };

    const displayReasonOnly = (reason) => {
        if (!reason) return '';
        return reason.replace(/^\[Thông tin hoàn tiền:\s*[^\]]+\]\s*-\s*Lý do:\s*/, '');
    };

    const expandedRowRender = (record) => {
        const bankInfo = parseBankInfo(record.reason);
        let parsedImages = [];
        try {
            parsedImages = JSON.parse(record.images || '[]');
        } catch (e) {
            console.error(e);
        }

        return (
            <div className="p-4 bg-gray-50/50 border rounded-lg space-y-4">
                <Descriptions title="Chi tiết yêu cầu trả hàng" size="small" bordered column={2}>
                    <Descriptions.Item label="Lý do trả hàng" span={2}>
                        <Text italic>"{displayReasonOnly(record.reason)}"</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức TT">
                        {record.order?.paymentMethod}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số tiền hoàn dự kiến">
                        <Text strong color="red">
                            {Number(record.order?.finalAmount || 0).toLocaleString('vi-VN')} đ
                        </Text>
                    </Descriptions.Item>
                </Descriptions>

                {bankInfo && (
                    <>
                        <Divider orientation="left" style={{ margin: '12px 0', fontSize: '12px' }}>Thông tin hoàn tiền COD</Divider>
                        <Descriptions size="small" bordered column={3}>
                            <Descriptions.Item label="Ngân hàng">{bankInfo.bankName}</Descriptions.Item>
                            <Descriptions.Item label="Số tài khoản"><Text strong copyable>{bankInfo.accountNumber}</Text></Descriptions.Item>
                            <Descriptions.Item label="Chủ tài khoản">{bankInfo.accountHolder}</Descriptions.Item>
                        </Descriptions>
                    </>
                )}

                {parsedImages.length > 0 && (
                    <>
                        <Divider orientation="left" style={{ margin: '12px 0', fontSize: '12px' }}>Hình ảnh minh chứng</Divider>
                        <Space wrap size={16}>
                            {parsedImages.map((img, idx) => (
                                <Image
                                    key={idx}
                                    width={100}
                                    height={100}
                                    src={img}
                                    className="object-cover rounded border"
                                    placeholder={<div className="w-24 h-24 bg-gray-100 animate-pulse" />}
                                />
                            ))}
                        </Space>
                    </>
                )}
            </div>
        );
    };

    const columns = [
        {
            title: 'Mã yêu cầu',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            render: (id) => <Text strong>#REQ-{id}</Text>
        },
        {
            title: 'Đơn hàng',
            dataIndex: 'orderId',
            key: 'orderId',
            width: 120,
            render: (orderId) => <Text style={{ color: '#1890ff' }}>#ORD-{orderId}</Text>
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Space orientation="vertical" size={0}>
                    <Text strong>{user?.fullName || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{user?.phone}</Text>
                </Space>
            )
        },
        {
            title: 'Thời gian yêu cầu',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix()
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: () => <Tag color="orange">CHỜ NHẬN HÀNG</Tag>
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: 180,
            render: (_, record) => {
                const btn = (
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        disabled={!canReceiveReturn}
                        onClick={() => handleOpenConfirm(record.id)}
                        size="small"
                        style={{ backgroundColor: canReceiveReturn ? '#52c41a' : undefined, borderColor: canReceiveReturn ? '#52c41a' : undefined }}
                    >
                        Xác nhận nhận hàng
                    </Button>
                );

                if (!canReceiveReturn) {
                    return (
                        <Tooltip title="Bạn không có quyền xác nhận nhận hàng hoàn (Yêu cầu: orders.update_receive_return)">
                            <div>{btn}</div>
                        </Tooltip>
                    );
                }
                return btn;
            }
        }
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={requests}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20'],
                    showTotal: (total) => `Tổng cộng ${total} yêu cầu trả hàng chờ nhận`
                }}
                onChange={handleTableChange}
                expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => true
                }}
                className="custom-admin-table"
            />

            <Modal
                title="Xác nhận đã nhận hàng hoàn vật lý"
                open={isModalOpen}
                onOk={handleConfirmReceived}
                onCancel={() => setIsModalOpen(false)}
                okText="Xác nhận & Nhập kho"
                cancelText="Hủy bỏ"
                confirmLoading={submitting}
                className="rounded-xl overflow-hidden"
            >
                <div className="py-4 space-y-4">
                    <Text>Vui lòng kiểm tra thực tế kiện hàng hoàn vật lý và phân loại tình trạng hàng:</Text>
                    <div className="flex justify-center pt-2">
                        <Radio.Group
                            onChange={(e) => setStockCondition(e.target.value)}
                            value={stockCondition}
                            optionType="button"
                            buttonStyle="solid"
                        >
                            <Radio.Button value="good" style={{ width: 180, textAlign: 'center' }}>
                                Nguyên vẹn (Cộng kho)
                            </Radio.Button>
                            <Radio.Button value="defective" style={{ width: 180, textAlign: 'center' }} danger>
                                Lỗi/Hỏng (Phế phẩm)
                            </Radio.Button>
                        </Radio.Group>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 border">
                        {stockCondition === 'good'
                            ? '* Hệ thống sẽ cộng lại số lượng sản phẩm vào kho bán lẻ trực tuyến và tự động tiến hành hoàn tiền cho khách.'
                            : '* Hệ thống sẽ ghi nhận hàng phế phẩm (RETURN_DEFECTIVE), KHÔNG cộng lại vào kho bán trực tuyến, và tiến hành hoàn tiền.'
                        }
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default WarehouseReturnsTab;
