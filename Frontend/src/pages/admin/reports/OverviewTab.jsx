import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Statistic, Spin, Alert, Progress } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
import reportService from '@/services/reportService';

const OverviewTab = ({ dateRange, refresh, onRefreshComplete, showCustomers }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ overview: null, coupons: [], customers: [] });

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

                if (showCustomers) {
                    promises.push(reportService.getTopCustomers({ ...params, limit: 5 }));
                }

                const results = await Promise.all(promises);

                const overviewRes = results[0];
                const couponsRes = results[1];
                const customersRes = showCustomers ? results[2] : { EC: 0, DT: [] };

                if (overviewRes.EC === 0 && couponsRes.EC === 0 && customersRes.EC === 0) {
                    setData({
                        overview: overviewRes.DT,
                        coupons: couponsRes.DT || [],
                        customers: customersRes.DT || []
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
    }, [dateRange, refresh, showCustomers]);

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

    return (
        <div className="space-y-6">
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
                <Card title="👑 Top 5 khách hàng chi tiêu nhiều nhất" className="shadow-sm border-none">
                    <Table
                        dataSource={data.customers}
                        columns={customerColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                    />
                </Card>
            )}
        </div>
    );
};

export default OverviewTab;
