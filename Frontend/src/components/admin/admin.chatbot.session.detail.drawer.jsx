import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Drawer, List, Avatar, Tag, Spin, Typography, Divider,
    Empty, Button, message, Pagination, Tooltip, Badge
} from 'antd';
import {
    UserOutlined, RobotOutlined, CloseOutlined,
    CopyOutlined, FileTextOutlined
} from '@ant-design/icons';
import chatbotService from '@/services/chatbotService';

const { Text, Paragraph } = Typography;

const PAGE_LIMIT = 50;

const ChatbotSessionDetailDrawer = ({ open, sessionId, onClose }) => {
    const [logs, setLogs]         = useState([]);
    const [loading, setLoading]   = useState(false);
    const [page, setPage]         = useState(1);
    const [total, setTotal]       = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const bottomRef               = useRef(null);

    const fetchLogs = useCallback(async (targetPage = 1) => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const res = await chatbotService.getAdminSessionDetail(sessionId, {
                page: targetPage,
                limit: PAGE_LIMIT,
            });
            if (res?.EC === 0 && res.DT) {
                setLogs(res.DT.logs || []);
                setTotal(res.DT.totalMessages || 0);
                setTotalPages(res.DT.totalPages || 1);
            } else {
                message.error(res?.EM || 'Không thể tải log phiên chat');
                setLogs([]);
            }
        } catch {
            message.error('Lỗi kết nối máy chủ');
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        if (open && sessionId) {
            setPage(1);
            setLogs([]);
            fetchLogs(1);
        }
    }, [open, sessionId]);

    const handlePageChange = (p) => {
        setPage(p);
        fetchLogs(p);
    };

    const copySessionId = () => {
        navigator.clipboard.writeText(sessionId || '').then(() =>
            message.success('Đã sao chép Session ID!')
        );
    };

    const renderLog = (log) => {
        const isBot    = log.sender === 'BOT';
        const hasHints = Array.isArray(log.suggestedProductIds) && log.suggestedProductIds.length > 0;

        return (
            <List.Item
                key={log.id}
                style={{ border: 'none', padding: '4px 0' }}
            >
                <div
                    className={`flex gap-3 w-full ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
                >
                    <Avatar
                        size={34}
                        icon={isBot ? <RobotOutlined /> : <UserOutlined />}
                        style={{
                            background: isBot ? '#13c2c2' : '#722ed1',
                            flexShrink: 0,
                        }}
                    />

                    <div
                        className={`max-w-[75%] flex flex-col gap-1 ${
                            isBot ? 'items-start' : 'items-end'
                        }`}
                    >
                        <div
                            style={{
                                background: isBot ? '#f0fafa' : '#f5f0ff',
                                border: `1px solid ${isBot ? '#b5e8e8' : '#d3adf7'}`,
                                borderRadius: isBot
                                    ? '0 12px 12px 12px'
                                    : '12px 0 12px 12px',
                                padding: '8px 12px',
                                wordBreak: 'break-word',
                            }}
                        >
                            <Paragraph
                                style={{ margin: 0, fontSize: 13 }}
                                copyable={false}
                            >
                                {log.message}
                            </Paragraph>
                        </div>

                        {hasHints && (
                            <div className="flex flex-wrap gap-1">
                                {log.suggestedProductIds.map((product) => {
                                    const id = typeof product === 'object' && product !== null ? product.id : product;
                                    const name = typeof product === 'object' && product !== null ? product.name : '';
                                    return (
                                        <Tooltip key={id} title={name || `Sản phẩm #${id}`}>
                                            <Tag color="purple" className="text-xs rounded-full cursor-pointer">
                                                SP #{id}
                                            </Tag>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        )}

                        <Text
                            type="secondary"
                            style={{ fontSize: 11 }}
                            className={isBot ? 'text-left' : 'text-right'}
                        >
                            {new Date(log.createdAt).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                            })}
                        </Text>
                    </div>
                </div>
            </List.Item>
        );
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-purple-500" />
                    <span className="font-semibold text-gray-700 text-sm">Chi tiết phiên chat</span>
                    {sessionId && (
                        <Tooltip title="Sao chép Session ID">
                            <Button
                                size="small"
                                type="text"
                                icon={<CopyOutlined />}
                                onClick={copySessionId}
                                className="ml-1 text-gray-400 hover:text-gray-700"
                            />
                        </Tooltip>
                    )}
                </div>
            }
            closeIcon={<CloseOutlined />}
            size="large"
            destroyOnClose
            styles={{ body: { padding: '12px 16px', overflowY: 'auto' } }}
            footer={
                totalPages > 1 && (
                    <div className="flex justify-center py-2">
                        <Pagination
                            current={page}
                            total={total}
                            pageSize={PAGE_LIMIT}
                            onChange={handlePageChange}
                            showTotal={(t) => `${t} tin nhắn`}
                            size="small"
                        />
                    </div>
                )
            }
        >
            {sessionId && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">Session ID:</span>{' '}
                    <span className="font-mono break-all">{sessionId}</span>
                    <span className="ml-3">
                        <Badge
                            status={loading ? 'processing' : 'success'}
                            text={`${total} tin nhắn`}
                        />
                    </span>
                </div>
            )}

            <Divider className="mt-0 mb-3" />

            {loading ? (
                <div className="flex justify-center items-center" style={{ minHeight: 200 }}>
                    <Spin tip="Đang tải log..." />
                </div>
            ) : logs.length === 0 ? (
                <Empty description="Không có log nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
                <List
                    dataSource={logs}
                    renderItem={renderLog}
                    split={false}
                />
            )}

            <div ref={bottomRef} />
        </Drawer>
    );
};

export default ChatbotSessionDetailDrawer;
