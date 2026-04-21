import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Card, Typography, Tag, Modal, Form, Input, message, Tooltip, App } from 'antd';
import { 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    SafetyCertificateOutlined,
    SafetyOutlined 
} from '@ant-design/icons';
import adminRoleService from '@/services/adminRoleService';
import RolePermissionModal from '@/components/admin/role.permission.modal';

const { Title, Paragraph } = Typography;

const RoleManagePage = () => {
    const { message } = App.useApp();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await adminRoleService.getAllRoles();
            if (res && res.EC === 0) {
                setRoles(res.DT);
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách vai trò");
        } finally {
            setLoading(false);
        }
    };

    const handleAddRole = () => {
        setSelectedRole(null);
        form.resetFields();
        setIsRoleModalOpen(true);
    };

    const handleEditRole = (record) => {
        setSelectedRole(record);
        form.setFieldsValue({
            name: record.name,
            description: record.description
        });
        setIsRoleModalOpen(true);
    };

    const handleDeleteRole = (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa vai trò?',
            content: 'Hành động này không thể hoàn tác và có thể ảnh hưởng đến quyền truy cập của người dùng.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await adminRoleService.deleteRole(id);
                    if (res && res.EC === 0) {
                        message.success(res.EM);
                        fetchRoles();
                    } else {
                        message.error(res.EM);
                    }
                } catch (error) {
                    message.error("Lỗi khi xóa vai trò");
                }
            }
        });
    };

    const handleManagePermissions = (record) => {
        setSelectedRole(record);
        setIsPermissionModalOpen(true);
    };

    const handleRoleSubmit = async (values) => {
        setSubmitting(true);
        try {
            let res;
            if (selectedRole) {
                res = await adminRoleService.updateRole(selectedRole.id, values);
            } else {
                res = await adminRoleService.createRole(values);
            }

            if (res && res.EC === 0) {
                message.success(res.EM);
                setIsRoleModalOpen(false);
                fetchRoles();
            } else {
                message.error(res.EM);
            }
        } catch (error) {
            message.error("Lỗi xử lý yêu cầu");
        } finally {
            setSubmitting(false);
        }
    };

    const onPermissionSuccess = useCallback((msg) => {
        message.success(msg || "Cập nhật quyền thành công!");
        setIsPermissionModalOpen(false);
        fetchRoles();
    }, [message]);

    const columns = [
        {
            title: 'Tên vai trò',
            dataIndex: 'name',
            key: 'name',
            render: (name) => (
                <Tag color={name === 'SUPER_ADMIN' ? 'gold' : 'blue'} className="font-bold uppercase py-1 px-3">
                    {name}
                </Tag>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Số lượng quyền',
            key: 'permCount',
            align: 'center',
            render: (_, record) => (
                <Tag color="cyan">{record.permissions?.length || 0} quyền</Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 250,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Gán quyền hạn">
                        <Button 
                            icon={<SafetyCertificateOutlined />} 
                            onClick={() => handleManagePermissions(record)}
                            disabled={record.name === 'SUPER_ADMIN'}
                            className={`${record.name === 'SUPER_ADMIN' ? '' : 'text-green-600 border-green-600 hover:text-green-500! hover:border-green-500!'}`}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button 
                            icon={<EditOutlined />} 
                            onClick={() => handleEditRole(record)}
                            disabled={record.name === 'SUPER_ADMIN'}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button 
                            icon={<DeleteOutlined />} 
                            danger 
                            onClick={() => handleDeleteRole(record.id)}
                            disabled={record.name === 'SUPER_ADMIN'}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card className="shadow-lg rounded-xl border-none">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Title level={3} className="m-0 flex items-center gap-3">
                        <SafetyOutlined className="text-blue-600" />
                        Quản lý Vai trò & Quyền hạn
                    </Title>
                    <Paragraph className="text-gray-500 mt-2 mb-0">
                        Cấu hình các bộ quyền tập trung và gán cho các nhóm người dùng trong hệ thống.
                    </Paragraph>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    size="large"
                    onClick={handleAddRole}
                    className="bg-blue-600 hover:bg-blue-500! h-[45px] shadow-md"
                >
                    Thêm vai trò mới
                </Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={roles} 
                rowKey="id" 
                loading={loading}
                bordered
                pagination={false}
                className="custom-table"
            />

            {/* Modal Thêm/Sửa Role */}
            <Modal
                title={<Title level={4}>{selectedRole ? 'Cập nhật Vai trò' : 'Thêm Vai trò mới'}</Title>}
                open={isRoleModalOpen}
                onCancel={() => setIsRoleModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={submitting}
                centered
                okText={selectedRole ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleRoleSubmit}
                    className="mt-4"
                >
                    <Form.Item
                        name="name"
                        label="Tên vai trò (Mã hệ thống)"
                        rules={[{ required: true, message: 'Vui lòng nhập tên vai trò!' }]}
                    >
                        <Input placeholder="VD: SALES, MANAGER..." disabled={selectedRole?.name === 'SUPER_ADMIN'} />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả chi tiết"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả chức năng của vai trò này..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Quản lý Permission */}
            <RolePermissionModal
                open={isPermissionModalOpen}
                onCancel={() => setIsPermissionModalOpen(false)}
                role={selectedRole}
                onSuccess={onPermissionSuccess}
            />
        </Card>
    );
};

export default RoleManagePage;
