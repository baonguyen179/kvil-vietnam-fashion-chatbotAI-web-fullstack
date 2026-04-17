import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Button, Table, Space, message, Spin, Typography, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import productService from '@/services/productService';

const { Title, Text } = Typography;

const AdminVariantDrawer = ({
    isDrawerVisible,
    setIsDrawerVisible,
    manageVariantProduct,
}) => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm();

    const fetchProductVariants = async () => {
        if (!manageVariantProduct?.id) return;
        setLoading(true);
        try {
            const res = await productService.getProductById(manageVariantProduct.id);
            if (res && res.EC === 0) {
                setVariants(res.DT.variants || []);
            } else {
                message.error("Không thể tải danh sách biến thể!");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi kết nối máy chủ!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isDrawerVisible && manageVariantProduct) {
            fetchProductVariants();
            form.resetFields();
        }
    }, [isDrawerVisible, manageVariantProduct]);

    const handleClose = () => {
        setIsDrawerVisible(false);
        form.resetFields();
        setVariants([]);
    };

    const handleAddVariant = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);
            
            const res = await productService.addProductVariant(manageVariantProduct.id, values);
            if (res && res.EC === 0) {
                message.success(res.EM || "Thêm biến thể thành công!");
                form.resetFields();
                fetchProductVariants(); // Tải lại danh sách biến thể
            } else {
                message.error(res.EM || "Thêm biến thể thất bại!");
            }
        } catch (error) {
            console.log('Validation Failed:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns = [
        {
            title: 'Màu sắc (Color)',
            dataIndex: 'color',
            key: 'color',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Kích cỡ (Size)',
            dataIndex: 'size',
            key: 'size',
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: 'Giá riêng (VNĐ)',
            dataIndex: 'price',
            key: 'price',
            render: (val) => val ? val.toLocaleString() + 'đ' : <Text type="secondary">Mặc định</Text>
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            render: (val) => val ? val : <Text type="secondary">Auto</Text>
        }
    ];

    return (
        <Drawer
            title={`Quản lý Biến thể: ${manageVariantProduct?.name || ''}`}
            placement="right"
            width={700}
            onClose={handleClose}
            open={isDrawerVisible}
        >
            <Spin spinning={loading}>
                <Card title="Thêm biến thể mới" size="small" className="mb-6 bg-gray-50 border border-gray-200">
                    <Form
                        form={form}
                        layout="vertical"
                        className="grid grid-cols-2 gap-x-4"
                    >
                        <Form.Item
                            name="color"
                            label="Màu sắc"
                            rules={[{ required: true, message: 'Vui lòng nhập màu sắc!' }]}
                        >
                            <Input placeholder="vd: Đỏ, Xanh, Trắng..." />
                        </Form.Item>

                        <Form.Item
                            name="size"
                            label="Kích cỡ"
                            rules={[{ required: true, message: 'Vui lòng nhập kích cỡ!' }]}
                        >
                            <Input placeholder="vd: S, M, L, XL..." />
                        </Form.Item>

                        <Form.Item
                            name="stock"
                            label="Số lượng (Tồn kho)"
                            rules={[{ required: true, message: 'Vui lòng nhập tồn kho!' }]}
                        >
                            <InputNumber min={0} placeholder="vd: 100" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label="Giá tùy chỉnh (nếu có khác gốc)"
                        >
                            <InputNumber 
                                min={0} 
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                placeholder="Bỏ trống để dùng giá mặc định"
                            />
                        </Form.Item>

                        <Form.Item
                            name="sku"
                            label="Mã SKU (tùy chọn)"
                            className="col-span-2"
                        >
                            <Input placeholder="Ví dụ: SP01-RED-M. Bỏ trống sẽ tự động tạo" />
                        </Form.Item>

                        <div className="col-span-2 flex justify-end">
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={handleAddVariant}
                                loading={submitLoading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Thêm Biến thể
                            </Button>
                        </div>
                    </Form>
                </Card>

                <Title level={5} className="mb-4">Danh sách biến thể hiện tại</Title>
                <Table
                    columns={columns}
                    dataSource={variants}
                    rowKey="id"
                    pagination={false}
                    bordered
                    size="small"
                />
            </Spin>
        </Drawer>
    );
};

export default AdminVariantDrawer;
