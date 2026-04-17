import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Space, Tag, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, CrownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import userService from '@/services/userService';
import { useSelector } from 'react-redux';

const { Option } = Select;

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
                                <Button size="small" icon={<CrownOutlined />} style={{ color: '#d97706', borderColor: '#d97706' }}>
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
                                <Button danger size="small" disabled={isSelf}>
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
        <div style={{ padding: '24px', background: '#fff', borderRadius: '8px', minHeight: 'calc(100vh - 150px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <Space>
                    <Input.Search
                        placeholder="Tìm theo email, tên, SĐT..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Select
                        placeholder="Lọc theo vai trò"
                        allowClear
                        size="large"
                        style={{ width: 150 }}
                        onChange={handleRoleFilter}
                    >
                        <Option value="ADMIN">Admin</Option>
                        <Option value="USER">User</Option>
                    </Select>
                </Space>
                
                {/* <Button type="primary" size="large" icon={<PlusOutlined />}>
                    Thêm người dùng
                </Button> */}
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
                bordered
            />
        </div>
    );
};

export default UserManagePage;
