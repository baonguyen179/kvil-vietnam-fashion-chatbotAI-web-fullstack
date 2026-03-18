const request = require('supertest');
const express = require('express');
const orderController = require('../../src/controllers/orderController');
const orderService = require('../../src/service/orderService');
const errorCode = require('../../src/config/errorCodes');

// 1. TẠO APP ẢO VÀ FAKE ĐĂNG NHẬP (Bypass Auth Middleware)
const app = express();
app.use(express.json());

// Middleware FAKE  luôn gán req.user = { id: 1 } (Đóng vai một User đã đăng nhập)
app.use((req, res, next) => {
    req.user = { id: 1 };
    next();
});

// Gắn cái controller app ảo
app.post('/api/v1/orders', orderController.handleCreateOrder);
app.put('/api/v1/user/orders/:id/cancel', orderController.handleCancelOrder);

// 2. FAKE SERVICE
jest.mock('../../src/service/orderService');

describe('🛒 API Đặt Hàng (Checkout) - /api/v1/orders', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 🔴 KỊCH BẢN 1: Bắt lỗi Validation (Không nhập địa chỉ)
    it('Phải trả về lỗi VALIDATION_ERROR nếu khách không nhập địa chỉ giao hàng', async () => {
        const response = await request(app)
            .post('/api/v1/orders')
            .send({
                paymentMethod: 'COD',
                // Cố tình bỏ quên shippingAddress
            });

        expect(response.status).toBe(200);
        expect(response.body.EC).toBe(errorCode.VALIDATION_ERROR);
        expect(response.body.EM).toBe('Địa chỉ giao hàng là bắt buộc!');
    });

    // 🔴 KỊCH BẢN 2: Bắt lỗi Validation (Nhập sai phương thức thanh toán)
    it('Phải trả về lỗi VALIDATION_ERROR nếu phương thức thanh toán không hợp lệ', async () => {
        const response = await request(app)
            .post('/api/v1/orders')
            .send({
                shippingAddress: '123 Đường ABC, Hà Nội',
                paymentMethod: 'TRA_GOP_0_PHAN_TRAM', // Phương thức bịa đặt
            });

        expect(response.status).toBe(200);
        expect(response.body.EC).toBe(errorCode.VALIDATION_ERROR);
        expect(response.body.EM).toBe('Phương thức thanh toán chỉ hỗ trợ COD hoặc BANK_TRANSFER!');
    });

    // 🟢 KỊCH BẢN 3: Đặt hàng thành công (Happy Case)
    it('Phải gọi sang orderService và trả về SUCCESS khi nhập chuẩn', async () => {

        // Dàn xếp kết quả trả về giả cho Service (Mô phỏng Transaction thành công)
        orderService.createOrder.mockResolvedValue({
            EM: 'Đặt hàng thành công!',
            EC: errorCode.SUCCESS,
            DT: {
                id: 101,
                finalAmount: 150000,
                status: 'pending'
            }
        });

        const response = await request(app)
            .post('/api/v1/orders')
            .send({
                shippingAddress: '123 Đường ABC, Hà Nội',
                paymentMethod: 'COD',
                couponCode: 'KM_HE_2024'
            });

        expect(response.status).toBe(200);
        expect(response.body.EC).toBe(errorCode.SUCCESS);
        expect(response.body.EM).toBe('Đặt hàng thành công!');

        // Kiểm tra xem tầng Service có lấy được đúng User ID = 1 từ Middleware giả không
        expect(orderService.createOrder).toHaveBeenCalledWith(1, expect.any(Object));
    });
});
describe('❌ API Hủy Đơn Hàng - /api/v1/user/orders/:id/cancel', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 🔴 KỊCH BẢN 1: Bắt lỗi Validation (Khách nhập ID đơn hàng là chữ cái)
    it('Phải trả về lỗi VALIDATION_ERROR nếu ID đơn hàng không phải là số', async () => {
        // ACT: Khách cố tình truyền chữ 'abc' thay vì số
        const response = await request(app)
            .put('/api/v1/user/orders/abc_chu_khong_phai_so/cancel');

        expect(response.status).toBe(200);
        expect(response.body.EC).toBe(errorCode.VALIDATION_ERROR);
        expect(response.body.EM).toBe('ID đơn hàng phải là một số nguyên!');
    });

    // 🔴 KỊCH BẢN 2: Service từ chối (Đơn hàng đã giao hoặc không phải của khách)
    it('Phải trả về lỗi từ Service nếu đơn hàng không ở trạng thái pending', async () => {

        // LÀM GIẢ: Service trả về lỗi y như trong hàm cancelOrder 
        orderService.cancelOrder.mockResolvedValue({
            EM: 'Không thể hủy! Đơn hàng đang ở trạng thái: shipping',
            EC: errorCode.VALIDATION_ERROR,
            DT: ''
        });

        const response = await request(app)
            .put('/api/v1/user/orders/99/cancel');

        expect(response.status).toBe(200);
        expect(response.body.EC).toBe(errorCode.VALIDATION_ERROR);
        expect(response.body.EM).toBe('Không thể hủy! Đơn hàng đang ở trạng thái: shipping');
    });

    // 🟢 KỊCH BẢN 3: Hủy đơn thành công (Happy Case)
    it('Phải trả về SUCCESS và gọi đúng tham số khi hủy đơn hợp lệ', async () => {

        // LÀM GIẢ: Giao dịch DB thành công tốt đẹp
        orderService.cancelOrder.mockResolvedValue({
            EM: 'Đã hủy đơn hàng thành công!',
            EC: errorCode.SUCCESS,
            DT: ''
        });

        // ACT: Hủy đơn số 100
        const response = await request(app)
            .put('/api/v1/user/orders/100/cancel');

        // ASSERT
        expect(response.status).toBe(200);
        expect(response.body.EC).toBe(errorCode.SUCCESS);
        expect(response.body.EM).toBe('Đã hủy đơn hàng thành công!');

        // KIỂM TRA  
        // Đảm bảo Controller truyền đúng User ID = 1 (từ fake Token) và Order ID = "100" (từ URL) xuống cho Service
        expect(orderService.cancelOrder).toHaveBeenCalledWith(1, "100");
        expect(orderService.cancelOrder).toHaveBeenCalledTimes(1);
    });
});
