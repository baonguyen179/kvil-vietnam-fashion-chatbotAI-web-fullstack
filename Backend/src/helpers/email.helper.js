const nodemailer = require('nodemailer');
require('dotenv').config();

//  kết nối 1 lần duy nhất, tái sử dụng cho 1 vạn User
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587, // cổng 587 (TLS) thường kết nối nhanh và ít bị chặn 
    secure: false, // Cổng 587 đi kèm với secure: false
    auth: {
        user: process.env.EMAIL_APP_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: {
        //  Bỏ qua lỗi kẹt chứng chỉ do Diệt virus/Mạng chặn
        rejectUnauthorized: false
    }
});

const sendOtpEmail = async (userEmail, otpCode) => {
    try {
        const mailOptions = {
            from: '"Kvil Fashion" <no-reply@kvilfashion.com>',
            to: userEmail,
            subject: 'Mã OTP Khôi phục mật khẩu - Kvil Fashion',
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2>Xin chào,</h2>
                    <p>Mã OTP để khôi phục mật khẩu của bạn là:</p>
                    <h1 style="color: #007bff; letter-spacing: 5px; background: #f4f4f4; padding: 10px; border-radius: 8px; display: inline-block;">${otpCode}</h1>
                    <p><i>Mã này có hiệu lực trong vòng 5 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</i></p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error(">>> Lỗi Gửi Email Nodemailer:", error);
        throw error;
    }
};

module.exports = { sendOtpEmail };