import React from 'react';
import { Row, Col, Card, Statistic, Skeleton, Tag, Tooltip } from 'antd';
import {
    MessageOutlined,
    ClockCircleOutlined,
    RobotOutlined,
    UserOutlined,
    ThunderboltOutlined,
    TeamOutlined,
} from '@ant-design/icons';

const ChatbotStatsCards = ({ stats, loading }) => {
    const cards = [
        {
            title: 'Tổng tin nhắn',
            value: stats?.totalMessages ?? 0,
            icon: <MessageOutlined className="text-blue-500" style={{ fontSize: 22 }} />,
            color: '#e6f4ff',
            suffix: 'tin',
        },
        {
            title: 'Tổng phiên chat',
            value: stats?.totalSessions ?? 0,
            icon: <TeamOutlined className="text-purple-500" style={{ fontSize: 22 }} />,
            color: '#f9f0ff',
            suffix: 'phiên',
        },
        {
            title: 'Hôm nay',
            value: stats?.todayMessages ?? 0,
            icon: <ClockCircleOutlined className="text-green-500" style={{ fontSize: 22 }} />,
            color: '#f6ffed',
            suffix: 'tin',
        },
        {
            title: 'Tin nhắn USER',
            value: stats?.userMessages ?? 0,
            icon: <UserOutlined className="text-orange-500" style={{ fontSize: 22 }} />,
            color: '#fff7e6',
            suffix: 'tin',
        },
        {
            title: 'Tin nhắn BOT',
            value: stats?.botMessages ?? 0,
            icon: <RobotOutlined className="text-cyan-500" style={{ fontSize: 22 }} />,
            color: '#e6fffb',
            suffix: 'tin',
        },
        {
            title: 'Tỷ lệ phản hồi',
            value: stats?.botResponseRate ?? 0,
            icon: <ThunderboltOutlined className="text-yellow-500" style={{ fontSize: 22 }} />,
            color: '#fffbe6',
            suffix: '%',
            tooltip: 'Tỷ lệ % số tin nhắn BOT / tổng tin nhắn',
        },
    ];

    return (
        <Row gutter={[16, 16]} className="mb-5">
            {cards.map((card, idx) => (
                <Col key={idx} xs={24} sm={12} md={8} lg={4}>
                    <Tooltip title={card.tooltip || ''} placement="top">
                        <Card
                            className="border-none shadow-sm rounded-xl h-full"
                            style={{ background: card.color }}
                            bodyStyle={{ padding: '16px 18px' }}
                        >
                            {loading ? (
                                <Skeleton active paragraph={false} />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="shrink-0">{card.icon}</div>
                                    <div className="min-w-0">
                                        <Statistic
                                            title={
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {card.title}
                                                </span>
                                            }
                                            value={card.value}
                                            suffix={
                                                <span className="text-xs text-gray-400 ml-1">
                                                    {card.suffix}
                                                </span>
                                            }
                                            valueStyle={{ fontSize: 20, fontWeight: 700 }}
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </Tooltip>
                </Col>
            ))}

            {!loading && stats?.topSessions?.length > 0 && (
                <Col span={24}>
                    <Card
                        className="border-none shadow-sm rounded-xl"
                        size="small"
                        title={
                            <span className="text-sm font-semibold text-gray-700">
                                🔥 Top 5 phiên chat hoạt động nhiều nhất
                            </span>
                        }
                    >
                        <div className="flex flex-wrap gap-2">
                            {stats.topSessions.map((s, i) => (
                                <Tooltip
                                    key={s.sessionId}
                                    title={`Session: ${s.sessionId}`}
                                    placement="top"
                                >
                                    <Tag
                                        color={i === 0 ? 'gold' : i === 1 ? 'silver' : 'default'}
                                        className="rounded-full px-3 py-1 text-xs cursor-default"
                                    >
                                        #{i + 1} &nbsp;
                                        {s.userId ? `User #${s.userId}` : 'Khách'} —{' '}
                                        {s.messageCount} tin
                                    </Tag>
                                </Tooltip>
                            ))}
                        </div>
                    </Card>
                </Col>
            )}
        </Row>
    );
};

export default ChatbotStatsCards;
