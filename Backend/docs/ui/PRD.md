# PRD — Kvil Fashion Backend

> **Product Requirements Document** — Tính năng đã hoàn thiện trong hệ thống.
> **Cập nhật lần cuối:** 2026-05-16

---

## 1. Phân quyền người dùng (RBAC)

| Vai trò | Quyền hạn chính |
|:---|:---|
| **Guest** | Xem sản phẩm, đặt hàng, chat AI, tra cứu đơn bằng phone |
| **User** | + Profile, địa chỉ, giỏ hàng, lịch sử đơn, đánh giá sản phẩm |
| **SALES** | `orders`, `products`, `inventory`, `categories`, `coupons` |
| **ACCOUNTANT** | `payments.read`, `orders.read` |
| **SUPER_ADMIN** | Tất cả + `users.manage`, `dashboard.read`, `chatbot.read/manage` |

> RBAC động: Roles/Permissions tạo tùy ý qua API, không hardcode.

---

## 2. Tính năng đã hoàn thiện

### 🔐 Auth & Bảo mật
- [x] Đăng ký / Đăng nhập / Đăng xuất / Refresh Token (HttpOnly Cookie)
- [x] Đổi mật khẩu khi đăng nhập
- [x] Quên mật khẩu qua OTP email (hết hạn 5 phút)

### 👤 Profile & Địa chỉ
- [x] Xem / cập nhật thông tin cá nhân
- [x] CRUD địa chỉ giao hàng, đặt mặc định

### 🛍️ Sản phẩm & Danh mục
- [x] Danh sách (phân trang, lọc động AQP, sort), tìm kiếm full-text
- [x] Chi tiết sản phẩm (variants, ảnh, `ratingAvg` denormalize)
- [x] Best Seller (từ lịch sử đơn), Best Discount
- [x] CRUD Category, Product, Variant (colorId, sizeId, sku, stock)
- [x] Upload/xóa ảnh Cloudinary, quản lý Colors & Sizes

### 🗂️ Collections
- [x] Xem danh sách + chi tiết theo slug
- [x] CRUD Collection + banner Cloudinary, thêm/xóa sản phẩm

### 🛒 Giỏ hàng
- [x] Xem / thêm / sửa / xóa item, kiểm tra tồn kho, đồng bộ DB

### 📦 Đặt hàng
- [x] Tạo đơn (User + Guest `optionalAuth`), áp Coupon
- [x] Trừ kho Atomic (DB Transaction + Rollback), gửi email xác nhận (Queue)
- [x] Xem lịch sử + chi tiết đơn, hủy đơn
- [x] Admin: xem/duyệt/cập nhật trạng thái toàn bộ đơn

### 💳 VNPay
- [x] Tạo link thanh toán QR, IPN Webhook (checksum bảo mật)
- [x] Guest lấy lại link nếu đóng trình duyệt
- [x] Admin sync QueryDR, xem giao dịch (ACCOUNTANT)

### 🔄 Trả hàng
- [x] User yêu cầu trả kèm ảnh, Admin duyệt/từ chối, tự động refund VNPay

### 🏪 Kho hàng
- [x] Xem lịch sử nhập/xuất, nhập kho bằng Excel, điều chỉnh thủ công

### 🎫 Coupon
- [x] Kiểm tra hợp lệ, xem coupon công khai, CRUD coupon (Admin)

### ⭐ Đánh giá sản phẩm
- [x] Token review qua email / đăng nhập; gửi review + ảnh
- [x] Chống spam (1 OrderItem = 1 Review, pessimistic lock)
- [x] Lọc ngôn từ → auto PENDING/APPROVED, cập nhật `ratingAvg` atomic
- [x] Admin duyệt/ẩn review

### 🤖 AI Chatbot (10 Function Tools)
- [x] `searchProducts`, `getAllProducts`, `suggestCollections`
- [x] `getBestDiscountProducts`, `getBestSellerProducts`
- [x] `checkProductAvailability`, `filterProductsAdvanced`
- [x] `trackOrder` (User auto / Guest xác thực phone)
- [x] `getTopRatedProducts` — top sản phẩm đánh giá cao, cache 30m
- [x] `getProductReviewSummary` — tổng quan review 1 sản phẩm cụ thể
- [x] Lưu ChatLog + Redis context cache, merge history khi đăng nhập
- [x] Admin: stats, sessions, xóa session/user chat

### 📊 Dashboard & Admin System
- [x] Thống kê doanh thu, top sản phẩm (Redis 30m)
- [x] CRUD Staff, Roles, Permissions (SUPER_ADMIN)

---

## 3. User Flow cơ bản

### A. Mua hàng (Happy path)
```
Vào web → Chat AI gợi ý / Tìm sản phẩm
  → Chi tiết → Chọn size/màu → Thêm giỏ
  → Đặt hàng (địa chỉ + coupon) → Thanh toán VNPay / COD
  → Email xác nhận → Theo dõi trạng thái
  → Nhận hàng → Đánh giá sản phẩm (token)
```

### B. Khách vãng lai (Guest)
```
Không đăng nhập → Đặt hàng (guestInfo: email, phone, name)
  → Thanh toán → Tra cứu đơn bằng orderId + phone
  → Mất mã → Nhập email + phone → Hệ thống gửi lại danh sách đơn
```

### C. Admin xử lý đơn
```
SALES: Duyệt đơn → Cập nhật giao hàng → Xử lý trả hàng
ACCOUNTANT: Xem giao dịch VNPay → Sync trạng thái nghi ngờ (QueryDR)
```

### D. Chatbot AI
```
Khách nhắn → Lấy Redis context
  → OpenRouter API → text thuần: trả lời ngay
                   → tool_call: actionHandler → serviceForChatBot → DB/Redis
  → { reply, products } → Lưu log async → Trả Client
```
