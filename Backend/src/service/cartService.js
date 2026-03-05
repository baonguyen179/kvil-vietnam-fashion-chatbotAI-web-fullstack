const db = require('../models/index');
const errorCode = require('../config/errorCodes');

const getCartByUserId = async (userId) => {
    try {
        const cart = await db.Cart.findOne({
            where: { userId: userId },
            attributes: ['id'],
            include: [
                {
                    model: db.CartItem,
                    as: 'cartItems',
                    attributes: ['id', 'quantity', 'variantId'],
                    include: [
                        {
                            model: db.ProductVariant,
                            as: 'variant',
                            attributes: ['id', 'size', 'color', 'price', 'stock'],
                            include: [
                                {
                                    model: db.Product,
                                    as: 'product',
                                    attributes: ['id', 'name', 'basePrice', 'discountPercent'],
                                    include: [
                                        {
                                            model: db.ProductImage,
                                            as: 'images',
                                            attributes: ['imageUrl'],
                                            where: { isMain: true },
                                            required: false
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [
                [{ model: db.CartItem, as: 'cartItems' }, 'createdAt', 'DESC']
            ]
        });

        if (!cart) {
            return {
                EM: 'Giỏ hàng trống!',
                EC: errorCode.SUCCESS,
                DT: { cartItems: [], totalPrice: 0 }
            };
        }

        const cartData = cart.get({ plain: true });
        let totalPrice = 0;

        if (cartData.cartItems && cartData.cartItems.length > 0) {
            cartData.cartItems.forEach(item => {
                const itemPrice = item.variant.price || item.variant.product.basePrice;

                totalPrice += (itemPrice * item.quantity);
            });
        }

        cartData.totalPrice = totalPrice;

        return {
            EM: 'Lấy thông tin giỏ hàng thành công!',
            EC: errorCode.SUCCESS,
            DT: cartData
        };

    } catch (error) {
        console.error(">>> Lỗi tại cartService (getCartByUserId):", error);
        return {
            EM: 'Lỗi server khi lấy giỏ hàng',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const addToCart = async (userId, variantId, quantity) => {
    try {
        const variant = await db.ProductVariant.findOne({
            where: { id: variantId }
        });

        if (!variant) {
            return {
                EM: 'Sản phẩm/Biến thể không tồn tại!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        if (quantity > variant.stock) {
            return {
                EM: `Số lượng tồn kho không đủ (Kho chỉ còn ${variant.stock} sản phẩm)!`,
                EC: errorCode.OUT_OF_STOCK,
                DT: ''
            };
        }

        const [cart, created] = await db.Cart.findOrCreate({
            where: { userId: userId },
            defaults: { userId: userId }
        });

        let cartItem = await db.CartItem.findOne({
            where: {
                cartId: cart.id,
                variantId: variantId
            }
        });

        if (cartItem) {
            const newQuantity = cartItem.quantity + quantity;

            if (newQuantity > variant.stock) {
                return {
                    EM: `Không thể thêm! Bạn đang có ${cartItem.quantity} sản phẩm trong giỏ, kho chỉ còn ${variant.stock}!`,
                    EC: errorCode.OUT_OF_STOCK,
                    DT: ''
                };
            }

            await cartItem.update({ quantity: newQuantity });

        } else {
            cartItem = await db.CartItem.create({
                cartId: cart.id,
                variantId: variantId,
                quantity: quantity
            });
        }

        return {
            EM: 'Thêm vào giỏ hàng thành công!',
            EC: errorCode.SUCCESS,
            DT: cartItem
        };

    } catch (error) {
        console.error(">>> Lỗi tại cartService (addToCart):", error);
        return {
            EM: 'Lỗi server khi thêm vào giỏ hàng',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const updateCartItemQuantity = async (userId, cartItemId, newQuantity) => {
    try {
        const cart = await db.Cart.findOne({ where: { userId: userId } });
        if (!cart) {
            return { EM: 'Giỏ hàng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        const cartItem = await db.CartItem.findOne({
            where: {
                id: cartItemId,
                cartId: cart.id
            },
            include: [
                {
                    model: db.ProductVariant,
                    as: 'variant',
                    attributes: ['stock'] // Kéo theo Tồn kho để check
                }
            ]
        });

        if (!cartItem) {
            return { EM: 'Món hàng không tồn tại trong giỏ của bạn!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        if (newQuantity > cartItem.variant.stock) {
            return {
                EM: `Kho không đủ! Chỉ còn tối đa ${cartItem.variant.stock} sản phẩm.`,
                EC: errorCode.OUT_OF_STOCK,
                DT: ''
            };
        }

        await cartItem.update({ quantity: newQuantity });

        return { EM: 'Cập nhật số lượng thành công!', EC: errorCode.SUCCESS, DT: cartItem };

    } catch (error) {
        console.error(">>> Lỗi tại cartService (updateCartItemQuantity):", error);
        return { EM: 'Lỗi server khi cập nhật giỏ hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const deleteCartItem = async (userId, cartItemId) => {
    try {
        const cart = await db.Cart.findOne({ where: { userId: userId } });
        if (!cart) {
            return { EM: 'Giỏ hàng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        const cartItem = await db.CartItem.findOne({
            where: { id: cartItemId, cartId: cart.id }
        });

        if (!cartItem) {
            return { EM: 'Món hàng không tồn tại trong giỏ của bạn!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        await cartItem.destroy();

        return { EM: 'Đã xóa sản phẩm khỏi giỏ hàng!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(">>> Lỗi tại cartService (deleteCartItem):", error);
        return { EM: 'Lỗi server khi xóa món hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
module.exports = {
    addToCart, getCartByUserId, updateCartItemQuantity, deleteCartItem
};