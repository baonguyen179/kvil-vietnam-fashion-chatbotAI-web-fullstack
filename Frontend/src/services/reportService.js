import axios from "@/utils/axiosCustomize";

const BASE = "/api/v1/admin/reports";

const reportService = {
    getOverview: (params) => axios.get(`${BASE}/overview`, { params }),
    getTopProducts: (params) => axios.get(`${BASE}/top-products`, { params }),
    getSlowProducts: (params) => axios.get(`${BASE}/slow-products`, { params }),
    getLowStock: (params) => axios.get(`${BASE}/low-stock`, { params }),
    getOverstock: (params) => axios.get(`${BASE}/overstock`, { params }),
    getSellThrough: (params) => axios.get(`${BASE}/sell-through`, { params }),
    getRevenueByCategory: (params) => axios.get(`${BASE}/revenue-by-category`, { params }),
    getProfit: (params) => axios.get(`${BASE}/profit`, { params }),
    getTopCustomers: (params) => axios.get(`${BASE}/top-customers`, { params }),
    getCouponPerformance: (params) => axios.get(`${BASE}/coupon-performance`, { params }),
};

export default reportService;
