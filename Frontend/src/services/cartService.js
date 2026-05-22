import axios from "@/utils/axiosCustomize";

const cartService = {
    // Lấy giỏ hàng của người dùng hiện tại
    getCart: async () => {
        return await axios.get("/api/v1/user/carts");
    },

    // Thêm sản phẩm vào giỏ
    addToCart: async (variantId, quantity) => {
        return await axios.post("/api/v1/user/carts", {
            variantId,
            quantity
        });
    },

    // Cập nhật số lượng sản phẩm trong giỏ
    updateCartItem: async (itemId, quantity) => {
        return await axios.put(`/api/v1/user/carts/${itemId}`, {
            quantity
        });
    },

    // Xóa sản phẩm khỏi giỏ
    removeCartItem: async (itemId) => {
        return await axios.delete(`/api/v1/user/carts/${itemId}`);
    },

    // Xóa toàn bộ giỏ hàng
    clearCart: async () => {
        return await axios.delete("/api/v1/user/carts");
    }
};

export default cartService;
