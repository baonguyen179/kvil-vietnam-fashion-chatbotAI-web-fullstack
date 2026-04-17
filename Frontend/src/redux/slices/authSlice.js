import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '@/services/authService';

export const performLogout = createAsyncThunk(
  'auth/performLogout',
  async (_, thunkAPI) => {
    try {
      // Gọi API báo backend xóa rỗng refresh_token ở DB và xóa Cookie
      const res = await authService.logout();
      // Sau đó tự động xóa nốt dữ liệu ở cục Redux Local
      thunkAPI.dispatch(logout());
      return res;
    } catch (error) {
      // Nếu mất mạng hoặc API lỗi, cứ ép đăng xuất ở Local cho an toàn
      thunkAPI.dispatch(logout());
      return thunkAPI.rejectWithValue(error);
    }
  }
)

const initialState = {
  user: null,
  access_token: null,
  isAuthenticated: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginData: (state, action) => {
      state.user = action.payload.user;
      state.access_token = action.payload.access_token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.access_token = null;
      state.isAuthenticated = false;
    },
    setAccessToken: (state, action) => {
      state.access_token = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
})

export const { setLoginData, logout, setAccessToken, updateUser } = authSlice.actions

export default authSlice.reducer