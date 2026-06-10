import React, { useState, useCallback } from 'react';
import { Modal, Form, InputNumber, Input, Space, Typography, Alert, Divider, Select, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, WarningOutlined, SearchOutlined } from '@ant-design/icons';
import inventoryService from '@/services/inventoryService';
import productService from '@/services/productService';
import _ from 'lodash';

const { Text } = Typography;
const { TextArea } = Input;

/**
 * [SENIOR COMPONENT] AdjustInventoryModal
 * Thực hiện "Bút toán đảo" (Compensating Transaction) theo chuẩn kế toán.
 */
const AdjustInventoryModal = ({ open, record, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [deltaValue, setDeltaValue] = useState(0);
    const [searching, setSearching] = useState(false);
    const [variantOptions, setVariantOptions] = useState([]);

    const handleClose = () => {
        form.resetFields();
        setDeltaValue(0);
        setVariantOptions([]);
        onClose();
    };

    // Debounce tìm kiếm sản phẩm theo từ khóa (tên hoặc SKU)
    const handleSearchVariants = useCallback(
        _.debounce(async (value) => {
            if (!value || value.length < 2) {
                setVariantOptions([]);
                return;
            }
            setSearching(true);
            try {
                // searchProducts trả về { products: [...] } với mỗi product có variants[]
                const res = await productService.searchProducts(value, 1, 20);
                if (res && res.EC === 0) {
                    const options = [];
                    const productList = res.DT?.products || res.DT?.rows || [];
                    productList.forEach(product => {
                        if (!product.variants || product.variants.length === 0) return;
                        product.variants.forEach(v => {
                            options.push({
                                label: (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{product.name}</div>
                                            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                                                {v.color?.name} · {v.size?.name} · Tồn: {v.stock ?? '?'}
                                            </div>
                                        </div>
                                        <Tag color="blue" style={{ flexShrink: 0 }}>{v.sku}</Tag>
                                    </div>
                                ),
                                value: v.id,
                                sku: v.sku,
                                productName: product.name,
                            });
                        });
                    });
                    setVariantOptions(options);
                } else {
                    setVariantOptions([]);
                }
            } catch (error) {
                console.error('Lỗi tìm kiếm biến thể:', error);
                setVariantOptions([]);
            } finally {
                setSearching(false);
            }
        }, 500),
        []
    );

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            // variantId lấy từ record (nếu có) hoặc từ form (nếu là chọn mới)
            const targetVariantId = record?.variantId || values.variantId;

            const res = await inventoryService.adjustInventory(
                targetVariantId,
                values.delta,
                values.note
            );

            if (res && res.EC === 0) {
                Modal.success({
                    title: 'Điều chỉnh kho thành công!',
                    content: res.EM,
                });
                handleClose();
                onSuccess();
            } else {
                Modal.error({
                    title: 'Điều chỉnh thất bại',
                    content: res?.EM || 'Đã xảy ra lỗi. Vui lòng thử lại.',
                });
            }
        } catch (err) {
            console.error("Submit error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const isPositive = deltaValue > 0;
    const isNegative = deltaValue < 0;

    // Xác định variantId mục tiêu để xử lý form validation
    const hasPredefinedVariant = record && record.variantId;

    return (
        <Modal
            title={
                <Space>
                    <WarningOutlined style={{ color: '#faad14' }} />
                    <span>Bút toán điều chỉnh kho</span>
                </Space>
            }
            open={open}
            onCancel={handleClose}
            onOk={handleSubmit}
            okText="Xác nhận điều chỉnh"
            cancelText="Hủy"
            confirmLoading={submitting}
            okButtonProps={{ danger: isNegative }}
            width={600}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" requiredMark="optional">
                {record && (
                    <>
                        <Alert
                            message="Nguyên tắc: KHÔNG xóa log cũ. Hệ thống tạo dòng ADJUST mới để bù trừ số dư."
                            type="info"
                            showIcon
                            className="mb-4"
                        />

                        {hasPredefinedVariant ? (
                            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
                                <Space orientation="vertical" size={2}>
                                    <Text><Text strong>Sản phẩm:</Text> {record.variant?.product?.name || 'N/A'}</Text>
                                    <Text><Text strong>SKU:</Text> <Tag color="blue">{record.variant?.sku}</Tag></Text>
                                    <Text><Text strong>Phân loại:</Text> {record.variant?.color?.name} - {record.variant?.size?.name}</Text>
                                </Space>
                            </div>
                        ) : (
                            <Form.Item
                                name="variantId"
                                label={<Text strong>Tìm kiếm Sản phẩm / SKU</Text>}
                                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm cần điều chỉnh!' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Gõ tên sản phẩm hoặc mã SKU..."
                                    filterOption={false}
                                    onSearch={handleSearchVariants}
                                    loading={searching}
                                    options={variantOptions}
                                    size="large"
                                    suffixIcon={<SearchOutlined />}
                                />
                            </Form.Item>
                        )}

                        <Divider className="my-4" />

                        <Form.Item
                            name="delta"
                            label={<Text strong>Số lượng thay đổi</Text>}
                            extra={
                                deltaValue !== 0 && (
                                    <Space className="mt-1">
                                        {isPositive
                                            ? <Text type="success"><ArrowUpOutlined /> Tăng thêm {deltaValue} sản phẩm</Text>
                                            : <Text type="danger"><ArrowDownOutlined /> Giảm đi {Math.abs(deltaValue)} sản phẩm</Text>
                                        }
                                    </Space>
                                )
                            }
                            rules={[
                                { required: true, message: 'Vui lòng nhập số lượng!' },
                                { 
                                    validator: (_, val) => val === 0
                                        ? Promise.reject('Số lượng điều chỉnh không được bằng 0!')
                                        : Promise.resolve()
                                }
                            ]}
                        >
                            <InputNumber
                                className="w-full"
                                placeholder="Dương (+) để tăng, Âm (-) để giảm kho"
                                onChange={(val) => setDeltaValue(val || 0)}
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="note"
                            label={<Text strong>Lý do điều chỉnh (Bắt buộc)</Text>}
                            rules={[
                                { required: true, message: 'Vui lòng ghi rõ lý do!' },
                                { min: 10, message: 'Lý do phải có ít nhất 10 ký tự!' }
                            ]}
                        >
                            <TextArea
                                rows={3}
                                placeholder="Ví dụ: Nhập nhầm số lượng ngày 27/04. Cần trừ lại 50 cái..."
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default AdjustInventoryModal;
