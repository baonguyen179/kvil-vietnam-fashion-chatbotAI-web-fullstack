const redisClient = require('../config/redis.config');
const emailHelper = require('./email.helper.js');

// ================= CACHING LOGIC =================
const setCache = async (key, value, expInSeconds = 300) => {
    if (!redisClient.isReady) return null; // Bỏ qua nếu Redis sập
    try {
        return await redisClient.setEx(key, expInSeconds, JSON.stringify(value));
    } catch (error) {
        console.error(">>> Redis Set Error:", error);
        return null;
    }
};

const getCache = async (key) => {
    if (!redisClient.isReady) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(">>> Redis Get Error:", error);
        return null;
    }
};

const delCache = async (key) => {
    if (!redisClient.isReady) return null;
    try {
        return await redisClient.del(key);
    } catch (error) {
        console.error(">>> Redis Del Error:", error);
        return null;
    }
};

const delByPattern = async (pattern) => {
    if (!redisClient.isReady) return null;
    try {
        let cursor = 0;
        do {
            // SCAN giúp duyệt key an toàn cho performance
            const reply = await redisClient.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });
            cursor = reply.cursor;
            if (reply.keys.length > 0) {
                await redisClient.del(reply.keys);
            }
        } while (cursor !== 0);
        return true;
    } catch (error) {
        console.error(`>>> Redis DelPattern Error [${pattern}]:`, error);
        return null;
    }
};
// ================= QUEUE LOGIC =================
const pushEmailQueue = async (emailData) => {
    if (!redisClient.isReady) {
        // Fallback: Nếu Redis sập, gửi email trực tiếp như cũ để không làm gián đoạn User
        console.warn(">>> Redis is down. Fallback to direct email sending.");
        return emailHelper.sendOtpEmail(emailData.email, emailData.otpCode).catch(console.error);
    }
    try {
        // Đẩy job gửi email vào đuôi danh sách (List)
        await redisClient.lPush('email_queue', JSON.stringify(emailData));
    } catch (error) {
        console.error(">>> Redis Queue Error:", error);
    }
};

module.exports = { setCache, getCache, delCache, delByPattern, pushEmailQueue };