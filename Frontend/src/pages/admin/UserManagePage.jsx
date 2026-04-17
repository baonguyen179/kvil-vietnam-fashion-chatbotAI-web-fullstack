import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Space, Tag, message, Popconfirm, Card, Typography } from 'antd';
import { SearchOutlined, CrownOutlined } from '@ant-design/icons';
import userService from '@/services/userService';
import { useSelector } from 'react-redux';

const { Option } = Select;
const { Title } = Typography;

const UserManagePage = () => {
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

    const fetchUsers = async (page = 1, limit = 10, search = '', role = '') => {
        setLoading(true);
        try {
            const res = await userService.getAdminUsers({ page, limit, search, role });
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
                let color = role === 'ADMIN' ? 'gold' : 'blue';
                return <Tag color={color}>{role}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => {
                const isSelf = currentUser?.id === record.id;
                return (
                    <Space size="middle">
                        {record.role !== 'ADMIN' ? (
                            <Popconfirm
                                title="Cấp quyền Admin"
                                description={`Bạn có chắc muốn cấp quyền ADMIN cho ${record.fullName}?`}
                                onConfirm={() => handleUpdateRole(record.id, 'ADMIN')}
                                okText="Đồng ý"
                                cancelText="Hủy"
                            >
                                <Button 
                                    size="small" 
                                    icon={<CrownOutlined />} 
                                    className="text-amber-600 border-amber-600 hover:bg-amber-500! hover:text-white! hover:border-amber-500! hover:scale-110! transition-all duration-300 shadow-sm"
                                >
                                    Cấp quyền
                                </Button>
                            </Popconfirm>
                        ) : (
                            <Popconfirm
                                title="Hủy quyền Admin"
                                description={`Bạn có chắc muốn giáng cấp ${record.fullName} xuống USER?`}
                                onConfirm={() => handleUpdateRole(record.id, 'USER')}
                                okText="Đồng ý"
                                cancelText="Hủy"
                                disabled={isSelf} // Khóa popup nếu tự hủy bản thân
                            >
                                <Button 
                                    danger 
                                    size="small" 
                                    disabled={isSelf}
                                    className={!isSelf ? "hover:bg-red-500! hover:text-white! hover:scale-110! transition-all duration-300 shadow-sm" : ""}
                                >
                                    Hủy quyền
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
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
                        className="w-[150px]"
                        onChange={handleRoleFilter}
                    >
                        <Option value="ADMIN">Admin</Option>
                        <Option value="USER">User</Option>
                    </Select>
                </Space>
            </div>

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
