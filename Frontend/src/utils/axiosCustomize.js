import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { setAccessToken, logout } from '@/redux/slices/authSlice';

let store;

export const injectStore = (_store) => {
    store = _store;
};

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

// Lấy url từ env hoặc default
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const instance = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    withCredentials: true, // Cho phép đính kèm cookie (refresh_token)
});

instance.interceptors.request.use(function (config) {
    NProgress.start();
    
    const state = store?.getState();
    const token = state?.auth?.access_token;
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, function (error) {
    return Promise.reject(error);
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

instance.interceptors.response.use(function (response) {
    NProgress.done();
    
    // Trả về data (do backend custom bọc form của res.data)
    return response && response.data ? response.data : response;
}, async function (error) {
    NProgress.done();

    const originalRequest = error.config;
    
    // Xác định trường hợp Token hết hạn (Thường status backend trả ra là 401)
    if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
            return new Promise(function(resolve, reject) {
                failedQueue.push({ resolve, reject });
            }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return instance(originalRequest);
            }).catch(err => {
                return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Thay vì dùng instance (dễ bị dính đệ quy vòng lặp interceptor), dùng thẻ axios mới
            const res = await axios.post(`${baseURL}/api/v1/auth/refresh`, {}, {
                withCredentials: true // bắt buộc gửi kèm refresh_token cookie
            });
            
            const data = res && res.data ? res.data : res;

            if (data && data.EC === 0 && data.DT && data.DT.access_token) {
                const newAccessToken = data.DT.access_token;
                
                store?.dispatch(setAccessToken(newAccessToken));
                
                // Đổi config request đã bị lỗi để dùng token mới
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                
                processQueue(null, newAccessToken);
                
                // Request lại chính api vừa fail
                return instance(originalRequest);
            } else {
                // Làm mới token thất bại (refresh token cũng đã hết hạn)
                store?.dispatch(logout()); 
                processQueue(new Error('Refresh token invalid'));
                return Promise.reject(error);
            }
        } catch (err) {
            store?.dispatch(logout());
            processQueue(err);
            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }

    return error && error.response && error.response.data
        ? Promise.reject(error.response.data)
        : Promise.reject(error);
});

export default instance;