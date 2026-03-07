const orderValidation = require('../validations/orderValidation');
const orderService = require('../service/orderService');
const errorCode = require('../config/errorCodes');

const handleCreateOrder = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = orderValidation.createOrderSchema.validate(req.body);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.createOrder(userId, req.body);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleCreateOrder):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleCancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const { error } = orderValidation.cancelOrderSchema.validate({ id: orderId });
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.cancelOrder(userId, orderId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleCancelOrder):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        // Validate req.query (FE gửi params lên URL như ?page=1&limit=5&status=pending)
        const { error, value } = orderValidation.getOrderListSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.getUserOrders(userId, value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetUserOrders):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetUserOrderDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const { error } = orderValidation.getOrderDetailSchema.validate({ id: orderId });
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.getUserOrderDetail(userId, orderId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetUserOrderDetail):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetAdminOrders = async (req, res) => {
    try {
        const { error, value } = orderValidation.getAdminOrderListSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.getAdminOrders(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetAdminOrders):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleUpdateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;

        const { error } = orderValidation.updateOrderStatusSchema.validate(req.body);
        if (error) {
            return res.status(200).json(
                {
                    EM: error.details[0].message,
                    EC: errorCode.VALIDATION_ERROR,
                    DT: ''
                });
        }

        const data = await orderService.updateOrderStatus(orderId, req.body.status);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdateOrderStatus):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleUpdatePaymentStatus = async (req, res) => {
    try {
        const orderId = req.params.id;

        const { error } = orderValidation.updatePaymentStatusSchema.validate(req.body);
        if (error) {
            return res.status(200).json({
                EM: error.details[0].message,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            });
        }

        const data = await orderService.updatePaymentStatus(orderId, req.body.paymentStatus);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdatePaymentStatus):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
module.exports = {
    handleCreateOrder, handleCancelOrder,
    handleGetUserOrders, handleGetUserOrderDetail,
    handleGetAdminOrders, handleUpdateOrderStatus,
    handleUpdatePaymentStatus
}