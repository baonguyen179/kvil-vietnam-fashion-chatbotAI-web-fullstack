import axios from "@/utils/axiosCustomize";

const BASE = "/api/v1/admin/chatbot";

const cleanParams = (params = {}) =>
    Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );

const chatbotService = {
    /**
     * [GET] Thống kê tổng quan chatbot
     * Response DT: { totalMessages, totalSessions, todayMessages,
     *                userMessages, botMessages, botResponseRate, topSessions }
     */
    getAdminChatStats: async () => {
        return await axios.get(`${BASE}/stats`);
    },

    /**
     * [GET] Danh sách phiên chat (có phân trang + bộ lọc)
     * @param {Object} params - { page, limit, search, type, startDate, endDate }
     * Response DT: { totalItems, totalPages, currentPage, sessions[] }
     */
    getAdminChatSessions: async (params = {}) => {
        return await axios.get(`${BASE}/sessions`, { params: cleanParams(params) });
    },

    /**
     * [GET] Chi tiết toàn bộ log của một phiên chat
     * @param {string} sessionId
     * @param {Object} params - { page, limit }
     * Response DT: { sessionId, totalMessages, totalPages, currentPage, logs[] }
     */
    getAdminSessionDetail: async (sessionId, params = {}) => {
        return await axios.get(`${BASE}/sessions/${encodeURIComponent(sessionId)}`, {
            params: cleanParams(params),
        });
    },

    /**
     * [DELETE] Xóa toàn bộ lịch sử chat theo sessionId
     * @param {string} sessionId
     * Response DT: { deletedCount, sessionId }
     */
    deleteSession: async (sessionId) => {
        return await axios.delete(`${BASE}/sessions/${encodeURIComponent(sessionId)}`);
    },

    /**
     * [DELETE] Xóa toàn bộ lịch sử chat của một user đăng nhập
     * @param {number} userId
     * Response DT: { deletedCount, userId }
     */
    deleteUserChats: async (userId) => {
        return await axios.delete(`${BASE}/users/${userId}`);
    },
};

export default chatbotService;
