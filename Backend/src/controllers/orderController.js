const orderValidation = require('../validations/orderValidation');
const orderService = require('../service/orderService');
const errorCode = require('../config/errorCodes');

const handleCreateOrder = async (req, res) => {
    try {
        // userId có thể là null/undefined nếu là khách vãng lai
        const userId = req.user?.id;
        let error;

        if (userId) {
            // User đã đăng nhập -> Validate bằng schema cho user
            ({ error } = orderValidation.createOrderSchema.validate(req.body));
        } else {
            // Khách vãng lai -> Validate bằng schema cho khách
            ({ error } = orderValidation.createGuestOrderSchema.validate(req.body));
        }

        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }
        // Truyền cả userId và data từ body xuống service
        const data = await orderService.createOrder(userId, req.body);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleCreateOrder):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleCancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const { error } = orderValidation.cancelOrderSchema.validate({ id: orderId });
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.cancelOrder(userId, orderId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleCancelOrder):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        // Validate req.query (FE gửi params lên URL như ?page=1&limit=5&status=pending)
        const { error, value } = orderValidation.getOrderListSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.getUserOrders(userId, value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetUserOrders):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetUserOrderDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const { error } = orderValidation.getOrderDetailSchema.validate({ id: orderId });
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.getUserOrderDetail(userId, orderId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetUserOrderDetail):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetAdminOrders = async (req, res) => {
    try {
        const { error, value } = orderValidation.getAdminOrderListSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.getAdminOrders(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetAdminOrders):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleUpdateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;

        const { error } = orderValidation.updateOrderStatusSchema.validate(req.body);
        if (error) {
            return res.status(200).json(
                {
                    EM: error.details[0].message,
                    EC: errorCode.VALIDATION_ERROR,
                    DT: ''
                });
        }

        const data = await orderService.updateOrderStatus(orderId, req.body.status);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdateOrderStatus):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleUpdatePaymentStatus = async (req, res) => {
    try {
        const orderId = req.params.id;

        const { error } = orderValidation.updatePaymentStatusSchema.validate(req.body);
        if (error) {
            return res.status(200).json({
                EM: error.details[0].message,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            });
        }

        const data = await orderService.updatePaymentStatus(orderId, req.body.paymentStatus);
        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdatePaymentStatus):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleRequestReturnOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        // [SENIOR] Handle both JSON and FormData (for image upload)
        const reason = req.body.reason;
        let images = [];

        // If files are uploaded via multer
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.path);
        } else if (req.body.images) {
            // Fallback for JSON body if already uploaded or using links
            images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        if (!reason) {
            return res.status(200).json({ EM: 'Vui lòng cung cấp lý do trả hàng!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.requestReturnOrder(userId, orderId, { reason, images });
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleRequestReturnOrder):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}

const vnpayService = require('../service/vnpayService');

/**
 * Lấy link thanh toán VNPAY (Hỗ trợ cả đơn mới và đơn cũ chưa thanh toán)
 */
const handleGetVNPayUrl = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        const data = await orderService.getVNPayPaymentUrl(req, orderId, userId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi handleGetVNPayUrl:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

/**
 * [PUBLIC] Lấy link thanh toán cho khách vãng lai (Xác thực qua SĐT)
 */
const handleGetGuestVNPayUrl = async (req, res) => {
    try {
        const { orderId, phone } = req.body;
        if (!orderId || !phone) {
            return res.status(200).json({ EM: 'Mã đơn hàng và Số điện thoại là bắt buộc!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.getGuestVNPayPaymentUrl(req, orderId, phone);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi handleGetGuestVNPayUrl:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

/**
 * [PUBLIC] Tra cứu trạng thái đơn hàng khách vãng lai
 */
const handleGetGuestOrderDetail = async (req, res) => {
    try {
        const orderId = req.params.id;
        const phone = req.query.phone;
        
        if (!orderId || !phone) {
            return res.status(200).json({ EM: 'Mã đơn hàng và Số điện thoại là bắt buộc!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.getGuestOrderDetail(orderId, phone);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi handleGetGuestOrderDetail:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

/**
 * [PUBLIC] Yêu cầu khôi phục mã đơn hàng qua Email
 */
const handleRecoverGuestOrderIds = async (req, res) => {
    try {
        const { email, phone } = req.body;
        if (!email || !phone) {
            return res.status(200).json({ EM: 'Email và Số điện thoại là bắt buộc!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.recoverGuestOrderIds(email, phone);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi handleRecoverGuestOrderIds:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};


/**
 * [ADMIN] Đồng bộ thủ công trạng thái đơn hàng từ VNPAY
 */
const handleSyncVNPayStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const data = await orderService.syncOrderWithVNPay(orderId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi handleSyncVNPayStatus:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

/**
 * Xử lý IPN từ VNPay (Server-to-Server)
 * Rất quan trọng để cập nhật đơn hàng chính xác
 */
const handleVNPayIPN = async (req, res) => {
    console.log(">>> [VNPAY IPN RECEIVED]:", req.query);
    try {
        const verify = vnpayService.verifyIpnCall(req.query);
        console.log(">>> [VNPAY IPN VERIFY]:", verify);

        if (!verify.isSuccess) {
            console.error(">>> [VNPAY IPN ERROR]: Invalid checksum");
            return res.status(200).json({ RspCode: '97', Message: 'Invalid checksum' });
        }

        const orderId = req.query.vnp_TxnRef;
        const vnpAmount = parseInt(req.query.vnp_Amount) / 100;
        const vnpResponseCode = req.query.vnp_ResponseCode;

        console.log(`>>> [PROCESSING VNPAY IPN] OrderID: ${orderId}, Amount: ${vnpAmount}, ResCode: ${vnpResponseCode}`);

        // Gọi service xử lý cập nhật đơn hàng
        const result = await orderService.processVNPayPayment(orderId, vnpAmount, vnpResponseCode, req.query);
        
        console.log(">>> [VNPAY IPN PROCESS RESULT]:", result);

        // Trả về theo định nghĩa của VNPay
        return res.status(200).json({
            RspCode: result.EC === 0 ? '00' : result.EC.toString(),
            Message: result.EM
        });

    } catch (error) {
        console.error(">>> [CRITICAL ERROR handleVNPayIPN]:", error);
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};


const handleVNPayReturn = async (req, res) => {
    // console.log(">>> [VNPAY RETURN RECEIVED]:", req.query);
    try {
        const verify = vnpayService.verifyReturnUrl(req.query);
        // console.log(">>> [VNPAY RETURN VERIFY]:", verify);

        // Senior Note: Library vnpay trả về Object { isSuccess, ... } nên if(verify) luôn đúng -> cần sửa
        if (verify && (verify.isSuccess || verify.isVerified)) {
            console.log(">>> [VNPAY RETURN] Checksum hợp lệ. Bắt đầu cập nhật đồng bộ...");
            
            const orderId = req.query.vnp_TxnRef;
            const vnpAmount = parseInt(req.query.vnp_Amount) / 100;
            const vnpResponseCode = req.query.vnp_ResponseCode;

            // [SENIOR FALLBACK] Gọi cập nhật DB ngay tại đây để tránh lỗi mất IPN
            const updateResult = await orderService.processVNPayPayment(orderId, vnpAmount, vnpResponseCode, req.query);
            
            // Map thông báo lỗi thân thiện dựa trên vnp_ResponseCode
            const vnpMsgMap = {
                '07': 'Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
                '09': 'Thẻ/Tài khoản của bạn chưa đăng ký dịch vụ InternetBanking.',
                '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
                '11': 'Hết hạn chờ thanh toán. Vui lòng thực hiện lại.',
                '12': 'Thẻ/Tài khoản của bạn đang bị khóa.',
                '13': 'Sai mật khẩu OTP. Vui lòng thực hiện lại.',
                '24': 'Giao dịch đã bị hủy bởi người dùng.',
                '51': 'Tài khoản của bạn không đủ số dư để thực hiện giao dịch.',
                '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
                '75': 'Ngân hàng thanh toán đang bảo trì.',
                '99': 'Lỗi không xác định tại cổng thanh toán.'
            };

            // Chuyển đổi mã '00' từ VNPay (String) thành mã thành công của hệ thống (Number 0)
            const systemEC = vnpResponseCode === '00' ? 0 : vnpResponseCode;
            const systemEM = vnpResponseCode === '00' ? 'Thanh toán thành công!' : (vnpMsgMap[vnpResponseCode] || updateResult.EM);

            return res.status(200).json({
                EM: systemEM,
                EC: systemEC,
                DT: req.query
            });

        } else {
            console.error(">>> [VNPAY RETURN ERROR]: Invalid checksum");
            return res.status(200).json({
                EM: 'Chữ ký không hợp lệ hoặc thanh toán thất bại',
                EC: -1,
                DT: ''
            });
        }
    } catch (error) {
        console.error(">>> [CRITICAL ERROR handleVNPayReturn]:", error);
        return res.status(500).json({
            EM: 'Lỗi server khi xử lý kết quả VNPay',
            EC: -1,
            DT: ''
        });
    }
};



const handleGetPaymentTransactions = async (req, res) => {
    try {
        const { error, value } = orderValidation.getPaymentTransactionsSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.getPaymentTransactionsAdmin(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi handleGetPaymentTransactions:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetReturnRequests = async (req, res) => {
    try {
        const query = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            status: req.query.status
        };
        const data = await orderService.getReturnRequestsAdmin(query);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi handleGetReturnRequests:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleUpdateReturnRequestStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body; // APPROVED or REJECTED
        const adminId = req.user.id;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(200).json({ EM: 'Trạng thái không hợp lệ!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.updateReturnStatus(id, status, adminId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi handleUpdateReturnRequestStatus:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleConfirmReturnReceived = async (req, res) => {
    try {
        const id = req.params.id;
        const { stockCondition } = req.body; // 'good' | 'defective'
        const warehouseUserId = req.user.id;

        if (!['good', 'defective'].includes(stockCondition)) {
            return res.status(200).json({ EM: 'Tình trạng hàng không hợp lệ!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await orderService.confirmReturnReceived(id, warehouseUserId, stockCondition);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi handleConfirmReturnReceived:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

module.exports = {
    handleCreateOrder, handleCancelOrder,
    handleGetUserOrders, handleGetUserOrderDetail,
    handleGetAdminOrders, handleUpdateOrderStatus,
    handleUpdatePaymentStatus,
    handleRequestReturnOrder,
    handleGetVNPayUrl, handleVNPayIPN, handleVNPayReturn,
    handleGetPaymentTransactions, handleGetReturnRequests, handleUpdateReturnRequestStatus,
    handleConfirmReturnReceived,
    handleSyncVNPayStatus, handleGetGuestVNPayUrl, handleGetGuestOrderDetail,
    handleRecoverGuestOrderIds
}