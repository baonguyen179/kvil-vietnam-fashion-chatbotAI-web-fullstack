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
    // Helper to calculate item price locally
    calculatePrice: (item) => {
        const base = item.variant?.price || item.variant?.product?.basePrice || 0;
        const discount = item.variant?.product?.discountPercent || 0;
        return base * (1 - discount / 100);
    },

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

    // --- LOCAL CART REDUCERS FOR GUEST USERS ---
    
    addToCartLocal: (state, action) => {
      // payload là một item có cấu trúc { variant: { ... }, quantity: number }
      const newItem = action.payload;
      const existingItem = state.cartItems.find(item => item.variant.id === newItem.variant.id);
      
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        // Tạo ID giả cho item (vì chưa có ID từ DB)
        const tempId = Date.now();
        state.cartItems.push({ ...newItem, id: tempId });
      }
      
      // Tính lại tổng tiền
      state.totalPrice = state.cartItems.reduce((total, item) => {
        const price = item.variant?.price || item.variant?.product?.basePrice || 0;
        const discount = item.variant?.product?.discountPercent || 0;
        const discountedPrice = price * (1 - discount / 100);
        return total + (discountedPrice * item.quantity);
      }, 0);
    },

    removeFromCartLocal: (state, action) => {
      // payload là item.id
      state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
      
      // Tính lại tổng tiền
      state.totalPrice = state.cartItems.reduce((total, item) => {
        const price = item.variant?.price || item.variant?.product?.basePrice || 0;
        const discount = item.variant?.product?.discountPercent || 0;
        const discountedPrice = price * (1 - discount / 100);
        return total + (discountedPrice * item.quantity);
      }, 0);
    },

    updateQuantityLocal: (state, action) => {
      // payload là { id, quantity }
      const item = state.cartItems.find(i => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      
      // Tính lại tổng tiền
      state.totalPrice = state.cartItems.reduce((total, item) => {
        const price = item.variant?.price || item.variant?.product?.basePrice || 0;
        const discount = item.variant?.product?.discountPercent || 0;
        const discountedPrice = price * (1 - discount / 100);
        return total + (discountedPrice * item.quantity);
      }, 0);
    },

    clearCart: (state) => {
      state.cartId = null;
      state.cartItems = [];
      state.totalPrice = 0;
      state.isOpen = false;
    },
  },
})

export const { 
  setCartData, 
  toggleCartDrawer, 
  clearCart,
  addToCartLocal,
  removeFromCartLocal,
  updateQuantityLocal
} = cartSlice.actions

export default cartSlice.reducer