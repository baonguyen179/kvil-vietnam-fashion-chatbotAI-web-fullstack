import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import productService from '@/services/productService';

const { TextArea } = Input;
const { Option } = Select;

const AdminProductModal = ({ 
    isModalVisible, 
    setIsModalVisible, 
    modalMode, 
    editingProduct, 
    categories, 
    fetchProducts 
}) => {
    const [form] = Form.useForm();
    const [submitLoading, setSubmitLoading] = React.useState(false);

    useEffect(() => {
        if (isModalVisible) {
            if (modalMode === 'edit' && editingProduct) {
                // Populate form with existing data
                form.setFieldsValue({
                    name: editingProduct.name,
                    categoryId: editingProduct.category?.id || editingProduct.categoryId, // handle populate structure
                    basePrice: editingProduct.basePrice,
                    discountPercent: editingProduct.discountPercent,
                    description: editingProduct.description
                });
            } else {
                form.resetFields();
            }
        }
    }, [isModalVisible, modalMode, editingProduct, form]);

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);
            
            if (modalMode === 'add') {
                const res = await productService.createProduct(values);
                if (res && res.EC === 0) {
                    message.success(res.EM || "Thêm sản phẩm thành công!");
                    setIsModalVisible(false);
                    fetchProducts();
                } else {
                    message.error(res.EM || "Thêm sản phẩm thất bại!");
                }
            } else if (modalMode === 'edit') {
                const res = await productService.updateProduct(editingProduct.id, values);
                if (res && res.EC === 0) {
                    message.success(res.EM || "Cập nhật sản phẩm thành công!");
                    setIsModalVisible(false);
                    fetchProducts();
                } else {
                    message.error(res.EM || "Cập nhật sản phẩm thất bại!");
                }
            }
        } catch (error) {
            console.log('Validation Failed:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Modal
            title={modalMode === 'add' ? "Thêm mới sản phẩm gốc" : "Cập nhật thông tin gốc sản phẩm"}
            open={isModalVisible}
            onOk={handleModalSubmit}
            onCancel={handleCancel}
            confirmLoading={submitLoading}
            okText="Lưu"
            cancelText="Hủy"
            centered
            width={700}
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4 grid grid-cols-2 gap-x-4"
            >
                <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    className="col-span-2"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên sản phẩm!' },
                        { min: 3, message: 'Tên sản phẩm phải có ít nhất 3 ký tự!' }
                    ]}
                >
                    <Input placeholder="Ví dụ: Áo thun nam basic..." size="large" />
                </Form.Item>

                <Form.Item
                    name="categoryId"
                    label="Danh mục (Category)"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                >
                    <Select 
                        placeholder="Chọn danh mục" 
                        size="large"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {categories.map(cat => (
                            <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item
                        name="basePrice"
                        label="Giá gốc (VNĐ)"
                        rules={[{ required: true, message: 'Vui lòng nhập định mức giá gốc!' }]}
                    >
                        <InputNumber 
                            placeholder="vd: 150000" 
                            size="large" 
                            style={{ width: '100%' }}
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="discountPercent"
                        label="Giảm giá (%)"
                        initialValue={0}
                    >
                        <InputNumber 
                            placeholder="0-100" 
                            size="large" 
                            style={{ width: '100%' }}
                            min={0}
                            max={100}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label="Mô tả sản phẩm"
                    className="col-span-2"
                >
                    <TextArea 
                        placeholder="Nhập phần mô tả sản phẩm của bạn..." 
                        rows={5} 
                        size="large"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AdminProductModal;
