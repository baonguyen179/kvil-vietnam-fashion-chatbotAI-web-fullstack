import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Spin, Alert, Progress } from 'antd';
import reportService from '@/services/reportService';

const InventoryTab = ({ dateRange, refresh, onRefreshComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ lowStock: [], overstock: [], sellThrough: [] });

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

                const [lowRes, overRes, sellRes] = await Promise.all([
                    reportService.getLowStock(params),
                    reportService.getOverstock(params),
                    reportService.getSellThrough(params)
                ]);

                if (lowRes.EC === 0 && overRes.EC === 0 && sellRes.EC === 0) {
                    setData({
                        lowStock: lowRes.DT || [],
                        overstock: overRes.DT || [],
                        sellThrough: sellRes.DT || []
                    });
                } else {
                    setError('Không tải được dữ liệu quản lý kho');
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

    if (loading) return <div className="py-10 text-center"><Spin size="large" description="Đang tải dữ liệu kho hàng..." /></div>;
    if (error) return <Alert message={error} type="error" showIcon className="my-5" />;

    const lowStockColumns = [
        { title: 'Sản phẩm', dataIndex: 'product', key: 'product', render: (text) => <span className="font-medium">{text}</span> },
        { title: 'SKU / Biến thể', dataIndex: 'sku', key: 'sku', render: (sku, r) => <div className="text-xs text-gray-500 font-mono">{sku} ({r.color} - {r.size})</div> },
        { 
            title: 'Tồn kho', 
            dataIndex: 'stock', 
            key: 'stock', 
            render: (stock) => {
                const isUrgent = stock < 3;
                return <Tag color={isUrgent ? 'red' : 'orange'} className="font-bold">{stock} (Cảnh báo {isUrgent ? 'Đỏ' : 'Vàng'})</Tag>;
            } 
        }
    ];

    const overstockColumns = [
        { title: 'Sản phẩm', dataIndex: 'name', key: 'name', render: (text) => <span className="font-medium">{text}</span> },
        { title: 'Tổng lượng tồn', dataIndex: 'totalStock', key: 'totalStock', render: (val) => <span className="font-semibold">{val}</span> },
        { 
            title: 'Giá trị chôn vốn (ước tính)', 
            dataIndex: 'estimatedValue', 
            key: 'estimatedValue', 
            render: (val) => <span className="font-bold text-red-600">{Number(val).toLocaleString('vi-VN')}đ</span> 
        }
    ];

    const sellThroughColumns = [
        { title: 'Sản phẩm', dataIndex: 'name', key: 'name', render: (text) => <span className="font-medium">{text}</span> },
        { title: 'Bán ra', dataIndex: 'sold', key: 'sold' },
        { title: 'Nhập vào', dataIndex: 'imported', key: 'imported' },
        { 
            title: 'Tỷ lệ bán hết (STR)', 
            dataIndex: 'sellThroughRate', 
            key: 'sellThroughRate', 
            render: (rate) => {
                if (rate === null || rate === undefined) return <span className="text-gray-400">N/A</span>;
                let color = 'blue';
                let actionStr = 'Theo dõi';
                if (rate > 80) {
                    color = 'green';
                    actionStr = 'Nhập thêm ngay';
                } else if (rate < 30) {
                    color = 'red';
                    actionStr = 'Flash sale / Xả hàng';
                }
                return (
                    <div className="flex items-center gap-2">
                        <Progress percent={rate} size="small" strokeColor={rate > 80 ? '#10b981' : rate < 30 ? '#ef4444' : '#3b82f6'} style={{ width: 80 }} />
                        <Tag color={color} className="font-semibold">{rate}% - {actionStr}</Tag>
                    </div>
                );
            } 
        }
    ];

    return (
        <div className="space-y-6">
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="⚠️ Cảnh báo sắp hết hàng" className="shadow-sm border-none">
                        <Table
                            dataSource={data.lowStock}
                            columns={lowStockColumns}
                            rowKey="sku"
                            pagination={{ pageSize: 5 }}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="💰 Hàng tồn chôn vốn nhiều nhất" className="shadow-sm border-none">
                        <Table
                            dataSource={data.overstock}
                            columns={overstockColumns}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="📊 Tốc độ bán hàng (Sell-through Rate)" className="shadow-sm border-none">
                <Table
                    dataSource={data.sellThrough}
                    columns={sellThroughColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    size="small"
                />
            </Card>
        </div>
    );
};

export default InventoryTab;
