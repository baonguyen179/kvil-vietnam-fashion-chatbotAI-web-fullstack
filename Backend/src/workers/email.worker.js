const redisClient = require('../config/redis.config');
const emailHelper = require('../helpers/email.helper');

//  duplicate() để tạo một kết nối Redis độc lập cho Worker.
// Nếu dùng chung client gốc, lệnh brPop sẽ khóa toàn bộ các tác vụ cache khác của server.
const workerClient = redisClient.duplicate();

// Thêm listener bắt lỗi để tránh crash ứng dụng khi mất kết nối Redis đột ngột (ECONNRESET)
workerClient.on('error', (err) => {
    console.error('>>> Redis Worker Client Error:', err.message);
});

const startEmailWorker = async () => {
    try {
        await workerClient.connect();
        console.log('>>> Email Worker đã khởi động và đang trực chờ ở [email_queue]...');
    } catch (error) {
        console.error('>>> Email Worker không thể kết nối Redis:', error.message);
        return;
    }

    while (true) {
        try {
            const job = await workerClient.brPop('email_queue', 0);

            if (job) {
                let emailData;

                try {
                    emailData = JSON.parse(job.element);
                } catch (parseError) {
                    console.error(`>>> [Worker] Dữ liệu rác trong Queue, không thể Parse JSON:`, job.element);
                    continue; // Lỗi parse thì bỏ qua job này, lấy job mới
                }

                if (!emailData || !emailData.email) {
                    console.warn(`>>> [Worker] Bỏ qua Job lỗi (Dữ liệu không có email):`, job.element);
                    continue;
                }

                console.log(`\n>>> [Worker] Bắt đầu gửi email OTP tới: ${emailData.email}`);

                try {
                    await emailHelper.sendOtpEmail(emailData.email, emailData.otpCode);
                    console.log(`>>> [Worker] Gửi thành công email tới: ${emailData.email}`);
                } catch (emailError) {
                    console.error(`>>> [Worker] Lỗi khi gửi email tới ${emailData.email}:`, emailError.message);

                }
            }
        } catch (error) {
            console.error("\n>>> [Worker] Lỗi hệ thống khi xử lý email_queue:", error.message);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

module.exports = { startEmailWorker };