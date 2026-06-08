import React, { useState, useCallback } from 'react';
import { Tabs, Typography, Button, DatePicker, Space, Row, Col ,Card} from 'antd';
import { ReloadOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';

import OverviewTab from './reports/OverviewTab';
import ProductsTab from './reports/ProductsTab';
import InventoryTab from './reports/InventoryTab';
import FinancialTab from './reports/FinancialTab';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ReportPage = () => {
    const user = useSelector(state => state.auth.user);
    const { roles = [] } = user || {};
    
    const isSuperAdmin = roles.includes('SUPER_ADMIN');
    const isSales = roles.includes('SALES');
    const isAccountant = roles.includes('ACCOUNTANT');

    const [dateRange, setDateRange] = useState([
        dayjs().startOf('month'),
        dayjs(),
    ]);
    const [refresh, setRefresh] = useState(false);
    const [reloading, setReloading] = useState(false);

    const handleRefresh = useCallback(() => {
        setRefresh(true);
        setReloading(true);
    }, []);

    const onRefreshComplete = useCallback(() => {
        setRefresh(false);
        setReloading(false);
    }, []);

    const handleRangeChange = (dates) => {
        if (!dates) return;
        setDateRange(dates);
    };

    // Tạo danh sách tab động dựa theo vai trò người dùng (Role)
    const tabItems = [];

    if (isSuperAdmin) {
        tabItems.push({
            key: 'overview',
            label: '📊 Tổng quan & Khách hàng',
            children: <OverviewTab dateRange={dateRange} refresh={refresh} onRefreshComplete={onRefreshComplete} showCustomers={true} />
        });
        tabItems.push({
            key: 'products',
            label: '🛍️ Hiệu suất sản phẩm',
            children: <ProductsTab dateRange={dateRange} refresh={refresh} onRefreshComplete={onRefreshComplete} />
        });
        tabItems.push({
            key: 'inventory',
            label: '📦 Quản trị kho & Tồn kho',
            children: <InventoryTab dateRange={dateRange} refresh={refresh} onRefreshComplete={onRefreshComplete} />
        });
        tabItems.push({
            key: 'financial',
            label: '💵 Phân tích tài chính',
            children: <FinancialTab dateRange={dateRange} refresh={refresh} onRefreshComplete={onRefreshComplete} showProfit={true} />
        });
    } else if (isSales) {
        tabItems.push({
            key: 'overview',
            label: '📊 Tổng quan & Doanh số',
            children: <OverviewTab dateRange={dateRange} refresh={refresh} onRefreshComplete={onRefreshComplete} showCustomers={false} />
        });
        tabItems.push({
            key: 'products',
            label: '🛍️ Hiệu suất sản phẩm',
            children: <ProductsTab dateRange={dateRange} refresh={refresh} onRefreshComplete={onRefreshComplete} />
        });
        tabItems.push({
            key: 'inventory',
            label: '📦 Quản trị kho & Tồn kho',
            children: <InventoryTab dateRange={dateRange} refresh={refresh} onRefreshComplete={onRefreshComplete} />
        });
        tabItems.push({
            key: 'category_revenue',
            label: '🍕 Doanh thu danh mục',
            children: <FinancialTab dateRange={dateRange} refresh={refresh} onRefreshComplete={onRefreshComplete} showProfit={false} />
        });
    } else if (isAccountant) {
        tabItems.push({
            key: 'overview',
            label: '📊 Tổng quan & Khách hàng',
            children: <OverviewTab dateRange={dateRange} refresh={refresh} onRefreshComplete={onRefreshComplete} showCustomers={true} />
        });
        tabItems.push({
            key: 'financial',
            label: '💵 Phân tích tài chính',
            children: <FinancialTab dateRange={dateRange} refresh={refresh} onRefreshComplete={onRefreshComplete} showProfit={true} />
        });
    }

    return (
        <div className="space-y-5">
            <Row justify="between" align="middle" gutter={[16, 16]}>
                <Col>
                    <Title level={4} className="m-0">Báo cáo kinh doanh</Title>
                    <Text type="secondary" className="text-sm">
                        Theo dõi hiệu suất doanh thu, kho bãi và tài chính của KVIL Fashion
                    </Text>
                </Col>
                <Col className="flex gap-2">
                    <RangePicker
                        value={dateRange}
                        onChange={handleRangeChange}
                        format="DD/MM/YYYY"
                        allowClear={false}
                        suffixIcon={<CalendarOutlined />}
                        disabledDate={(current) => current && current > dayjs().endOf('day')}
                    />
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={reloading}
                    >
                        Làm mới
                    </Button>
                </Col>
            </Row>

            <Card className="shadow-sm border-none rounded-xl">
                <Tabs defaultActiveKey="overview" items={tabItems} className="report-tabs" />
            </Card>

            <div className="text-center text-xs text-gray-400 pb-2">
                Báo cáo tự động lưu bộ nhớ đệm (Cache) trong 30 phút. Click "Làm mới" để cập nhật thời gian thực.
            </div>
        </div>
    );
};

export default ReportPage;
