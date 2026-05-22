import { combineReducers } from 'redux';
import authReducer from '../slices/authSlice';
import cartReducer from '../slices/cartSlice';
import themeReducer from '../slices/themeSlice';

const rootReducer = combineReducers({
    // Thêm các reducer khác tại đây ...
    auth: authReducer,
    cart: cartReducer,
    theme: themeReducer,
});

export default rootReducer;