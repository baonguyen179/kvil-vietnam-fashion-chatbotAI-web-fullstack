import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, App, Typography, Table, Space, Tag, Tabs, Input, InputNumber, Select } from 'antd';
import { InboxOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import inventoryService from '@/services/inventoryService';
import productService from '@/services/productService';
import { saveAs } from 'file-saver';

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;

const ImportInventoryModal = ({ open, onClose, onSuccess }) => {
    const { message, notification } = App.useApp();
    const [activeTab, setActiveTab] = useState('excel');
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [variantSkus, setVariantSkus] = useState([]);

    // State phục vụ việc nhập kho thủ công
    const [manualItems, setManualItems] = useState([
        { key: Date.now(), sku: '', quantity: 1, costPrice: 0 }
    ]);

    const fetchAllSkus = async () => {
        try {
            const res = await productService.getAllVariantSkus();
            if (res && res.EC === 0) {
                setVariantSkus(res.DT || []);
            }
        } catch (error) {
            console.error(">>> Error fetching variants skus:", error);
        }
    };

    useEffect(() => {
        if (open) {
            fetchAllSkus();
        }
    }, [open]);

    const handleDownloadTemplate = async () => {
        try {
            message.loading({ content: 'Đang tải file mẫu...', key: 'template' });
            const res = await inventoryService.getInventoryTemplate();
            
            const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'Mau_Nhap_Kho.xlsx');
            
            message.success({ content: 'Tải file mẫu thành công!', key: 'template' });
        } catch (error) {
            console.error(">>> Lỗi tải template:", error);
            if (error instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errData = JSON.parse(reader.result);
                        message.error({ content: errData.EM || 'Lỗi tải file mẫu', key: 'template' });
                    } catch (e) {
                        message.error({ content: 'Lỗi tải file mẫu (403 Forbidden)', key: 'template' });
                    }
                };
                reader.readAsText(error);
            } else {
                message.error({ content: error?.EM || 'Lỗi kết nối khi tải file mẫu', key: 'template' });
            }
        }
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning("Vui lòng chọn file Excel để tải lên.");
            return;
        }

        const file = fileList[0];
        setUploading(true);
        setErrors([]);

        try {
            const res = await inventoryService.importInventory(file);
            if (res && res.EC === 0) {
                notification.success({
                    message: 'Nhập kho thành công',
                    description: res.EM,
                    placement: 'topRight'
                });
                setFileList([]);
                onSuccess();
                onClose();
            } else {
                message.error(res.EM || "Nhập kho thất bại.");
                if (res.DT && res.DT.errors && res.DT.errors.length > 0) {
                    setErrors(res.DT.errors);
                }
            }
        } catch (error) {
            console.error(">>> Lỗi gọi API Upload:", error);
            message.error("Đã xảy ra lỗi kết nối đến máy chủ.");
        } finally {
            setUploading(false);
        }
    };

    // Nghiệp vụ nhập kho thủ công
    const handleAddManualItem = () => {
        setManualItems([
            ...manualItems,
            { key: Date.now() + Math.random(), sku: '', quantity: 1, costPrice: 0 }
        ]);
    };

    const handleUpdateManualItem = (key, field, value) => {
        setManualItems(prev => prev.map(item => {
            if (item.key === key) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleRemoveManualItem = (key) => {
        if (manualItems.length === 1) {
            message.warning("Phải có ít nhất 1 sản phẩm để nhập kho!");
            return;
        }
        setManualItems(prev => prev.filter(item => item.key !== key));
    };

    const handleImportManual = async () => {
        // Validation Client-side
        const invalidItems = manualItems.filter(item => !item.sku.trim() || !item.quantity || item.quantity <= 0 || item.costPrice === undefined || item.costPrice === null || item.costPrice <= 0);
        if (invalidItems.length > 0) {
            message.error("Vui lòng chọn Mã SKU, Số lượng (> 0) và Giá vốn (> 0) cho tất cả các dòng!");
            return;
        }

        setUploading(true);
        setErrors([]);

        try {
            const payload = manualItems.map(item => ({
                sku: item.sku.trim(),
                quantity: parseInt(item.quantity, 10),
                costPrice: parseFloat(item.costPrice)
            }));

            const res = await inventoryService.importInventoryManual(payload);
            if (res && res.EC === 0) {
                notification.success({
                    message: 'Nhập kho thủ công thành công',
                    description: res.EM,
                    placement: 'topRight'
                });
                setManualItems([{ key: Date.now(), sku: '', quantity: 1, costPrice: 0 }]);
                onSuccess();
                onClose();
            } else {
                message.error(res.EM || "Nhập kho thủ công thất bại.");
                if (res.DT && res.DT.errors && res.DT.errors.length > 0) {
                    setErrors(res.DT.errors);
                }
            }
        } catch (error) {
            console.error(">>> Lỗi gọi API Manual Import:", error);
            message.error("Đã xảy ra lỗi kết nối đến máy chủ.");
        } finally {
            setUploading(false);
        }
    };

    const uploadProps = {
        onRemove: () => {
            setFileList([]);
            setErrors([]);
        },
        beforeUpload: (file) => {
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel' || file.type === 'text/csv';
            if (!isExcel) {
                message.error(`${file.name} không phải là file Excel hợp lệ!`);
                return Upload.LIST_IGNORE;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('File phải nhỏ hơn 5MB!');
                return Upload.LIST_IGNORE;
            }
            setFileList([file]);
            setErrors([]);
            return false;
        },
        fileList,
        maxCount: 1,
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Nhập Tồn Kho Hàng Loạt</Title>}
            open={open}
            onCancel={onClose}
            width={850}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={uploading}>
                    Hủy
                </Button>,
                activeTab === 'excel' ? (
                    <Button 
                        key="upload" 
                        type="primary" 
                        onClick={handleUpload} 
                        loading={uploading}
                        disabled={fileList.length === 0}
                        style={{ backgroundColor: '#107c41', borderColor: '#107c41' }}
                    >
                        {uploading ? 'Đang xử lý...' : 'Xác nhận Nhập kho'}
                    </Button>
                ) : (
                    <Button 
                        key="submit-manual" 
                        type="primary" 
                        onClick={handleImportManual} 
                        loading={uploading}
                        style={{ backgroundColor: '#107c41', borderColor: '#107c41' }}
                    >
                        {uploading ? 'Đang xử lý...' : 'Nhập kho thủ công'}
                    </Button>
                )
            ]}
        >
            <div className="py-2">
                <Tabs activeKey={activeTab} onChange={(key) => { setActiveTab(key); setErrors([]); }}>
                    <Tabs.TabPane tab="Nhập bằng File Excel" key="excel">
                        <Paragraph className="mt-2">
                            Tải về file Excel mẫu, điền mã SKU, số lượng nhập kho, và giá vốn nhập, sau đó tải lên hệ thống.
                            Hệ thống sẽ <Text strong type="success">cộng dồn</Text> số lượng mới vào tồn kho hiện tại và cập nhật giá vốn AVG.
                        </Paragraph>
                        
                        <div className="mb-4">
                            <Button 
                                icon={<DownloadOutlined />} 
                                onClick={handleDownloadTemplate}
                            >
                                Tải File Mẫu (Template)
                            </Button>
                        </div>

                        <Dragger {...uploadProps} className="mb-2">
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined style={{ color: '#107c41' }} />
                            </p>
                            <p className="ant-upload-text">Kéo thả hoặc Nhấp để chọn file Excel</p>
                            <p className="ant-upload-hint">
                                Chỉ hỗ trợ file .xlsx, .xls, .csv dưới 5MB. Tối đa 1000 dòng.
                            </p>
                        </Dragger>
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Nhập trực tiếp (Thủ công)" key="manual">
                        <Paragraph className="mt-2">
                            Nhập trực tiếp danh sách mã SKU, số lượng nhập kho, và giá vốn nhập vào bảng dưới đây.
                            Bấm nút <Text strong type="success">Nhập kho thủ công</Text> ở chân trang để lưu dữ liệu.
                        </Paragraph>

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="mb-4 border rounded-md">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#555' }}>Chọn Biến thể / SKU (*)</th>
                                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#555', width: '130px' }}>Số lượng (*)</th>
                                        <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#555', width: '180px' }}>Giá vốn nhập (*)</th>
                                        <th style={{ padding: '10px', textAlign: 'center', fontSize: '13px', color: '#555', width: '70px' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manualItems.map((item) => (
                                        <tr key={item.key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '8px' }}>
                                                <Select
                                                    showSearch
                                                    placeholder="Gõ tìm kiếm tên SP hoặc SKU..."
                                                    optionFilterProp="children"
                                                    value={item.sku || undefined}
                                                    onChange={(val) => handleUpdateManualItem(item.key, 'sku', val)}
                                                    style={{ width: '100%' }}
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    options={variantSkus.map(v => ({
                                                        value: v.sku,
                                                        label: v.displayName
                                                    }))}
                                                />
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <InputNumber 
                                                    min={1} 
                                                    value={item.quantity} 
                                                    onChange={(val) => handleUpdateManualItem(item.key, 'quantity', val)}
                                                    placeholder="Số lượng"
                                                    style={{ width: '100%' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px' }}>
                                                <InputNumber 
                                                    min={0} 
                                                    value={item.costPrice} 
                                                    onChange={(val) => handleUpdateManualItem(item.key, 'costPrice', val)}
                                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                                    placeholder="Giá vốn nhập"
                                                    style={{ width: '100%' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                                <Button 
                                                    type="link" 
                                                    danger 
                                                    onClick={() => handleRemoveManualItem(item.key)}
                                                    disabled={manualItems.length === 1}
                                                >
                                                    Xóa
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <Button 
                            type="dashed" 
                            onClick={handleAddManualItem} 
                            icon={<PlusOutlined />}
                            style={{ width: '100%' }}
                            className="mb-2"
                        >
                            Thêm dòng sản phẩm mới
                        </Button>
                    </Tabs.TabPane>
                </Tabs>

                {errors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <Space orientation="horizontal" className="mb-2">
                            <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '18px' }} />
                            <Text strong type="danger">Phát hiện lỗi xử lý (Dữ liệu chưa được lưu):</Text>
                        </Space>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <ul className="list-disc pl-5 m-0 text-red-500">
                                {errors.map((err, index) => (
                                    <li key={index}><Text type="danger">{err}</Text></li>
                                ))}
                            </ul>
                        </div>
                        <Text type="secondary" className="block mt-2 text-xs">
                            * Vui lòng kiểm tra lại thông tin và điền chính xác SKU tồn tại trong hệ thống.
                        </Text>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImportInventoryModal;
