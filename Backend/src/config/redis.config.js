const redis = require('redis');
require('dotenv').config();

class RedisClient {
    constructor() {
        this.client = redis.createClient({
            url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
            password: process.env.REDIS_PASSWORD || undefined
        });

        // Bắt các sự kiện để Monitor
        this.client.on('connect', () => console.log('>>> Redis Client Connected'));
        this.client.on('error', (err) => console.error('>>> Redis Client Error:', err.message));
        this.client.on('ready', () => console.log('>>> Redis Client Ready to use'));
        this.client.on('end', () => console.log('>>> Redis Client Disconnected'));

        this.connect();

        // Graceful Shutdown: Tự động ngắt kết nối khi kill node process
        process.on('SIGINT', this.cleanup.bind(this));
        process.on('SIGTERM', this.cleanup.bind(this));
    }

    async connect() {
        try {
            await this.client.connect();
        } catch (error) {
            console.error('>>> Không thể kết nối Redis ban đầu. Hệ thống sẽ tự thử lại.');
        }
    }

    async cleanup() {
        console.log('\n>>> Đang đóng kết nối Redis...');
        await this.client.quit();
        process.exit(0);
    }
}

// Export duy nhất 1 instance (Singleton Pattern)
module.exports = new RedisClient().client;