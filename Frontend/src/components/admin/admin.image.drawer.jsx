import React, { useState, useEffect } from 'react';
import { Drawer, Button, message, Spin, Typography, Card, Upload, Modal, Image } from 'antd';
import { UploadOutlined, DeleteOutlined, StarFilled } from '@ant-design/icons';
import productService from '@/services/productService';

const { Title, Text } = Typography;

const AdminImageDrawer = ({
    isDrawerVisible,
    setIsDrawerVisible,
    manageImageProduct,
    fetchProducts
}) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // For Upload
    const [uploading, setUploading] = useState(false);
    const [fileList, setFileList] = useState([]);

    const fetchProductImages = async () => {
        if (!manageImageProduct?.id) return;
        setLoading(true);
        try {
            const res = await productService.getProductById(manageImageProduct.id);
            if (res && res.EC === 0) {
                setImages(res.DT.images || []);
            } else {
                message.error("Không thể tải danh sách ảnh!");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi kết nối máy chủ!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isDrawerVisible && manageImageProduct) {
            fetchProductImages();
            setFileList([]);
        }
    }, [isDrawerVisible, manageImageProduct]);

    const handleClose = () => {
        setIsDrawerVisible(false);
        setImages([]);
        setFileList([]);
    };

    const handleDeleteImage = async (imgId) => {
        Modal.confirm({
            title: 'Xác nhận xóa ảnh',
            content: 'Bạn có chắc chắn muốn xóa hình ảnh này khỏi hệ thống không?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                setLoading(true);
                try {
                    const res = await productService.deleteProductImage(imgId);
                    if (res && res.EC === 0) {
                        message.success(res.EM || "Xóa ảnh thành công!");
                        fetchProductImages();
                        if (fetchProducts) fetchProducts(); // Gọi để cập nhật thumbnail ở bảng chính
                    } else {
                        message.error(res.EM || "Xóa ảnh thất bại!");
                    }
                } catch (error) {
                    console.error(error);
                    message.error("Lỗi xóa ảnh!");
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            return message.warning("Vui lòng chọn ít nhất một tấm ảnh!");
        }

        const filesToUpload = fileList.map(item => item.originFileObj || item);
        
        setUploading(true);
        try {
            const res = await productService.addProductImages(manageImageProduct.id, filesToUpload);
            if (res && res.EC === 0) {
                message.success(res.EM || "Tải ảnh lên thành công!");
                setFileList([]);
                fetchProductImages();
                if (fetchProducts) fetchProducts(); // Gọi để cập nhật thumbnail ở bảng chính
            } else {
                message.error(res.EM || "Tải ảnh thất bại!");
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi kết nối khi tải ảnh!");
        } finally {
            setUploading(false);
        }
    };

    const uploadProps = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            // Kiểm tra định dạng (Chỉ cho gửi ảnh tĩnh)
            const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
            if (!isImage) {
                message.error('Bạn chỉ có thể tải lên file JPG/PNG/WEBP!');
                return Upload.LIST_IGNORE;
            }
            
            // Giới hạn 10 tấm một lúc
            if (fileList.length >= 10) {
                message.error('Tối đa 10 ảnh một lần!');
                return Upload.LIST_IGNORE;
            }

            setFileList(prev => [...prev, file]);
            return false; // Ngăn không cho Antd tự Submit URL (để tự gọi API thủ công).
        },
        fileList,
        multiple: true,
        maxCount: 10,
        accept: "image/png, image/jpeg, image/webp"
    };

    return (
        <Drawer
            title={`Bộ Sưu Tập: ${manageImageProduct?.name || ''}`}
            placement="right"
            width={600}
            onClose={handleClose}
            open={isDrawerVisible}
        >
            <Spin spinning={loading}>
                <Card title="Tải ảnh thiết kế" size="small" className="mb-6 bg-gray-50 border border-gray-200">
                    <div className="mb-4 text-xs text-gray-500">
                        *Lưu ý: Tấm ảnh đầu tiên trong mảng ảnh vừa tải lên sẽ tự động trở thành ảnh đại diện chính (Thumbnail). Tối đa 10 ảnh/lượt.
                    </div>
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Chọn File Ảnh (Tối đa 10)</Button>
                    </Upload>
                    <Button
                        type="primary"
                        onClick={handleUpload}
                        disabled={fileList.length === 0}
                        loading={uploading}
                        style={{ marginTop: 16 }}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {uploading ? 'Đang tải lên Hệ thống...' : 'Bắt đầu Tải lên'}
                    </Button>
                </Card>

                <Title level={5} className="mb-4">Hình ảnh đã tải lên ({images.length} ảnh)</Title>
                <div className="grid grid-cols-2 gap-4">
                    {images.map((img) => (
                        <Card 
                            key={img.id} 
                            hoverable
                            cover={<div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center"><Image src={img.imageUrl} alt="product" className="object-cover w-full h-full" /></div>}
                            bodyStyle={{ padding: '12px' }}
                            className="relative group border border-gray-200"
                        >
                            {img.isMain && (
                                <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded shadow flex items-center gap-1 z-10">
                                    <StarFilled /> Ảnh Chính
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <Text className="truncate text-xs text-gray-500" style={{ maxWidth: 150 }}>{img.publicId || `Ảnh ID: ${img.id}`}</Text>
                                <Button 
                                    danger 
                                    type="text" 
                                    size="small" 
                                    icon={<DeleteOutlined />} 
                                    onClick={() => handleDeleteImage(img.id)} 
                                />
                            </div>
                        </Card>
                    ))}

                    {images.length === 0 && (
                        <div className="col-span-2 text-center text-gray-400 py-10 border border-dashed border-gray-300 rounded-lg">
                            <p>Sản phẩm này chưa có hình ảnh nào.</p>
                        </div>
                    )}
                </div>
            </Spin>
        </Drawer>
    );
};

export default AdminImageDrawer;
