const request = require('supertest');
const app = require('../../src/server'); // 👈 NHÚNG APP THẬT CHỨA FULL MIDDLEWARE VÀO ĐÂY
const authService = require('../../src/service/authService');
const errorCode = require('../../src/config/errorCodes');

jest.mock('../../src/service/authService');

describe('🚀 API Authentication & Middleware', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 🟢 TEST LUÔN MIDDLEWARE 404 CỦA BẠN
    it('Phải bắt được lỗi 404 Not Found nếu người dùng gọi sai đường dẫn', async () => {
        const response = await request(app).get('/api/duong-dan-nay-khong-ton-tai');

        // Vì app thật đã có middleware 404, nó sẽ trả về status 404 thay vì HTML lỗi
        expect(response.status).toBe(404);
        // (Tùy thuộc vào nội dung file notFond.js của bạn trả về gì, bạn expect cái đó)
    });

    // 🟢 TEST API ĐĂNG KÝ (Đi qua toàn bộ CORS, BodyParser...)
    it('Phải gọi sang authService và trả về SUCCESS khi dữ liệu hợp lệ', async () => {
        authService.registerNewUser.mockResolvedValue({
            EM: 'Tạo tài khoản thành công',
            EC: errorCode.SUCCESS,
            DT: { id: 1, email: 'test@gmail.com' }
        });

        const response = await request(app)
            .post('/api/v1/auth/register') // Nhớ dùng đúng đường dẫn thật có /api/v1
            .send({
                email: 'test@gmail.com',
                phone: '0987654321',
                password: 'password123',
                fullName: 'Test User'
            });

        expect(response.status).toBe(200);
        expect(response.body.EC).toBe(errorCode.SUCCESS);
        expect(authService.registerNewUser).toHaveBeenCalledTimes(1);
    });
});