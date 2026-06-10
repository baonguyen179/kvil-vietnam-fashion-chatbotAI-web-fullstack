import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';
import {
    CarOutlined,
    ShopOutlined,
    RollbackOutlined,
    AlertOutlined
} from '@ant-design/icons';

const WarehouseStats = ({ stats = {}, loading = false }) => {
    const CARD_CONFIG = [
        {
            key: 'outboundCount',
            title: 'Chờ bàn giao ĐVVC',
            icon: <CarOutlined />,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            borderColor: 'border-l-orange-500',
            value: stats.outboundCount || 0,
            suffix: 'đơn',
            description: 'Đã xác nhận & cần giao ĐVVC',
        },
        {
            key: 'pickupCount',
            title: 'Khách nhận tại quầy',
            icon: <ShopOutlined />,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            borderColor: 'border-l-blue-500',
            value: stats.pickupCount || 0,
            suffix: 'đơn',
            description: 'Đã xác nhận & nhận tại quầy',
        },
        {
            key: 'returnCount',
            title: 'Chờ nhận hàng hoàn',
            icon: <RollbackOutlined />,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            borderColor: 'border-l-purple-500',
            value: stats.returnCount || 0,
            suffix: 'yêu cầu',
            description: 'Đã duyệt lý thuyết, chờ hàng về',
        },
        {
            key: 'lowStockCount',
            title: 'Biến thể tồn kho thấp',
            icon: <AlertOutlined />,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            borderColor: 'border-l-red-500',
            value: stats.lowStockCount || 0,
            suffix: 'SKU',
            description: 'Mức tồn kho dưới ngưỡng cảnh báo (<=10)',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                                    value={cfg.value}
                                    suffix={<span className="text-sm font-normal text-gray-400"> {cfg.suffix}</span>}
                                    styles={{ content: { fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 } }}
                                />
                                <p className="text-gray-400 text-xs mt-1">
                                    {cfg.description}
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

export default WarehouseStats;
