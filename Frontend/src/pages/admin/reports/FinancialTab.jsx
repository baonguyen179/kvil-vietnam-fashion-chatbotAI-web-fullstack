import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Table } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import reportService from '@/services/reportService';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const FinancialTab = ({ dateRange, refresh, onRefreshComplete, showProfit }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ categoryRevenue: [], profit: [] });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    startDate: dateRange[0]?.toISOString(),
                    endDate: dateRange[1]?.toISOString(),
                    refresh: refresh ? true : undefined
                };

                const promises = [
                    reportService.getRevenueByCategory(params)
                ];

                if (showProfit) {
                    promises.push(reportService.getProfit(params));
                }

                const results = await Promise.all(promises);

                setData({
                    categoryRevenue: results[0]?.DT || [],
                    profit: showProfit ? (results[1]?.DT || []) : []
                });
            } catch (err) {
                console.error(err);
                setError('Lỗi kết nối máy chủ');
            } finally {
                setLoading(false);
                if (onRefreshComplete) onRefreshComplete();
            }
        };

        fetchData();
    }, [dateRange, refresh, showProfit]);

    if (loading) return <div className="py-10 text-center"><Spin size="large" description="Đang tải dữ liệu tài chính..." /></div>;
    if (error) return <Alert message={error} type="error" showIcon className="my-5" />;

    const profitColumns = [
        { title: 'Tháng / Năm', dataIndex: 'month', key: 'month', render: (val, r) => <span className="font-semibold">{val}/{r.year}</span> },
        { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: (val) => `${Number(val).toLocaleString('vi-VN')}đ` },
        { title: 'Giá vốn (COGS)', dataIndex: 'cogs', key: 'cogs', render: (val) => `${Number(val).toLocaleString('vi-VN')}đ` },
        { title: 'Lợi nhuận gộp', dataIndex: 'grossProfit', key: 'grossProfit', render: (val) => <span className="text-green-600 font-bold">{Number(val).toLocaleString('vi-VN')}đ</span> },
        { title: 'Biên lợi nhuận', dataIndex: 'marginPercent', key: 'marginPercent', render: (val) => <span className="font-semibold">{val}%</span> }
    ];

    const formatMoney = (val) => {
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}tr`;
        if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
        return val;
    };

    return (
        <div className="space-y-6">
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={10}>
                    <Card title="🍕 Doanh thu theo danh mục" className="shadow-sm border-none h-full">
                        {data.categoryRevenue.length > 0 ? (
                            <div className="flex flex-col items-center justify-center">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie
                                            data={data.categoryRevenue}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="revenue"
                                            nameKey="category"
                                        >
                                            {data.categoryRevenue.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val) => `${Number(val).toLocaleString('vi-VN')}đ`} />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="py-10 text-center text-gray-400">Không có dữ liệu</div>
                        )}
                    </Card>
                </Col>

                {showProfit && (
                    <Col xs={24} lg={14}>
                        <Card title="📊 Lợi nhuận gộp hàng tháng" className="shadow-sm border-none h-full">
                            {data.profit.length > 0 ? (
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={[...data.profit].reverse()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                                            </linearGradient>
                                            <linearGradient id="colorCogs" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                                            </linearGradient>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="month" stroke="#9ca3af" tickFormatter={(m, idx) => `T${m}/${[...data.profit].reverse()[idx]?.year}`} fontSize={11} />
                                        <YAxis tickFormatter={formatMoney} stroke="#9ca3af" fontSize={11} />
                                        <Tooltip formatter={(val) => `${Number(val).toLocaleString('vi-VN')}đ`} />
                                        <Legend />
                                        <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" />
                                        <Area type="monotone" dataKey="cogs" name="Giá vốn" stroke="#ef4444" fillOpacity={1} fill="url(#colorCogs)" />
                                        <Area type="monotone" dataKey="grossProfit" name="Lợi nhuận gộp" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="py-10 text-center text-gray-400">Không có dữ liệu để vẽ biểu đồ lợi nhuận</div>
                            )}
                        </Card>
                    </Col>
                )}
            </Row>

            {showProfit && (
                <Card title="📋 Bảng thống kê doanh thu & lợi nhuận hàng tháng" className="shadow-sm border-none">
                    <Table
                        dataSource={data.profit}
                        columns={profitColumns}
                        rowKey={(r) => `${r.month}-${r.year}`}
                        pagination={false}
                        size="small"
                    />
                </Card>
            )}
        </div>
    );
};

export default FinancialTab;
