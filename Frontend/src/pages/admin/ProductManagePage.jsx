import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Space, message, Popconfirm, Card, Typography, Tooltip, Avatar, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, TagsOutlined, PictureFilled } from '@ant-design/icons';
import productService from '@/services/productService';
import categoryService from '@/services/categoryService';

import AdminProductModal from '@/components/admin/admin.product.modal';
import AdminVariantDrawer from '@/components/admin/admin.variant.drawer';
import AdminImageDrawer from '@/components/admin/admin.image.drawer';

const { Title, Text } = Typography;

const ProductManagePage = () => {
    // ---- STATE: Data ----
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // ---- STATE: Table & Filters ----
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({ search: '', categoryId: undefined });

    // ---- STATE: Modals & Drawers ----
    const [isProductModalVisible, setIsProductModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingProduct, setEditingProduct] = useState(null);

    const [isVariantDrawerVisible, setIsVariantDrawerVisible] = useState(false);
    const [manageVariantProduct, setManageVariantProduct] = useState(null);

    const [isImageDrawerVisible, setIsImageDrawerVisible] = useState(false);
    const [manageImageProduct, setManageImageProduct] = useState(null);

    // ---- LOAD DATA ----
    const fetchCategories = async () => {
        try {
            const res = await categoryService.getAllCategories();
            if (res && res.EC === 0) {
                setCategories(res.DT || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchProducts = async (page = 1, limit = 10, search = '', catId = '') => {
        setLoading(true);
        try {
            let res;
            if (search) {
                res = await productService.searchProducts(search, page, limit);
            } else {
                const query = { page, limit };
                if (catId) query.categoryId = catId;
                res = await productService.getAllProducts(query);
            }

            if (res && res.EC === 0) {
                setProducts(res.DT.products);
                setPagination({
                    current: res.DT.currentPage,
                    pageSize: limit,
                    total: res.DT.totalItems,
                });
            } else {
                message.error(res.EM || "Lấy danh sách sản phẩm thất bại!");
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
        fetchProducts(pagination.current, pagination.pageSize, filters.search, filters.categoryId);
    }, []);

    // ---- HANDLERS ----
    const handleTableChange = (newPagination) => {
        fetchProducts(newPagination.current, newPagination.pageSize, filters.search, filters.categoryId);
    };

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search: value }));
        fetchProducts(1, pagination.pageSize, value, filters.categoryId);
    };

    const handleFilterCategory = (value) => {
        setFilters(prev => ({ ...prev, categoryId: value, search: '' })); // Reset search if filter cat
        fetchProducts(1, pagination.pageSize, '', value);
    };

    const handleDeleteProduct = async (id) => {
        try {
            const res = await productService.deleteProduct(id);
            if (res && res.EC === 0) {
                message.success(res.EM || "Xóa sản phẩm thành công!");
                fetchProducts(pagination.current, pagination.pageSize, filters.search, filters.categoryId);
            } else {
                message.error(res.EM || "Xóa sản phẩm thất bại!");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi kết nối khi xóa");
        }
    };

    // ---- OPENS ----
    const openAddModal = () => {
        setModalMode('add');
        setEditingProduct(null);
        setIsProductModalVisible(true);
    };

    const openEditModal = (record) => {
        setModalMode('edit');
        setEditingProduct(record);
        setIsProductModalVisible(true);
    };

    const openVariantDrawer = (record) => {
        setManageVariantProduct(record);
        setIsVariantDrawerVisible(true);
    };

    const openImageDrawer = (record) => {
        setManageImageProduct(record);
        setIsImageDrawerVisible(true);
    };

    // ---- TABLE COLUMNS ----
    const columns = [
        {
            title: 'Sản phẩm',
            key: 'product',
            render: (_, record) => {
                let mainImg = null;
                if (record.images && record.images.length > 0) {
                    mainImg = record.images.find(img => img.isMain)?.imageUrl || record.images[0].imageUrl;
                }
                return (
                    <Space>
                        <Avatar 
                            shape="square" 
                            size={50} 
                            src={mainImg} 
                            icon={!mainImg && <PictureFilled />}
                            className="bg-gray-100 border border-gray-200"
                        />
                        <div style={{ maxWidth: 200 }}>
                            <Text strong className="truncate block" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                                {record.name}
                            </Text>
                            <Text type="secondary" className="text-xs">ID: {record.id}</Text>
                        </div>
                    </Space>
                )
            }
        },
        {
            title: 'Danh mục',
            dataIndex: ['category', 'name'],
            key: 'category',
            render: (text) => <Tag color="blue">{text || 'N/A'}</Tag>
        },
        {
            title: 'Giá gốc',
            dataIndex: 'basePrice',
            key: 'basePrice',
            render: (val) => <Text className="text-red-500 font-semibold">{val?.toLocaleString()}đ</Text>
        },
        {
            title: 'Khuyến mãi',
            dataIndex: 'discountPercent',
            key: 'discountPercent',
            render: (val) => val ? <Tag color="orange">-{val}%</Tag> : '-'
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 250,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Sửa thông tin">
                        <Button 
                            type="text" 
                            shape="circle" 
                            icon={<EditOutlined />} 
                            onClick={() => openEditModal(record)}
                            className="text-blue-500 hover:bg-blue-50"
                        />
                    </Tooltip>
                    
                    <Tooltip title="Quản lý Biến thể (Màu/Size)">
                        <Button 
                            type="text" 
                            shape="circle" 
                            icon={<TagsOutlined />} 
                            onClick={() => openVariantDrawer(record)}
                            className="text-purple-500 hover:bg-purple-50"
                        />
                    </Tooltip>

                    <Tooltip title="Quản lý Ảnh chụp">
                        <Button 
                            type="text" 
                            shape="circle" 
                            icon={<PictureOutlined />} 
                            onClick={() => openImageDrawer(record)}
                            className="text-green-500 hover:bg-green-50"
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Xóa sản phẩm"
                        description={`Chắc chắn xóa sản phẩm này?`}
                        onConfirm={() => handleDeleteProduct(record.id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button 
                                type="text" 
                                shape="circle" 
                                danger 
                                icon={<DeleteOutlined />} 
                                className="hover:bg-red-50"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card className="shadow-md rounded-xl border-none">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={4} className="m-0">Quản lý Sản phẩm</Title>
                    <p className="text-gray-500 mt-1 mb-0">Quản lý danh mục hàng hóa, ảnh và biến thể màu sắc</p>
                </div>
                
                <Space>
                    <Input.Search
                        placeholder="Tìm kiếm sản phẩm..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        className="w-[250px]"
                    />
                    <Select
                        placeholder="Lọc theo Danh mục"
                        allowClear
                        size="large"
                        className="w-[180px]"
                        onChange={handleFilterCategory}
                    >
                        {categories.map(cat => (
                            <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                        ))}
                    </Select>

                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<PlusOutlined />}
                        onClick={openAddModal}
                        className="bg-green-600 hover:bg-green-700 shadow-sm font-medium ml-2"
                    >
                        Thêm SP
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={products}
                rowKey="id"
                loading={loading}
                onChange={handleTableChange}
                bordered
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`
                }}
            />

            {/* --- Modals & Drawers --- */}
            <AdminProductModal 
                isModalVisible={isProductModalVisible}
                setIsModalVisible={setIsProductModalVisible}
                modalMode={modalMode}
                editingProduct={editingProduct}
                categories={categories}
                fetchProducts={() => fetchProducts(pagination.current, pagination.pageSize, filters.search, filters.categoryId)}
            />

            <AdminVariantDrawer 
                isDrawerVisible={isVariantDrawerVisible}
                setIsDrawerVisible={setIsVariantDrawerVisible}
                manageVariantProduct={manageVariantProduct}
            />

            <AdminImageDrawer 
                isDrawerVisible={isImageDrawerVisible}
                setIsDrawerVisible={setIsImageDrawerVisible}
                manageImageProduct={manageImageProduct}
            />
            
        </Card>
    );
};

export default ProductManagePage;
