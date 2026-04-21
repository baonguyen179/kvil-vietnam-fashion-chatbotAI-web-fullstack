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
    if (!redisClient.isReady || !key) return null;
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
        let keys = [];
        for await (const key of redisClient.scanIterator({
            MATCH: pattern,
            COUNT: 100
        })) {
            if (Array.isArray(key)) {
                keys.push(...key);
            } else if (key) {
                keys.push(key);
            }
        }
        
        // Remove duplicates just in case and check if there are keys to delete
        keys = [...new Set(keys)];

        if (keys.length > 0) {
            // Delete in chunks to prevent large payload issues
            for (let i = 0; i < keys.length; i += 100) {
                const chunk = keys.slice(i, i + 100);
                await redisClient.del(chunk);
            }
        }
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