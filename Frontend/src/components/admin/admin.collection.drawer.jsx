import React, { useState, useEffect } from 'react';
import { Drawer, Button, Space, Transfer, message } from 'antd';
import collectionService from '@/services/collectionService';
import productService from '@/services/productService';

const AdminCollectionDrawer = ({ open, onClose, collection }) => {
    const [allProducts, setAllProducts] = useState([]);
    const [targetKeys, setTargetKeys] = useState([]); // productIds đang trong collection
    const [loadingInit, setLoadingInit] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [originalKeys, setOriginalKeys] = useState([]);

    useEffect(() => {
        if (open && collection) {
            loadData();
        }
    }, [open, collection]);

    const loadData = async () => {
        setLoadingInit(true);
        try {
            // Load tất cả sản phẩm (không phân trang để lấy hết)
            const res = await productService.getAllProducts({ page: 1, limit: 999 });
            if (res && res.EC === 0) {
                const mapped = (res.DT.products || []).map(p => ({
                    key: String(p.id),
                    title: p.name,
                    description: `${p.basePrice?.toLocaleString()}đ`,
                }));
                setAllProducts(mapped);
            }

            // Load chi tiết collection để biết sản phẩm hiện có
            const colRes = await collectionService.getCollectionBySlug(collection.slug);
            if (colRes && colRes.EC === 0) {
                const ids = (colRes.DT.products || []).map(p => String(p.id));
                setTargetKeys(ids);
                setOriginalKeys(ids);
            }
        } catch (err) {
            message.error('Không tải được dữ liệu sản phẩm');
        } finally {
            setLoadingInit(false);
        }
    };

    const handleSave = async () => {
        setLoadingSave(true);
        try {
            const toAdd = targetKeys
                .filter(k => !originalKeys.includes(k))
                .map(Number);
            const toRemove = originalKeys
                .filter(k => !targetKeys.includes(k))
                .map(Number);

            const promises = [];
            if (toAdd.length > 0) {
                promises.push(collectionService.addProductsToCollection(collection.id, toAdd));
            }
            if (toRemove.length > 0) {
                promises.push(collectionService.removeProductsFromCollection(collection.id, toRemove));
            }

            if (promises.length === 0) {
                message.info('Không có thay đổi nào cần lưu!');
                onClose();
                return;
            }

            const results = await Promise.all(promises);
            const hasError = results.some(r => r.EC !== 0);
            if (hasError) {
                message.error('Một số thao tác không thành công!');
            } else {
                message.success('Cập nhật sản phẩm trong Bộ sưu tập thành công!');
                setOriginalKeys([...targetKeys]);
                onClose();
            }
        } catch (err) {
            message.error('Lỗi kết nối khi lưu');
        } finally {
            setLoadingSave(false);
        }
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={
                <span className="font-semibold">
                    🗂️ Quản lý sản phẩm: <span className="text-blue-600">{collection?.name}</span>
                </span>
            }
            styles={{ body: { padding: '16px' } }}
            style={{ maxWidth: '760px' }}
            size="large"
            extra={
                <Space>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" loading={loadingSave} onClick={handleSave}>
                        Lưu thay đổi
                    </Button>
                </Space>
            }
        >
            <div className="mb-3 text-gray-500 text-sm">
                Kéo sản phẩm từ cột trái sang phải để thêm vào bộ sưu tập. Ngược lại để gỡ bỏ.
            </div>
            <Transfer
                dataSource={allProducts}
                titles={['Tất cả sản phẩm', `Trong BST (${targetKeys.length})`]}
                targetKeys={targetKeys}
                onChange={(nextKeys) => setTargetKeys(nextKeys)}
                render={item => (
                    <div className="flex flex-col leading-tight w-full overflow-hidden">
                        <span className="font-medium text-sm truncate" style={{ maxWidth: 220 }}>{item.title}</span>
                        <span className="text-xs text-red-500">{item.description}</span>
                    </div>
                )}
                showSearch
                filterOption={(input, item) =>
                    item.title.toLowerCase().includes(input.toLowerCase())
                }
                listStyle={{ flex: 1, height: 450 }}
                loading={loadingInit}
            />
        </Drawer>
    );
};

export default AdminCollectionDrawer;
