import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartId: null,       // Lưu ID của giỏ hàng (tương ứng 'id' của Cart)
  cartItems: [],      // Chứa mảng sản phẩm trong giỏ (tương ứng 'DT.cartItems')
  totalPrice: 0,      // Chứa tổng tiền (tương ứng 'DT.totalPrice')
  isLoading: false,   // Trạng thái chờ gọi API (tuỳ chọn nhưng rất cần thiết)
  error: null         // Lưu lỗi nếu gọi API thất bại (tuỳ chọn)
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartId: (state, action) => {
      state.cartId = action.payload
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload
    },
    setTotalPrice: (state, action) => {
      state.totalPrice = action.payload
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    addToCart: (state, action) => {
      state.cartItems.push(action.payload)
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((item) => item.id !== action.payload)
    },
    updateCartItem: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.cartItems.find((item) => item.id === id)
      if (item) {
        item.quantity = quantity
      }
    },
    clearCart: (state) => {
      state.cartId = null
      state.cartItems = []
      state.totalPrice = 0
    },
  },
})

// Action creators are generated for each case reducer function
export const { setCartId, setCartItems, setTotalPrice, setIsLoading, setError, addToCart, removeFromCart, updateCartItem, clearCart } = cartSlice.actions

export default cartSlice.reducer