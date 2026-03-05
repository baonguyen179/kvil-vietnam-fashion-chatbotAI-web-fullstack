const cartValidation = require('../validations/cartValidation');
const errorCode = require('../config/errorCodes');
const cartService = require('../service/cartService')

const handleGetCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const data = await cartService.getCartByUserId(userId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi controller (handleGetCart):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleAddToCart = async (req, res) => {
    try {
        const { error } = cartValidation.addToCartSchema.validate(req.body);

        if (error) {
            return res.status(200).json({
                EM: error.details[0].message,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            });
        }

        const userId = req.user.id;
        const { variantId, quantity } = req.body;

        const data = await cartService.addToCart(userId, variantId, quantity);
        return res.status(200).json(
            {
                EM: data.EM,
                EC: data.EC,
                DT: data.DT
            });


    } catch (error) {
        console.error(">>> Lỗi controller (handleAddToCart):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleUpdateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItemId = req.params.id;

        const { error } = cartValidation.updateCartItemSchema.validate(req.body);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const { quantity } = req.body;

        const data = await cartService.updateCartItemQuantity(userId, cartItemId, quantity);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdateCartItem):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleDeleteCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItemId = req.params.id;

        const data = await cartService.deleteCartItem(userId, cartItemId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleDeleteCartItem):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}

module.exports = {
    handleAddToCart, handleGetCart,
    handleUpdateCartItem, handleDeleteCartItem
}