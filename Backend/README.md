# 👕 KVIL Vietnam Fashion - Chatbot AI Backend

Phương thức Endpoint Chức năng Quyền yêu cầu
GET /api/v1/admin/roles Lấy danh sách Vai trò & Quyền Quản trị viên
POST /api/v1/admin/roles Tạo vai trò mới SUPER_ADMIN
PUT /api/v1/admin/roles/:id Cập nhật Vai trò SUPER_ADMIN
DELETE /api/v1/admin/roles/:id Xóa Vai trò SUPER_ADMIN
POST /api/v1/admin/roles/:id/permissions Gán danh sách quyền cho Role SUPER_ADMIN
GET /api/v1/admin/permissions Lấy tất cả quyền có sẵn Quản trị viên
Hệ thống Backend được xây dựng trên nền tảng Node.js với cấu trúc hiện đại, tích hợp Trí tuệ nhân tạo (Chatbot), Cổng thanh toán trực tuyến (VNPay) và hệ thống phân quyền chuyên sâu (RBAC).

---

## 🛠️ Công nghệ & Thư viện cốt lõi (Tech Stack)

| Công nghệ      | Thư viện / Công cụ          | Mục đích                                                  |
| :------------- | :-------------------------- | :-------------------------------------------------------- |
| **Core**       | `Node.js` & `Express`       | Xây dựng RESTful API và Middleware.                       |
| **Database**   | `MySQL` & `Sequelize ORM`   | Quản lý dữ liệu quan hệ, Migration và quan hệ khóa ngoại. |
| **Security**   | `jsonwebtoken` & `bcryptjs` | Xác thực JWT, phân quyền RBAC và mã hóa mật khẩu.         |
| **AI / NLP**   | `Google Generative AI`      | Xử lý ngôn ngữ tự nhiên và gợi ý sản phẩm cho Chatbot.    |
| **Payment**    | `vnpay` (Node.js SDK)       | Tích hợp cổng thanh toán VNPay (QR Code / IPN).           |
| **Storage**    | `Cloudinary`                | Lưu trữ và tối ưu hóa hình ảnh sản phẩm.                  |
| **Caching**    | `Redis`                     | Tối ưu hóa tốc độ tải dữ liệu (Homepage, Search, Stats).  |
| **Validation** | `joi`                       | Kiểm soát dữ liệu đầu vào (Input Validation).             |

---

## 🛡️ Hệ thống Phân quyền (RBAC Matrix)

Hệ thống sử dụng bộ mã quyền (Role) động để giới hạn quyền truy cập tài nguyên:

| Role              | Mô tả                 | Quyền hạn chính                                                        |
| :---------------- | :-------------------- | :--------------------------------------------------------------------- |
| **`SUPER_ADMIN`** | Quản trị viên cao cấp | Full quyền. Quản lý Role, Tạo tài khoản Admin, Giám sát toàn hệ thống. |
| **`SALES`**       | Nhân viên Kinh doanh  | Quản lý Sản phẩm, Danh mục, Đơn hàng, Kho hàng và Duyệt đổi trả.       |
| **`ACCOUNTANT`**  | Nhân viên Kế toán     | Xem thống kê doanh thu, Đối soát giao dịch thanh toán (VNPay).         |
| **`CUSTOMER`**    | Khách hàng thành viên | Quản lý Profile, Giỏ hàng, Đặt hàng và gửi yêu cầu Đổi trả.            |
| **`GUEST`**       | Khách vãng lai        | Xem sản phẩm, Chat với Bot, Đặt hàng (Guest Checkout).                 |
| **`INDIVIDUAL`**  | Quyền hạn cá nhân     | Các quyền cụ thể được cấp riêng cho một User mà không phụ thuộc vào Role. |

### 🛡️ Cơ chế Phân quyền Hybrid (Roles + Permissions)

Hệ thống KVIL áp dụng mô hình phân quyền **Hybrid RBAC** (Kết hợp giữa Vai trò và Quyền hạn chi tiết), mang lại sự linh hoạt tối đa trong quản lý nhân sự:

1.  **Many-to-Many Roles**: Một người dùng có thể sở hữu nhiều vai trò cùng lúc (Ví dụ: Một nhân viên vừa là `SALES` vừa là `ACCOUNTANT`).
2.  **Granular Permissions**: Mỗi vai trò được gắn với một danh sách các quyền cụ thể (ví dụ: `products.read`, `orders.update`).
3.  **Direct Permissions**: Admin có thể cấp thêm các quyền cụ thể trực tiếp cho một User mà không cần tạo Role mới (Individual Permissions).
4.  **Đặc quyền SUPER_ADMIN**: Khi User có vai trò `SUPER_ADMIN`, hệ thống tự động bỏ qua các bước kiểm tra thông thường và cấp toàn bộ quyền hạn cao nhất.

---

## ⚙️ Giải thích Middleware `checkUserPermission`

Middleware này đóng vai trò là "người gác cổng" cho toàn bộ các route Admin. Luồng xử lý kỹ thuật như sau:

### 1. Cách thức khai báo trong Route
Hệ thống hỗ trợ 2 cách truyền tham số cực kỳ linh hoạt:
- **Kiểu cũ (Legacy):** `checkUserPermission('SALES', 'ACCOUNTANT')` -> Kiểm tra theo vai trò.
- **Kiểu mới (Granular):** `checkUserPermission([], ['products.update'])` -> Kiểm tra chính xác quyền hạn cần thiết.

### 2. Luồng xử lý logic (Logic Flow)
Hàm xử lý được thiết kế theo thứ tự ưu tiên giảm dần để đảm bảo an toàn:

1.  **Xác thực người dùng:** Kiểm tra `req.user` đã tồn tại chưa (đã qua middleware JWTAction).
2.  **Chuẩn hóa dữ liệu:** Thu thập mảng `roles` và `permissions` của người dùng từ JWT Payload.
3.  **Kiểm tra Quyền (Required Permissions):** Nếu Route yêu cầu một danh sách quyền cụ thể, middleware sẽ dùng hàm `.every()` để kiểm tra người dùng phải sở hữu **TẤT CẢ** các quyền đó. Nếu thiếu, trả về lỗi `403 Forbidden`.
4.  **Kiểm tra Vai trò (Allowed Roles):** Nếu không yêu cầu quyền cụ thể nhưng có yêu cầu vai trò, middleware dùng hàm `.some()` để kiểm tra người dùng có sở hữu **ÍT NHẤT MỘT** trong các vai trò được phép hay không.
5.  **Bảo vệ mặc định (Admin Route Protection):** Nếu là route thuộc prefix `/api/v1/admin/*`, hệ thống tự động thực hiện một lớp kiểm tra cuối cùng để đảm bảo người dùng sở hữu ít nhất một vai trò thuộc nhóm nhân viên cấp cao (`ADMIN_ROLES`).

---

---

## 🚀 Danh mục API Endpoints

### 1. Public APIs (Không yêu cầu đăng nhập)

_Dùng cho trang chủ, tìm kiếm và khách vãng lai._

- `POST /auth/register`: Đăng ký tài khoản khách hàng.
- `POST /auth/login`: Đăng nhập lấy Access Token & Refresh Token.
- `GET /products`: Danh sách sản phẩm (Có phân trang, lọc).
- `GET /products/:id`: Chi tiết sản phẩm & các biến thể.
- `GET /products/best-seller`: Top sản phẩm bán chạy (Tối ưu bởi Redis).
- `POST /chatbot/message`: Gửi tin nhắn và nhận gợi ý từ AI.
- `GET /vnpay/ipn`: [Secure] VNPay gọi vào để xác nhận thanh toán.

### 2. User APIs (Yêu cầu JWT Token - Khách hàng)

_Path Prefix: `/api/v1/user/_`\*

- `GET /user/profile`: Xem và cập nhật thông tin cá nhân.
- `POST /user/orders`: Đặt hàng (tự động trừ kho & gửi email xác nhận).
- `GET /user/orders/:id/payment-url`: Tạo link thanh toán VNPay (QR Code).
- `POST /user/orders/:id/return`: Gửi yêu cầu đổi trả (Kèm ảnh lỗi Cloudinary).
- `GET /user/carts`: Đồng bộ giỏ hàng cá nhân giữa các thiết bị.

### 3. Admin APIs (Yêu cầu JWT + Quyền hạn cụ thể)

_Path Prefix: `/api/v1/admin/_`\*

#### 📦 Quản trị Sản phẩm & Kho (`SALES`, `SUPER_ADMIN`)

- `POST /admin/products`: Thêm sản phẩm mới và upload ảnh.
- `POST /admin/products/:id/variants`: Thêm Size/Màu và nhập kho ban đầu.
- `GET /admin/inventory/logs`: **(`SALES`, `SUPER_ADMIN`)** - Xem lịch sử biến động kho (Nhập/Xuất/Trả).

#### 🎫 Quản trị Mã giảm giá (Coupons)

- `GET /admin/coupons`: **(`SALES`, `ACCOUNTANT`, `SUPER_ADMIN`)** - Xem danh sách khuyến mãi hiện có.
- `POST /admin/coupons`: **(`SALES`, `SUPER_ADMIN`)** - Tạo chương trình giảm giá mới.
- `PUT /admin/coupons/:id`: **(`SALES`, `SUPER_ADMIN`)** - Sửa đổi thông tin mã giảm giá.
- `DELETE /admin/coupons/:id`: **(`SUPER_ADMIN`)** - Xóa mã giảm giá khỏi hệ thống.

#### 💰 Quản trị Đơn hàng & Tài chính

_Phân cấp quyền hạn chuyên biệt giữa Tiền (Accountant) và Hàng (Sales):_

- `GET /admin/orders`: **(`SALES`, `ACCOUNTANT`, `SUPER_ADMIN`)** - Xem danh sách đơn hàng chung.
- `PATCH /admin/orders/:id/status`: **(`SALES`, `SUPER_ADMIN`)** - Duyệt đơn, Giao hàng, Hủy đơn (SALES nắm hàng).
- `PATCH /admin/orders/:id/payment`: **(`ACCOUNTANT`, `SUPER_ADMIN`)** - Xác nhận trạng thái đã trả tiền thủ công (Kế toán nắm tiền).
- `GET /admin/payments/transactions`: **(`ACCOUNTANT`, `SUPER_ADMIN`)** - Danh sách giao dịch VNPay thành công.
- `PATCH /admin/orders/returns/:id/status`: **(`SALES`, `SUPER_ADMIN`)** - Duyệt/Từ chối yêu cầu đổi trả (Tự động hoàn kho).

#### 👤 Quản trị Hệ thống (`SUPER_ADMIN`)

- `POST /admin/users`: Tạo tài khoản dành riêng cho nhân viên.
- `PATCH /admin/users/:id/role`: Quản lý Vai trò và Quyền hạn cá nhân của người dùng.
- `GET /admin/roles`: Xem tất cả vai trò hiện có trong hệ thống.
- `POST /admin/roles`: Tạo vai trò mới (Ví dụ: `MANAGER`).
- `PUT /admin/roles/:id`: Đổi tên hoặc mô tả vai trò.
- `POST /admin/roles/:id/permissions`: Gán danh sách quyền cho một vai trò cụ thể.
- `GET /admin/permissions`: Lấy danh sách tất cả mã danh mục quyền hạn hiện có.
- `GET /admin/dashboard/stats`: Thống kê tổng quan doanh thu, tăng trưởng.

---

## 🔒 Cơ chế Bảo mật IPN (VNPay)

Hệ thống sử dụng cơ chế **Checksum HMAC-SHA512** để xác thực mọi yêu cầu từ VNPay. Dữ liệu thanh toán được đối soát chéo (Cross-check) về số tiền và trạng thái đơn hàng trong Database trước khi cập nhật thành công, đảm bảo không thể bị hack bằng cách sửa tham số URL.

## 📈 Hiệu năng

- **Redis Layer**: Giảm tải cho MySQL bằng cách cache các truy vấn nặng (Stats, Bestsellers).
- **Database Indexing**: Các cột `email`, `phone`, `sku` được đánh chỉ mục để tìm kiếm trong thời gian thực.
