import axios from "../utils/axiosCustomize";

/**
 * [SENIOR SERVICE] Chatbot Service
 * Provides methods to interact with the AI Chatbot backend.
 */
const chatbotService = {
    /**
     * Gửi tin nhắn đến Chatbot
     * @param {string} message - Nội dung tin nhắn
     * @returns {Promise} 
     */
    sendMessage: async (message) => {
        return await axios.post("/api/v1/chatbot/message", { message });
    },

    /**
     * Lấy lịch sử hội thoại
     * @param {number} page - Trang hiện tại
     * @param {number} limit - Số lượng tin nhắn mỗi trang
     * @returns {Promise}
     */
    getHistory: async (page = 1, limit = 20) => {
        return await axios.get("/api/v1/chatbot/history", {
            params: { page, limit }
        });
    },

    // --- [ADMIN METHODS] ---

    /**
     * Lấy thống kê Chatbot AI (Chỉ Admin)
     */
    getAdminChatStats: async () => {
        return await axios.get("/api/v1/admin/chatbot/stats");
    },

    /**
     * Lấy danh sách phiên chat (Chỉ Admin)
     * @param {object} params - { page, limit, search, type, startDate, endDate }
     */
    getAdminChatSessions: async (params) => {
        return await axios.get("/api/v1/admin/chatbot/sessions", { params });
    },

    /**
     * Lấy chi tiết một phiên chat (Chỉ Admin)
     * @param {string} sessionId 
     * @param {object} params - { page, limit }
     */
    getAdminSessionDetail: async (sessionId, params) => {
        return await axios.get(`/api/v1/admin/chatbot/sessions/${sessionId}`, { params });
    },

    /**
     * Xóa một phiên chat (Chỉ Admin)
     * @param {string} sessionId 
     */
    deleteSession: async (sessionId) => {
        return await axios.delete(`/api/v1/admin/chatbot/sessions/${sessionId}`);
    }
};

export default chatbotService;
