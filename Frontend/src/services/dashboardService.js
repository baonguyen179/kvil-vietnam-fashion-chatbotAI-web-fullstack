import axios from "@/utils/axiosCustomize";

const BASE = "/api/v1/admin/dashboard";

const dashboardService = {
    /**
     * Lấy dữ liệu thống kê Dashboard
     * @param {Object} params - { startDate?: string (ISO), endDate?: string (ISO) }
     * @returns {{ summary: { totalRevenue, totalOrders, pendingOrders }, chart: [...] }}
     */
    getDashboardStats: async (params = {}) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
        );
        return await axios.get(`${BASE}/stats`, { params: cleanParams });
    },
};

export default dashboardService;
