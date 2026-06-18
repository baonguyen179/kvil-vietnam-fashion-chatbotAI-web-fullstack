import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, InputNumber, Button, Table, Space, message, Spin, Typography, Card, Select, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import productService from '@/services/productService';
import colorService from '@/services/colorService';
import sizeService from '@/services/sizeService';
import inventoryService from '@/services/inventoryService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminVariantDrawer = ({
    isDrawerVisible,
    setIsDrawerVisible,
    manageVariantProduct,
    fetchProducts
}) => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [editingVariant, setEditingVariant] = useState(null);
    const [form] = Form.useForm();

    // State phục vụ việc xem lịch sử nhập kho của biến thể
    const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
    const [selectedVariantForHistory, setSelectedVariantForHistory] = useState(null);
    const [historyLogs, setHistoryLogs] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyType, setHistoryType] = useState('IN');

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
            fetchAttributes();
            form.resetFields();
        }
    }, [isDrawerVisible, manageVariantProduct]);

    const fetchAttributes = async () => {
        try {
            const [colorRes, sizeRes] = await Promise.all([
                colorService.getAllColors(),
                sizeService.getAllSizes()
            ]);
            if (colorRes?.EC === 0) setColors(colorRes.DT);
            if (sizeRes?.EC === 0) setSizes(sizeRes.DT);
        } catch (error) {
            console.error("Lỗi lấy attributes:", error);
        }
    };

    const handleClose = () => {
        setIsDrawerVisible(false);
        form.resetFields();
        setVariants([]);
        setEditingVariant(null);
    };

    const handleEditClick = (record) => {
        setEditingVariant(record);
        form.setFieldsValue({
            colorId: record.colorId,
            sizeId: record.sizeId,
            stock: record.stock, // Disabled in UI
            price: record.price,
            sku: record.sku,
            costPrice: record.avgCostPrice
        });
    };

    const handleCancelEdit = () => {
        setEditingVariant(null);
        form.resetFields();
    };

    const handleSubmitVariant = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);
            
            if (editingVariant) {
                // Cập nhật biến thể
                const res = await productService.updateProductVariant(editingVariant.id, values);
                if (res && res.EC === 0) {
                    message.success("Cập nhật thông tin biến thể thành công!");
                    handleCancelEdit();
                    fetchProductVariants();
                    if (fetchProducts) fetchProducts();
                } else {
                    message.error(res.EM || "Cập nhật thất bại!");
                }
            } else {
                // Thêm biến thể mới
                const res = await productService.addProductVariant(manageVariantProduct.id, values);
                if (res && res.EC === 0) {
                    message.success(res.EM || "Thêm biến thể thành công!");
                    form.resetFields();
                    fetchProductVariants();
                    if (fetchProducts) fetchProducts();
                } else {
                    message.error(res.EM || "Thêm biến thể thất bại!");
                }
            }
        } catch (error) {
            console.log('Validation Failed:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleShowHistoryLogs = async (record, type = 'IN') => {
        setSelectedVariantForHistory(record);
        setHistoryType(type);
        setIsHistoryModalVisible(true);
        setHistoryLoading(true);
        try {
            // Lấy tối đa 50 log của biến thể này theo loại (IN/OUT)
            const res = await inventoryService.getInventoryLogs(1, 50, type, record.id);
            if (res && res.EC === 0) {
                setHistoryLogs(res.DT.logs || []);
            } else {
                message.error(res.EM || `Không thể tải lịch sử ${type === 'IN' ? 'nhập' : 'xuất'} hàng!`);
            }
        } catch (error) {
            console.error(">>> Error fetching variant inventory logs:", error);
            message.error("Lỗi khi kết nối đến máy chủ");
        } finally {
            setHistoryLoading(false);
        }
    };

    const columns = [
        {
            title: 'Màu sắc (Color)',
            dataIndex: 'color',
            key: 'color',
            render: (_, record) => (
                <Space>
                    {record.color?.hexCode && (
                        <div style={{ width: 16, height: 16, background: record.color.hexCode, border: '1px solid #d9d9d9', borderRadius: 2 }} />
                    )}
                    <Text strong>{record.color?.name || 'N/A'}</Text>
                </Space>
            )
        },
        {
            title: 'Kích cỡ (Size)',
            dataIndex: 'size',
            key: 'size',
            render: (_, record) => <Text>{record.size?.name || 'N/A'}</Text>
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: 'Giá vốn (AVG)',
            dataIndex: 'avgCostPrice',
            key: 'avgCostPrice',
            render: (val) => val ? val.toLocaleString() + 'đ' : <Text type="secondary">0đ</Text>
        },
        {
            title: 'Giá bán (VNĐ)',
            dataIndex: 'price',
            key: 'price',
            render: (val) => val ? val.toLocaleString() + 'đ' : <Text type="secondary">Mặc định</Text>
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            render: (val) => val ? val : <Text type="secondary">Auto</Text>
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        onClick={() => handleEditClick(record)}
                        disabled={editingVariant?.id === record.id}
                    >
                        Sửa
                    </Button>
                    <Button 
                        type="link" 
                        onClick={() => handleShowHistoryLogs(record, 'IN')}
                        style={{ color: '#107c41' }}
                    >
                        Lịch sử nhập
                    </Button>
                    <Button 
                        type="link" 
                        onClick={() => handleShowHistoryLogs(record, 'OUT')}
                        style={{ color: '#d9363e' }}
                    >
                        Lịch sử xuất
                    </Button>
                </Space>
            )
        }
    ];

    // Các cột cho bảng lịch sử nhập hàng trong Modal
    const historyColumns = [
        {
            title: 'Ngày nhập',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (val) => dayjs(val).format('DD/MM/YYYY HH:mm'),
            width: 150
        },
        {
            title: 'Số lượng nhập',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (val) => <span className="text-green-600 font-semibold">+{val}</span>,
            width: 120
        },
        {
            title: 'Giá vốn nhập',
            dataIndex: 'costPrice',
            key: 'costPrice',
            render: (val) => val ? parseFloat(val).toLocaleString('vi-VN') + 'đ' : '0đ',
            width: 130
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (val) => <span className="text-gray-500 text-xs">{val || '---'}</span>
        }
    ];

    // Các cột cho bảng lịch sử xuất hàng trong Modal (định dạng giá X xuất Y sản phẩm)
    const exportHistoryColumns = [
        {
            title: 'Ngày xuất',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (val) => dayjs(val).format('DD/MM/YYYY HH:mm'),
            width: 150
        },
        {
            title: 'Chi tiết xuất',
            key: 'detail',
            render: (_, record) => {
                const rawPrice = record.orderItemPrice && parseFloat(record.orderItemPrice) > 0
                    ? parseFloat(record.orderItemPrice)
                    : (record.costPrice && parseFloat(record.costPrice) > 0
                        ? parseFloat(record.costPrice)
                        : (record.variant?.price 
                            ? parseFloat(record.variant.price) 
                            : (selectedVariantForHistory?.price 
                                ? parseFloat(selectedVariantForHistory.price) 
                                : 0)));
                const priceStr = rawPrice > 0 ? rawPrice.toLocaleString('vi-VN') + 'đ' : '0đ';
                return (
                    <span>
                        Giá bán <Text strong>{priceStr}</Text> xuất <Text type="danger" strong>{record.quantity}</Text> sản phẩm
                    </span>
                );
            },
            width: 300
        },
        {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            render: (val) => <span className="text-gray-500 text-xs">{val || '---'}</span>
        }
    ];

    return (
        <Drawer
            title={`Quản lý Biến thể: ${manageVariantProduct?.name || ''}`}
            placement="right"
            size="large"
            onClose={handleClose}
            open={isDrawerVisible}
        >
            <Spin spinning={loading}>
                <Card 
                    title={editingVariant ? "Chỉnh sửa biến thể" : "Thêm biến thể mới"} 
                    size="small" 
                    className={`mb-6 border ${editingVariant ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        className="grid grid-cols-2 gap-x-4"
                    >
                        <Form.Item
                            name="colorId"
                            label="Màu sắc"
                            rules={[{ required: true, message: 'Vui lòng chọn màu sắc!' }]}
                        >
                            <Select placeholder="Chọn màu sắc" showSearch optionFilterProp="children">
                                {colors.map(c => (
                                    <Option key={c.id} value={c.id}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 14, height: 14, background: c.hexCode, border: '1px solid #d9d9d9', borderRadius: 2 }} />
                                            {c.name}
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="sizeId"
                            label="Kích cỡ"
                            rules={[{ required: true, message: 'Vui lòng chọn kích cỡ!' }]}
                        >
                            <Select placeholder="Chọn kích cỡ" showSearch optionFilterProp="children">
                                {sizes.map(s => (
                                    <Option key={s.id} value={s.id}>
                                        {s.name} {s.description && `(${s.description})`}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="stock"
                            label="Số lượng (Tồn kho)"
                            rules={[{ required: true, message: 'Vui lòng nhập tồn kho!' }]}
                        >
                            <InputNumber 
                                min={0} 
                                placeholder="vd: 100" 
                                style={{ width: '100%' }} 
                                disabled={!!editingVariant} // Khóa không cho sửa trực tiếp để đảm bảo tính toàn vẹn Log kho
                            />
                            {editingVariant && (
                                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
                                    * Không thể sửa trực tiếp. Vui lòng nhập/xuất kho để thay đổi số lượng.
                                </Text>
                            )}
                        </Form.Item>

                        <Form.Item
                            name="costPrice"
                            label="Giá vốn nhập (*)"
                            rules={[{ required: !editingVariant, message: 'Vui lòng nhập giá vốn!' }]}
                        >
                            <InputNumber 
                                min={0} 
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                placeholder={editingVariant ? "" : "vd: 50,000"}
                                disabled={!!editingVariant}
                            />
                            {editingVariant && (
                                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
                                    * Không thể sửa trực tiếp. Vui lòng nhập/xuất kho để điều chỉnh giá vốn.
                                </Text>
                            )}
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label="Giá bán"
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
                            label="Mã SKU(Stock Keeping Unit)"
                            className="col-span-2"
                        >
                            <Input placeholder="Mã sản phẩm trong kho" />
                        </Form.Item>

                        <div className="col-span-2 flex justify-end gap-2">
                            {editingVariant && (
                                <Button 
                                    onClick={handleCancelEdit}
                                    disabled={submitLoading}
                                >
                                    Hủy
                                </Button>
                            )}
                            <Button 
                                type="primary" 
                                icon={editingVariant ? null : <PlusOutlined />} 
                                onClick={handleSubmitVariant}
                                loading={submitLoading}
                                className={editingVariant ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"}
                            >
                                {editingVariant ? "Cập nhật Biến thể" : "Thêm Biến thể"}
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

            {/* Modal hiển thị lịch sử nhập/xuất kho của biến thể */}
            <Modal
                title={historyType === 'IN' 
                    ? `Lịch sử giá nhập hàng - SKU: ${selectedVariantForHistory?.sku || 'N/A'}`
                    : `Lịch sử xuất hàng - SKU: ${selectedVariantForHistory?.sku || 'N/A'}`
                }
                open={isHistoryModalVisible}
                onCancel={() => {
                    setIsHistoryModalVisible(false);
                    setSelectedVariantForHistory(null);
                    setHistoryLogs([]);
                }}
                footer={[
                    <Button 
                        key="close" 
                        onClick={() => {
                            setIsHistoryModalVisible(false);
                            setSelectedVariantForHistory(null);
                            setHistoryLogs([]);
                        }}
                    >
                        Đóng
                    </Button>
                ]}
                width={700}
                centered
            >
                <Table
                    columns={historyType === 'IN' ? historyColumns : exportHistoryColumns}
                    dataSource={historyLogs}
                    rowKey="id"
                    loading={historyLoading}
                    size="small"
                    bordered
                    pagination={{ pageSize: 5 }}
                    locale={{ 
                        emptyText: historyType === 'IN' 
                            ? 'Chưa có lịch sử nhập hàng cho biến thể này.' 
                            : 'Chưa có lịch sử xuất hàng cho biến thể này.' 
                    }}
                />
            </Modal>
        </Drawer>
    );
};

export default AdminVariantDrawer;
