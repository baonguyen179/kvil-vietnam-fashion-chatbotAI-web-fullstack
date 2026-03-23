const OpenAI = require("openai");
const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const { executeAiAction } = require('./chatbotActionHandler');
const { aiFunctionDeclarations } = require('../config/chatbotTools');

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "kvil-chatbot"
    }
});

const processChatbotMessage = async (userId, sessionId, message) => {
    // 1. Lưu log tin nhắn của khách
    await db.ChatLog.create({
        userId, sessionId, sender: 'USER', message, metadata: null
    });

    let finalReply = "";
    let finalProducts = [];

    // 2. Lấy lịch sử hội thoại (Context)
    let whereCondition = userId ? { userId } : { sessionId };
    const recentLogs = await db.ChatLog.findAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']],
        limit: 10
    });
    recentLogs.reverse();

    const messages = [
        {
            role: "system",
            content: `Bạn là trợ lý ảo tư vấn thời trang thông minh của shop Kvil.
            Nhiệm vụ: Tư vấn sản phẩm, kiểm tra hàng, lọc giá.
            Phong cách: Thân thiện, chuyên nghiệp, dùng emoji nhẹ nhàng.
            QUY TẮC BÓC TÁCH GIÁ:
            - "Dưới X": maxPrice = X, không điền minPrice.
            - "Trên X": minPrice = X, không điền maxPrice.
            - "Từ X đến Y": minPrice = X, maxPrice = Y.
            - "X k" hay "X nghìn": Tự động nhân với 1000 (Ví dụ: 700k -> 700000).
            - LUÔN LUÔN phải giữ lại keyword (áo, quần...) khi khách nhắc tới.
            LƯU Ý QUAN TRỌNG:
            - Có con số cụ thể (ví dụ: 500k, 1 triệu) -> Dùng filterProductsAdvanced.
            - Chỉ nói chung chung "rẻ", "đắt", "mới" -> Dùng searchProducts .
            - Nếu khách muốn lọc theo giá (ví dụ: dưới 500k, từ 200-300k), hãy dùng 'filterProductsAdvanced'.
            - Nếu khách hỏi hàng bán chạy/hot, hãy dùng 'getBestSellerProducts'.
            - KHÔNG tự tiện đoán giá tiền (ví dụ: không được tự ý điền 1 triệu khi khách nói "rẻ").
            - Nếu khách nói "rẻ", "giá tốt", "bình dân" -> Gọi 'searchProducts' với sort='price_asc'.
            - Nếu khách có con số cụ thể (ví dụ: "dưới 500k") -> Mới được gọi 'filterProductsAdvanced'.
            - Tuyệt đối không trả về tin nhắn rác trong tham số hàm.
            - Luôn phản hồi bằng tiếng Việt.`
        },
        ...recentLogs.map(log => ({
            role: log.sender === 'USER' ? 'user' : 'assistant',
            content: log.message || ""
        })),
        { role: "user", content: message } // Thêm tin nhắn hiện tại
    ];

    try {
        // 3. Gọi AI xử lý
        const response = await client.chat.completions.create({
            model: "meta-llama/llama-3-8b-instruct", // Hoặc gpt-3.5-turbo/gpt-4o
            messages: messages,
            tools: aiFunctionDeclarations,
            tool_choice: "auto"
        });

        const choice = response.choices[0];
        const toolCalls = choice.message.tool_calls;

        if (toolCalls && toolCalls.length > 0) {
            // Xử lý gọi hàm (Chỉ lấy call đầu tiên cho đơn giản, hoặc loop nếu cần)
            const call = toolCalls[0];
            const functionName = call.function.name;
            const args = JSON.parse(call.function.arguments || "{}");
            console.log("------------------------------------------");
            console.log("🚀 AI quyết định gọi hàm:", functionName);
            console.log("📦 Tham số AI bóc tách được:", args);
            console.log("------------------------------------------");
            // Thực thi action từ handler (File 2)
            const actionResult = await executeAiAction(functionName, args);
            finalReply = actionResult.finalReply;
            finalProducts = actionResult.finalProducts;

        } else {
            // Trả lời bình thường nếu không cần gọi tool
            finalReply = choice.message.content || "Dạ, shop có thể giúp gì thêm cho bạn không ạ?";
        }

    } catch (error) {
        console.error(">>> Lỗi AI Service:", error);
        finalReply = "Dạ, hệ thống đang bận một chút, bạn đợi mình vài giây nhé!";
    }

    // 4. Lưu log phản hồi của BOT
    const productIds = finalProducts.map(p => p.id);
    await db.ChatLog.create({
        userId,
        sessionId,
        sender: 'BOT',
        message: finalReply,
        metadata: productIds.length > 0 ? JSON.stringify(productIds) : null
    });

    return {
        EM: 'Thành công',
        EC: errorCode.SUCCESS,
        DT: {
            reply: finalReply,
            suggestedProducts: finalProducts
        }
    };

};
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

        const formattedLogs = rows.map(log => ({
            id: log.id,
            sender: log.sender,
            message: log.message,
            metadata: log.metadata ? JSON.parse(log.metadata) : [],
            createdAt: log.createdAt
        }));

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
};

module.exports = {
    processChatbotMessage,
    getChatHistory
};
