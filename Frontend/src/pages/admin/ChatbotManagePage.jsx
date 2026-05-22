import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, Table, Typography, Button, Space, Tag, Badge,
    Tooltip, Input, Select, DatePicker, message as antdMessage, Popconfirm, Flex, App
} from 'antd';
import {
    ReloadOutlined, FilterOutlined, SearchOutlined,
    EyeOutlined, DeleteOutlined, UserOutlined, RobotOutlined,
    MessageOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import chatbotService from '@/services/chatbotService';
import ChatbotStatsCards from '@/components/admin/admin.chatbot.stats';
import ChatbotSessionDetailDrawer from '@/components/admin/admin.chatbot.session.detail.drawer';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TYPE_OPTIONS = [
    { value: 'all',   label: 'Tất cả phiên' },
    { value: 'user',  label: 'Người dùng đăng nhập' },
    { value: 'guest', label: 'Khách vãng lai' },
];

const DEFAULT_FILTERS = { search: '', type: 'all', dateRange: [] };

const formatDateTime = (val) =>
    val
        ? new Date(val).toLocaleString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
          })
        : '—';

const formatDuration = (startedAt, lastActivity) => {
    if (!startedAt || !lastActivity) return '—';
    const diff = Math.round((new Date(lastActivity) - new Date(startedAt)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}p ${diff % 60}s`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}p`;
};

const ChatbotManagePage = () => {
    const { message } = App.useApp();
    const [stats, setStats]           = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    const [sessions, setSessions]     = useState([]);
    const [loading, setLoading]       = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [filters, setFilters]       = useState(DEFAULT_FILTERS);

    const [drawerOpen, setDrawerOpen]         = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await chatbotService.getAdminChatStats();
            if (res?.EC === 0) setStats(res.DT);
            else message.warning(res?.EM || 'Không lấy được thống kê');
        } catch {
            message.error('Lỗi kết nối khi tải thống kê');
        } finally {
            setStatsLoading(false);
        }
    }, []);

    const fetchSessions = useCallback(async (
        page      = 1,
        limit     = 20,
        activeFilters = filters
    ) => {
        setLoading(true);
        try {
            const { search, type, dateRange } = activeFilters;
            const params = {
                page,
                limit,
                ...(search  ? { search }                               : {}),
                ...(type !== 'all' ? { type }                          : {}),
                ...(dateRange?.[0] ? { startDate: dateRange[0].format('YYYY-MM-DD') } : {}),
                ...(dateRange?.[1] ? { endDate:   dateRange[1].format('YYYY-MM-DD') } : {}),
            };

            const res = await chatbotService.getAdminChatSessions(params);
            if (res?.EC === 0 && res.DT) {
                setSessions(res.DT.sessions || []);
                setPagination(prev => ({
                    ...prev,
                    current:    res.DT.currentPage,
                    total:      res.DT.totalItems,
                }));
            } else {
                message.error(res?.EM || 'Không lấy được danh sách phiên');
            }
        } catch {
            message.error('Lỗi kết nối máy chủ');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchStats();
        fetchSessions(1, pagination.pageSize, DEFAULT_FILTERS);
    }, []);

    const handleRefreshAll = () => {
        fetchStats();
        fetchSessions(pagination.current, pagination.pageSize, filters);
    };

    const applyFilter = (key, value) => {
        const next = { ...filters, [key]: value };
        setFilters(next);
        fetchSessions(1, pagination.pageSize, next);
    };

    const handleResetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        fetchSessions(1, pagination.pageSize, DEFAULT_FILTERS);
    };

    const hasActiveFilter =
        filters.search !== '' ||
        filters.type   !== 'all' ||
        filters.dateRange.length > 0;

    const handleTableChange = (newPag) => {
        setPagination(prev => ({ ...prev, current: newPag.current, pageSize: newPag.pageSize }));
        fetchSessions(newPag.current, newPag.pageSize, filters);
    };

    const handleDeleteSession = async (sessionId) => {
        setDeletingId(sessionId);
        try {
            const res = await chatbotService.deleteSession(sessionId);
            if (res?.EC === 0) {
                message.success(res.EM || 'Đã xóa phiên chat!');
                setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
                setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
                fetchStats();
            } else {
                message.error(res?.EM || 'Xóa thất bại!');
            }
        } catch {
            message.error('Lỗi kết nối khi xóa');
        } finally {
            setDeletingId(null);
        }
    };

    const openDetail = (sessionId) => {
        setSelectedSessionId(sessionId);
        setDrawerOpen(true);
    };

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 50,
            render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1,
        },
        {
            title: 'Session ID',
            dataIndex: 'sessionId',
            key: 'sessionId',
            ellipsis: true,
            render: (id, record) => (
                <Flex vertical gap={2}>
                    <Tooltip title={id} placement="topLeft">
                        <Text
                            className="font-mono text-xs text-blue-700 cursor-pointer hover:underline"
                            onClick={() => openDetail(id)}
                            style={{ maxWidth: 200 }}
                            ellipsis
                        >
                            {id}
                        </Text>
                    </Tooltip>
                    {record.userId ? (
                        <Tag
                            icon={<UserOutlined />}
                            color="purple"
                            className="text-xs w-fit"
                        >
                            User #{record.userId}
                        </Tag>
                    ) : (
                        <Tag color="default" className="text-xs w-fit">
                            Khách vãng lai
                        </Tag>
                    )}
                </Flex>
            ),
        },
        {
            title: 'Tin nhắn',
            key: 'messages',
            width: 180,
            render: (_, record) => (
                <Flex gap={6} align="center" wrap="wrap">
                    <Tooltip title="Tổng">
                        <Tag icon={<MessageOutlined />} color="blue">
                            {record.totalMessages}
                        </Tag>
                    </Tooltip>
                    <Tooltip title="Người dùng">
                        <Tag icon={<UserOutlined />} color="purple">
                            {record.userMessages}
                        </Tag>
                    </Tooltip>
                    <Tooltip title="BOT">
                        <Tag icon={<RobotOutlined />} color="cyan">
                            {record.botMessages}
                        </Tag>
                    </Tooltip>
                </Flex>
            ),
        },
        {
            title: 'Thời lượng',
            key: 'duration',
            width: 110,
            render: (_, record) => (
                <Tooltip
                    title={`Bắt đầu: ${formatDateTime(record.startedAt)}`}
                    placement="top"
                >
                    <Tag icon={<ClockCircleOutlined />} color="default" className="text-xs">
                        {formatDuration(record.startedAt, record.lastActivity)}
                    </Tag>
                </Tooltip>
            ),
        },
        {
            title: 'Hoạt động cuối',
            dataIndex: 'lastActivity',
            key: 'lastActivity',
            width: 155,
            render: (val) => (
                <Text className="text-xs text-gray-500">{formatDateTime(val)}</Text>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 120,
            render: (_, record) => {
                const isGuest = record.isGuest;
                return (
                    <Badge
                        status={isGuest ? 'default' : 'success'}
                        text={
                            <Tag color={isGuest ? 'default' : 'green'} className="text-xs">
                                {isGuest ? 'Khách' : 'Thành viên'}
                            </Tag>
                        }
                    />
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem log">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<EyeOutlined />}
                            className="text-blue-500 hover:bg-blue-50"
                            onClick={() => openDetail(record.sessionId)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa phiên chat"
                        description={`Xóa toàn bộ ${record.totalMessages} tin nhắn của phiên này?`}
                        onConfirm={() => handleDeleteSession(record.sessionId)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa phiên">
                            <Button
                                type="text"
                                shape="circle"
                                danger
                                icon={<DeleteOutlined />}
                                loading={deletingId === record.sessionId}
                                className="hover:bg-red-50"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card className="shadow-md rounded-xl border-none">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <Title level={4} className="m-0">
                        Giám sát Chatbot AI
                    </Title>
                    <p className="text-gray-500 mt-1 mb-0 text-sm">
                        Theo dõi và quản lý toàn bộ lịch sử các phiên trò chuyện
                    </p>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefreshAll}
                    loading={loading || statsLoading}
                >
                    Làm mới
                </Button>
            </div>

            <ChatbotStatsCards stats={stats} loading={statsLoading} />

            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Space align="center" className="mr-1">
                    <FilterOutlined className="text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">Bộ lọc:</span>
                </Space>

                <Input.Search
                    id="chatbot-search"
                    placeholder="Tìm theo nội dung tin nhắn..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    className="w-[260px]"
                    value={filters.search}
                    onSearch={(v) => applyFilter('search', v)}
                    onChange={(e) => !e.target.value && applyFilter('search', '')}
                />

                <Select
                    id="chatbot-type-filter"
                    className="w-[200px]"
                    value={filters.type}
                    onChange={(v) => applyFilter('type', v)}
                    options={TYPE_OPTIONS}
                />

                <RangePicker
                    id="chatbot-date-range"
                    format="DD/MM/YYYY"
                    placeholder={['Từ ngày', 'Đến ngày']}
                    value={filters.dateRange}
                    onChange={(dates) => applyFilter('dateRange', dates || [])}
                    className="w-[240px]"
                    disabledDate={(d) => d && d > dayjs().endOf('day')}
                />

                {hasActiveFilter && (
                    <Button
                        danger
                        size="small"
                        onClick={handleResetFilters}
                        className="self-center"
                    >
                        Xóa bộ lọc
                    </Button>
                )}
            </div>

            <Table
                id="chatbot-sessions-table"
                columns={columns}
                dataSource={sessions}
                rowKey="sessionId"
                loading={loading}
                bordered
                scroll={{ x: 900 }}
                onChange={handleTableChange}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total, range) =>
                        `${range[0]}–${range[1]} / ${total} phiên`,
                }}
                rowClassName={(record) =>
                    record.isGuest ? 'opacity-80' : ''
                }
            />

            <ChatbotSessionDetailDrawer
                open={drawerOpen}
                sessionId={selectedSessionId}
                onClose={() => setDrawerOpen(false)}
            />
        </Card>
    );
};

export default ChatbotManagePage;
