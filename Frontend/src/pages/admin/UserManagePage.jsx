import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Space, Tag, message as antdMessage, Popconfirm, Card, Typography, Modal, Form, App } from 'antd';
import { SearchOutlined, CrownOutlined, UserAddOutlined } from '@ant-design/icons';
import userService from '@/services/userService';
import { useSelector } from 'react-redux';

const { Option } = Select;
const { Title } = Typography;

const ROLE_CONFIG = {
    'SUPER_ADMIN': { color: 'gold', label: 'Super Admin' },
    'SALES': { color: 'green', label: 'Sales' },
    'ACCOUNTANT': { color: 'cyan', label: 'Accountant' },
    'CUSTOMER': { color: 'blue', label: 'Customer' },
};

const UserManagePage = () => {
    const { message } = App.useApp();
    const currentUser = useSelector(state => state.auth.user);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        search: '',
        role: undefined,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [createLoading, setCreateLoading] = useState(false);

    const fetchUsers = async (page = 1, limit = 10, search = '', role = '') => {
        setLoading(true);
        try {
            const res = await userService.getAdminUsers({ page, limit, search, role });
            // console.log("res getAdminUsers: ", res);
            if (res && res.EC === 0) {
                setUsers(res.DT.users);
                setPagination({
                    current: res.DT.currentPage,
                    pageSize: limit,
                    total: res.DT.totalItems,
                });
            } else {
                message.error(res.EM || "Lấy danh sách người dùng thất bại!");
            }
        } catch (error) {
            message.error("Lỗi khi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize, filters.search, filters.role);
    }, []);

    const handleTableChange = (newPagination) => {
        fetchUsers(newPagination.current, newPagination.pageSize, filters.search, filters.role);
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            const res = await userService.updateUserRole(userId, newRole);
            if (res && res.EC === 0) {
                message.success(res.EM || "Cập nhật quyền thành công!");
                // Gọi lại API để cập nhật bảng ngay lập tức
                fetchUsers(pagination.current, pagination.pageSize, filters.search, filters.role);
            } else {
                message.error(res.EM || "Cập nhật quyền thất bại!");
            }
        } catch (error) {
            message.error("Lỗi khi kết nối đến máy chủ");
        }
    };

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
        fetchUsers(1, pagination.pageSize, value, filters.role); // Reset to page 1
    };

    const handleRoleFilter = (value) => {
        setFilters(prev => ({ ...prev, role: value }));
        fetchUsers(1, pagination.pageSize, filters.search, value); // Reset to page 1
    };

    const handleCreateUser = async (values) => {
        setCreateLoading(true);
        try {
            const res = await userService.createAdminUser(values);
            if (res && res.EC === 0) {
                message.success(res.EM || "Tạo người dùng thành công!");
                setIsModalOpen(false);
                form.resetFields();
                fetchUsers(1, pagination.pageSize, filters.search, filters.role);
            } else {
                message.error(res.EM || "Tạo người dùng thất bại!");
            }
        } catch (error) {
            message.error("Lỗi khi kết nối đến máy chủ");
        } finally {
            setCreateLoading(false);
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Họ Tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const config = ROLE_CONFIG[role] || { color: 'blue', label: role };
                return <Tag color={config.color} className="font-medium uppercase">{config.label}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => {
                const isSelf = currentUser?.id === record.id;
                
                return (
                    <Select
                        size="small"
                        value={record.role}
                        className="w-36"
                        disabled={isSelf}
                        onChange={(newRole) => {
                            handleUpdateRole(record.id, newRole);
                        }}
                    >
                        {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                            <Option key={key} value={key}>
                                {config.label}
                            </Option>
                        ))}
                    </Select>
                );
            },
        },
    ];

    return (
        <Card className="shadow-md rounded-xl border-none">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={4} className="m-0">Quản lý người dùng</Title>
                    <p className="text-gray-500 mt-1 mb-0">Quản lý danh sách tài khoản và phân quyền hệ thống</p>
                </div>
                
                <Space>
                    <Input.Search
                        placeholder="Tìm theo email, tên, SĐT..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        className="w-[300px]"
                    />
                    <Select
                        placeholder="Lọc theo vai trò"
                        allowClear
                        size="large"
                        className="w-[180px]"
                        onChange={handleRoleFilter}
                    >
                        {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                            <Option key={key} value={key}>{config.label}</Option>
                        ))}
                    </Select>
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<UserAddOutlined />}
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500! shadow-sm"
                    >
                        Thêm người dùng
                    </Button>
                </Space>
            </div>

            <Modal
                title={<Title level={4}>Thêm người dùng mới</Title>}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                confirmLoading={createLoading}
                okText="Tạo tài khoản"
                cancelText="Hủy"
                destroyOnHidden
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateUser}
                    className="mt-4"
                >
                    <Form.Item
                        name="loginValue"
                        label="Email hoặc Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập Email hoặc Số điện thoại!' }]}
                    >
                        <Input placeholder="name@example.com hoặc 0123456789" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password placeholder="Tối thiểu 6 ký tự" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="fullName"
                        label="Họ tên"
                    >
                        <Input placeholder="VD: Nguyễn Văn A" size="large" />
                    </Form.Item>
                </Form>
            </Modal>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                onChange={handleTableChange}
                bordered
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`
                }}
            />
        </Card>
    );
};

export default UserManagePage;
