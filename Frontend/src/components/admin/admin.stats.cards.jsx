import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    ClockCircleOutlined,
    WalletOutlined,
    RiseOutlined
} from '@ant-design/icons';

const currencyFormatter = (val) => {
    const num = parseFloat(val) || 0;
    if (num >= 1_000_000_000)
        return `${(num / 1_000_000_000).toFixed(1)} tỷ`;
    if (num >= 1_000_000)
        return `${(num / 1_000_000).toFixed(1)} triệu`;
    return `${num.toLocaleString('vi-VN')}`;
};

// Config cards: dễ thêm card mới sau này
const CARD_CONFIG = [
    {
        key: 'totalRevenue',
        title: 'Doanh thu',
        icon: <DollarOutlined />,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        borderColor: 'border-l-green-500',
        formatter: currencyFormatter,
        suffix: 'đ',
        description: 'Đơn đã giao thành công',
    },
    {
        key: 'totalCost',
        title: 'Giá vốn',
        icon: <WalletOutlined />,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        borderColor: 'border-l-red-500',
        formatter: currencyFormatter,
        suffix: 'đ',
        description: 'Giá vốn đơn đã giao',
    },
    {
        key: 'grossProfit',
        title: 'Lợi nhuận gộp',
        icon: <RiseOutlined />,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        borderColor: 'border-l-purple-500',
        formatter: currencyFormatter,
        suffix: 'đ',
        description: (summary) => `Biên LN: ${parseFloat(summary?.profitMargin || 0).toFixed(1)}%`,
    },
    {
        key: 'totalOrders',
        title: 'Tổng đơn hàng',
        icon: <ShoppingCartOutlined />,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        borderColor: 'border-l-blue-500',
        formatter: (val) => `${parseInt(val) || 0}`,
        suffix: 'đơn',
        description: 'Không tính đơn đã hủy',
    },
    {
        key: 'pendingOrders',
        title: 'Chờ xử lý',
        icon: <ClockCircleOutlined />,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-500',
        borderColor: 'border-l-orange-400',
        formatter: (val) => `${parseInt(val) || 0}`,
        suffix: 'đơn',
        description: 'Đang chờ xác nhận',
    },
];

const AdminStatsCards = ({ summary, loading }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {CARD_CONFIG.map((cfg) => (
                <Card
                    key={cfg.key}
                    className={`shadow-sm rounded-xl border-l-4 ${cfg.borderColor} border-t-0 border-r-0 border-b-0`}
                    styles={{ body: { padding: '20px 24px' } }}
                >
                    {loading ? (
                        <Skeleton active paragraph={{ rows: 1 }} />
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm mb-1">{cfg.title}</p>
                                <Statistic
                                    value={cfg.formatter(summary?.[cfg.key])}
                                    suffix={<span className="text-sm font-normal text-gray-400">{cfg.suffix}</span>}
                                    styles={{ content: { fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 } }}
                                />
                                <p className="text-gray-400 text-xs mt-1">
                                    {typeof cfg.description === 'function' ? cfg.description(summary) : cfg.description}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-full ${cfg.iconBg} flex items-center justify-center text-xl ${cfg.iconColor}`}>
                                {cfg.icon}
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default AdminStatsCards;
