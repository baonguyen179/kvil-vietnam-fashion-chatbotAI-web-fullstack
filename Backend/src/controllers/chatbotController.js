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

        // Nếu cookie hợp lệ, nó trả về giá trị ID gốc. Nếu bị giả mạo, nó trả về false.
        let sessionId = req.signedCookies ? req.signedCookies.guest_session_id : null;

        // Nếu người dùng cố tình sửa bậy cookie, sessionId sẽ thành false hoặc undefined -> Tạo mới luôn
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            res.cookie('guest_session_id', sessionId, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                signed: true //  Bật cờ chữ ký số 
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
        const { error, value } = chatbotValidation.getChatHistorySchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: "" });
        }

        const { limit, page } = value;

        const userId = req.user && req.user.id ? req.user.id : null;

        // Đọc từ req.signedCookies để lấy đúng lịch sử
        const sessionId = req.signedCookies ? req.signedCookies.guest_session_id : null;

        const data = await chatbotService.getChatHistory(userId, sessionId, limit, page);

        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller handleGetChatHistory:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}

// ================================================================
// [ADMIN SECTION] HANDLERS QUẢN LÝ & GIÁM SÁT CHATBOT
// ================================================================

/**
 * [ADMIN] GET /admin/chatbot/stats
 * Thống kê tổng quan chatbot: tổng tin nhắn, tổng phiên, hoạt động hôm nay...
 */
const handleGetAdminChatStats = async (req, res) => {
    try {
        const data = await chatbotService.getAdminChatStats();
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error('>>> Lỗi controller handleGetAdminChatStats:', error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: null });
    }
};

/**
 * [ADMIN] GET /admin/chatbot/sessions
 * Lấy danh sách tất cả phiên chat với phân trang và bộ lọc
 * Query: page, limit, search, type (all|user|guest), startDate, endDate
 */
const handleGetAdminChatSessions = async (req, res) => {
    try {
        const { error, value } = chatbotValidation.adminGetSessionsSchema.validate(req.query, {
            abortEarly: false // Trả về tất cả lỗi cùng lúc thay vì dừng ở lỗi đầu tiên
        });
        if (error) {
            return res.status(200).json({
                EM: error.details.map(d => d.message).join(', '),
                EC: errorCode.VALIDATION_ERROR,
                DT: null
            });
        }

        const data = await chatbotService.getAdminChatSessions(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error('>>> Lỗi controller handleGetAdminChatSessions:', error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: null });
    }
};

/**
 * [ADMIN] GET /admin/chatbot/sessions/:sessionId
 * Lấy toàn bộ log chi tiết của một phiên chat
 * Query: page, limit
 */
const handleGetAdminSessionDetail = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Validate sessionId từ params (không rỗng, không quá dài)
        if (!sessionId || sessionId.trim() === '' || sessionId.length > 128) {
            return res.status(200).json({
                EM: 'sessionId không hợp lệ',
                EC: errorCode.VALIDATION_ERROR,
                DT: null
            });
        }

        const { error, value } = chatbotValidation.adminGetSessionDetailSchema.validate(req.query);
        if (error) {
            return res.status(200).json({
                EM: error.details[0].message,
                EC: errorCode.VALIDATION_ERROR,
                DT: null
            });
        }

        const data = await chatbotService.getAdminSessionDetail(
            sessionId.trim(),
            value.page,
            value.limit
        );
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error('>>> Lỗi controller handleGetAdminSessionDetail:', error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: null });
    }
};

/**
 * [ADMIN] DELETE /admin/chatbot/sessions/:sessionId
 * Xóa toàn bộ lịch sử chat của một phiên cụ thể
 */
const handleDeleteAdminChatSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId || sessionId.trim() === '' || sessionId.length > 128) {
            return res.status(200).json({
                EM: 'sessionId không hợp lệ',
                EC: errorCode.VALIDATION_ERROR,
                DT: null
            });
        }

        const data = await chatbotService.deleteAdminChatSession(sessionId.trim());
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error('>>> Lỗi controller handleDeleteAdminChatSession:', error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: null });
    }
};

/**
 * [ADMIN] DELETE /admin/chatbot/users/:userId
 * Xóa toàn bộ lịch sử chat của một user (đăng nhập)
 */
const handleDeleteAdminUserChats = async (req, res) => {
    try {
        const { error, value } = chatbotValidation.adminUserIdParamSchema.validate({
            userId: req.params.userId
        });
        if (error) {
            return res.status(200).json({
                EM: error.details[0].message,
                EC: errorCode.VALIDATION_ERROR,
                DT: null
            });
        }

        const data = await chatbotService.deleteAdminUserChats(value.userId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error('>>> Lỗi controller handleDeleteAdminUserChats:', error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: null });
    }
};

module.exports = {
    handleChatbotMessage,
    handleGetChatHistory,
    // [ADMIN]
    handleGetAdminChatStats,
    handleGetAdminChatSessions,
    handleGetAdminSessionDetail,
    handleDeleteAdminChatSession,
    handleDeleteAdminUserChats,
}