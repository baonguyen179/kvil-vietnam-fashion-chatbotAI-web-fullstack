import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Space, Tag, message, Card, Typography,
    Tooltip, Badge, Select, Popconfirm, Input, Progress, Flex
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    ReloadOutlined, FilterOutlined, SearchOutlined
} from '@ant-design/icons';
import couponService from '@/services/couponService';
import AdminCouponModal from '@/components/admin/admin.coupon.modal';

const { Title, Text } = Typography;

const formatCurrency = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? '—' : `${num.toLocaleString('vi-VN')}đ`;
};

const formatDate = (val) =>
    val ? new Date(val).toLocaleDateString('vi-VN') : '—';

const isExpired = (endDate) =>
    endDate ? new Date(endDate) < new Date() : false;

const CouponManagePage = () => {
    const [coupons, setCoupons]   = useState([]);
    const [loading, setLoading]   = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ isActive: '', search: '' });

    // Modal
    const [isModalOpen, setIsModalOpen]       = useState(false);
    const [editingCoupon, setEditingCoupon]   = useState(null);

    const fetchCoupons = useCallback(async (page = 1, limit = 10, activeFilters = filters) => {
        setLoading(true);
        try {
            const params = { page, limit, ...activeFilters };
            if (params.isActive === 'true')  params.isActive = true;
            if (params.isActive === 'false') params.isActive = false;

            const res = await couponService.getAdminCoupons(params);
            if (res && res.EC === 0) {
                setCoupons(res.DT.coupons || []);
                setPagination(prev => ({
                    ...prev,
                    current: res.DT.currentPage,
                    total:   res.DT.totalItems,
                }));
            } else {
                message.error(res?.EM || 'Không lấy được danh sách!');
            }
        } catch {
            message.error('Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchCoupons(1, pagination.pageSize, filters);
    }, []);

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));
        fetchCoupons(newPagination.current, newPagination.pageSize, filters);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        fetchCoupons(1, pagination.pageSize, newFilters);
    };

    const handleSearch = (value) => handleFilterChange('search', value);

    const handleResetFilters = () => {
        const reset = { isActive: '', search: '' };
        setFilters(reset);
        fetchCoupons(1, pagination.pageSize, reset);
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            const res = await couponService.deleteCoupon(id);
            if (res && res.EC === 0) {
                message.success(res.EM || 'Xóa thành công!');
                // Optimistic: xóa ngay khỏi local state
                setCoupons(prev => prev.filter(c => c.id !== id));
            } else {
                message.error(res?.EM || 'Xóa thất bại!');
            }
        } catch {
            message.error('Lỗi kết nối khi xóa');
        } finally {
            setDeletingId(null);
        }
    };

    const openAddModal = () => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingCoupon(record);
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 55,
            render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1,
        },
        {
            title: 'Mã Code',
            dataIndex: 'code',
            key: 'code',
            render: (code, record) => (
                <Space direction="vertical" size={2}>
                    <Text className="font-mono font-bold text-blue-700 text-sm">{code}</Text>
                    {isExpired(record.endDate) && record.isActive && (
                        <Tag color="red" className="text-xs">Hết hạn</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            width: 160,
            render: (_, record) => {
                const isPercent = record.discountType === 'percent';
                const val = parseFloat(record.discountValue);
                return (
                    <Flex vertical gap={2}>
                        <Tag color={isPercent ? 'purple' : 'geekblue'} className="font-semibold">
                            {isPercent ? `${val}%` : formatCurrency(val)}
                        </Tag>
                        {isPercent && record.maxDiscountAmount && (
                            <Text type="secondary" className="text-xs">
                                Tối đa: {formatCurrency(record.maxDiscountAmount)}
                            </Text>
                        )}
                    </Flex>
                );
            },
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'minOrderValue',
            key: 'minOrderValue',
            width: 130,
            render: (val) => (
                <Text className="text-xs">
                    {parseFloat(val) > 0 ? formatCurrency(val) : <span className="text-gray-400 italic">Không giới hạn</span>}
                </Text>
            ),
        },
        {
            title: 'Thời hạn',
            key: 'dateRange',
            width: 160,
            render: (_, record) => {
                const expired = isExpired(record.endDate);
                return (
                    <Flex vertical gap={0}>
                        <Text className="text-xs text-gray-500">Từ: {formatDate(record.startDate)}</Text>
                        <Text className={`text-xs ${expired ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                            Đến: {formatDate(record.endDate)}
                        </Text>
                    </Flex>
                );
            },
        },
        {
            title: 'Lượt dùng',
            key: 'usage',
            width: 150,
            render: (_, record) => {
                const used  = parseInt(record.usedCount)  || 0;
                const limit = parseInt(record.usageLimit) || 1;
                const pct   = Math.min(Math.round((used / limit) * 100), 100);
                const status = pct >= 100 ? 'exception' : pct >= 80 ? 'normal' : 'success';
                return (
                    <div>
                        <Progress
                            percent={pct}
                            size="small"
                            status={status}
                            format={() => `${used}/${limit}`}
                        />
                    </div>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 110,
            render: (val, record) => {
                if (!val) return <Badge status="default" text={<Tag color="default">Tắt</Tag>} />;
                if (isExpired(record.endDate)) return <Badge status="error" text={<Tag color="orange">Hết hạn</Tag>} />;
                return <Badge status="success" text={<Tag color="green">Hoạt động</Tag>} />;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Sửa">
                        <Button
                            type="text" shape="circle"
                            icon={<EditOutlined />}
                            className="text-blue-500 hover:bg-blue-50"
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa mã giảm giá"
                        description={`Xác nhận xóa mã "${record.code}"? Hành động này không thể hoàn tác.`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text" shape="circle" danger
                                icon={<DeleteOutlined />}
                                loading={deletingId === record.id}
                                className="hover:bg-red-50"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const hasActiveFilter = filters.isActive !== '' || filters.search !== '';

    return (
        <Card className="shadow-md rounded-xl border-none">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <Title level={4} className="m-0">Quản lý Mã giảm giá</Title>
                    <p className="text-gray-500 mt-1 mb-0">
                        Tạo và quản lý các mã khuyến mãi, theo dõi lượt sử dụng
                    </p>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => fetchCoupons(pagination.current, pagination.pageSize, filters)}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type="primary" icon={<PlusOutlined />}
                        onClick={openAddModal}
                        className="bg-green-600 hover:bg-green-700 shadow-sm font-medium"
                    >
                        Tạo mã mới
                    </Button>
                </Space>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Space align="center" className="mr-1">
                    <FilterOutlined className="text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">Bộ lọc:</span>
                </Space>

                <Input.Search
                    placeholder="Tìm theo mã code..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    className="w-[220px]"
                    value={filters.search}
                    onSearch={handleSearch}
                    onChange={(e) => !e.target.value && handleFilterChange('search', '')}
                />

                <Select
                    className="w-[160px]"
                    value={filters.isActive}
                    onChange={(v) => handleFilterChange('isActive', v)}
                    options={[
                        { value: '',      label: 'Tất cả trạng thái' },
                        { value: 'true',  label: 'Đang kích hoạt' },
                        { value: 'false', label: 'Đã tắt' },
                    ]}
                />

                {hasActiveFilter && (
                    <Button danger size="small" onClick={handleResetFilters} className="self-center">
                        Xóa bộ lọc
                    </Button>
                )}
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={coupons}
                rowKey="id"
                loading={loading}
                onChange={handleTableChange}
                bordered
                scroll={{ x: 900 }}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} mã giảm giá`,
                }}
                rowClassName={(record) => {
                    if (!record.isActive) return 'opacity-50';
                    if (isExpired(record.endDate)) return 'bg-orange-50';
                    return '';
                }}
            />

            {/* Modal Tạo / Sửa */}
            <AdminCouponModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchCoupons(pagination.current, pagination.pageSize, filters)}
                editingCoupon={editingCoupon}
            />
        </Card>
    );
};

export default CouponManagePage;
