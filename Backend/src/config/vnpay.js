const { VNPay, ignoreLogger } = require('vnpay');

/**
 * Cấu hình VNPay Sandbox để test
 * Thông tin lấy từ: https://sandbox.vnpayment.vn/test-site/
 */
const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMN_CODE || '2QX1S61S',
    secureSecret: process.env.VNP_HASH_SECRET || 'ONGYAEVJUXJLBCYNHRRECOWTRZKWXTHO',
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true, // Sandbox mode
    enableLog: true,
    loggerFn: ignoreLogger,
});

const VNPX_CONFIG = {
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/order/vnpay-return',
    vnp_IpnUrl: process.env.VNP_IPN_URL || 'http://your-backend-url.com/api/v1/vnpay/ipn', // VNPay sẽ gọi ngầm vào đây
};

module.exports = { vnpay, VNPX_CONFIG };
