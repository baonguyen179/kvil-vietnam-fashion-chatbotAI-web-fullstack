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

const sendOrderIdListEmail = async (userEmail, orders) => {
    try {
        const orderListHtml = orders.map(order => `
            <li style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; list-style: none; border-left: 4px solid #1c1c19;">
                <p style="margin: 0; font-weight: bold;">Mã đơn: #${order.id}</p>
                <p style="margin: 0; font-size: 12px; color: #666;">Trạng thái: ${order.status} | Tổng tiền: ${order.finalAmount.toLocaleString()}₫</p>
            </li>
        `).join('');

        const mailOptions = {
            from: '"Kvil Fashion" <no-reply@kvilfashion.com>',
            to: userEmail,
            subject: 'Danh sách Mã đơn hàng của bạn - Kvil Fashion',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="text-align: center; padding: 20px; background: #1c1c19; color: #fff;">
                        <h2 style="margin: 0; letter-spacing: 2px;">KOISAN</h2>
                    </div>
                    <div style="padding: 30px; border: 1px solid #eee;">
                        <h3>Chào bạn,</h3>
                        <p>Theo yêu cầu của bạn, đây là các đơn hàng (trong vòng 30 ngày qua) liên kết với Email và Số điện thoại này:</p>
                        <ul style="padding: 0;">
                            ${orderListHtml}
                        </ul>
                        <p style="margin-top: 30px; font-size: 13px; color: #888;">
                            Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này hoặc liên hệ hotline 1900 xxxx để hỗ trợ.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(">>> Lỗi Gửi Email recovery:", error);
        // [FIX] Xử lý kín, không throw lỗi ra ngoài để tránh báo lỗi server (500) lên giao diện
    }
};

const sendOrderConfirmationEmail = async (userEmail, order) => {
    try {
        const baseUrl = process.env.REACT_URL || 'http://localhost:3000';
        const trackingUrl = order.userId 
            ? `${baseUrl}/account` 
            : `${baseUrl}/tra-cuu-don-hang?orderId=${order.id}&phone=${order.phone}`;
        
        const mailOptions = {
            from: '"Kvil Fashion" <no-reply@kvilfashion.com>',
            to: userEmail,
            subject: `[Kvil Fashion] Đơn hàng #${order.id} của bạn đã được tiếp nhận`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee;">
                    <div style="text-align: center; padding: 20px; background: #1c1c19; color: #fff;">
                        <h2 style="margin: 0; letter-spacing: 2px;">KOISAN CLOTHES</h2>
                    </div>
                    <div style="padding: 30px;">
                        <h3 style="color: #1c1c19;">Cảm ơn bạn đã đặt hàng!</h3>
                        <p>Chào bạn, chúng tôi đã nhận được đơn hàng <b>#${order.id}</b> của bạn và đang chờ xử lý.</p>
                        
                        <div style="background: #fdfdfd; padding: 20px; border: 1px solid #f0f0f0; margin: 20px 0;">
                            <p style="margin: 5px 0; font-size: 13px;"><b>Tổng tiền:</b> ${order.finalAmount.toLocaleString()}₫</p>
                            <p style="margin: 5px 0; font-size: 13px;"><b>Trạng thái:</b> Đang chờ thanh toán/xác nhận</p>
                            <p style="margin: 5px 0; font-size: 13px;"><b>Phương thức:</b> ${order.paymentMethod}</p>
                        </div>

                        <p>Nếu bạn chưa hoàn tất thanh toán hoặc muốn theo dõi tình trạng vận chuyển, bạn có thể truy cập ngay tại đây:</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${trackingUrl}" style="background: #1c1c19; color: #fff; padding: 15px 30px; text-decoration: none; font-weight: bold; font-size: 14px; display-inline-block; border-radius: 4px;">
                                THEO DÕI ĐƠN HÀNG
                            </a>
                        </div>

                        <p style="font-size: 12px; color: #888;">
                            Lưu ý: Nếu đây là đơn thanh toán qua VNPay và bạn chưa hoàn tất, vui lòng nhấn vào nút trên để tiến hành thanh toán lại.
                        </p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
                        <p style="font-size: 11px; color: #aaa; text-align: center;">
                            KOISAN CLOTHES - 274B Lạch Tray, Ngô Quyền, Hải Phòng<br/>
                            Hotline: 0225.3846.118
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(">>> Lỗi Gửi Email confirmation:", error);
        // Không throw lỗi ở đây để tránh làm chết luồng tạo đơn hàng chính
    }
};

const sendReviewRequestEmail = async (userEmail, order, itemsWithTokens) => {
    try {
        const baseUrl = process.env.REACT_URL || 'http://localhost:3000';
        
        // Lọc ra những sản phẩm chưa được đánh giá
        const unreviewedItems = itemsWithTokens.filter(item => !item.reviewed && item.token);
        
        if (unreviewedItems.length === 0) return; // Không có gì để đánh giá

        const productListHtml = unreviewedItems.map(item => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eaeaea; border-radius: 8px; display: flex; align-items: center; gap: 15px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; color: #1c1c19;">${item.productName}</h4>
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #888;">Phân loại: ${item.color} / ${item.size}</p>
                    <a href="${baseUrl}/danh-gia?token=${item.token}" style="display: inline-block; background: #785254; color: #fff; padding: 8px 20px; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: bold;">
                        Đánh giá sản phẩm
                    </a>
                </div>
            </div>
        `).join('');

        const mailOptions = {
            from: '"Kvil Fashion" <no-reply@kvilfashion.com>',
            to: userEmail,
            subject: `[Kvil Fashion] Đơn hàng #${order.id} đã giao thành công - Mời bạn đánh giá`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee;">
                    <div style="text-align: center; padding: 20px; background: #1c1c19; color: #fff;">
                        <h2 style="margin: 0; letter-spacing: 2px;">KOISAN CLOTHES</h2>
                    </div>
                    <div style="padding: 30px;">
                        <h3 style="color: #1c1c19;">Đơn hàng đã được giao thành công!</h3>
                        <p>Chào bạn, đơn hàng <b>#${order.id}</b> của bạn đã được giao đến nơi.</p>
                        <p>Hy vọng bạn hài lòng với các sản phẩm của Koisan. Hãy dành chút thời gian để đánh giá trải nghiệm của mình nhé. Đánh giá của bạn giúp chúng tôi phục vụ tốt hơn và giúp những khách hàng khác có thêm thông tin!</p>
                        
                        <div style="margin: 30px 0;">
                            ${productListHtml}
                        </div>

                        <p style="font-size: 13px; color: #666;">
                            <i>Lưu ý: Link đánh giá có hiệu lực trong vòng 7 ngày kể từ khi nhận được email này.</i>
                        </p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
                        <p style="font-size: 11px; color: #aaa; text-align: center;">
                            KOISAN CLOTHES - 274B Lạch Tray, Ngô Quyền, Hải Phòng<br/>
                            Hotline: 0225.3846.118
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(">>> Lỗi Gửi Email Review Request:", error);
    }
};

module.exports = { sendOtpEmail, sendOrderIdListEmail, sendOrderConfirmationEmail, sendReviewRequestEmail };

