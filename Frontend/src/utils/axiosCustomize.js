import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// 1. Cấu hình NProgress
NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

// 2. Khởi tạo instance trước
const instance = axios.create({
    // Sử dụng biến môi trường từ file .env
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    timeout: 10000,
});

// 3. Thiết lập Interceptor sau khi đã có biến instance
instance.interceptors.request.use(function (config) {
    NProgress.start();
    // Ví dụ: const token = store.getState()?.user?.token;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, function (error) {
    return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
    NProgress.done();
    return response && response.data ? response.data : response;
}, function (error) {
    NProgress.done();
    return error && error.response && error.response.data
        ? Promise.reject(error.response.data)
        : Promise.reject(error);
});

export default instance;