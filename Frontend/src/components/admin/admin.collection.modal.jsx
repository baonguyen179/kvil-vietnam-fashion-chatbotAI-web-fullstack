import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, Switch } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import collectionService from '@/services/collectionService';
import { message } from 'antd';

const { Dragger } = Upload;

const AdminCollectionModal = ({ open, onClose, onSuccess, editingCollection }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const isEdit = !!editingCollection;

    useEffect(() => {
        if (open) {
            if (isEdit) {
                form.setFieldsValue({
                    name: editingCollection.name,
                    description: editingCollection.description || '',
                    isActive: editingCollection.isActive,
                });
                setFileList(
                    editingCollection.bannerUrl
                        ? [{ uid: '-1', name: 'banner', status: 'done', url: editingCollection.bannerUrl }]
                        : []
                );
            } else {
                form.resetFields();
                form.setFieldsValue({ isActive: true });
                setFileList([]);
            }
        }
    }, [open, editingCollection]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('description', values.description || '');
            formData.append('isActive', values.isActive ? 'true' : 'false');

            const newFile = fileList.find(f => f.originFileObj);
            if (newFile) {
                formData.append('banner', newFile.originFileObj);
            }

            let res;
            if (isEdit) {
                res = await collectionService.updateCollection(editingCollection.id, formData);
            } else {
                res = await collectionService.createCollection(formData);
            }

            if (res && res.EC === 0) {
                message.success(res.EM || (isEdit ? 'Cập nhật thành công!' : 'Tạo thành công!'));
                onSuccess();
                onClose();
            } else {
                message.error(res.EM || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            if (err?.errorFields) return; // validation error
            message.error('Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        maxCount: 1,
        listType: 'picture',
        fileList,
        beforeUpload: () => false, // ngăn auto upload
        onChange: ({ fileList: newList }) => setFileList(newList),
        accept: 'image/*',
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            title={
                <span className="text-base font-semibold">
                    {isEdit ? '✏️ Cập nhật Bộ sưu tập' : '➕ Thêm Bộ sưu tập mới'}
                </span>
            }
            okText={isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
            cancelText="Hủy"
            width={560}
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item
                    name="name"
                    label="Tên Bộ sưu tập"
                    rules={[
                        { required: true, message: 'Tên bộ sưu tập là bắt buộc!' },
                        { min: 3, message: 'Tên phải có ít nhất 3 ký tự!' },
                        { max: 255, message: 'Tên không được vượt quá 255 ký tự!' }
                    ]}
                >
                    <Input size="large" placeholder="VD: Bộ sưu tập Mùa Hè 2026" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={3} placeholder="Mô tả ngắn về bộ sưu tập..." />
                </Form.Item>

                <Form.Item label="Ảnh Banner">
                    <Dragger {...uploadProps} className="rounded-lg">
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text text-sm">Kéo thả hoặc click để chọn ảnh Banner</p>
                        <p className="ant-upload-hint text-xs text-gray-400">Hỗ trợ JPG, PNG, WEBP (tỷ lệ 16:9 khuyến nghị)</p>
                    </Dragger>
                </Form.Item>

                <Form.Item name="isActive" label="Hiển thị công khai" valuePropName="checked">
                    <Switch checkedChildren="Kích hoạt" unCheckedChildren="Ẩn" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AdminCollectionModal;
