import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Popconfirm, Space, Tooltip, Tag, Typography, message, App, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import colorService from '@/services/colorService';
import sizeService from '@/services/sizeService';

const { Title, Text } = Typography;

const ColorSizeManagePage = () => {
    const { message } = App.useApp();
    const [activeTab, setActiveTab] = useState('1');

    // Colors State
    const [colors, setColors] = useState([]);
    const [colorLoading, setColorLoading] = useState(false);
    const [isColorModalVisible, setIsColorModalVisible] = useState(false);
    const [colorMode, setColorMode] = useState('add');
    const [editingColor, setEditingColor] = useState(null);
    const [colorForm] = Form.useForm();
    const [colorSubmitLoading, setColorSubmitLoading] = useState(false);

    // Sizes State
    const [sizes, setSizes] = useState([]);
    const [sizeLoading, setSizeLoading] = useState(false);
    const [isSizeModalVisible, setIsSizeModalVisible] = useState(false);
    const [sizeMode, setSizeMode] = useState('add');
    const [editingSize, setEditingSize] = useState(null);
    const [sizeForm] = Form.useForm();
    const [sizeSubmitLoading, setSizeSubmitLoading] = useState(false);

    useEffect(() => {
        if (activeTab === '1') {
            fetchColors();
        } else {
            fetchSizes();
        }
    }, [activeTab]);

    // ---- COLORS LOGIC ----
    const fetchColors = async () => {
        setColorLoading(true);
        try {
            const res = await colorService.getAllColors();
            if (res && res.EC === 0) {
                setColors(res.DT);
            } else {
                message.error(res.EM || "Lỗi tải màu sắc");
            }
        } catch (error) {
            message.error("Lỗi kết nối");
        } finally {
            setColorLoading(false);
        }
    };

    const handleOpenColorModal = (mode, record = null) => {
        setColorMode(mode);
        setEditingColor(record);
        if (mode === 'edit' && record) {
            colorForm.setFieldsValue({ name: record.name, hexCode: record.hexCode });
        } else {
            colorForm.resetFields();
        }
        setIsColorModalVisible(true);
    };

    const handleColorSubmit = async () => {
        try {
            const values = await colorForm.validateFields();
            setColorSubmitLoading(true);
            let res;
            if (colorMode === 'add') {
                res = await colorService.createColor(values);
            } else {
                res = await colorService.updateColor(editingColor.id, values);
            }

            if (res && res.EC === 0) {
                message.success(res.EM || "Thành công");
                setIsColorModalVisible(false);
                fetchColors();
            } else {
                message.error(res.EM || "Thất bại");
            }
        } catch (error) {
            console.log('Validation Failed:', error);
        } finally {
            setColorSubmitLoading(false);
        }
    };

    const handleDeleteColor = async (id) => {
        try {
            const res = await colorService.deleteColor(id);
            if (res && res.EC === 0) {
                message.success(res.EM || "Đã xóa");
                fetchColors();
            } else {
                message.error(res.EM || "Lỗi khi xóa");
            }
        } catch (error) {
            message.error("Lỗi kết nối");
        }
    };

    // ---- SIZES LOGIC ----
    const fetchSizes = async () => {
        setSizeLoading(true);
        try {
            const res = await sizeService.getAllSizes();
            if (res && res.EC === 0) {
                setSizes(res.DT);
            } else {
                message.error(res.EM || "Lỗi tải kích cỡ");
            }
        } catch (error) {
            message.error("Lỗi kết nối");
        } finally {
            setSizeLoading(false);
        }
    };

    const handleOpenSizeModal = (mode, record = null) => {
        setSizeMode(mode);
        setEditingSize(record);
        if (mode === 'edit' && record) {
            sizeForm.setFieldsValue({ name: record.name, description: record.description });
        } else {
            sizeForm.resetFields();
        }
        setIsSizeModalVisible(true);
    };

    const handleSizeSubmit = async () => {
        try {
            const values = await sizeForm.validateFields();
            setSizeSubmitLoading(true);
            let res;
            if (sizeMode === 'add') {
                res = await sizeService.createSize(values);
            } else {
                res = await sizeService.updateSize(editingSize.id, values);
            }

            if (res && res.EC === 0) {
                message.success(res.EM || "Thành công");
                setIsSizeModalVisible(false);
                fetchSizes();
            } else {
                message.error(res.EM || "Thất bại");
            }
        } catch (error) {
            console.log('Validation Failed:', error);
        } finally {
            setSizeSubmitLoading(false);
        }
    };

    const handleDeleteSize = async (id) => {
        try {
            const res = await sizeService.deleteSize(id);
            if (res && res.EC === 0) {
                message.success(res.EM || "Đã xóa");
                fetchSizes();
            } else {
                message.error(res.EM || "Lỗi khi xóa");
            }
        } catch (error) {
            message.error("Lỗi kết nối");
        }
    };

    const colorColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Tên Màu', dataIndex: 'name', key: 'name' },
        { 
            title: 'Hiển thị', 
            dataIndex: 'hexCode', 
            key: 'hexCode',
            render: (text) => (
                <Space>
                    <div style={{ width: 24, height: 24, background: text, border: '1px solid #d9d9d9', borderRadius: 4 }} />
                    <Text>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenColorModal('edit', record)} className="text-blue-500 hover:bg-blue-50" />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa màu này?"
                        onConfirm={() => handleDeleteColor(record.id)}
                        okText="Có"
                        cancelText="Không"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50" />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const sizeColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: 'Kích cỡ', dataIndex: 'name', key: 'name', render: text => <Tag color="blue">{text}</Tag> },
        { title: 'Mô tả', dataIndex: 'description', key: 'description' },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenSizeModal('edit', record)} className="text-blue-500 hover:bg-blue-50" />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa size này?"
                        onConfirm={() => handleDeleteSize(record.id)}
                        okText="Có"
                        cancelText="Không"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50" />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Card className="shadow-md rounded-xl border-none">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={4} className="m-0">Quản lý Màu sắc & Kích cỡ</Title>
                    <p className="text-gray-500 mt-1 mb-0">Thiết lập các thuộc tính cho biến thể sản phẩm</p>
                </div>
            </div>

            <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={[
                    {
                        key: '1',
                        label: 'Quản lý Màu sắc (Colors)',
                        children: (
                            <div>
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenColorModal('add')} className="mb-4">
                                    Thêm Màu mới
                                </Button>
                                <Table columns={colorColumns} dataSource={colors} rowKey="id" loading={colorLoading} pagination={{ pageSize: 10 }} bordered />
                            </div>
                        )
                    },
                    {
                        key: '2',
                        label: 'Quản lý Kích cỡ (Sizes)',
                        children: (
                            <div>
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenSizeModal('add')} className="mb-4">
                                    Thêm Size mới
                                </Button>
                                <Table columns={sizeColumns} dataSource={sizes} rowKey="id" loading={sizeLoading} pagination={{ pageSize: 10 }} bordered />
                            </div>
                        )
                    }
                ]}
            />

            {/* Color Modal */}
            <Modal
                title={colorMode === 'add' ? "Thêm Màu Mới" : "Sửa Thông Tin Màu"}
                open={isColorModalVisible}
                onOk={handleColorSubmit}
                onCancel={() => setIsColorModalVisible(false)}
                confirmLoading={colorSubmitLoading}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={colorForm} layout="vertical">
                    <Form.Item name="name" label="Tên Màu" rules={[{ required: true, message: 'Vui lòng nhập tên màu' }]}>
                        <Input placeholder="VD: Đen, Trắng..." />
                    </Form.Item>
                    <Form.Item label="Mã Màu / CSS Gradient" tooltip="Nhập mã Hex Code (VD: #FF0000) hoặc dán mã gradient CSS (VD: repeating-linear-gradient(...))" required>
                        <Space.Compact style={{ width: '100%' }}>
                            <Form.Item name="hexCode" noStyle rules={[{ required: true, message: 'Vui lòng nhập mã màu' }]}>
                                <Input placeholder="VD: #000000 hoặc repeating-linear-gradient(...)" />
                            </Form.Item>
                            <Form.Item name="hexCode" noStyle>
                                <Input type="color" style={{ width: '50px', padding: '0 4px', cursor: 'pointer' }} title="Bảng màu (Chỉ hỗ trợ màu đơn sắc)" />
                            </Form.Item>
                        </Space.Compact>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Size Modal */}
            <Modal
                title={sizeMode === 'add' ? "Thêm Size Mới" : "Sửa Thông Tin Size"}
                open={isSizeModalVisible}
                onOk={handleSizeSubmit}
                onCancel={() => setIsSizeModalVisible(false)}
                confirmLoading={sizeSubmitLoading}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={sizeForm} layout="vertical">
                    <Form.Item name="name" label="Tên Size" rules={[{ required: true, message: 'Vui lòng nhập kích cỡ' }]}>
                        <Input placeholder="VD: S, M, L..." />
                    </Form.Item>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="VD: Dành cho người dưới 50kg" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default ColorSizeManagePage;
