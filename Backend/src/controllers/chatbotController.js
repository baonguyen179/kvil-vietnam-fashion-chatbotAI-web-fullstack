require('dotenv').config()
const crypto = require('crypto');
const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const chatbotValidation = require('../validations/chatbotValidation');
const chatbotService = require('../service/chatbotService');

const handleChatbotMessage = async (req, res) => {
    try {
        const { error, value } = chatbotValidation.chatbotMessageSchema.validate(req.body);
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const { message } = value;
        const userId = req.user && req.user.id ? req.user.id : null;

        let sessionId = req.cookies.guest_session_id;
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            res.cookie('guest_session_id', sessionId, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
        }

        const data = await chatbotService.processChatbotMessage(userId, sessionId, message);

        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller chatbot:", error);

        if (error.status === 429 || (error.response && error.response.status === 429)) {
            return res.status(200).json({
                EM: 'Chatbot quá tải tạm thời',
                EC: errorCode.SUCCESS,
                DT: {
                    reply: "Dạ hiện tại có quá nhiều khách hàng đang cần tư vấn cùng lúc nên mình hơi quá tải một chút. Bạn vui lòng chờ vài giây rồi nhắn lại giúp mình nhé! 🥺",
                    suggestedProducts: []
                }
            });
        }

        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetChatHistory = async (req, res) => {
    try {
        // Validate query (VD: ?limit=20&page=1)
        const { error, value } = chatbotValidation.getChatHistorySchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: "" });
        }

        const { limit, page } = value;

        const userId = req.user && req.user.id ? req.user.id : null;
        const sessionId = req.cookies.guest_session_id;

        const data = await chatbotService.getChatHistory(userId, sessionId, limit, page);

        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller handleGetChatHistory:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
module.exports = {
    handleChatbotMessage, handleGetChatHistory
}