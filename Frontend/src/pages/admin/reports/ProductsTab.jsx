import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Table } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import reportService from '@/services/reportService';

const ProductsTab = ({ dateRange, refresh, onRefreshComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ topProducts: [], slowProducts: [] });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    startDate: dateRange[0]?.toISOString(),
                    endDate: dateRange[1]?.toISOString(),
                    refresh: refresh ? true : undefined,
                    limit: 10
                };

                const [topRes, slowRes] = await Promise.all([
                    reportService.getTopProducts(params),
                    reportService.getSlowProducts(params)
                ]);

                if (topRes.EC === 0 && slowRes.EC === 0) {
                    setData({
                        topProducts: topRes.DT || [],
                        slowProducts: slowRes.DT || []
                    });
                } else {
                    setError('Không tải được dữ liệu sản phẩm');
                }
            } catch (err) {
                console.error(err);
                setError('Lỗi kết nối máy chủ');
            } finally {
                setLoading(false);
                if (onRefreshComplete) onRefreshComplete();
            }
        };

        fetchData();
    }, [dateRange, refresh]);

    if (loading) return <div className="py-10 text-center"><Spin size="large" description="Đang tải dữ liệu sản phẩm..." /></div>;
    if (error) return <Alert message={error} type="error" showIcon className="my-5" />;

    const slowColumns = [
        { title: 'Sản phẩm', dataIndex: 'name', key: 'name', render: (text) => <span className="font-medium">{text}</span> },
        { title: 'Số lượng bán (30 ngày)', dataIndex: 'totalSold', key: 'totalSold', render: (val) => <span className="text-gray-500 font-semibold">{val}</span> },
        { title: 'Tồn kho hiện tại', dataIndex: 'currentStock', key: 'currentStock', render: (val) => <span className="text-amber-600 font-semibold">{val}</span> }
    ];

    return (
        <div className="space-y-6">
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="🔥 Top 10 Sản phẩm bán chạy nhất" className="shadow-sm border-none">
                        {data.topProducts.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart
                                    data={data.topProducts}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        stroke="#4b5563" 
                                        fontSize={10} 
                                        width={100}
                                        tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 15)}...` : val}
                                    />
                                    <Tooltip 
                                        formatter={(val) => [`${val} sản phẩm`, 'Đã bán']}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} 
                                    />
                                    <Bar dataKey="totalSold" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="py-10 text-center text-gray-400">Không có dữ liệu</div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="❄️ Top 10 Sản phẩm bán chậm nhất" className="shadow-sm border-none">
                        {data.slowProducts.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart
                                    data={data.slowProducts}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" stroke="#9ca3af" fontSize={11} />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        stroke="#4b5563" 
                                        fontSize={10} 
                                        width={100}
                                        tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 15)}...` : val}
                                    />
                                    <Tooltip 
                                        formatter={(val, name, props) => [`${val} sản phẩm (Tồn: ${props.payload.currentStock})`, 'Đã bán']}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} 
                                    />
                                    <Bar dataKey="totalSold" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="py-10 text-center text-gray-400">Không có dữ liệu</div>
                        )}
                    </Card>
                </Col>
            </Row>

            <Card title="📋 Bảng danh sách hàng bán chậm chôn kho" className="shadow-sm border-none">
                <Table
                    dataSource={data.slowProducts}
                    columns={slowColumns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default ProductsTab;
