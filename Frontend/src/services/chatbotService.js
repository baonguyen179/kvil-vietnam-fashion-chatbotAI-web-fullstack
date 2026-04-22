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
    }
};

export default chatbotService;
