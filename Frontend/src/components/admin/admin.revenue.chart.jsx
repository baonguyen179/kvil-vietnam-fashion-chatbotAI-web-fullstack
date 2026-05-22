import React from 'react';
import { Card, Empty, Skeleton } from 'antd';
import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
            <p className="font-semibold text-gray-700 mb-2">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-600">{p.name}:</span>
                    <span className="font-medium">
                        {p.dataKey === 'revenue'
                            ? `${Number(p.value).toLocaleString('vi-VN')}đ`
                            : p.value
                        }
                    </span>
                </div>
            ))}
        </div>
    );
};

// ─── Revenue axis formatter ───────────────────────────────────────────────────
const formatRevenue = (val) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}tr`;
    if (val >= 1_000)     return `${(val / 1_000).toFixed(0)}k`;
    return val;
};

// ─── Component ───────────────────────────────────────────────────────────────
const AdminRevenueChart = ({ chartData, loading }) => {
    if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

    if (!chartData || chartData.length === 0) {
        return (
            <Empty
                description="Không có dữ liệu trong khoảng thời gian này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    // Format lại data: parse number, format date ngắn gọn
    const data = chartData.map((item) => ({
        ...item,
        revenue:    parseFloat(item.revenue)    || 0,
        orderCount: parseInt(item.orderCount)   || 0,
        // Hiển thị "dd/MM" thay vì full ISO date
        label: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    }));

    return (
        <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                />

                {/* Trục trái: Doanh thu */}
                <YAxis
                    yAxisId="revenue"
                    orientation="left"
                    tickFormatter={formatRevenue}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                />

                {/* Trục phải: Số đơn */}
                <YAxis
                    yAxisId="orders"
                    orientation="right"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                />

                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
                    formatter={(value) => value === 'revenue' ? 'Doanh thu (đ)' : 'Số đơn'}
                />

                <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    dot={false}
                    activeDot={{ r: 5 }}
                />
                <Area
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orderCount"
                    name="orderCount"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#colorOrders)"
                    dot={false}
                    activeDot={{ r: 5 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default AdminRevenueChart;
