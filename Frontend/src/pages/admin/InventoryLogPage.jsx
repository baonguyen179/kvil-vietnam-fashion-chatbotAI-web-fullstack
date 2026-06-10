import React, { useState, useEffect } from 'react';
import { Table, Select, Space, Tag, Card, Typography, App, Row, Col, Button, Tooltip, DatePicker, Tabs } from 'antd';
import { 
    HistoryOutlined, 
    ArrowUpOutlined, 
    ArrowDownOutlined, 
    ReloadOutlined,
    InboxOutlined,
    FileExcelOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import inventoryService from '@/services/inventoryService';
import orderService from '@/services/orderService';
import dayjs from 'dayjs';
import './AdminShared.css';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import ImportInventoryModal from './ImportInventoryModal';
import AdjustInventoryModal from './AdjustInventoryModal';

import WarehouseStats from './WarehouseStats';
import WarehouseOutboundTab from './WarehouseOutboundTab';
import WarehousePickupTab from './WarehousePickupTab';
import WarehouseReturnsTab from './WarehouseReturnsTab';
import WarehouseLowStockTab from './WarehouseLowStockTab';

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TYPE_CONFIG = {
    'IN':     { color: 'green',   label: 'Nhập kho',     icon: <ArrowUpOutlined /> },
    'OUT':    { color: 'volcano', label: 'Xuất kho',     icon: <ArrowDownOutlined /> },
    'HOLD':   { color: 'gold',    label: 'Tạm giữ',      icon: <HistoryOutlined /> },
    'UNHOLD': { color: 'default', label: 'Hủy tạm giữ', icon: <ReloadOutlined /> },
    'RETURN': { color: 'blue',    label: 'Hoàn trả',     icon: <ReloadOutlined /> },
    'ADJUST': { color: 'purple',  label: 'Điều chỉnh',  icon: <ReloadOutlined /> },
};

const InventoryLogPage = () => {
    const { message } = App.useApp();
    
    // User Permissions
    const user = useSelector(state => state.auth.user);
    const { roles = [], permissions: userPermissions = [] } = user || {};
    const isSuperAdmin = roles.includes('SUPER_ADMIN');

    const canShip = isSuperAdmin || userPermissions.includes('orders.update_ship');
    const canReceiveReturn = isSuperAdmin || userPermissions.includes('orders.update_receive_return');
    const canAdjust = isSuperAdmin || userPermissions.includes('inventory.update');
    const canImport = isSuperAdmin || userPermissions.includes('inventory.update') || userPermissions.includes('products.update');

    // Dashboard State
    const [stats, setStats] = useState({
        outboundCount: 0,
        pickupCount: 0,
        returnCount: 0,
        lowStockCount: 0
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const [lowStockRefresh, setLowStockRefresh] = useState(0);
    const [activeTab, setActiveTab] = useState('1');

    // Tab 1: History Log States
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        type: undefined,
        variantId: undefined,
        dateRange: [],
    });
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [adjustRecord, setAdjustRecord] = useState(null);

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const [outboundRes, pickupRes, returnRes, lowStockRes] = await Promise.all([
                orderService.getAdminOrders({ status: 'confirmed', deliveryMethod: 'home_delivery', page: 1, limit: 1 }),
                orderService.getAdminOrders({ status: 'confirmed', deliveryMethod: 'store_pickup', page: 1, limit: 1 }),
                orderService.getAdminReturnRequests({ status: 'APPROVED', page: 1, limit: 1 }),
                inventoryService.getLowStockVariants(10)
            ]);

            setStats({
                outboundCount: outboundRes?.EC === 0 ? outboundRes.DT.totalItems : 0,
                pickupCount: pickupRes?.EC === 0 ? pickupRes.DT.totalItems : 0,
                returnCount: returnRes?.EC === 0 ? returnRes.DT.totalRows : 0,
                lowStockCount: lowStockRes?.EC === 0 ? (lowStockRes.DT?.length || 0) : 0
            });
        } catch (error) {
            console.error(">>> Error fetching stats:", error);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchLogs = async (page = 1, limit = 10, type = undefined, variantId = undefined, startDate = undefined, endDate = undefined) => {
        setLoading(true);
        try {
            const res = await inventoryService.getInventoryLogs(page, limit, type, variantId, startDate, endDate);
            if (res && res.EC === 0) {
                setLogs(res.DT.logs);
                setPagination({
                    current: page,
                    pageSize: limit,
                    total: res.DT.totalRows,
                });
            } else {
                message.error(res.EM || "Lấy lịch sử kho hàng thất bại!");
            }
        } catch (error) {
            console.error(">>> Error fetching logs:", error);
            message.error("Lỗi khi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchLogs(pagination.current, pagination.pageSize, filters.type, filters.variantId);
    }, []);

    const handleTableChange = (newPagination) => {
        const startDate = filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD') : undefined;
        const endDate = filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD') : undefined;
        fetchLogs(newPagination.current, newPagination.pageSize, filters.type, filters.variantId, startDate, endDate);
    };

    const handleTypeFilter = (value) => {
        setFilters(prev => ({ ...prev, type: value }));
        const startDate = filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD') : undefined;
        const endDate = filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD') : undefined;
        fetchLogs(1, pagination.pageSize, value, filters.variantId, startDate, endDate);
    };

    const handleDateChange = (dates) => {
        setFilters(prev => ({ ...prev, dateRange: dates }));
        const startDate = dates?.[0] ? dayjs(dates[0]).format('YYYY-MM-DD') : undefined;
        const endDate = dates?.[1] ? dayjs(dates[1]).format('YYYY-MM-DD') : undefined;
        fetchLogs(1, pagination.pageSize, filters.type, filters.variantId, startDate, endDate);
    };

    const handleActionSuccess = () => {
        fetchStats();
        setLowStockRefresh(prev => prev + 1);
        const startDate = filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD') : undefined;
        const endDate = filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD') : undefined;
        fetchLogs(pagination.current, pagination.pageSize, filters.type, filters.variantId, startDate, endDate);
    };

    const handleExportExcel = async () => {
        try {
            message.loading({ content: 'Đang khởi tạo trình xuất Excel...', key: 'export' });
            const startDate = filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD') : undefined;
            const endDate = filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD') : undefined;
            const res = await inventoryService.getInventoryLogs(1, 99999, filters.type, filters.variantId, startDate, endDate);
            
            if (res && res.EC === 0 && res.DT.logs) {
                const exportData = res.DT.logs;
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Lịch sử kho hàng');

                worksheet.columns = [
                    { header: 'STT', key: 'stt', width: 8 },
                    { header: 'THỜI GIAN', key: 'time', width: 22 },
                    { header: 'LOẠI BIẾN ĐỘNG', key: 'type', width: 18 },
                    { header: 'TÊN SẢN PHẨM', key: 'product', width: 35 },
                    { header: 'MÃ SKU', key: 'sku', width: 15 },
                    { header: 'SỐ LƯỢNG', key: 'quantity', width: 12 },
                    { header: 'NGƯỜI THỰC HIỆN', key: 'user', width: 25 },
                    { header: 'CHỨC VỤ', key: 'role', width: 20 },
                    { header: 'HÀNH ĐỘNG', key: 'action', width: 25 },
                    { header: 'GHI CHÚ CHI TIẾT', key: 'note', width: 45 },
                ];

                const headerRow = worksheet.getRow(1);
                headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF107C41' }
                };
                headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
                headerRow.height = 25;

                exportData.forEach((log, index) => {
                    const isPositive = log.type === 'IN' || log.type === 'RETURN' || log.type === 'UNHOLD';
                    const quantityText = `${isPositive ? '+' : '-'}${log.quantity}`;
                    
                    const typeLabels = {
                        'IN': 'NHẬP KHO',
                        'OUT': 'XUẤT KHO',
                        'HOLD': 'TẠM GIỮ',
                        'UNHOLD': 'HỦY TẠM GIỮ',
                        'RETURN': 'HOÀN TRẢ',
                        'RETURN_DEFECTIVE': 'HOÀN TRẢ PHẾ PHẨM',
                        'ADJUST': 'ĐIỀU CHỈNH'
                    };

                    let name = 'Hệ thống';
                    let roleLabel = 'Tự động';
                    const userLog = log.user;

                    if (userLog) {
                        name = userLog.fullName;
                        const userRoles = userLog.roles || [];
                        if (userRoles.length > 0) {
                            const firstRole = userRoles[0].name;
                            if (firstRole === 'SUPER_ADMIN') roleLabel = 'Quản trị viên';
                            else if (firstRole === 'SALES') roleLabel = 'Nhân viên Bán hàng';
                            else if (firstRole === 'ACCOUNTANT') roleLabel = 'Kế toán';
                            else if (firstRole === 'CUSTOMER') roleLabel = 'Khách hàng';
                            else roleLabel = userRoles[0].description || firstRole;
                        } else {
                            roleLabel = 'Khách hàng';
                        }
                    } else if (log.note && log.note.includes('Khách vãng lai')) {
                        name = 'Khách vãng lai';
                        roleLabel = 'Khách hàng';
                    }

                    let actionLabel = 'Khác';
                    const type = log.type;
                    const note = log.note || '';

                    if (type === 'IN') {
                        if (note.includes('Excel')) actionLabel = 'Nhập kho qua file Excel';
                        else if (note.includes('thủ công')) actionLabel = 'Nhập kho thủ công';
                        else if (note.includes('ban đầu')) actionLabel = 'Khởi tạo tồn kho';
                        else actionLabel = 'Nhập kho';
                    } else if (type === 'OUT') {
                        if (note.includes('ĐVVC')) actionLabel = 'Giao ĐVVC (Bán hàng)';
                        else if (note.includes('tại cửa hàng') || note.includes('nhận tại cửa hàng')) actionLabel = 'Khách nhận tại quầy';
                        else actionLabel = 'Xuất kho bán hàng';
                    } else if (type === 'HOLD') {
                        actionLabel = 'Tạm giữ (Khách đặt hàng)';
                    } else if (type === 'UNHOLD') {
                        if (note.includes('hủy đơn')) actionLabel = 'Hủy giữ (Hủy đơn hàng)';
                        else actionLabel = 'Hủy tạm giữ';
                    } else if (type === 'RETURN') {
                        if (note.includes('hàng nguyên vẹn') || note.includes('Hoàn kho')) actionLabel = 'Nhập lại hàng hoàn (Nguyên vẹn)';
                        else actionLabel = 'Nhập lại hàng hoàn';
                    } else if (type === 'RETURN_DEFECTIVE') {
                        actionLabel = 'Nhập kho phế phẩm (Hàng lỗi)';
                    } else if (type === 'ADJUST') {
                        actionLabel = 'Điều chỉnh tồn kho';
                    } else {
                        actionLabel = typeLabels[type] || type;
                    }

                    const row = worksheet.addRow({
                        stt: index + 1,
                        time: dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                        type: typeLabels[log.type] || log.type,
                        product: log.variant?.product?.name || 'N/A',
                        sku: log.variant?.sku || '',
                        quantity: quantityText,
                        user: name,
                        role: roleLabel,
                        action: actionLabel,
                        note: log.note || '---'
                    });

                    row.alignment = { vertical: 'middle' };
                    row.getCell('stt').alignment = { horizontal: 'center' };
                    row.getCell('quantity').alignment = { horizontal: 'center' };
                    row.getCell('sku').alignment = { horizontal: 'center' };

                    row.getCell('quantity').font = {
                        bold: true,
                        color: { argb: isPositive ? 'FF52C41A' : 'FFF5222D' }
                    };

                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                            left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                            bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                            right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
                        };
                    });
                });

                worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `Bao_cao_kho_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);

                message.success({ content: 'Đã xuất báo cáo Excel thành công!', key: 'export' });
            } else {
                message.error({ content: 'Không tìm thấy dữ liệu phù hợp để xuất!', key: 'export' });
            }
        } catch (error) {
            console.error("Lỗi xuất Excel:", error);
            message.error({ content: 'Lỗi hệ thống khi tạo file Excel!', key: 'export' });
        }
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (date) => (
                <Text type="secondary">
                    {dayjs(date).format('DD/MM/YYYY HH:mm:ss')}
                </Text>
            ),
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        },
        {
            title: 'Loại biến động',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const config = TYPE_CONFIG[type] || { color: 'default', label: type, icon: <HistoryOutlined /> };
                return (
                    <Tag color={config.color} icon={config.icon} className="px-2 py-1 rounded-md border-0 uppercase font-medium">
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Sản phẩm / SKU',
            key: 'product',
            render: (_, record) => (
                <Space orientation="vertical" size={0}>
                    <Text strong>{record.variant?.product?.name || 'N/A'}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        SKU: <Tag color="blue" size="small">{record.variant?.sku}</Tag>
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            render: (qty, record) => {
                const isPositive = record.type === 'IN' || record.type === 'RETURN' || record.type === 'UNHOLD';
                return (
                    <Text strong style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
                        {isPositive ? '+' : '-'}{qty}
                    </Text>
                );
            },
        },
        {
            title: 'Người thực hiện',
            key: 'user_detail',
            render: (_, record) => {
                const u = record.user;
                let name = 'Hệ thống';
                let roleLabel = 'Tự động';
                let roleColor = 'default';

                if (u) {
                    name = u.fullName;
                    const userRoles = u.roles || [];
                    if (userRoles.length > 0) {
                        const firstRole = userRoles[0].name;
                        if (firstRole === 'SUPER_ADMIN') {
                            roleLabel = 'Quản trị viên';
                            roleColor = 'red';
                        } else if (firstRole === 'SALES') {
                            roleLabel = 'Nhân viên Bán hàng';
                            roleColor = 'blue';
                        } else if (firstRole === 'ACCOUNTANT') {
                            roleLabel = 'Kế toán';
                            roleColor = 'purple';
                        } else if (firstRole === 'CUSTOMER') {
                            roleLabel = 'Khách hàng';
                            roleColor = 'green';
                        } else {
                            roleLabel = userRoles[0].description || firstRole;
                            roleColor = 'cyan';
                        }
                    } else {
                        roleLabel = 'Khách hàng';
                        roleColor = 'green';
                    }
                } else if (record.note && record.note.includes('Khách vãng lai')) {
                    name = 'Khách vãng lai';
                    roleLabel = 'Khách hàng';
                    roleColor = 'green';
                }

                let actionLabel = 'Khác';
                const type = record.type;
                const note = record.note || '';

                if (type === 'IN') {
                    if (note.includes('Excel')) actionLabel = 'Nhập kho qua file Excel';
                    else if (note.includes('thủ công')) actionLabel = 'Nhập kho thủ công';
                    else if (note.includes('ban đầu')) actionLabel = 'Khởi tạo tồn kho';
                    else actionLabel = 'Nhập kho';
                } else if (type === 'OUT') {
                    if (note.includes('ĐVVC')) actionLabel = 'Giao ĐVVC (Bán hàng)';
                    else if (note.includes('tại cửa hàng') || note.includes('nhận tại cửa hàng')) actionLabel = 'Khách nhận tại quầy';
                    else actionLabel = 'Xuất kho bán hàng';
                } else if (type === 'HOLD') {
                    actionLabel = 'Tạm giữ (Khách đặt hàng)';
                } else if (type === 'UNHOLD') {
                    if (note.includes('hủy đơn')) actionLabel = 'Hủy giữ (Hủy đơn hàng)';
                    else actionLabel = 'Hủy tạm giữ';
                } else if (type === 'RETURN') {
                    if (note.includes('hàng nguyên vẹn') || note.includes('Hoàn kho')) actionLabel = 'Nhập lại hàng hoàn (Nguyên vẹn)';
                    else actionLabel = 'Nhập lại hàng hoàn';
                } else if (type === 'RETURN_DEFECTIVE') {
                    actionLabel = 'Nhập kho phế phẩm (Hàng lỗi)';
                } else if (type === 'ADJUST') {
                    actionLabel = 'Điều chỉnh tồn kho';
                } else {
                    actionLabel = TYPE_CONFIG[type]?.label || type;
                }

                return (
                    <Space orientation="vertical" size={2} style={{ display: 'flex' }}>
                        <Space wrap>
                            <Text strong>{name}</Text>
                            <Tag color={roleColor} style={{ fontSize: '10px', padding: '0 4px', lineHeight: '16px', borderRadius: '4px' }}>
                                {roleLabel}
                            </Tag>
                        </Space>
                        {u?.email && (
                            <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                                {u.email}
                            </Text>
                        )}
                        <Text style={{ fontSize: '12px', color: '#1890ff', display: 'block', marginTop: '2px' }}>
                            <span style={{ color: '#8c8c8c' }}>Hành động:</span> {actionLabel}
                        </Text>
                    </Space>
                );
            }
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (noteText) => (
                <Tooltip title={noteText || ''} placement="topLeft">
                    <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Text type="secondary">{noteText || '---'}</Text>
                    </div>
                </Tooltip>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 130,
            align: 'center',
            render: (_, record) => {
                if (!['IN', 'OUT', 'RETURN'].includes(record.type)) return null;
                const btn = (
                    <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        disabled={!canAdjust}
                        onClick={() => setAdjustRecord(record)}
                    >
                        Điều chỉnh
                    </Button>
                );
                if (!canAdjust) {
                    return (
                        <Tooltip title="Bạn không có quyền điều chỉnh kho hàng (Yêu cầu: inventory.update)">
                            <div>{btn}</div>
                        </Tooltip>
                    );
                }
                return btn;
            }
        },
    ];

    const tabItems = [
        {
            key: '1',
            label: 'Lịch sử kho',
            children: (
                <div className="space-y-4">
                    <Row justify="space-between" align="middle" gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Space size="middle" wrap>
                                <RangePicker 
                                    onChange={handleDateChange} 
                                    size="middle"
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                    style={{ width: 260 }}
                                />
                                <Select
                                    placeholder="Lọc theo loại"
                                    allowClear
                                    style={{ width: 140 }}
                                    onChange={handleTypeFilter}
                                    size="middle"
                                >
                                    <Option value="IN"><ArrowUpOutlined style={{ color: '#52c41a' }} /> Nhập kho</Option>
                                    <Option value="OUT"><ArrowDownOutlined style={{ color: '#f5222d' }} /> Xuất kho</Option>
                                    <Option value="HOLD"><HistoryOutlined style={{ color: '#faad14' }} /> Tạm giữ</Option>
                                    <Option value="UNHOLD"><ReloadOutlined style={{ color: '#d9d9d9' }} /> Hủy tạm giữ</Option>
                                    <Option value="RETURN"><ReloadOutlined style={{ color: '#1890ff' }} /> Hoàn trả</Option>
                                </Select>
                            </Space>
                        </Col>
                        <Col xs={24} lg={12} className="text-right">
                            <Space size="small" wrap>
                                <Button 
                                    icon={<ReloadOutlined />} 
                                    onClick={() => {
                                        const startDate = filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD') : undefined;
                                        const endDate = filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD') : undefined;
                                        fetchLogs(pagination.current, pagination.pageSize, filters.type, filters.variantId, startDate, endDate);
                                    }}
                                    size="middle"
                                >
                                    Làm mới
                                </Button>
                                <Button 
                                    type="primary" 
                                    style={{ backgroundColor: '#107c41', borderColor: '#107c41' }}
                                    onClick={handleExportExcel}
                                    size="middle"
                                    icon={<FileExcelOutlined />}
                                >
                                    Xuất báo cáo
                                </Button>
                                
                                {(() => {
                                    const importBtn = (
                                        <Button 
                                            type="primary" 
                                            icon={<InboxOutlined />}
                                            disabled={!canImport}
                                            onClick={() => setIsImportModalVisible(true)}
                                            size="middle"
                                        >
                                            Nhập kho (Excel)
                                        </Button>
                                    );
                                    if (!canImport) {
                                        return (
                                            <Tooltip title="Bạn không có quyền nhập kho (Yêu cầu: inventory.update hoặc products.update)">
                                                <div>{importBtn}</div>
                                            </Tooltip>
                                        );
                                    }
                                    return importBtn;
                                })()}

                                {(() => {
                                    const adjustBtn = (
                                        <Button
                                            icon={<ReloadOutlined />}
                                            disabled={!canAdjust}
                                            onClick={() => setAdjustRecord({ variantId: null, variant: null })}
                                            size="middle"
                                            style={{ borderColor: canAdjust ? '#722ed1' : undefined, color: canAdjust ? '#722ed1' : undefined }}
                                        >
                                            Điều chỉnh kho
                                        </Button>
                                    );
                                    if (!canAdjust) {
                                        return (
                                            <Tooltip title="Bạn không có quyền điều chỉnh kho hàng (Yêu cầu: inventory.update)">
                                                <div>{adjustBtn}</div>
                                            </Tooltip>
                                        );
                                    }
                                    return adjustBtn;
                                })()}
                            </Space>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={logs}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng cộng ${total} bản ghi lịch sử`,
                        }}
                        onChange={handleTableChange}
                        className="custom-admin-table"
                    />
                </div>
            )
        },
        {
            key: '2',
            label: (
                <span>
                    Chờ bàn giao ĐVVC{' '}
                    {stats.outboundCount > 0 && <Tag color="orange" style={{ marginInlineStart: 4 }}>{stats.outboundCount}</Tag>}
                </span>
            ),
            children: <WarehouseOutboundTab canShip={canShip} onActionSuccess={handleActionSuccess} />
        },
        {
            key: '3',
            label: (
                <span>
                    Khách nhận tại quầy{' '}
                    {stats.pickupCount > 0 && <Tag color="blue" style={{ marginInlineStart: 4 }}>{stats.pickupCount}</Tag>}
                </span>
            ),
            children: <WarehousePickupTab canShip={canShip} onActionSuccess={handleActionSuccess} />
        },
        {
            key: '4',
            label: (
                <span>
                    Chờ nhận hàng hoàn{' '}
                    {stats.returnCount > 0 && <Tag color="purple" style={{ marginInlineStart: 4 }}>{stats.returnCount}</Tag>}
                </span>
            ),
            children: <WarehouseReturnsTab canReceiveReturn={canReceiveReturn} onActionSuccess={handleActionSuccess} />
        },
        {
            key: '5',
            label: (
                <span>
                    Cảnh báo tồn kho{' '}
                    {stats.lowStockCount > 0 && <Tag color="red" style={{ marginInlineStart: 4 }}>{stats.lowStockCount}</Tag>}
                </span>
            ),
            children: (
                <WarehouseLowStockTab 
                    canAdjust={canAdjust} 
                    onAdjust={(record) => setAdjustRecord(record)} 
                    refreshTrigger={lowStockRefresh}
                />
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                    <Title level={3} style={{ margin: 0 }}>Bảng Điều Khiển Thủ Kho</Title>
                    <Text type="secondary">
                        Theo dõi biến động kho, quản lý đơn hàng bàn giao ĐVVC, nhận tại quầy và nhận hàng hoàn vật lý.
                    </Text>
                </div>
            </div>

            <WarehouseStats stats={stats} loading={statsLoading} />

            <Card variant="borderless" className="shadow-sm rounded-xl">
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                    className="custom-admin-tabs"
                />
            </Card>

            <ImportInventoryModal 
                open={isImportModalVisible} 
                onClose={() => setIsImportModalVisible(false)}
                onSuccess={handleActionSuccess}
            />

            <AdjustInventoryModal
                open={!!adjustRecord}
                record={adjustRecord}
                onClose={() => setAdjustRecord(null)}
                onSuccess={handleActionSuccess}
            />
        </div>
    );
};

export default InventoryLogPage;
