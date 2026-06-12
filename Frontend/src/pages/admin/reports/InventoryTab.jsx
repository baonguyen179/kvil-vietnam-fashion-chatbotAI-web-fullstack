import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Spin, Alert, Progress, Button } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import reportService from '@/services/reportService';
import { exportMultiTablesToExcel } from '@/utils/excelExport';

const InventoryTab = ({ dateRange, refresh, onRefreshComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ lowStock: [], overstock: [], sellThrough: [], topReturned: [] });

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

                const [lowRes, overRes, sellRes, returnedRes] = await Promise.all([
                    reportService.getLowStock(params),
                    reportService.getOverstock(params),
                    reportService.getSellThrough(params),
                    reportService.getTopReturnedProducts(params)
                ]);

                if (lowRes.EC === 0 && overRes.EC === 0 && sellRes.EC === 0 && returnedRes.EC === 0) {
                    setData({
                        lowStock: lowRes.DT || [],
                        overstock: overRes.DT || [],
                        sellThrough: sellRes.DT || [],
                        topReturned: returnedRes.DT || []
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
    const returnedColumns = [
        { title: 'Sản phẩm', dataIndex: 'name', key: 'name', render: (text) => <span className="font-medium">{text}</span> },
        { title: 'Bán ra', dataIndex: 'soldQty', key: 'soldQty', render: (val) => <span className="font-semibold">{val}</span> },
        { title: 'Bị trả lại', dataIndex: 'returnedQty', key: 'returnedQty', render: (val) => <span className="text-red-500 font-semibold">{val}</span> },
        { 
            title: 'Tỉ lệ hoàn trả', 
            dataIndex: 'returnRate', 
            key: 'returnRate', 
            render: (val) => <Tag color="red" className="font-bold">{val}%</Tag>
        }
    ];

    const handleExportExcel = () => {
        exportMultiTablesToExcel({
            fileName: 'bao-cao-kho-hang-va-ton-kho',
            title: 'BÁO CÁO QUẢN TRỊ KHO & TỒN KHO',
            subTitle: `Khoảng thời gian: ${dateRange[0]?.format('DD/MM/YYYY')} - ${dateRange[1]?.format('DD/MM/YYYY')}`,
            tables: [
                {
                    title: '⚠️ Cảnh báo sắp hết hàng (< 10 sản phẩm)',
                    columns: [
                        { header: 'Tên Sản phẩm', key: 'product', width: 35 },
                        { header: 'SKU', key: 'sku', width: 15 },
                        { header: 'Kích cỡ', key: 'size', width: 10 },
                        { header: 'Màu sắc', key: 'color', width: 12 },
                        { header: 'Số lượng tồn', key: 'stock', width: 15, align: 'right', style: { numFmt: '#,##0' } }
                    ],
                    data: data.lowStock
                },
                {
                    title: '💰 Hàng tồn chôn vốn nhiều nhất (> 100 sản phẩm)',
                    columns: [
                        { header: 'ID', key: 'id', width: 10 },
                        { header: 'Tên Sản phẩm', key: 'name', width: 35 },
                        { header: 'Tổng lượng tồn', key: 'totalStock', width: 18, align: 'right', style: { numFmt: '#,##0' } },
                        { header: 'Giá trị chôn vốn ước tính', key: 'estimatedValue', width: 25, align: 'right', style: { numFmt: '#,##0"đ"' } }
                    ],
                    data: data.overstock
                },
                {
                    title: '📊 Tốc độ bán hàng (Sell-through Rate)',
                    columns: [
                        { header: 'ID', key: 'id', width: 10 },
                        { header: 'Tên Sản phẩm', key: 'name', width: 35 },
                        { header: 'Số lượng bán ra', key: 'sold', width: 18, align: 'right', style: { numFmt: '#,##0' } },
                        { header: 'Số lượng nhập kho', key: 'imported', width: 18, align: 'right', style: { numFmt: '#,##0' } },
                        { header: 'Tỷ lệ bán hết (STR)', key: 'sellThroughRate', width: 22, align: 'right', style: { numFmt: '0.0"%"' } }
                    ],
                    data: data.sellThrough
                },
                {
                    title: '📦 Top sản phẩm bị hoàn trả nhiều nhất',
                    columns: [
                        { header: 'ID', key: 'id', width: 10 },
                        { header: 'Tên Sản phẩm', key: 'name', width: 35 },
                        { header: 'Số lượng bán ra', key: 'soldQty', width: 18, align: 'right', style: { numFmt: '#,##0' } },
                        { header: 'Số lượng bị hoàn trả', key: 'returnedQty', width: 20, align: 'right', style: { numFmt: '#,##0' } },
                        { header: 'Tỉ lệ hoàn trả', key: 'returnRate', width: 18, align: 'right', style: { numFmt: '0.0"%"' } }
                    ],
                    data: data.topReturned
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
                    Xuất Excel báo cáo kho
                </Button>
            </div>

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

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={15}>
                    <Card title="📊 Tốc độ bán hàng (Sell-through Rate)" className="shadow-sm border-none h-full">
                        <Table
                            dataSource={data.sellThrough}
                            columns={sellThroughColumns}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={9}>
                    <Card title="📦 Top sản phẩm bị hoàn trả nhiều nhất" className="shadow-sm border-none h-full">
                        <Table
                            dataSource={data.topReturned}
                            columns={returnedColumns}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default InventoryTab;
