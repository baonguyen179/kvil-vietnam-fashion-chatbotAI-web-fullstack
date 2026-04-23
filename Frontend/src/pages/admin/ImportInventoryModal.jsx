import React, { useState } from 'react';
import { Modal, Upload, Button, App, Typography, Table, Space, Tag } from 'antd';
import { InboxOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import inventoryService from '@/services/inventoryService';
import { saveAs } from 'file-saver';

const { Dragger } = Upload;
const { Text, Title, Paragraph } = Typography;

const ImportInventoryModal = ({ open, onClose, onSuccess }) => {
    const { message, notification } = App.useApp();
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState([]);

    const handleDownloadTemplate = async () => {
        try {
            message.loading({ content: 'Đang tải file mẫu...', key: 'template' });
            const res = await inventoryService.getInventoryTemplate();
            
            // Dùng file-saver để tải blob
            const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'Mau_Nhap_Kho.xlsx');
            
            message.success({ content: 'Tải file mẫu thành công!', key: 'template' });
        } catch (error) {
            console.error(">>> Lỗi tải template:", error);
            
            // Xử lý trường hợp lỗi trả về là một Blob (ví dụ: 403 Forbidden trả về JSON bọc trong Blob)
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
        setErrors([]); // Reset lỗi cũ

        try {
            const res = await inventoryService.importInventory(file);
            
            if (res && res.EC === 0) {
                notification.success({
                    message: 'Nhập kho thành công',
                    description: res.EM,
                    placement: 'topRight'
                });
                setFileList([]);
                onSuccess(); // Refresh bảng dữ liệu bên ngoài
                onClose(); // Đóng modal
            } else {
                // Xử lý báo lỗi chi tiết từ Server (Option A: Lỗi toàn bộ)
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
            return false; // Ngăn chặn Antd tự động upload (để dùng handleUpload)
        },
        fileList,
        maxCount: 1,
    };

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Nhập Tồn Kho Bằng File Excel</Title>}
            open={open}
            onCancel={onClose}
            width={700}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={uploading}>
                    Hủy
                </Button>,
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
            ]}
        >
            <div className="py-4">
                <Paragraph>
                    Tải về file Excel mẫu, điền mã SKU và số lượng cần nhập kho, sau đó tải lên hệ thống.
                    Hệ thống sẽ <Text strong type="success">cộng dồn</Text> số lượng mới vào tồn kho hiện tại.
                </Paragraph>
                
                <div className="mb-6">
                    <Button 
                        icon={<DownloadOutlined />} 
                        onClick={handleDownloadTemplate}
                    >
                        Tải File Mẫu (Template)
                    </Button>
                </div>

                <Dragger {...uploadProps} className="mb-4">
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: '#107c41' }} />
                    </p>
                    <p className="ant-upload-text">Kéo thả hoặc Nhấp để chọn file Excel</p>
                    <p className="ant-upload-hint">
                        Chỉ hỗ trợ file .xlsx, .xls, .csv dưới 5MB. Tối đa 1000 dòng.
                    </p>
                </Dragger>

                {errors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <Space orientation="horizontal" className="mb-2">
                            <CloseCircleOutlined style={{ color: '#f5222d', fontSize: '18px' }} />
                            <Text strong type="danger">Phát hiện lỗi trong file (Dữ liệu chưa được lưu):</Text>
                        </Space>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <ul className="list-disc pl-5 m-0 text-red-500">
                                {errors.map((err, index) => (
                                    <li key={index}><Text type="danger">{err}</Text></li>
                                ))}
                            </ul>
                        </div>
                        <Text type="secondary" className="block mt-2 text-xs">
                            * Vui lòng sửa lại các lỗi trên trong file Excel và tải lên lại.
                        </Text>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImportInventoryModal;
