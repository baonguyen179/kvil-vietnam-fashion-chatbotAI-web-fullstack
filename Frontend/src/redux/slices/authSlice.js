import { createSlice } from '@reduxjs/toolkit'

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