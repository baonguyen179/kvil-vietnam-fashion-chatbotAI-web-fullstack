import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartId: null,
  cartItems: [],
  totalPrice: 0,
  isOpen: false 
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Lấy bộ dữ liệu từ API vào Redux
    setCartData: (state, action) => {
      // payload chính là biến DT trả về từ API getCartByUserId của Backend
      state.cartId = action.payload.id || null;
      state.cartItems = action.payload.cartItems || [];
      state.totalPrice = action.payload.totalPrice || 0;
    },
    
    // Điều khiển UI mở giỏ hàng từ bất kỳ component nào
    toggleCartDrawer: (state, action) => {
      // Nếu truyền true/false thì set theo payload, không thì tự toggle (đảo ngược)
      state.isOpen = action.payload !== undefined ? action.payload : !state.isOpen;
    },

    clearCart: (state) => {
      state.cartId = null;
      state.cartItems = [];
      state.totalPrice = 0;
      state.isOpen = false;
    },
  },
})

export const { setCartData, toggleCartDrawer, clearCart } = cartSlice.actions

export default cartSlice.reducer