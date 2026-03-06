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

module.exports = { handleCreateOrder, handleCancelOrder }