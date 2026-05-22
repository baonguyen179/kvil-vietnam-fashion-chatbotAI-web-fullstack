import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Checkbox, Row, Col, Typography, Tag, Empty, Spin } from 'antd';
import adminRoleService from '@/services/adminRoleService';

const { Title, Text } = Typography;

const RolePermissionModal = ({ open, onCancel, role, onSuccess }) => {
    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Lấy toàn bộ permissions khi mở modal
    useEffect(() => {
        if (open) {
            fetchAllPermissions();
            // Reset selected permissions từ role hiện tại
            if (role && role.permissions) {
                setSelectedPermissions(role.permissions.map(p => p.id));
            } else {
                setSelectedPermissions([]);
            }
        }
    }, [open, role]);

    const fetchAllPermissions = async () => {
        setLoading(true);
        try {
            const res = await adminRoleService.getAllPermissions();
            if (res && res.EC === 0) {
                setPermissions(res.DT);
            }
        } catch (error) {
            console.error("Error fetching permissions:", error);
        } finally {
            setLoading(false);
        }
    };

    // Nhóm permissions theo module để hiển thị chuyên nghiệp
    const groupedPermissions = useMemo(() => {
        if (!Array.isArray(permissions)) return {};
        
        return permissions.reduce((acc, curr) => {
            const module = curr.module || 'Khác';
            if (!acc[module]) acc[module] = [];
            acc[module].push(curr);
            return acc;
        }, {});
    }, [permissions]);

    const handleOk = async () => {
        setSubmitting(true);
        try {
            const res = await adminRoleService.assignPermissionsToRole(role.id, selectedPermissions);
            if (res && res.EC === 0) {
                onSuccess(res.EM);
            }
        } catch (error) {
            console.error("Error assigning permissions:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedPermissions(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAllInModule = (modulePermissions, checked) => {
        const ids = modulePermissions.map(p => p.id);
        if (checked) {
            setSelectedPermissions(prev => [...new Set([...prev, ...ids])]);
        } else {
            setSelectedPermissions(prev => prev.filter(id => !ids.includes(id)));
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <Title level={4} style={{ margin: 0 }}>Quản lý quyền hạn</Title>
                    {role && <Tag color="blue" className="uppercase">{role.name}</Tag>}
                </div>
            }
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={submitting}
            width={800}
            centered
            okText="Cập nhật quyền hạn"
            cancelText="Hủy"
            styles={{ body: { maxHeight: '60vh', overflowY: 'auto', padding: '20px' } }}
        >
            <Spin spinning={loading}>
                {Object.keys(groupedPermissions).length > 0 ? (
                    Object.entries(groupedPermissions).map(([module, perms]) => {
                        const allChecked = perms.every(p => selectedPermissions.includes(p.id));
                        const someChecked = perms.some(p => selectedPermissions.includes(p.id)) && !allChecked;

                        return (
                            <div key={module} className="mb-6">
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded mb-3">
                                    <Text strong className="text-blue-600 uppercase text-xs">{module}</Text>
                                    <Checkbox
                                        indeterminate={someChecked}
                                        checked={allChecked}
                                        onChange={(e) => handleSelectAllInModule(perms, e.target.checked)}
                                    >
                                        <span className="text-xs">Chọn tất cả</span>
                                    </Checkbox>
                                </div>
                                <Row gutter={[16, 16]}>
                                    {perms.map(p => (
                                        <Col span={12} key={p.id}>
                                            <div className={`p-2 border rounded-md transition-all ${selectedPermissions.includes(p.id) ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}>
                                                <Checkbox
                                                    checked={selectedPermissions.includes(p.id)}
                                                    onChange={() => handleCheckboxChange(p.id)}
                                                >
                                                    <div className="ml-1">
                                                        <div className="font-medium text-sm">{p.description || p.name}</div>
                                                        <Text type="secondary" style={{ fontSize: '11px' }}>{p.name}</Text>
                                                    </div>
                                                </Checkbox>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        );
                    })
                ) : (
                    <Empty description="Không có quyền hạn nào được tìm thấy" />
                )}
            </Spin>
        </Modal>
    );
};

export default React.memo(RolePermissionModal);
