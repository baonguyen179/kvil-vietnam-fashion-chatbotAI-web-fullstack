import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Modal, Form, message, Popconfirm, Card, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import categoryService from '@/services/categoryService';

const { Title } = Typography;

const CategoryManagePage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    
    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingCategory, setEditingCategory] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    
    const [form] = Form.useForm();

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await categoryService.getAllCategories();
            if (res && res.EC === 0) {
                setCategories(res.DT);
            } else {
                message.error(res.EM || "Lấy danh sách danh mục thất bại!");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const filteredCategories = categories.filter(cat => 
        cat.name?.toLowerCase().includes(searchText.toLowerCase()) || 
        cat.slug?.toLowerCase().includes(searchText.toLowerCase())
    );

    const showAddModal = () => {
        setModalMode('add');
        setEditingCategory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (record) => {
        setModalMode('edit');
        setEditingCategory(record);
        form.setFieldsValue({
            name: record.name
        });
        setIsModalVisible(true);
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);
            
            if (modalMode === 'add') {
                const res = await categoryService.createCategory(values);
                if (res && res.EC === 0) {
                    message.success(res.EM || "Thêm danh mục thành công!");
                    setIsModalVisible(false);
                    fetchCategories();
                } else {
                    message.error(res.EM || "Thêm danh mục thất bại!");
                }
            } else if (modalMode === 'edit') {
                const res = await categoryService.updateCategory(editingCategory.id, values);
                if (res && res.EC === 0) {
                    message.success(res.EM || "Cập nhật danh mục thành công!");
                    setIsModalVisible(false);
                    fetchCategories();
                } else {
                    message.error(res.EM || "Cập nhật danh mục thất bại!");
                }
            }
        } catch (error) {
            console.log('Validation Failed:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await categoryService.deleteCategory(id);
            if (res && res.EC === 0) {
                message.success(res.EM || "Xóa danh mục thành công!");
                fetchCategories();
            } else {
                message.error(res.EM || "Xóa danh mục thất bại!");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi máy chủ");
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Đường dẫn (Slug)',
            dataIndex: 'slug',
            key: 'slug',
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        size="small"
                        onClick={() => showEditModal(record)}
                        className="bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-sm"
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa danh mục"
                        description={`Bạn có chắc muốn xóa ${record.name}?`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button 
                            danger 
                            icon={<DeleteOutlined />} 
                            size="small"
                            className="hover:scale-110 transition-all duration-300 shadow-sm"
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card className="shadow-md rounded-xl border-none">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={4} className="m-0">Quản lý danh mục</Title>
                    <p className="text-gray-500 mt-1 mb-0">Quản lý danh sách các loại sản phẩm của cửa hàng</p>
                </div>
                
                <Space>
                    <Input.Search
                        placeholder="Tìm kiếm danh mục..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        className="w-[300px]"
                    />
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<PlusOutlined />}
                        onClick={showAddModal}
                        className="bg-green-600 hover:bg-green-700 shadow-sm font-medium"
                    >
                        Thêm mới
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredCategories}
                rowKey="id"
                loading={loading}
                bordered
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục`
                }}
            />

            <Modal
                title={modalMode === 'add' ? "Thêm mới danh mục" : "Cập nhật danh mục"}
                open={isModalVisible}
                onOk={handleModalSubmit}
                onCancel={handleCancelModal}
                confirmLoading={submitLoading}
                okText="Lưu"
                cancelText="Hủy"
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên danh mục!' },
                            { min: 3, message: 'Tên danh mục phải có ít nhất 3 ký tự!' }
                        ]}
                    >
                        <Input placeholder="Nhập tên danh mục..." size="large" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default CategoryManagePage;
