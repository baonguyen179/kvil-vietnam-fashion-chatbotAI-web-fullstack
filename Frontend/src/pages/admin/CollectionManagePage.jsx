import React, { useState, useEffect } from 'react';
import {
    Table, Input, Button, Space, Tag, message as antdMessage, Card, Typography,
    Tooltip, Badge, Image, App
} from 'antd';
import {
    PlusOutlined, EditOutlined, SearchOutlined,
    AppstoreAddOutlined, PictureFilled
} from '@ant-design/icons';
import collectionService from '@/services/collectionService';
import AdminCollectionModal from '@/components/admin/admin.collection.modal';
import AdminCollectionDrawer from '@/components/admin/admin.collection.drawer';

const { Title, Text } = Typography;

const CollectionManagePage = () => {
    const { message } = App.useApp();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [manageCollection, setManageCollection] = useState(null);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const res = await collectionService.getPublicCollections();
            if (res && res.EC === 0) {
                setCollections(res.DT || []);
            } else {
                message.error(res.EM || 'Không lấy được danh sách!');
            }
        } catch (err) {
            message.error('Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const openAddModal = () => {
        setEditingCollection(null);
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingCollection(record);
        setIsModalOpen(true);
    };

    const openManageDrawer = (record) => {
        setManageCollection(record);
        setIsDrawerOpen(true);
    };

    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Banner',
            dataIndex: 'bannerUrl',
            key: 'banner',
            width: 100,
            render: (url) => url
                ? <Image src={url} width={72} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} />
                : <div className="flex items-center justify-center bg-gray-100 rounded" style={{ width: 72, height: 48 }}>
                    <PictureFilled className="text-gray-300 text-xl" />
                </div>
        },
        {
            title: 'Tên Bộ sưu tập',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">slug: {record.slug}</div>
                </div>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (text) => (
                <Text type="secondary" className="text-sm" style={{ maxWidth: 250, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {text || <span className="italic text-gray-300">Chưa có mô tả</span>}
                </Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (val) => val
                ? <Badge status="success" text={<Tag color="green">Kích hoạt</Tag>} />
                : <Badge status="default" text={<Tag color="default">Đã ẩn</Tag>} />,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 130,
            render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '-',
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Quản lý sản phẩm">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<AppstoreAddOutlined />}
                            onClick={() => openManageDrawer(record)}
                            className="text-purple-500 hover:bg-purple-50"
                        />
                    </Tooltip>
                    <Tooltip title="Sửa thông tin">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                            className="text-blue-500 hover:bg-blue-50"
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <Card className="shadow-md rounded-xl border-none">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={4} className="m-0">Quản lý Bộ sưu tập</Title>
                    <p className="text-gray-500 mt-1 mb-0">Tạo và quản lý các nhóm sản phẩm theo chủ đề / mùa vụ</p>
                </div>
                <Space>
                    <Input.Search
                        placeholder="Tìm kiếm bộ sưu tập..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        className="w-[260px]"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={openAddModal}
                        className="bg-green-600 hover:bg-green-700 shadow-sm font-medium"
                    >
                        Thêm BST
                    </Button>
                </Space>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredCollections}
                rowKey="id"
                loading={loading}
                bordered
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bộ sưu tập`
                }}
            />

            {/* Modal Tạo / Sửa */}
            <AdminCollectionModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchCollections}
                editingCollection={editingCollection}
            />

            {/* Drawer Quản lý sản phẩm */}
            <AdminCollectionDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                collection={manageCollection}
            />
        </Card>
    );
};

export default CollectionManagePage;
