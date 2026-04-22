require('dotenv').config()
const { VNPay, ignoreLogger } = require('vnpay');

/**
 * Cấu hình VNPay Sandbox để test
 * Thông tin lấy từ: https://sandbox.vnpayment.vn/test-site/
 */
const vnpay = new VNPay({
    tmnCode: process.env.VNP_TMN_CODE || 'J1GWOF15',
    secureSecret: process.env.VNP_HASH_SECRET || 'BV2HPPM4O781ZJ7MBI3N1ISSLR9XY8BO',
    vnpayHost: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',

    testMode: true, // Sandbox mode
    enableLog: true,
    loggerFn: ignoreLogger,
});

const VNPX_CONFIG = {
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/order/vnpay-return',
    vnp_IpnUrl: process.env.VNP_IPN_URL || 'http://localhost:8080/api/v1/vnpay/ipn', // VNPay sẽ gọi ngầm vào đây
};

module.exports = { vnpay, VNPX_CONFIG };
