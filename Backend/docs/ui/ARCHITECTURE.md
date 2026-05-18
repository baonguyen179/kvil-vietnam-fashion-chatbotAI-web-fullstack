# ARCHITECTURE — Kvil Fashion Backend

> Tài liệu này mô tả kiến trúc kỹ thuật của Backend API cho hệ thống thương mại điện tử thời trang Kvil.
> **Cập nhật lần cuối:** 2026-05-16

---

## 1. Tech Stack

| Lớp | Công nghệ | Ghi chú |
|:---|:---|:---|
| **Runtime** | Node.js (CommonJS) | `"type": "commonjs"` |
| **Framework** | Express.js v5 | REST API |
| **Database** | MySQL | Quan hệ đầy đủ |
| **ORM** | Sequelize v6 | Migrations + Seeders + Soft-delete (paranoid) |
| **Cache / Queue** | Redis v5 (ioredis) | Cache TTL + Email Queue |
| **Authentication** | JWT (jsonwebtoken) + Cookie (HttpOnly) | Access + Refresh Token |
| **File Storage** | Cloudinary | Ảnh sản phẩm, review, banner |
| **File Upload** | Multer + multer-storage-cloudinary | Multipart/form-data |
| **AI Chatbot** | OpenRouter API (OpenAI SDK) | Function Calling |
| **Payment** | VNPay (`vnpay` lib) | QR, IPN webhook, QueryDR |
| **Email** | Nodemailer + Redis Queue Worker | OTP, xác nhận đơn |
| **Validation** | Joi | Schema validation tất cả input |
| **Excel** | ExcelJS | Template nhập kho |
| **Query Parse** | api-query-params (aqp) | Bộ lọc động từ query string |
| **Dev** | Nodemon | Hot-reload |
| **Test** | Jest + Supertest | Unit & Integration |
| **Deploy** | Render.com | Cloud PaaS |

---

## 2. Cấu trúc thư mục `src/`

```
src/
├── server.js                 # Entry point — khởi động Express, kết nối DB/Redis/Worker
│
├── routes/
│   ├── api.js                # Router gốc: gộp public + user + admin vào /api/v1
│   ├── public.js             # Routes KHÔNG cần auth (sản phẩm, auth, chatbot, reviews...)
│   ├── user.js               # Routes cần JWT của Customer
│   └── admin.js              # Routes cần JWT + Permission của Staff
│
├── controllers/              # Tầng HTTP: nhận req → validate → gọi service → trả res
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── chatbotController.js
│   └── ... (14 controllers)
│
├── service/                  # Business logic cho API thông thường (không phải chatbot)
│   ├── authService.js
│   ├── orderService.js       # Lớn nhất (~58KB): đặt hàng, VNPay, trả hàng
│   ├── productService.js     # CRUD sản phẩm, variants, ảnh, kho
│   ├── reviewService.js      # Đánh giá, token, duyệt admin
│   └── ... (16 services)
│
├── serviceForChatBot/        # Business logic riêng cho AI Chatbot (nhẹ, read-only)
│   ├── productService.js     # Tìm kiếm, lọc, bestseller, discount
│   ├── orderService.js       # Tra cứu đơn hàng theo user/guest
│   ├── collectionService.js  # Danh sách bộ sưu tập
│   └── reviewService.js      # Top-rated, review summary (Redis cache 30 phút)
│
├── chatbot/
│   ├── chatbotTools.js       # Khai báo 10 Function Declarations cho OpenAI
│   └── actionHandler.js      # Dispatcher: switch(functionName) → gọi đúng service
│
├── models/                   # Sequelize model definitions (27 models)
│   ├── product.js            # Có paranoid, ratingAvg denormalize
│   ├── order.js
│   ├── review.js
│   └── ... (27 models)
│
├── middleware/
│   ├── JWTAction.js          # checkUserJWT, checkUserPermission, optionalAuth
│   ├── CORS.js               # Whitelist domain
│   ├── reviewAuth.js         # Xác thực token link review email
│   └── notFond.js            # 404 handler
│
├── config/
│   ├── database.js           # Sequelize config
│   ├── connectDB.js          # Kết nối MySQL + Redis
│   ├── redis.config.js       # Redis client singleton
│   ├── openai.config.js      # OpenRouter client (OpenAI SDK)
│   ├── cloudinary.config.js  # Multer + Cloudinary storage
│   ├── vnpay.js              # VNPay config
│   ├── errorCodes.js         # Chuẩn hóa mã lỗi {SUCCESS, NOT_FOUND...}
│   └── roles.js              # Danh sách permission strings
│
├── validations/              # Joi schemas — validate input trước khi vào service
│   └── ... (11 files)
│
├── helpers/
│   ├── redis.helper.js       # setCache, getCache, delCache, delByPattern, pushEmailQueue
│   ├── email.helper.js       # Template HTML email + gửi mail
│   ├── excel.helper.js       # Đọc/ghi file Excel nhập kho
│   └── review.helper.js      # generateReviewToken, isCleanContent
│
├── workers/
│   └── email.worker.js       # Consumer lấy job từ Redis Queue và gửi email
│
├── migrations/               # Sequelize migration files
└── seeders/                  # Dữ liệu mẫu
```

---

## 3. Data Flow chính

### 3A. Request thông thường (REST API)
```
Client (Browser/App)
    │ HTTP Request + Cookie(accessToken)
    ▼
Express Router (/api/v1)
    │
    ├─ [public.js]  → Controller → Service → DB/Cache → Response
    ├─ [user.js]    → JWTAction.checkUserJWT → Controller → Service → Response
    └─ [admin.js]   → JWTAction.checkUserJWT + checkUserPermission → Controller → Service → Response
```

### 3B. Chatbot AI Flow (Function Calling)
```
Client → POST /api/v1/chatbot/message
    │
    ▼
chatbotController
    │ Lấy context từ Redis (10 tin nhắn gần nhất)
    ▼
OpenRouter API (GPT model)
    │ Trả về: text | tool_call(functionName, args)
    ▼
actionHandler.executeAiAction(functionName, args, userId)
    │
    ├─ searchProducts       → serviceForChatBot/productService
    ├─ getTopRatedProducts  → serviceForChatBot/reviewService → Redis Cache (30 phút)
    ├─ trackOrder           → serviceForChatBot/orderService
    └─ ... (10 tools)
    ▼
{ finalReply: string, finalProducts: Product[] }
    │ Lưu log vào ChatLog (DB) — async, không block
    ▼
Response về Client
```

### 3C. Payment Flow (VNPay)
```
User đặt hàng → POST /user/orders
    → Tạo Order (DB Transaction) → Trừ kho → Gửi email xác nhận (Redis Queue)
    → Nếu paymentMethod = 'vnpay': tạo paymentUrl

User thanh toán VNPay → Redirect → GET /vnpay/return (hiển thị UI)
VNPay IPN → GET /vnpay/ipn (server-to-server, cập nhật trạng thái DB)

Admin sync thủ công → PATCH /admin/orders/:id/vnpay-sync → QueryDR API
```

### 3D. Email Queue Flow
```
Trigger (đăng ký, đặt hàng, OTP)
    → redisHelper.pushEmailQueue(emailData)
    → Redis List "email_queue"
    ← email.worker.js (polling mỗi 1s) → Nodemailer → Gửi email
    ※ Fallback: Nếu Redis down → gửi email trực tiếp (không queue)
```

---

## 4. Database Schema (tóm tắt quan hệ)

```
Users ──< UserRoles >── Roles ──< RolePermissions >── Permissions
Users ──< UserAddresses
Users ──< Carts ──< CartItems >── ProductVariants
Users ──< Orders ──< OrderItems >── ProductVariants
                  └─ PaymentTransactions
                  └─ ReturnRequests

Products ──< ProductVariants (colorId, sizeId, stock, sku)
Products ──< ProductImages
Products ──< Reviews ──< ReviewImages
Products >──< Collections (qua CollectionProduct)
Products ──< InventoryLogs

Reviews ──> OrderItems  (chống spam: 1 item = 1 review)
Reviews ──> Users (nullable — khách vãng lai)
```

---

## 5. Caching Strategy

| Key Pattern | TTL | Mô tả |
|:---|:---:|:---|
| `chatbot:context:{sessionId}` | 1h | Lịch sử hội thoại (10 tin) |
| `products:list:{params}` | 1h | Danh sách sản phẩm phân trang |
| `product:detail:{id}` | 1h | Chi tiết sản phẩm |
| `products:search:{kw}` | — | Tắt cache (search quá động) |
| `products:bestsellers:{kw}:{limit}` | 1h | Best seller |
| `products:discount:{kw}:{limit}` | 10m | Best discount |
| `chatbot:top-rated:{kw}:{rating}:{limit}` | 30m | Top-rated sản phẩm |
| `collection:detail:{slug}` | 1h | Chi tiết collection |
| `dashboard:stats` | 30m | Thống kê dashboard |
| `admin:chatbot:stats` | 30m | Chatbot analytics |
| `email_queue` | — | Redis List (FIFO queue) |
