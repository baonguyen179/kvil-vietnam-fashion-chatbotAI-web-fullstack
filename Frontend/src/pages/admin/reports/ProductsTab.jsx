import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Table, Button } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileExcelOutlined } from '@ant-design/icons';
import reportService from '@/services/reportService';
import { exportMultiTablesToExcel } from '@/utils/excelExport';

const ProductsTab = ({ dateRange, refresh, onRefreshComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ topProducts: [], slowProducts: [], topProfitProducts: [] });

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

                const [topRes, slowRes, profitRes] = await Promise.all([
                    reportService.getTopProducts(params),
                    reportService.getSlowProducts(params),
                    reportService.getTopProfitProducts(params)
                ]);

                if (topRes.EC === 0 && slowRes.EC === 0 && profitRes.EC === 0) {
                    setData({
                        topProducts: topRes.DT || [],
                        slowProducts: slowRes.DT || [],
                        topProfitProducts: profitRes.DT || []
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

    const profitColumns = [
        { title: 'Sản phẩm', dataIndex: 'name', key: 'name', render: (text) => <span className="font-medium">{text}</span> },
        { title: 'Đã bán', dataIndex: 'totalSold', key: 'totalSold', render: (val) => <span className="font-semibold">{val}</span> },
        { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: (val) => `${Number(val).toLocaleString('vi-VN')}đ` },
        { title: 'Giá vốn', dataIndex: 'cogs', key: 'cogs', render: (val) => `${Number(val).toLocaleString('vi-VN')}đ` },
        { title: 'Lãi', dataIndex: 'profit', key: 'profit', render: (val) => <span className="text-green-600 font-bold">{Number(val).toLocaleString('vi-VN')}đ</span> }
    ];

    const handleExportExcel = () => {
        exportMultiTablesToExcel({
            fileName: 'bao-cao-hieu-suat-san-pham',
            title: 'BÁO CÁO HIỆU SUẤT SẢN PHẨM',
            subTitle: `Khoảng thời gian: ${dateRange[0]?.format('DD/MM/YYYY')} - ${dateRange[1]?.format('DD/MM/YYYY')}`,
            tables: [
                {
                    title: 'Top 10 Sản phẩm bán chạy nhất',
                    columns: [
                        { header: 'ID', key: 'id', width: 10 },
                        { header: 'Tên Sản phẩm', key: 'name', width: 35 },
                        { header: 'Số lượng đã bán', key: 'totalSold', width: 18, align: 'right', style: { numFmt: '#,##0' } }
                    ],
                    data: data.topProducts
                },
                {
                    title: 'Top 10 Sản phẩm bán chậm nhất',
                    columns: [
                        { header: 'ID', key: 'id', width: 10 },
                        { header: 'Tên Sản phẩm', key: 'name', width: 35 },
                        { header: 'Số lượng đã bán', key: 'totalSold', width: 18, align: 'right', style: { numFmt: '#,##0' } },
                        { header: 'Hàng tồn kho hiện tại', key: 'currentStock', width: 22, align: 'right', style: { numFmt: '#,##0' } }
                    ],
                    data: data.slowProducts
                },
                {
                    title: 'Top 10 Sản phẩm đem lại lợi nhuận cao nhất',
                    columns: [
                        { header: 'ID', key: 'id', width: 10 },
                        { header: 'Tên Sản phẩm', key: 'name', width: 35 },
                        { header: 'Đã bán', key: 'totalSold', width: 12, align: 'right', style: { numFmt: '#,##0' } },
                        { header: 'Doanh thu', key: 'revenue', width: 18, align: 'right', style: { numFmt: '#,##0"đ"' } },
                        { header: 'Giá vốn (COGS)', key: 'cogs', width: 18, align: 'right', style: { numFmt: '#,##0"đ"' } },
                        { header: 'Lợi nhuận ròng', key: 'profit', width: 18, align: 'right', style: { numFmt: '#,##0"đ"' } }
                    ],
                    data: data.topProfitProducts
                }
            ]
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button 
                    type="primary" 
                    icon={<FileExcelOutlined />} 
                    onClick={handleExportExcel}
                    style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                >
                    Xuất Excel báo cáo sản phẩm
                </Button>
            </div>

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

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card title="💰 Top sản phẩm đem lại lợi nhuận cao nhất" className="shadow-sm border-none h-full">
                        <Table
                            dataSource={data.topProfitProducts}
                            columns={profitColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card title="📋 Bảng danh sách hàng bán chậm chôn kho" className="shadow-sm border-none h-full">
                        <Table
                            dataSource={data.slowProducts}
                            columns={slowColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProductsTab;
