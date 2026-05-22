import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Input, InputNumber, Select,
    Switch, DatePicker, Row, Col, message, Tooltip
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import couponService from '@/services/couponService';

const DISCOUNT_TYPE_OPTIONS = [
    { value: 'fixed',   label: '💰 Cố định (VNĐ)' },
    { value: 'percent', label: '📊 Phần trăm (%)' },
];

// Formatter/parser dùng chung cho InputNumber tiền tệ
const currencyFormatter = (val) => val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
const currencyParser    = (val) => val?.replace(/,/g, '') ?? '';

const AdminCouponModal = ({ open, onClose, onSuccess, editingCoupon }) => {
    const [form] = Form.useForm();
    const [loading, setLoading]   = useState(false);
    const discountType = Form.useWatch('discountType', form);
    const isEdit = !!editingCoupon;

    useEffect(() => {
        if (!open) return;
        if (isEdit) {
            form.setFieldsValue({
                ...editingCoupon,
                discountValue:      parseFloat(editingCoupon.discountValue)      || 0,
                minOrderValue:      parseFloat(editingCoupon.minOrderValue)      || 0,
                maxDiscountAmount:  editingCoupon.maxDiscountAmount
                    ? parseFloat(editingCoupon.maxDiscountAmount)
                    : null,
                startDate: editingCoupon.startDate ? dayjs(editingCoupon.startDate) : null,
                endDate:   editingCoupon.endDate   ? dayjs(editingCoupon.endDate)   : null,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ isActive: true, discountType: 'fixed', minOrderValue: 0 });
        }
    }, [open, editingCoupon]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                ...values,
                startDate: values.startDate?.toISOString(),
                endDate:   values.endDate?.toISOString(),
                maxDiscountAmount: values.discountType === 'fixed' ? null : (values.maxDiscountAmount || null),
            };

            const res = isEdit
                ? await couponService.updateCoupon(editingCoupon.id, payload)
                : await couponService.createCoupon(payload);

            if (res && res.EC === 0) {
                message.success(res.EM || (isEdit ? 'Cập nhật thành công!' : 'Tạo thành công!'));
                onSuccess();
                onClose();
            } else {
                message.error(res?.EM || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            if (err?.errorFields) return; // Lỗi validation form → antd tự hiện
            message.error('Lỗi kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            title={
                <span className="text-base font-semibold">
                    {isEdit ? '✏️ Cập nhật mã giảm giá' : '➕ Tạo mã giảm giá mới'}
                </span>
            }
            okText={isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
            cancelText="Hủy"
            width={660}
            destroyOnClose
        >
            <Form form={form} layout="vertical" className="mt-4">
                {/* Hàng 1: Code + Loại */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="code"
                            label="Mã Code"
                            rules={[{ required: true, message: 'Vui lòng nhập mã code!' }]}
                        >
                            <Input
                                size="large"
                                placeholder="VD: KM_HE_2026"
                                style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                                onChange={(e) =>
                                    form.setFieldValue('code', e.target.value.toUpperCase().trim())
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="discountType"
                            label="Loại giảm giá"
                            rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
                        >
                            <Select size="large" options={DISCOUNT_TYPE_OPTIONS} />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Hàng 2: Mức giảm + Đơn tối thiểu */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="discountValue"
                            label={discountType === 'percent' ? 'Mức giảm (%)' : 'Mức giảm (VNĐ)'}
                            rules={[
                                { required: true, message: 'Vui lòng nhập mức giảm!' },
                                ...(discountType === 'percent'
                                    ? [{ type: 'number', max: 100, message: 'Phần trăm không vượt quá 100!' }]
                                    : [])
                            ]}
                        >
                            <InputNumber
                                size="large" min={0}
                                max={discountType === 'percent' ? 100 : undefined}
                                className="w-full"
                                formatter={discountType === 'percent'
                                    ? (val) => val ? `${val}%` : ''
                                    : currencyFormatter
                                }
                                parser={discountType === 'percent'
                                    ? (val) => val?.replace('%', '') ?? ''
                                    : currencyParser
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="minOrderValue" label="Đơn tối thiểu (VNĐ)">
                            <InputNumber
                                size="large" min={0} className="w-full"
                                placeholder="0 = không giới hạn"
                                formatter={currencyFormatter}
                                parser={currencyParser}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {discountType === 'percent' && (
                    <Form.Item
                        name="maxDiscountAmount"
                        label={
                            <span>
                                Giảm tối đa (VNĐ)&nbsp;
                                <Tooltip title="Giới hạn số tiền được giảm tối đa khi dùng mã % này. Để trống = không giới hạn.">
                                    <QuestionCircleOutlined className="text-gray-400" />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            size="large" min={0} className="w-full"
                            placeholder="Để trống = không giới hạn"
                            formatter={currencyFormatter}
                            parser={currencyParser}
                        />
                    </Form.Item>
                )}

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startDate"
                            label="Ngày bắt đầu"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        >
                            <DatePicker size="large" className="w-full" format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="endDate"
                            label="Ngày kết thúc"
                            dependencies={['startDate']}
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const start = getFieldValue('startDate');
                                        if (!value || !start || value.isAfter(start)) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject('Ngày kết thúc phải sau ngày bắt đầu!');
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                size="large" className="w-full" format="DD/MM/YYYY"
                                disabledDate={(current) => {
                                    const startDate = form.getFieldValue('startDate');
                                    return startDate ? current && current <= startDate.endOf('day') : false;
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="usageLimit"
                            label="Giới hạn lượt dùng"
                            rules={[{ required: true, message: 'Vui lòng nhập giới hạn!' }]}
                        >
                            <InputNumber size="large" min={1} className="w-full" placeholder="VD: 100" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="isActive" label="Trạng thái kích hoạt" valuePropName="checked">
                            <Switch checkedChildren="Kích hoạt" unCheckedChildren="Tắt" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AdminCouponModal;
