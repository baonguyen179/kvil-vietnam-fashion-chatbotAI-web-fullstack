const db = require('../models/index');
const errorCode = require('../config/errorCodes');

const redisHelper = require('../helpers/redis.helper');
const CART_CACHE_TTL = process.env.CART_CACHE_TTL || 3600;
// Hàm phụ trợ tạo key cache
const getCartCacheKey = (userId) => `cart:user:${userId}`;

const getCartByUserId = async (userId) => {
    try {
        const cacheKey = getCartCacheKey(userId);
        const cachedCart = await redisHelper.getCache(cacheKey);

        if (cachedCart) {
            return {
                EM: 'Lấy thông tin giỏ hàng (Cache) thành công!',
                EC: errorCode.SUCCESS,
                DT: cachedCart
            };
        }

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
                            attributes: ['id', 'price', 'stock', 'colorId', 'sizeId'],
                            include: [
                                { model: db.Color, as: 'color', attributes: ['id', 'name', 'hexCode'] },
                                { model: db.Size, as: 'size', attributes: ['id', 'name'] },
                                {
                                    model: db.Product,
                                    as: 'product',
                                    attributes: ['id', 'name', 'basePrice', 'discountPercent'],
                                    include: [
                                        {
                                            model: db.ProductImage,
                                            as: 'images',
                                            attributes: ['imageUrl', 'isMain'],
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

        await redisHelper.setCache(cacheKey, cartData, CART_CACHE_TTL);
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
    let t;
    try {
        // Sử dụng Transaction để đảm bảo tính nhất quán dữ liệu (Atomic)
        t = await db.sequelize.transaction();

        const variant = await db.ProductVariant.findOne({
            where: { id: variantId },
            lock: t.LOCK.UPDATE, // Khóa bản ghi để tránh race condition khi check stock
            transaction: t
        });

        if (!variant) {
            await t.rollback();
            return {
                EM: 'Sản phẩm/Biến thể không tồn tại!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        if (quantity > variant.stock) {
            await t.rollback();
            return {
                EM: `Số lượng tồn kho không đủ (Kho chỉ còn ${variant.stock} sản phẩm)!`,
                EC: errorCode.OUT_OF_STOCK,
                DT: ''
            };
        }

        // 1. Tìm hoặc tạo giỏ hàng cho User
        const [cart, created] = await db.Cart.findOrCreate({
            where: { userId: userId },
            defaults: { userId: userId },
            transaction: t
        });

        // 2. Kiểm tra item đã có trong giỏ chưa
        let cartItem = await db.CartItem.findOne({
            where: {
                cartId: cart.id,
                variantId: variantId
            },
            transaction: t
        });

        if (cartItem) {
            const newQuantity = cartItem.quantity + quantity;

            // Kiểm tra tổng số lượng sau khi cộng dồn có vượt tồn kho không
            if (newQuantity > variant.stock) {
                await t.rollback();
                return {
                    EM: `Không thể thêm! Bạn đang có ${cartItem.quantity} sản phẩm trong giỏ, kho chỉ còn ${variant.stock}!`,
                    EC: errorCode.OUT_OF_STOCK,
                    DT: ''
                };
            }

            await cartItem.update({ quantity: newQuantity }, { transaction: t });

        } else {
            // 3. Nếu chưa có thì tạo mới
            cartItem = await db.CartItem.create({
                cartId: cart.id,
                variantId: variantId,
                quantity: quantity
            }, { transaction: t });
        }

        await t.commit();

        // Xóa Cache giỏ hàng của User
        await redisHelper.delCache(getCartCacheKey(userId));
        
        return {
            EM: 'Thêm vào giỏ hàng thành công!',
            EC: errorCode.SUCCESS,
            DT: cartItem
        };

    } catch (error) {
        if (t) await t.rollback();
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
        //  Xóa Cache giỏ hàng vì có sự thay đổi số lượng (ảnh hưởng tới Total Price)
        await redisHelper.delCache(getCartCacheKey(userId));
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
        //  Xóa Cache giỏ hàng sau khi loại bỏ món hàng
        await redisHelper.delCache(getCartCacheKey(userId));
        return { EM: 'Đã xóa sản phẩm khỏi giỏ hàng!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(">>> Lỗi tại cartService (deleteCartItem):", error);
        return { EM: 'Lỗi server khi xóa món hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
module.exports = {
    addToCart, getCartByUserId, updateCartItemQuantity, deleteCartItem
};