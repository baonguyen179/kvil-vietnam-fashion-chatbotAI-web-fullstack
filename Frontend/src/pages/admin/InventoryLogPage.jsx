import React, { useState, useEffect } from 'react';
import { Table, Select, Space, Tag, Card, Typography, App, Row, Col, Badge, Input, Button, Tooltip, DatePicker } from 'antd';
import { 
    HistoryOutlined, 
    ArrowUpOutlined, 
    ArrowDownOutlined, 
    ReloadOutlined,
    UserOutlined,
    InboxOutlined
} from '@ant-design/icons';
import inventoryService from '@/services/inventoryService';
import dayjs from 'dayjs';
import './AdminShared.css';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import ImportInventoryModal from './ImportInventoryModal';
import AdjustInventoryModal from './AdjustInventoryModal';

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
        dateRange: [], // [startDate, endDate]
    });
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [adjustRecord, setAdjustRecord] = useState(null); // null = đóng modal, record = mở

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

    const handleExportExcel = async () => {
        try {
            message.loading({ content: 'Đang khởi tạo trình xuất Excel cao cấp...', key: 'export' });
            
            const startDate = filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD') : undefined;
            const endDate = filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD') : undefined;
            
            const res = await inventoryService.getInventoryLogs(1, 99999, filters.type, filters.variantId, startDate, endDate);
            
            if (res && res.EC === 0 && res.DT.logs) {
                const exportData = res.DT.logs;
                
                // 1. Tạo Workbook & Worksheet
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Lịch sử kho hàng');

                // 2. Định nghĩa cấu trúc cột và Độ rộng (Width)
                worksheet.columns = [
                    { header: 'STT', key: 'stt', width: 8 },
                    { header: 'THỜI GIAN', key: 'time', width: 22 },
                    { header: 'LOẠI BIẾN ĐỘNG', key: 'type', width: 18 },
                    { header: 'TÊN SẢN PHẨM', key: 'product', width: 35 },
                    { header: 'MÃ SKU', key: 'sku', width: 15 },
                    { header: 'SỐ LƯỢNG', key: 'quantity', width: 12 },
                    { header: 'NGƯỜI THỰC HIỆN', key: 'user', width: 25 },
                    { header: 'GHI CHÚ CHI TIẾT', key: 'note', width: 45 },
                ];

                // 3. Style cho dòng Header
                const headerRow = worksheet.getRow(1);
                headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF107C41' } // Màu xanh Excel đặc trưng
                };
                headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
                headerRow.height = 25;

                // 4. Đổ dữ liệu vào hàng
                exportData.forEach((log, index) => {
                    const isPositive = log.type === 'IN' || log.type === 'RETURN' || log.type === 'UNHOLD';
                    const quantityText = `${isPositive ? '+' : '-'}${log.quantity}`;
                    
                    const typeLabels = {
                        'IN': 'NHẬP KHO',
                        'OUT': 'XUẤT KHO',
                        'HOLD': 'TẠM GIỮ',
                        'UNHOLD': 'HỦY TẠM GIỮ',
                        'RETURN': 'HOÀN TRẢ'
                    };

                    const row = worksheet.addRow({
                        stt: index + 1,
                        time: dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                        type: typeLabels[log.type] || log.type,
                        product: log.variant?.product?.name || 'N/A',
                        sku: log.variant?.sku || '',
                        quantity: quantityText,
                        user: log.user ? log.user.fullName : 'Hệ thống / Admin',
                        note: log.note || '---'
                    });

                    // 5. [UX] Căn chỉnh dữ liệu
                    row.alignment = { vertical: 'middle' };
                    row.getCell('stt').alignment = { horizontal: 'center' };
                    row.getCell('quantity').alignment = { horizontal: 'center' };
                    row.getCell('sku').alignment = { horizontal: 'center' };

                    // 6. [UX] Phân biệt màu sắc cho Số lượng
                    row.getCell('quantity').font = {
                        bold: true,
                        color: { argb: isPositive ? 'FF52C41A' : 'FFF5222D' }
                    };

                    // 7. [UX] Kẻ viền cho các dòng dữ liệu
                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                            left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                            bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
                            right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
                        };
                    });
                });

                // 8. [PREMIUM] Cố định dòng tiêu đề (Freeze Panes)
                worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

                // 9. Xuất file
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `Bao_cao_kho_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);

                message.success({ content: 'Đã xuất báo cáo Excel thành công!', key: 'export' });
            } else {
                message.error({ content: 'Không tìm thấy dữ liệu phù hợp để xuất!', key: 'export' });
            }
        } catch (error) {
            console.error("Lỗi xuất ExcelJS:", error);
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
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                user ? (
                    <Tooltip title={user.email}>
                        <Space>
                            <UserOutlined />
                            <Text>{user.fullName}</Text>
                        </Space>
                    </Tooltip>
                ) : <Text type="secondary">Hệ thống / Admin</Text>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (note) => (
                <Tooltip title={note || ''} placement="topLeft">
                    <div style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Text type="secondary">{note || '---'}</Text>
                    </div>
                </Tooltip>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 130,
            align: 'center',
            render: (_, record) => (
                // Chỉ hiện nút điều chỉnh cho log IN/OUT (các log do nhân viên tạo thủ công)
                // Không hiện cho HOLD/UNHOLD/ADJUST vì chúng do hệ thống tự tạo
                ['IN', 'OUT', 'RETURN'].includes(record.type) ? (
                    <Button
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={() => setAdjustRecord(record)}
                    >
                        Điều chỉnh
                    </Button>
                ) : null
            )
        },
    ];

    return (
        <div className="p-6">
            <Card variant="borderless" className="shadow-sm rounded-xl">
                <Row justify="space-between" align="middle" className="mb-6" gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Space orientation="vertical" size={0}>
                            <Title level={3} style={{ margin: 0 }}>Lịch sử Biến động Kho</Title>
                            <Text type="secondary">Theo dõi chi tiết các lần Nhập, Xuất và Hoàn trả hàng hóa</Text>
                        </Space>
                    </Col>
                    <Col xs={24} md={16} className="text-right">
                        <Space size="middle" wrap>
                            <RangePicker 
                                onChange={handleDateChange} 
                                size="large"
                                placeholder={['Từ ngày', 'Đến ngày']}
                                style={{ width: 280 }}
                            />
                            <Select
                                placeholder="Lọc theo loại"
                                allowClear
                                style={{ width: 160 }}
                                onChange={handleTypeFilter}
                                size="large"
                            >
                                <Option value="IN"><ArrowUpOutlined style={{ color: '#52c41a' }} /> Nhập kho</Option>
                                <Option value="OUT"><ArrowDownOutlined style={{ color: '#f5222d' }} /> Xuất kho</Option>
                                <Option value="HOLD"><HistoryOutlined style={{ color: '#faad14' }} /> Tạm giữ</Option>
                                <Option value="UNHOLD"><ReloadOutlined style={{ color: '#d9d9d9' }} /> Hủy tạm giữ</Option>
                                <Option value="RETURN"><ReloadOutlined style={{ color: '#1890ff' }} /> Hoàn trả</Option>
                            </Select>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={() => {
                                    const startDate = filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD') : undefined;
                                    const endDate = filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD') : undefined;
                                    fetchLogs(pagination.current, pagination.pageSize, filters.type, filters.variantId, startDate, endDate);
                                }}
                                size="large"
                            >
                                Làm mới
                            </Button>
                            <Button 
                                type="primary" 
                                style={{ backgroundColor: '#107c41', borderColor: '#107c41' }}
                                onClick={handleExportExcel}
                                size="large"
                            >
                                Xuất Báo cáo Excel
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<InboxOutlined />}
                                onClick={() => setIsImportModalVisible(true)}
                                size="large"
                            >
                                Nhập Kho (Excel)
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => setAdjustRecord({ variantId: null, variant: null })}
                                size="large"
                                style={{ borderColor: '#722ed1', color: '#722ed1' }}
                            >
                                Bút toán điều chỉnh
                            </Button>
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
                        showTotal: (total) => `Tổng cộng ${total} bản ghi`,
                    }}
                    onChange={handleTableChange}
                    className="custom-admin-table"
                />
            </Card>

            <ImportInventoryModal 
                open={isImportModalVisible} 
                onClose={() => setIsImportModalVisible(false)}
                onSuccess={() => {
                    const startDate = filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD') : undefined;
                    const endDate = filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD') : undefined;
                    fetchLogs(1, pagination.pageSize, filters.type, filters.variantId, startDate, endDate);
                }}
            />

            <AdjustInventoryModal
                open={!!adjustRecord}
                record={adjustRecord}
                onClose={() => setAdjustRecord(null)}
                onSuccess={() => {
                    const startDate = filters.dateRange?.[0] ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD') : undefined;
                    const endDate = filters.dateRange?.[1] ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD') : undefined;
                    fetchLogs(1, pagination.pageSize, filters.type, filters.variantId, startDate, endDate);
                }}
            />
        </div>
    );
};

export default InventoryLogPage;
