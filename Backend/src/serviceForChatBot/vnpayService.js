const { vnpay, VNPX_CONFIG } = require('../config/vnpay');
const { ProductCode } = require('vnpay');

/**
 * Service xử lý các tác vụ liên quan đến VNPay
 */
const generatePaymentUrl = (req, orderId, amount, orderInfo) => {
    // 1. Lấy địa chỉ IP của khách hàng
    const ipAddr = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress || 
                   req.connection.socket.remoteAddress;

    // 2. Xây dựng tham số thanh toán
    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount, // VNPay tính bằng VND, không cần nhân 100 nếu amount đã là VND thực tế * 100 (thư viện vnpay tự xử lý nhân 100)
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: orderId.toString(),
        vnp_OrderInfo: orderInfo || `Thanh toán cho đơn hàng #${orderId}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: VNPX_CONFIG.vnp_ReturnUrl,
        // vnp_CreateDate: format(new Date(), 'yyyyMMddHHmmss'), // Thư viện tự tạo
    });

    return paymentUrl;
};

const verifyIpnCall = (query) => {
    return vnpay.verifyIpnCall(query);
};

const verifyReturnUrl = (query) => {
    return vnpay.verifyReturnUrl(query);
};

/**
 * Truy vấn trạng thái giao dịch từ VNPay (QueryDR)
 * Dùng để đối soát hoặc xử lý khi IPN không đến được hệ thống
 */
const queryTransaction = async (orderId, createDate, ipAddr) => {
    return vnpay.queryDr({
        vnp_TxnRef: orderId.toString(),
        vnp_TransactionDate: createDate, // Phải lấy đúng ngày lúc tạo thanh toán (yyyyMMddHHmmss)
        vnp_IpAddr: ipAddr || '127.0.0.1'
    });
};

/**
 * Hoàn tiền giao dịch (Refund API)
 * Dùng khi Admin duyệt trả hàng
 */
const refundTransaction = async (params) => {
    const { 
        orderId, 
        amount, 
        transDate, 
        refundType, // '02' (Hoàn tiền toàn phần), '03' (Hoàn tiền một phần)
        user, 
        ipAddr,
        vnp_TransactionNo 
    } = params;
    
    return vnpay.refund({
        vnp_TxnRef: orderId.toString(),
        vnp_Amount: amount,
        vnp_TransactionType: refundType || '02',
        vnp_TransactionDate: transDate,
        vnp_TransactionNo: vnp_TransactionNo || '', // Mã GD từ VNPay trả về lúc thanh toán
        vnp_CreateBy: user || 'ADMIN',
        vnp_IpAddr: ipAddr || '127.0.0.1'
    });
};

module.exports = {
    generatePaymentUrl,
    verifyIpnCall,
    verifyReturnUrl,
    queryTransaction,
    refundTransaction
};
