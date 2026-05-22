import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Button, DatePicker, Space, Alert, message } from 'antd';
import { ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import dashboardService from '@/services/dashboardService';
import AdminStatsCards from '@/components/admin/admin.stats.cards';
import AdminRevenueChart from '@/components/admin/admin.revenue.chart';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Các preset khoảng thời gian nhanh
const DATE_PRESETS = [
    { label: '7 ngày', days: 7 },
    { label: '30 ngày', days: 30 },
    { label: '90 ngày', days: 90 },
];

const DashboardPage = () => {
    const [summary, setSummary]     = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState(null);

    // Mặc định: 30 ngày gần nhất
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(30, 'day'),
        dayjs(),
    ]);

    const fetchStats = useCallback(async (range = dateRange) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                startDate: range[0]?.toISOString(),
                endDate:   range[1]?.toISOString(),
            };
            const res = await dashboardService.getDashboardStats(params);
            if (res && res.EC === 0) {
                setSummary(res.DT.summary);
                setChartData(res.DT.chart || []);
            } else {
                setError(res?.EM || 'Không tải được dữ liệu thống kê!');
                message.error(res?.EM || 'Không tải được dữ liệu!');
            }
        } catch {
            const msg = 'Lỗi kết nối đến máy chủ';
            setError(msg);
            message.error(msg);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchStats(dateRange);
    }, []);

    const handleRangeChange = (dates) => {
        if (!dates) return;
        setDateRange(dates);
        fetchStats(dates);
    };

    const handlePreset = (days) => {
        const range = [dayjs().subtract(days, 'day'), dayjs()];
        setDateRange(range);
        fetchStats(range);
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                    <Title level={4} className="m-0">Dashboard</Title>
                    <Text type="secondary" className="text-sm">
                        Tổng quan hoạt động kinh doanh trong khoảng thời gian được chọn
                    </Text>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <Space size="small">
                        {DATE_PRESETS.map((p) => (
                            <Button
                                key={p.days}
                                size="small"
                                onClick={() => handlePreset(p.days)}
                                className="text-xs"
                            >
                                {p.label}
                            </Button>
                        ))}
                    </Space>

                    <RangePicker
                        value={dateRange}
                        onChange={handleRangeChange}
                        format="DD/MM/YYYY"
                        allowClear={false}
                        suffixIcon={<CalendarOutlined />}
                        disabledDate={(current) => current && current > dayjs().endOf('day')}
                        presets={[
                            { label: '7 ngày qua',  value: [dayjs().subtract(7,  'day'), dayjs()] },
                            { label: '30 ngày qua', value: [dayjs().subtract(30, 'day'), dayjs()] },
                            { label: 'Tháng này',   value: [dayjs().startOf('month'), dayjs()] },
                        ]}
                    />

                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => fetchStats(dateRange)}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {error && (
                <Alert
                    type="error"
                    message={error}
                    showIcon
                    closable
                    onClose={() => setError(null)}
                />
            )}

            <AdminStatsCards summary={summary} loading={loading} />

            <Card
                className="shadow-sm rounded-xl border-none"
                title={
                    <div>
                        <span className="font-semibold">📊 Biểu đồ Doanh thu & Đơn hàng</span>
                        <Text type="secondary" className="ml-3 text-xs font-normal">
                            (Chỉ tính đơn đã giao thành công)
                        </Text>
                    </div>
                }
                styles={{ body: { paddingTop: 8 } }}
            >
                <AdminRevenueChart chartData={chartData} loading={loading} />
            </Card>

            <div className="text-center text-xs text-gray-400 pb-2">
                Dữ liệu được cache trong 5 phút. Nhấn "Làm mới" để lấy dữ liệu mới nhất.
            </div>
        </div>
    );
};

export default DashboardPage;
