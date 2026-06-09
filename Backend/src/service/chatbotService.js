const { Op, fn, col, literal } = require('sequelize');
const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const { executeAiAction } = require('../chatbot/actionHandler');
const { aiFunctionDeclarations } = require('../chatbot/chatbotTools');
const { SYSTEM_PROMPT } = require('../chatbot/chatbotPrompt');
//config AI 
const client = require('../config/openai.config');

const redisHelper = require('../helpers/redis.helper');
const CHAT_CACHE_TTL = process.env.CHAT_CACHE_TTL || 600; // Cache lịch sử chat ngắn hạn (10 phút)
// Admin cache TTLs
const ADMIN_STATS_TTL = 120;    // 2 phút - stats có thể sai lệch ít
const ADMIN_SESSIONS_TTL = 60;  // 1 phút - dữ liệu thay đổi nhanh hơn
const ADMIN_DETAIL_TTL = 180;   // 3 phút - chi tiết session ít thay đổi hơn

const processChatbotMessage = async (userId, sessionId, message) => {
    //  [PERFORMANCE] Lưu log USER song song, không await để giảm latency
    db.ChatLog.create({
        userId, sessionId, sender: 'USER', message, metadata: null
    }).catch(err => console.error(">>> Lỗi lưu log USER (Silent):", err));

    let finalReply = "";
    let finalProducts = [];
    const identifier = userId ? `user:${userId}` : `session:${sessionId}`;
    const contextCacheKey = `chat:context:${identifier}`;

    // [OPTIMIZATION] Lấy Context từ Redis cache trước khi query DB
    let aiMessages = [];
    try {
        const cachedContext = await redisHelper.getCache(contextCacheKey);
        if (cachedContext && Array.isArray(cachedContext)) {
            aiMessages = cachedContext;
        } else {
            // Nếu không có cache, mới query DB
            let whereCondition = userId ? { userId } : { sessionId };
            const recentLogs = await db.ChatLog.findAll({
                where: whereCondition,
                order: [['createdAt', 'DESC']],
                limit: 10
            });
            recentLogs.reverse();
            aiMessages = recentLogs.map(log => ({
                role: log.sender === 'USER' ? 'user' : 'assistant',
                content: log.message || ""
            }));
        }
    } catch (cacheError) {
        console.error(">>> Lỗi lấy context cache:", cacheError);
    }

    let userContext = "[HỆ THỐNG]: Khách hàng hiện tại chưa đăng nhập (Khách vãng lai). Cần yêu cầu Số điện thoại + Mã đơn hàng nếu họ muốn tra cứu đơn hàng.";
    if (userId) {
        try {
            const userDetail = await db.User.findByPk(userId, { attributes: ['fullName', 'email'] });
            if (userDetail) {
                userContext = `[HỆ THỐNG]: Khách hàng hiện tại ĐÃ ĐĂNG NHẬP. Tên: ${userDetail.fullName}, Email: ${userDetail.email}, ID: ${userId}. Bạn có thể chủ động chào hỏi thân mật theo tên khách hàng và tự động tra cứu đơn hàng cho họ mà không cần hỏi lại thông tin cá nhân.`;
            }
        } catch (err) {
            console.error(">>> Lỗi lấy thông tin user cho chatbot context:", err);
        }
    }

    const messages = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        {
            role: "system",
            content: userContext
        },
        ...aiMessages,
        { role: "user", content: message } // Thêm tin nhắn hiện tại
    ];

    try {
        const response = await client.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: messages,
            tools: aiFunctionDeclarations,
            tool_choice: "auto"
        });

        const choice = response.choices[0];
        const toolCalls = choice.message.tool_calls;

        if (toolCalls && toolCalls.length > 0) {
            // Xử lý gọi hàm (Chỉ lấy call đầu tiên cho đơn giản)
            const call = toolCalls[0];
            const functionName = call.function.name;
            const args = JSON.parse(call.function.arguments || "{}");
            const actionResult = await executeAiAction(functionName, args, userId);
            finalReply = actionResult.finalReply;
            finalProducts = actionResult.finalProducts;
        } else {
            finalReply = choice.message.content || "Dạ, shop có thể giúp gì thêm cho bạn không ạ?";
        }
    } catch (error) {
        console.error(">>> Lỗi AI Service:", error);
        finalReply = "Dạ, hệ thống đang bận một chút, bạn đợi mình vài giây nhé!";
    }

    // Cập nhật Context Cache (Giữ 10 tin nhắn mới nhất trong Redis)
    const newContext = [
        ...aiMessages,
        { role: "user", content: message },
        { role: "assistant", content: finalReply }
    ].slice(-10); // Chỉ giữ 10 tin cuối
    
    // Lưu cache đồng thời với lưu log BOT
    const productIds = finalProducts.map(p => p.id);
    await Promise.all([
        db.ChatLog.create({
            userId, sessionId, sender: 'BOT', message: finalReply,
            metadata: productIds.length > 0 ? JSON.stringify(productIds) : null
        }),
        redisHelper.setCache(contextCacheKey, newContext, 1800), // Cache 30 phút
        redisHelper.delByPattern(`chat:history:${identifier}:*`) // Clear history list cache
    ]);

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
        const identifier = userId ? `user:${userId}` : `session:${sessionId}`;
        if (!userId && !sessionId) {
            return { EM: 'Chưa có lịch sử chat', EC: errorCode.SUCCESS, DT: { logs: [] } };
        }

        const cacheKey = `chat:history:${identifier}:${page}:${limit}`;
        const cachedHistory = await redisHelper.getCache(cacheKey);

        if (cachedHistory) {
            return { EM: 'Lấy lịch sử chat (Cache) thành công!', EC: errorCode.SUCCESS, DT: cachedHistory };
        }
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
            order: [['createdAt', 'DESC']],
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

        formattedLogs.reverse();

        const result = {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            logs: formattedLogs
        };
        await redisHelper.setCache(cacheKey, result, CHAT_CACHE_TTL);

        return {
            EM: 'Lấy lịch sử chat thành công!',
            EC: errorCode.SUCCESS,
            DT: result
        };

    } catch (error) {
        console.error(">>> Lỗi service getChatHistory:", error);
        return { EM: 'Lỗi khi lấy dữ liệu', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

// ==============================================================
// [ADMIN SECTION] QUẢN LÝ & GIÁM SÁT CHATBOT
// ==============================================================

/**
 * [ADMIN] Lấy thống kê tổng quan về chatbot
 * - Tổng số tin nhắn, tổng số phiên, hoạt động hôm nay, tỷ lệ phản hồi
 * - Cache Redis 2 phút
 */
const getAdminChatStats = async () => {
    const cacheKey = 'admin:chatbot:stats';
    try {
        const cached = await redisHelper.getCache(cacheKey);
        if (cached) {
            return { EM: 'Lấy thống kê (Cache)', EC: errorCode.SUCCESS, DT: cached };
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // Chạy song song 5 query để tối đa tốc độ
        const [
            totalMessages,
            totalSessions,
            todayMessages,
            userMessages,
            botMessages
        ] = await Promise.all([
            // Tổng số tin nhắn
            db.ChatLog.count(),

            // Tổng số phiên chat (theo sessionId unique)
            db.ChatLog.count({
                distinct: true,
                col: 'sessionId'
            }),

            // Tin nhắn hôm nay
            db.ChatLog.count({
                where: { createdAt: { [Op.gte]: todayStart } }
            }),

            // Tổng tin của USER
            db.ChatLog.count({ where: { sender: 'USER' } }),

            // Tổng tin của BOT
            db.ChatLog.count({ where: { sender: 'BOT' } }),
        ]);

        // Lấy top 5 sessions hoạt động nhiều nhất (nhiều tin nhất)
        const topSessions = await db.ChatLog.findAll({
            attributes: [
                'sessionId',
                'userId',
                [fn('COUNT', col('id')), 'messageCount'],
                [fn('MAX', col('createdAt')), 'lastActivity'],
            ],
            group: ['sessionId', 'userId'],
            order: [[literal('messageCount'), 'DESC']],
            limit: 5,
            raw: true,
        });

        const stats = {
            totalMessages,
            totalSessions,
            todayMessages,
            userMessages,
            botMessages,
            botResponseRate: totalMessages > 0
                ? Math.round((botMessages / totalMessages) * 100)
                : 0,
            topSessions,
            generatedAt: new Date().toISOString(),
        };

        await redisHelper.setCache(cacheKey, stats, ADMIN_STATS_TTL);
        return { EM: 'Lấy thống kê thành công!', EC: errorCode.SUCCESS, DT: stats };

    } catch (error) {
        console.error('>>> Lỗi getAdminChatStats:', error);
        return { EM: 'Lỗi khi lấy thống kê chatbot', EC: errorCode.OTHER_ERROR, DT: null };
    }
};

/**
 * [ADMIN] Lấy danh sách tất cả phiên chat (group by sessionId)
 * Hỗ trợ: phân trang, tìm kiếm theo nội dung, lọc theo ngày, lọc user/guest
 * Cache Redis 1 phút
 * @param {object} query - { page, limit, search, type, startDate, endDate }
 */
const getAdminChatSessions = async ({ page = 1, limit = 20, search = '', type = 'all', startDate, endDate } = {}) => {
    // Tạo cache key dựa trên toàn bộ bộ lọc
    const cacheKey = `admin:chatbot:sessions:${page}:${limit}:${type}:${search || ''}:${startDate || ''}:${endDate || ''}`;
    try {
        const cached = await redisHelper.getCache(cacheKey);
        if (cached) {
            return { EM: 'Lấy danh sách phiên (Cache)', EC: errorCode.SUCCESS, DT: cached };
        }

        // Xây dựng điều kiện lọc
        const whereCondition = {};

        // Lọc theo loại: user đăng nhập hay khách vãng lai
        if (type === 'user') {
            whereCondition.userId = { [Op.not]: null };
        } else if (type === 'guest') {
            whereCondition.userId = null;
        }

        // Lọc theo nội dung tin nhắn
        if (search && search.trim() !== '') {
            whereCondition.message = { [Op.like]: `%${search.trim()}%` };
        }

        // Lọc theo khoảng thời gian
        if (startDate || endDate) {
            whereCondition.createdAt = {};
            if (startDate) whereCondition.createdAt[Op.gte] = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Bao gồm cả cuối ngày
                whereCondition.createdAt[Op.lte] = end;
            }
        }

        const offset = (page - 1) * limit;

        // Lấy danh sách sessions phân biệt (distinct sessionId)
        // Dùng subquery pattern: lấy dữ liệu tổng hợp cho mỗi session
        const sessionData = await db.ChatLog.findAll({
            attributes: [
                'sessionId',
                'userId',
                [fn('COUNT', col('id')), 'totalMessages'],
                [fn('SUM', literal("CASE WHEN sender = 'USER' THEN 1 ELSE 0 END")), 'userMessages'],
                [fn('SUM', literal("CASE WHEN sender = 'BOT' THEN 1 ELSE 0 END")), 'botMessages'],
                [fn('MIN', col('createdAt')), 'startedAt'],
                [fn('MAX', col('createdAt')), 'lastActivity'],
            ],
            where: whereCondition,
            group: ['sessionId', 'userId'],
            order: [[literal('lastActivity'), 'DESC']],
            limit: limit,
            offset: offset,
            raw: true,
        });

        // Đếm tổng số sessions khác biệt cho phân trang
        const totalSessionsResult = await db.ChatLog.count({
            distinct: true,
            col: 'sessionId',
            where: whereCondition,
        });

        const result = {
            totalItems: totalSessionsResult,
            totalPages: Math.ceil(totalSessionsResult / limit),
            currentPage: page,
            sessions: sessionData.map(s => ({
                sessionId: s.sessionId,
                userId: s.userId,
                isGuest: s.userId === null,
                totalMessages: parseInt(s.totalMessages, 10),
                userMessages: parseInt(s.userMessages, 10) || 0,
                botMessages: parseInt(s.botMessages, 10) || 0,
                startedAt: s.startedAt,
                lastActivity: s.lastActivity,
            })),
        };

        await redisHelper.setCache(cacheKey, result, ADMIN_SESSIONS_TTL);
        return { EM: 'Lấy danh sách phiên thành công!', EC: errorCode.SUCCESS, DT: result };

    } catch (error) {
        console.error('>>> Lỗi getAdminChatSessions:', error);
        return { EM: 'Lỗi khi lấy danh sách phiên chat', EC: errorCode.OTHER_ERROR, DT: null };
    }
};

/**
 * [ADMIN] Lấy toàn bộ log chi tiết của một phiên chat cụ thể
 * Cache Redis 3 phút
 * @param {string} sessionId
 * @param {number} page
 * @param {number} limit
 */
const getAdminSessionDetail = async (sessionId, page = 1, limit = 50) => {
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
        return { EM: 'sessionId không hợp lệ', EC: errorCode.VALIDATION_ERROR, DT: null };
    }

    const cacheKey = `admin:chatbot:session:${sessionId}:${page}:${limit}`;
    try {
        const cached = await redisHelper.getCache(cacheKey);
        if (cached) {
            return { EM: 'Lấy chi tiết phiên (Cache)', EC: errorCode.SUCCESS, DT: cached };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await db.ChatLog.findAndCountAll({
            where: { sessionId },
            order: [['createdAt', 'ASC']],
            limit,
            offset,
            attributes: ['id', 'userId', 'sessionId', 'sender', 'message', 'metadata', 'createdAt'],
        });

        if (count === 0) {
            return { EM: 'Không tìm thấy phiên chat này', EC: errorCode.NOT_FOUND, DT: null };
        }

        const logs = rows.map(log => ({
            id: log.id,
            userId: log.userId,
            sessionId: log.sessionId,
            sender: log.sender,
            message: log.message,
            // Parse metadata an toàn, tránh lỗi JSON.parse bốc
            suggestedProductIds: (() => {
                try { return log.metadata ? JSON.parse(log.metadata) : []; }
                catch { return []; }
            })(),
            createdAt: log.createdAt,
        }));

        const result = {
            sessionId,
            totalMessages: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            logs,
        };

        await redisHelper.setCache(cacheKey, result, ADMIN_DETAIL_TTL);
        return { EM: 'Lấy chi tiết phiên thành công!', EC: errorCode.SUCCESS, DT: result };

    } catch (error) {
        console.error('>>> Lỗi getAdminSessionDetail:', error);
        return { EM: 'Lỗi khi lấy chi tiết phiên chat', EC: errorCode.OTHER_ERROR, DT: null };
    }
};

/**
 * [ADMIN] Xóa toàn bộ lịch sử chat của một sessionId
 * + Xóa cache lên quan
 * @param {string} sessionId
 */
const deleteAdminChatSession = async (sessionId) => {
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
        return { EM: 'sessionId không hợp lệ', EC: errorCode.VALIDATION_ERROR, DT: null };
    }

    try {
        // Kiểm tra session có tồn tại không trước khi xóa
        const existingCount = await db.ChatLog.count({ where: { sessionId } });
        if (existingCount === 0) {
            return { EM: 'Phiên chat này không tồn tại hoặc đã bị xóa', EC: errorCode.NOT_FOUND, DT: null };
        }

        const deletedCount = await db.ChatLog.destroy({ where: { sessionId } });

        // Xóa tất cả cache liên quan song song
        await Promise.all([
            redisHelper.delByPattern('admin:chatbot:*'),
            redisHelper.delByPattern(`chat:history:session:${sessionId}:*`),
        ]);

        return {
            EM: `Đã xóa ${deletedCount} tin nhắn của phiên chat thành công!`,
            EC: errorCode.SUCCESS,
            DT: { deletedCount, sessionId },
        };

    } catch (error) {
        console.error('>>> Lỗi deleteAdminChatSession:', error);
        return { EM: 'Lỗi khi xóa phiên chat', EC: errorCode.OTHER_ERROR, DT: null };
    }
};

/**
 * [ADMIN] Xóa toàn bộ lịch sử chat của một userId (kể cả nhiều phiên)
 * + Xóa cache liên quan
 * @param {number} userId
 */
const deleteAdminUserChats = async (userId) => {
    const parsedId = parseInt(userId, 10);
    if (!parsedId || isNaN(parsedId) || parsedId <= 0) {
        return { EM: 'userId không hợp lệ', EC: errorCode.VALIDATION_ERROR, DT: null };
    }

    try {
        // Kiểm tra user có lịch sử chat không
        const existingCount = await db.ChatLog.count({ where: { userId: parsedId } });
        if (existingCount === 0) {
            return { EM: 'Người dùng này chưa có lịch sử chat nào', EC: errorCode.NOT_FOUND, DT: null };
        }

        const deletedCount = await db.ChatLog.destroy({ where: { userId: parsedId } });

        // Xóa cache song song
        await Promise.all([
            redisHelper.delByPattern('admin:chatbot:*'),
            redisHelper.delByPattern(`chat:history:user:${parsedId}:*`),
        ]);

        return {
            EM: `Đã xóa ${deletedCount} tin nhắn của user #${parsedId} thành công!`,
            EC: errorCode.SUCCESS,
            DT: { deletedCount, userId: parsedId },
        };

    } catch (error) {
        console.error('>>> Lỗi deleteAdminUserChats:', error);
        return { EM: 'Lỗi khi xóa lịch sử chat của user', EC: errorCode.OTHER_ERROR, DT: null };
    }
};

module.exports = {
    processChatbotMessage,
    getChatHistory,
    // [ADMIN]
    getAdminChatStats,
    getAdminChatSessions,
    getAdminSessionDetail,
    deleteAdminChatSession,
    deleteAdminUserChats,
};
