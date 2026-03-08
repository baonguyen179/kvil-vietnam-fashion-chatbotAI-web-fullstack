const { GoogleGenAI } = require('@google/genai');
const productService = require('./productService');
const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const { executeAiAction } = require('./chatbotActionHandler');

const { aiFunctionDeclarations } = require('../config/chatbotTools');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const processChatbotMessage = async (userId, sessionId, message) => {
    await db.ChatLog.create({
        userId, sessionId, sender: 'USER', message, metadata: null
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
            systemInstruction: "Bạn là nhân viên tư vấn nhiệt tình của shop Kvil. Luôn xưng là 'Dạ/Mình' và gọi khách là 'Bạn'. Trả lời ngắn gọn, thân thiện.",
            tools: [{
                functionDeclarations: aiFunctionDeclarations
            }]
        }
    });

    const functionCalls = response.functionCalls;
    let finalReply = "";
    let finalProducts = [];
    console.log("check functionCalls: ", functionCalls)
    if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];

        const actionResult = await executeAiAction(call.name, call.args);

        finalReply = actionResult.finalReply;
        finalProducts = actionResult.finalProducts;

    } else {
        finalReply = response.text || "Dạ, hệ thống đang kiểm tra thông tin cho bạn ạ.";
    }

    const productIds = finalProducts.map(p => p.id);
    await db.ChatLog.create({
        userId, sessionId, sender: 'BOT', message: finalReply,
        metadata: productIds.length > 0 ? JSON.stringify(productIds) : null
    });

    return {
        EM: 'Chatbot phản hồi thành công!',
        EC: errorCode.SUCCESS,
        DT: {
            reply: finalReply,
            suggestedProducts: finalProducts
        }
    };
}
const getChatHistory = async (userId, sessionId, limit, page) => {
    try {
        const offset = (page - 1) * limit;

        let whereCondition = {};
        if (userId) {
            whereCondition.userId = userId;
        } else if (sessionId) {
            whereCondition.sessionId = sessionId;
            whereCondition.userId = null;
        } else {
            return { EM: 'Chưa có lịch sử chat', EC: errorCode.SUCCESS, DT: { logs: [] } };
        }

        const { count, rows } = await db.ChatLog.findAndCountAll({
            where: whereCondition,
            order: [['createdAt', 'ASC']],
            limit: limit,
            offset: offset,
            attributes: ['id', 'sender', 'message', 'metadata', 'createdAt']
        });

        const formattedLogs = rows.map(log => {
            return {
                id: log.id,
                sender: log.sender,
                message: log.message,
                metadata: log.metadata ? JSON.parse(log.metadata) : [],
                createdAt: log.createdAt
            };
        });

        return {
            EM: 'Lấy lịch sử chat thành công!',
            EC: errorCode.SUCCESS,
            DT: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                logs: formattedLogs
            }
        };
    } catch (error) {
        console.error(">>> Lỗi service getChatHistory:", error);
        return { EM: 'Lỗi khi lấy dữ liệu', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
module.exports = {
    processChatbotMessage, getChatHistory
};