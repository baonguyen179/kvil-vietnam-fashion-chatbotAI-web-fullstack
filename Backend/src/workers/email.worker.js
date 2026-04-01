const redisClient = require('../config/redis.config');
const emailHelper = require('../helpers/email.helper');

//  duplicate() để tạo một kết nối Redis độc lập cho Worker.
// Nếu dùng chung client gốc, lệnh brPop sẽ khóa toàn bộ các tác vụ cache khác của server.
const workerClient = redisClient.duplicate();

const startEmailWorker = async () => {
    try {
        await workerClient.connect();
        console.log('>>> Email Worker đã khởi động và đang trực chờ ở [email_queue]...');
    } catch (error) {
        console.error('>>> Email Worker không thể kết nối Redis:', error.message);
        return;
    }

    // Vòng lặp vô hạn chạy ngầm trong background
    while (true) {
        try {
            // brPop lấy data ra từ đuôi List
            const job = await workerClient.brPop('email_queue', 0);

            if (job) {
                try {
                    //  Cố gắng Parse JSON (Bắt lỗi rác như "user_101")
                    const emailData = JSON.parse(job.element);

                    //  Rào chắn (Validation) - Nếu thiếu email thì vứt job này đi, không gửi
                    if (!emailData || !emailData.email) {
                        console.warn(`>>> [Worker]  Bỏ qua Job lỗi (Dữ liệu không có email):`, job.element);
                        continue; // Nhảy qua vòng lặp mới, lấy job tiếp theo
                    }

                    console.log(`\n>>> [Worker] Bắt đầu gửi email OTP tới: ${emailData.email}`);

                    // Gọi hàm gửi email từ helper
                    await emailHelper.sendOtpEmail(emailData.email, emailData.otpCode);

                    console.log(`>>> [Worker]  Gửi thành công email tới: ${emailData.email}`);

                } catch (parseError) {
                    // Nếu lỗi ở JSON.parse, nó sẽ nhảy vào đây
                    console.error(`>>> [Worker] Dữ liệu rác trong Queue, không thể Parse JSON:`, job.element);
                    // Dữ liệu rác đã được lấy ra khỏi queue và vứt đi, worker vẫn sống khỏe để nhận job tiếp theo
                }
            }
        } catch (error) {
            console.error("\n>>> [Worker] Lỗi hệ thống khi xử lý email_queue:", error.message);
            // Delay 5s nếu mất kết nối Redis để tránh spam CPU
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

module.exports = { startEmailWorker };