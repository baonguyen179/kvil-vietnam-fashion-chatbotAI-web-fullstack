import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Statistic, Spin, Alert, Progress, Button, Radio, DatePicker, Select, App, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined, FileExcelOutlined } from '@ant-design/icons';
import reportService from '@/services/reportService';
import { exportMultiTablesToExcel } from '@/utils/excelExport';
import dayjs from 'dayjs';

const OverviewTab = ({ dateRange, refresh, onRefreshComplete, showCustomers }) => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ overview: null, coupons: [] });

    // Customer filters and state
    const [customerLoading, setCustomerLoading] = useState(false);
    const [customerData, setCustomerData] = useState([]);
    const [customerCycle, setCustomerCycle] = useState('default'); // 'default' | 'month' | 'year'
    const [customerMonth, setCustomerMonth] = useState(dayjs());
    const [customerYear, setCustomerYear] = useState(dayjs());
    const [customerLimit, setCustomerLimit] = useState(5);

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
                    reportService.getOverview(params),
                    reportService.getCouponPerformance(params)
                ];

                const results = await Promise.all(promises);

                const overviewRes = results[0];
                const couponsRes = results[1];

                if (overviewRes.EC === 0 && couponsRes.EC === 0) {
                    setData({
                        overview: overviewRes.DT,
                        coupons: couponsRes.DT || []
                    });
                } else {
                    setError('Không tải được một số dữ liệu báo cáo');
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

    useEffect(() => {
        if (!showCustomers) return;

        const fetchCustomers = async () => {
            setCustomerLoading(true);
            try {
                let start, end;
                if (customerCycle === 'month') {
                    start = customerMonth.startOf('month').toISOString();
                    end = customerMonth.endOf('month').toISOString();
                } else if (customerCycle === 'year') {
                    start = customerYear.startOf('year').toISOString();
                    end = customerYear.endOf('year').toISOString();
                } else {
                    // default
                    start = dateRange[0]?.toISOString();
                    end = dateRange[1]?.toISOString();
                }

                const params = {
                    startDate: start,
                    endDate: end,
                    limit: customerLimit,
                    refresh: refresh ? true : undefined
                };

                const res = await reportService.getTopCustomers(params);
                if (res && res.EC === 0) {
                    setCustomerData(res.DT || []);
                } else {
                    message.error(res.EM || 'Không tải được danh sách khách hàng tiêu biểu');
                }
            } catch (err) {
                console.error(err);
                message.error('Lỗi kết nối khi tải danh sách khách hàng tiêu biểu');
            } finally {
                setCustomerLoading(false);
            }
        };

        fetchCustomers();
    }, [dateRange, refresh, showCustomers, customerCycle, customerMonth, customerYear, customerLimit]);

    if (loading) return <div className="py-10 text-center"><Spin size="large" description="Đang tải dữ liệu tổng quan..." /></div>;
    if (error) return <Alert message={error} type="error" showIcon className="my-5" />;

    const overview = data.overview;
    const rev = overview?.revenue || {};
    const ord = overview?.orders || {};
    const cust = overview?.customers || {};

    const couponColumns = [
        { title: 'Mã Coupon', dataIndex: 'code', key: 'code', render: (text) => <Tag color="blue" className="font-semibold">{text}</Tag> },
        { title: 'Lượt sử dụng', dataIndex: 'usedCount', key: 'usedCount', sorter: (a, b) => a.usedCount - b.usedCount },
        { title: 'Tổng giảm giá', dataIndex: 'totalDiscounted', key: 'totalDiscounted', render: (val) => `${Number(val).toLocaleString('vi-VN')}đ` },
        { title: 'Doanh thu tạo ra', dataIndex: 'revenueGenerated', key: 'revenueGenerated', render: (val) => `${Number(val).toLocaleString('vi-VN')}đ` }
    ];

    const customerColumns = [
        { title: 'Khách hàng', dataIndex: 'fullName', key: 'fullName', render: (text, r) => <div><div className="font-medium">{text}</div><div className="text-xs text-gray-400">{r.email}</div></div> },
        { title: 'Số đơn hàng', dataIndex: 'orderCount', key: 'orderCount' },
        { title: 'Tổng chi tiêu', dataIndex: 'totalSpent', key: 'totalSpent', render: (val) => <span className="font-semibold text-green-600">{Number(val).toLocaleString('vi-VN')}đ</span> }
    ];

    const handleExportExcel = () => {
        const tables = [
            {
                title: '📊 Chỉ số Tổng quan',
                columns: [
                    { header: 'Chỉ số', key: 'metric', width: 25 },
                    { header: 'Giá trị', key: 'value', width: 20 }
                ],
                data: [
                    { metric: 'Doanh thu hôm nay', value: `${Number(rev.today || 0).toLocaleString('vi-VN')}đ` },
                    { metric: 'Doanh thu tuần này', value: `${Number(rev.thisWeek || 0).toLocaleString('vi-VN')}đ` },
                    { metric: 'Doanh thu tháng này', value: `${Number(rev.thisMonth || 0).toLocaleString('vi-VN')}đ` },
                    { metric: 'Doanh thu tháng trước', value: `${Number(rev.lastMonth || 0).toLocaleString('vi-VN')}đ` },
                    { metric: 'Tăng trưởng tháng này vs tháng trước', value: `${rev.growthPercent || 0}%` },
                    { metric: 'AOV (Giá trị đơn trung bình)', value: `${Number(cust.aov || 0).toLocaleString('vi-VN')}đ` }
                ]
            },
            {
                title: '📈 Thống kê Đơn hàng & Khách hàng',
                columns: [
                    { header: 'Thông số', key: 'metric', width: 25 },
                    { header: 'Số lượng / Giá trị', key: 'value', width: 20 }
                ],
                data: [
                    { metric: 'Đơn hàng thành công', value: `${ord.success || 0} đơn` },
                    { metric: 'Đơn hàng đã hủy', value: `${ord.cancelled || 0} đơn` },
                    { metric: 'Đơn hàng bị hoàn trả', value: `${ord.returned || 0} đơn` },
                    { metric: 'Tổng số đơn hàng', value: `${ord.total || 0} đơn` },
                    { metric: 'Khách hàng mới', value: `${cust.newCustomers || 0} khách` },
                    { metric: 'Khách hàng quay lại', value: `${cust.returningCustomers || 0} khách` }
                ]
            },
            {
                title: '🎟️ Hiệu quả mã giảm giá',
                columns: [
                    { header: 'Mã Coupon', key: 'code', width: 15 },
                    { header: 'Lượt sử dụng', key: 'usedCount', width: 15, align: 'right', style: { numFmt: '#,##0' } },
                    { header: 'Tổng tiền giảm giá', key: 'totalDiscounted', width: 20, align: 'right', style: { numFmt: '#,##0"đ"' } },
                    { header: 'Doanh thu tạo ra', key: 'revenueGenerated', width: 20, align: 'right', style: { numFmt: '#,##0"đ"' } }
                ],
                data: data.coupons
            }
        ];

        if (showCustomers && customerData.length > 0) {
            let excelTitle = `👑 Top ${customerLimit} khách hàng chi tiêu nhiều nhất`;
            if (customerCycle === 'month') {
                excelTitle += ` (Tháng ${customerMonth.format('MM/YYYY')})`;
            } else if (customerCycle === 'year') {
                excelTitle += ` (Năm ${customerYear.format('YYYY')})`;
            } else {
                excelTitle += ` (Theo khoảng ngày chung)`;
            }

            tables.push({
                title: excelTitle,
                columns: [
                    { header: 'Tên Khách hàng', key: 'fullName', width: 25 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'Số đơn hàng', key: 'orderCount', width: 15, align: 'right', style: { numFmt: '#,##0' } },
                    { header: 'Tổng chi tiêu', key: 'totalSpent', width: 20, align: 'right', style: { numFmt: '#,##0"đ"' } }
                ],
                data: customerData
            });
        }

        exportMultiTablesToExcel({
            fileName: 'bao-cao-tong-quan-kinh-doanh',
            title: 'BÁO CÁO TỔNG QUAN KINH DOANH & KHÁCH HÀNG',
            subTitle: `Khoảng thời gian: ${dateRange[0]?.format('DD/MM/YYYY')} - ${dateRange[1]?.format('DD/MM/YYYY')}`,
            tables
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
                    Xuất Excel tổng quan
                </Button>
            </div>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={rev.today || 0}
                            precision={0}
                            styles={{ content: { color: '#10b981', fontWeight: 'bold' } }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="Doanh thu tuần này"
                            value={rev.thisWeek || 0}
                            precision={0}
                            styles={{ content: { color: '#3b82f6', fontWeight: 'bold' } }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="Doanh thu tháng này"
                            value={rev.thisMonth || 0}
                            precision={0}
                            styles={{ content: { color: '#8b5cf6', fontWeight: 'bold' } }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                        <div className="text-xs mt-1 text-gray-500">
                            Tháng trước: {Number(rev.lastMonth || 0).toLocaleString('vi-VN')}đ
                            <span className={`ml-2 font-semibold ${rev.growthPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {rev.growthPercent >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                {Math.abs(rev.growthPercent || 0)}%
                            </span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="AOV (Giá trị đơn trung bình)"
                            value={cust.aov || 0}
                            precision={0}
                            styles={{ content: { color: '#f59e0b', fontWeight: 'bold' } }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="📈 Thống kê đơn hàng" className="shadow-sm border-none h-full">
                        <div className="space-y-4 py-2">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-500">Thành công (Đã giao)</span>
                                    <span className="text-sm font-semibold">{ord.success} / {ord.total} đơn</span>
                                </div>
                                <Progress percent={ord.total > 0 ? parseFloat((ord.success / ord.total * 100).toFixed(1)) : 0} strokeColor="#10b981" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-500">Đã hủy</span>
                                    <span className="text-sm font-semibold">{ord.cancelled} / {ord.total} đơn</span>
                                </div>
                                <Progress percent={ord.total > 0 ? parseFloat((ord.cancelled / ord.total * 100).toFixed(1)) : 0} strokeColor="#ef4444" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-500">Trả hàng</span>
                                    <span className="text-sm font-semibold">{ord.returned} / {ord.total} đơn</span>
                                </div>
                                <Progress percent={ord.total > 0 ? parseFloat((ord.returned / ord.total * 100).toFixed(1)) : 0} strokeColor="#f59e0b" />
                            </div>
                            <div className="flex justify-around border-t pt-4 text-center">
                                <div>
                                    <div className="text-xl font-bold text-blue-600">{cust.newCustomers || 0}</div>
                                    <div className="text-xs text-gray-400">Khách hàng mới</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-purple-600">{cust.returningCustomers || 0}</div>
                                    <div className="text-xs text-gray-400">Khách quay lại</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="🎟️ Hiệu quả mã giảm giá" className="shadow-sm border-none h-full">
                        <Table
                            dataSource={data.coupons}
                            columns={couponColumns}
                            rowKey="id"
                            pagination={{ pageSize: 4 }}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            {showCustomers && (
                <Card 
                    title={
                        <Space>
                            <span>👑 Top {customerLimit} khách hàng chi tiêu nhiều nhất</span>
                        </Space>
                    } 
                    className="shadow-sm border-none"
                    extra={
                        <Space wrap size="middle">
                            <Space size="small">
                                <span className="text-xs text-gray-500 font-medium">Chu kỳ:</span>
                                <Radio.Group 
                                    size="small" 
                                    buttonStyle="solid"
                                    value={customerCycle}
                                    onChange={(e) => setCustomerCycle(e.target.value)}
                                >
                                    <Radio.Button value="default">Mặc định</Radio.Button>
                                    <Radio.Button value="month">Theo tháng</Radio.Button>
                                    <Radio.Button value="year">Theo năm</Radio.Button>
                                </Radio.Group>
                            </Space>

                            {customerCycle === 'month' && (
                                <DatePicker 
                                    picker="month" 
                                    size="small" 
                                    format="MM/YYYY" 
                                    value={customerMonth}
                                    allowClear={false}
                                    onChange={(date) => date && setCustomerMonth(date)}
                                    disabledDate={(current) => current && current > dayjs().endOf('month')}
                                    style={{ width: 110 }}
                                />
                            )}

                            {customerCycle === 'year' && (
                                <DatePicker 
                                    picker="year" 
                                    size="small" 
                                    format="YYYY" 
                                    value={customerYear}
                                    allowClear={false}
                                    onChange={(date) => date && setCustomerYear(date)}
                                    disabledDate={(current) => current && current > dayjs().endOf('year')}
                                    style={{ width: 90 }}
                                />
                            )}

                            <Space size="small">
                                <span className="text-xs text-gray-500 font-medium">Hiển thị:</span>
                                <Select
                                    size="small"
                                    value={customerLimit}
                                    onChange={(val) => setCustomerLimit(val)}
                                    options={[
                                        { value: 5, label: '5' },
                                        { value: 10, label: '10' },
                                        { value: 20, label: '20' }
                                    ]}
                                    style={{ width: 65 }}
                                />
                            </Space>
                        </Space>
                    }
                >
                    <Table
                        dataSource={customerData}
                        columns={customerColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        loading={customerLoading}
                    />
                </Card>
            )}
        </div>
    );
};

export default OverviewTab;
