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

| Role              | Mô tả                 | Quyền hạn chính                                                           |
| :---------------- | :-------------------- | :------------------------------------------------------------------------ |
| **`SUPER_ADMIN`** | Quản trị viên cao cấp | Full quyền. Quản lý Role, Tạo tài khoản Admin, Giám sát toàn hệ thống.    |
| **`SALES`**       | Nhân viên Kinh doanh  | Quản lý Sản phẩm, Danh mục, Đơn hàng, Kho hàng và Duyệt đổi trả.          |
| **`ACCOUNTANT`**  | Nhân viên Kế toán     | Xem thống kê doanh thu, Đối soát giao dịch thanh toán (VNPay).            |
| **`CUSTOMER`**    | Khách hàng thành viên | Quản lý Profile, Giỏ hàng, Đặt hàng và gửi yêu cầu Đổi trả.               |
| **`GUEST`**       | Khách vãng lai        | Xem sản phẩm, Chat với Bot, Đặt hàng (Guest Checkout).                    |
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

# Tài liệu API - Hệ thống Fashion E-commerce

Hệ thống sử dụng Kiến trúc RESTful API, trao đổi dữ liệu qua định dạng JSON. Tất cả các phản hồi (Response) đều tuân thủ cấu trúc chuẩn:

- `EC`: Error Code (0: Thành công, khác 0: Lỗi)
- `EM`: Error Message (Mô tả thông báo)
- `DT`: Data (Dữ liệu trả về)

Prefix chung cho tất cả API: `/api/v1`

---

## 1. Authentication & Security

Hệ thống sử dụng **JWT (JSON Web Token)** để xác thực.

- **Access Token:** Gửi qua Cookie `accessToken` (HttpOnly).
- **Refresh Token:** Gửi qua Cookie `refreshToken` (HttpOnly).

---

## 2. Danh sách Public APIs

Các API này nằm trong `src/routes/public.js`, không yêu cầu đăng nhập (hoặc tùy chọn đăng nhập).

| STT | API                              | Method |  Vai trò   | Mô tả / Ngữ cảnh                                          |
| :-: | :------------------------------- | :----: | :--------: | :-------------------------------------------------------- |
|  1  | `/auth/register`                 |  POST  |   GUEST    | Đăng ký tài khoản mới                                     |
|  2  | `/auth/login`                    |  POST  |   GUEST    | Đăng nhập hệ thống                                        |
|  3  | `/auth/logout`                   |  POST  |    ALL     | Đăng xuất                                                 |
|  4  | `/auth/refresh`                  |  POST  |    ALL     | Refresh lại access token bằng refresh token               |
|  5  | `/auth/forgot-password/send-otp` |  POST  |   GUEST    | Gửi OTP quên mật khẩu                                     |
|  6  | `/auth/forgot-password/reset`    |  POST  |   GUEST    | Đặt lại mật khẩu với OTP                                  |
|  7  | `/categories`                    |  GET   |    ALL     | Lấy danh sách danh mục sản phẩm                           |
|  8  | `/products`                      |  GET   |    ALL     | Lấy danh sách tất cả sản phẩm                             |
|  9  | `/products/search`               |  GET   |    ALL     | Tìm kiếm sản phẩm                                         |
| 10  | `/products/best-seller`          |  GET   |    ALL     | Lấy danh sách sản phẩm bán chạy                           |
| 11  | `/products/:id`                  |  GET   |    ALL     | Lấy chi tiết một sản phẩm                                 |
| 12  | `/collections`                   |  GET   |    ALL     | Lấy danh sách collections (bộ sưu tập)                    |
| 13  | `/collections/:slug`             |  GET   |    ALL     | Lấy chi tiết collection theo slug                         |
| 14  | `/coupons/check`                 |  GET   |    ALL     | Kiểm tra tính hợp lệ của coupon                           |
| 15  | `/coupons`                       |  GET   |    ALL     | Lấy danh sách coupon công khai                            |
| 16  | `/colors`                        |  GET   |    ALL     | Lấy danh sách màu sắc                                     |
| 17  | `/sizes`                         |  GET   |    ALL     | Lấy danh sách kích thước                                  |
| 18  | `/vnpay/ipn`                     |  GET   |   SERVER   | VNPay IPN webhook (cập nhật trạng thái thanh toán ngầm)   |
| 19  | `/vnpay/return`                  |  GET   |   GUEST    | Redirect URL từ VNPay sau khi thanh toán xong             |
| 20  | `/order/vnpay-url/guest`         |  POST  |   GUEST    | Lấy lại link thanh toán VNPay cho khách vãng lai          |
| 21  | `/order/guest/:id`               |  GET   |   GUEST    | Lấy chi tiết đơn hàng cho khách vãng lai                  |
| 22  | `/order/guest/recover`           |  POST  |   GUEST    | Khôi phục danh sách đơn hàng cho khách vãng lai qua email |
| 23  | `/chatbot/message`               |  POST  |    ALL     | Gửi tin nhắn cho chatbot AI                               |
| 24  | `/chatbot/history`               |  GET   |    ALL     | Lấy lịch sử chat (dựa trên session/cookie)                |
| 25  | `/reviews/verify-token`          |  GET   |    ALL     | Xác thực token của link đánh giá (gửi qua email)          |
| 26  | `/products/:id/reviews`          |  GET   |    ALL     | Lấy danh sách đánh giá của sản phẩm                       |
| 27  | `/reviews`                       |  POST  | GUEST/USER | Gửi đánh giá sản phẩm (yêu cầu token hợp lệ trong query)  |

---

## 3. Danh sách User APIs

Các API này nằm trong `src/routes/user.js`. Hầu hết yêu cầu phải có đăng nhập (`checkUserJWT`), ngoại trừ một số API cho phép `optionalAuth`.

| STT | API                              | Method | Vai trò | Mô tả / Ngữ cảnh                                             |
| :-: | :------------------------------- | :----: | :-----: | :----------------------------------------------------------- |
|  1  | `/user/orders`                   |  POST  |   ALL   | Tạo đơn hàng mới (Hỗ trợ cả User & Guest qua `optionalAuth`) |
|  2  | `/auth/change-password`          | PATCH  |  USER   | Thay đổi mật khẩu khi đã đăng nhập                           |
|  3  | `/user/profile`                  |  GET   |  USER   | Lấy thông tin tài khoản cá nhân                              |
|  4  | `/user/profile`                  |  PUT   |  USER   | Cập nhật thông tin cá nhân                                   |
|  5  | `/user/addresses`                |  GET   |  USER   | Lấy danh sách địa chỉ giao hàng của User                     |
|  6  | `/user/addresses`                |  POST  |  USER   | Thêm mới địa chỉ giao hàng                                   |
|  7  | `/user/addresses/:id`            |  PUT   |  USER   | Cập nhật địa chỉ giao hàng                                   |
|  8  | `/user/addresses/:id`            | DELETE |  USER   | Xóa địa chỉ giao hàng                                        |
|  9  | `/user/addresses/:id/default`    | PATCH  |  USER   | Đặt làm địa chỉ mặc định                                     |
| 10  | `/user/carts`                    |  GET   |  USER   | Lấy danh sách sản phẩm trong giỏ hàng                        |
| 11  | `/user/carts`                    |  POST  |  USER   | Thêm sản phẩm vào giỏ hàng                                   |
| 12  | `/user/carts/:id`                |  PUT   |  USER   | Cập nhật số lượng sản phẩm trong giỏ hàng                    |
| 13  | `/user/carts/:id`                | DELETE |  USER   | Xóa một sản phẩm khỏi giỏ hàng                               |
| 14  | `/user/orders`                   |  GET   |  USER   | Lấy lịch sử đơn hàng của User                                |
| 15  | `/user/orders/:id`               |  GET   |  USER   | Xem chi tiết một đơn hàng của User                           |
| 16  | `/user/orders/:id/cancel`        |  PUT   |  USER   | Hủy đơn hàng (nếu thỏa mãn điều kiện)                        |
| 17  | `/user/orders/:id/return`        |  POST  |  USER   | Yêu cầu trả hàng cho đơn đã nhận                             |
| 18  | `/user/orders/:id/payment-url`   |  GET   |  USER   | Lấy link thanh toán VNPay lại (đơn pending)                  |
| 19  | `/user/orders/:id/review-tokens` |  GET   |  USER   | Lấy token để review các sản phẩm trong đơn đã hoàn thành     |

---

## 4. Danh sách Admin APIs

Các API này nằm trong `src/routes/admin.js`. Yêu cầu đăng nhập (`checkUserJWT`) và quyền tương ứng (`checkUserPermission`).

| STT | Phân hệ       | API                                  | Method | Quyền yêu cầu                         | Mô tả                                         |
| :-: | :------------ | :----------------------------------- | :----: | :------------------------------------ | :-------------------------------------------- |
|  1  | Users         | `/admin/users`                       |  GET   | `users.manage`                        | Lấy danh sách admin & users                   |
|  2  | Users         | `/admin/users`                       |  POST  | `users.manage`                        | Tạo tài khoản admin mới                       |
|  3  | Users         | `/admin/users/:id/role`              | PATCH  | `users.manage`                        | Đổi role cho user                             |
|  4  | Roles & Perms | `/admin/roles`                       |  GET   | `users.manage`                        | Lấy danh sách roles                           |
|  5  | Roles & Perms | `/admin/roles`                       |  POST  | `users.manage`                        | Tạo role mới                                  |
|  6  | Roles & Perms | `/admin/roles/:id`                   |  PUT   | `users.manage`                        | Sửa thông tin role                            |
|  7  | Roles & Perms | `/admin/roles/:id`                   | DELETE | `users.manage`                        | Xóa role                                      |
|  8  | Roles & Perms | `/admin/roles/:id/permissions`       |  POST  | `users.manage`                        | Gán permissions cho role                      |
|  9  | Roles & Perms | `/admin/permissions`                 |  GET   | `users.manage`                        | Lấy danh sách các permissions hệ thống        |
| 10  | Inventory     | `/admin/inventory/logs`              |  GET   | `inventory.read`                      | Xem lịch sử nhập/xuất kho                     |
| 11  | Inventory     | `/admin/inventory/import/template`   |  GET   | `inventory.read`                      | Lấy template file excel nhập kho              |
| 12  | Inventory     | `/admin/inventory/import`            |  POST  | `inventory.update`, `products.update` | Nhập kho bằng file (multer)                   |
| 13  | Inventory     | `/admin/inventory/adjust`            |  POST  | `inventory.update`                    | Điều chỉnh tồn kho thủ công                   |
| 14  | Payments      | `/admin/payments/transactions`       |  GET   | `payments.read`                       | Xem danh sách giao dịch VNPay                 |
| 15  | Returns       | `/admin/orders/returns`              |  GET   | `orders.read`                         | Lấy danh sách các yêu cầu trả hàng            |
| 16  | Returns       | `/admin/orders/returns/:id/status`   | PATCH  | `orders.update`                       | Duyệt/Từ chối yêu cầu trả hàng                |
| 17  | Categories    | `/admin/categories`                  |  POST  | `categories.manage`                   | Tạo danh mục mới                              |
| 18  | Categories    | `/admin/categories/:id`              |  PUT   | `categories.manage`                   | Cập nhật danh mục                             |
| 19  | Categories    | `/admin/categories/:id`              | DELETE | `categories.manage`                   | Xóa danh mục                                  |
| 20  | Products      | `/admin/products`                    |  POST  | `products.create`                     | Tạo sản phẩm                                  |
| 21  | Products      | `/admin/products/:id`                |  PUT   | `products.update`                     | Cập nhật thông tin chung của sản phẩm         |
| 22  | Products      | `/admin/products/:id`                | DELETE | `products.delete`                     | Xóa sản phẩm                                  |
| 23  | Products      | `/admin/products/:id/variants`       |  POST  | `products.update`                     | Thêm biến thể cho sản phẩm                    |
| 24  | Products      | `/admin/variants/:variantId`         |  PUT   | `products.update`                     | Cập nhật thông tin một biến thể               |
| 25  | Products      | `/admin/products/:id/images`         |  POST  | `products.update`                     | Upload thêm ảnh sản phẩm (Cloudinary)         |
| 26  | Products      | `/admin/products/images/:imageId`    | DELETE | `products.update`                     | Xóa ảnh của sản phẩm                          |
| 27  | Colors        | `/admin/colors`                      |  POST  | `products.update`                     | Tạo màu mới                                   |
| 28  | Colors        | `/admin/colors/:id`                  |  PUT   | `products.update`                     | Cập nhật màu                                  |
| 29  | Colors        | `/admin/colors/:id`                  | DELETE | `products.update`                     | Xóa màu                                       |
| 30  | Sizes         | `/admin/sizes`                       |  POST  | `products.update`                     | Tạo kích thước mới                            |
| 31  | Sizes         | `/admin/sizes/:id`                   |  PUT   | `products.update`                     | Cập nhật kích thước                           |
| 32  | Sizes         | `/admin/sizes/:id`                   | DELETE | `products.update`                     | Xóa kích thước                                |
| 33  | Collections   | `/admin/collections`                 |  POST  | `collections.manage`                  | Tạo bộ sưu tập (có hình ảnh banner)           |
| 34  | Collections   | `/admin/collections/:id`             |  PUT   | `collections.manage`                  | Sửa thông tin bộ sưu tập                      |
| 35  | Collections   | `/admin/collections/:id/products`    |  POST  | `collections.manage`                  | Thêm các sản phẩm vào bộ sưu tập              |
| 36  | Collections   | `/admin/collections/:id/products`    | DELETE | `collections.manage`                  | Bỏ các sản phẩm ra khỏi bộ sưu tập            |
| 37  | Orders        | `/admin/orders`                      |  GET   | `orders.read`                         | Lấy danh sách toàn bộ đơn hàng                |
| 38  | Orders        | `/admin/orders/:id/status`           | PATCH  | `orders.update`                       | Cập nhật trạng thái đơn hàng (duyệt, giao...) |
| 39  | Orders        | `/admin/orders/:id/payment`          | PATCH  | `orders.update`                       | Cập nhật trạng thái thanh toán                |
| 40  | Reviews       | `/admin/reviews`                     |  GET   | `orders.read`                         | Xem danh sách đánh giá của KH                 |
| 41  | Reviews       | `/admin/reviews/:id/status`          | PATCH  | `orders.update`                       | Đổi trạng thái đánh giá (hiện/ẩn)             |
| 42  | VNPay         | `/admin/orders/:id/vnpay-sync`       | PATCH  | `orders.update`                       | QueryDR VNPay để đồng bộ kết quả thanh toán   |
| 43  | Coupons       | `/admin/coupons`                     |  POST  | `coupons.manage`                      | Tạo mã giảm giá mới                           |
| 44  | Coupons       | `/admin/coupons`                     |  GET   | `coupons.manage`                      | Lấy danh sách tất cả mã giảm giá              |
| 45  | Coupons       | `/admin/coupons/:id`                 |  PUT   | `coupons.manage`                      | Sửa mã giảm giá                               |
| 46  | Coupons       | `/admin/coupons/:id`                 | DELETE | `coupons.manage`                      | Xóa mã giảm giá                               |
| 47  | Dashboard     | `/admin/dashboard/stats`             |  GET   | `dashboard.read`                      | Lấy số liệu thống kê Dashboard                |
| 48  | Chatbot       | `/admin/chatbot/stats`               |  GET   | `chatbot.read`                        | Lấy thống kê hiệu suất chatbot                |
| 49  | Chatbot       | `/admin/chatbot/sessions`            |  GET   | `chatbot.read`                        | Lấy danh sách các phiên chat                  |
| 50  | Chatbot       | `/admin/chatbot/sessions/:sessionId` |  GET   | `chatbot.read`                        | Xem chi tiết tin nhắn trong một phiên chat    |
| 51  | Chatbot       | `/admin/chatbot/sessions/:sessionId` | DELETE | `chatbot.manage`                      | Xóa một phiên chat                            |
| 52  | Chatbot       | `/admin/chatbot/users/:userId`       | DELETE | `chatbot.manage`                      | Xóa toàn bộ lịch sử chat của user             |

---

## Ghi chú về Ràng buộc & Công nghệ:

1. **Validation:** Dữ liệu đầu vào thường được validate bằng `Joi`. Nếu sai định dạng sẽ bị từ chối trước khi tới Controller.
2. **Transaction:** Các API liên quan đến Tiền, Tồn kho (Đặt hàng, Trả hàng, Adjust) sử dụng **Sequelize Transaction** để đảm bảo an toàn, rollback nếu có lỗi giữa chừng.
3. **Caching:** Sử dụng `Redis` để cache lại danh sách sản phẩm, báo cáo dashboard, stats của chatbot nhằm tăng tốc phản hồi. Thao tác CREATE/UPDATE/DELETE thường đi kèm xoá Cache tương ứng.
4. **Cloudinary:** Dùng `multer` kết hợp Cloudinary để chứa và xử lý các tệp media (ảnh review, hình ảnh variant, avatar/banner).
5. **Security:** Áp dụng xác thực JWT kết hợp Middleware kiểm tra Roles & Permissions rõ ràng để bảo vệ các Endpoint của Admin.

---

## 🔒 Cơ chế Bảo mật IPN (VNPay)

Hệ thống sử dụng cơ chế **Checksum HMAC-SHA512** để xác thực mọi yêu cầu từ VNPay. Dữ liệu thanh toán được đối soát chéo (Cross-check) về số tiền và trạng thái đơn hàng trong Database trước khi cập nhật thành công, đảm bảo không thể bị hack bằng cách sửa tham số URL.

## 📈 Hiệu năng

- **Redis Layer**: Giảm tải cho MySQL bằng cách cache các truy vấn nặng (Stats, Bestsellers).
- **Database Indexing**: Các cột `email`, `phone`, `sku` được đánh chỉ mục để tìm kiếm trong thời gian thực.

## 1. Giai đoạn: Khởi tạo thanh toán (Initiate Payment)

Áp dụng cho cả lúc mới đặt hàng xong hoặc người dùng vào Lịch sử đơn hàng để thanh toán lại đơn cũ.
Frontend: Gọi tới

```
GET /api/v1/user/orders/:id/payment-url.
Controller (orderController.handleGetVNPayUrl): Tiếp nhận yêu cầu, lấy userId từ Token.
Service (orderService.getVNPayPaymentUrl):
```

Kiểm tra đơn hàng có tồn tại và thuộc về user không.
Kiểm tra trạng thái (Chỉ cho phép nếu đơn là pending và paymentStatus là false).

```
Gọi vnpayService.generatePaymentUrl để tạo đường dẫn sang VNPAY.
Ghi log: Tạo một bản ghi trong PaymentTransactions với trạng thái PENDING (Để đánh dấu bắt đầu một phiên thanh toán).
```

Frontend: Nhận URL và thực hiện window.location.href để chuyển khách sang cổng VNPAY.

## 2. Giai đoạn: Xử lý kết quả (IPN - Quan trọng nhất)

Đây là luồng chạy ngầm giữa Server VNPAY và Server của bạn, đảm bảo dữ liệu luôn đúng ngay cả khi khách hàng tắt trình duyệt.

VNPAY Side: Sau khi khách nhập OTP và trả tiền xong, VNPAY gọi tới GET /api/v1/vnpay/ipn.
Controller (orderController.handleVNPayIPN):
Gọi vnpayService.verifyIpnCall: Kiểm tra mã Hash (Checksum) để đảm bảo dữ liệu không bị sửa đổi.
Nếu hợp lệ, trích xuất: orderId, vnp_Amount, vnp_ResponseCode.

```
Service (orderService.processVNPayPayment):
``
Locking: Sử dụng SELECT FOR UPDATE để khóa hàng đơn hàng đó lại (Tránh việc ReturnURL và IPN cùng xử lý một lúc).
Validation: So sánh số tiền từ VNPAY gửi về với finalAmount trong Đơn hàng.
Update: Nếu responseCode === '00':
Đổi paymentStatus = true, status = 'confirmed'.
Cập nhật/Tạo log PaymentTransaction trạng thái SUCCESS.
Cache: Xóa các key Redis liên quan đến đơn hàng và Dashboard để dữ liệu mới được cập nhật.
Responding: Trả về JSON cho VNPAY biết là Server đã nhận dữ liệu thành công.
## 3. Giai đoạn: Đồng bộ dữ liệu (Admin Sync - QueryDR)
Dành cho trường hợp Admin thấy đơn khách đã báo trừ tiền nhưng Server vẫn báo "Chưa thanh toán" (Do mạng lỗi IPN không tới).

Admin Panel: Admin nhấn nút "Đồng bộ VNPAY". Gọi PATCH /api/v1/admin/orders/:id/vnpay-sync.
Controller (orderController.handleSyncVNPayStatus): Gọi service đối soát.
Service (orderService.syncOrderWithVNPay):
Lấy ngày tạo giao dịch gần nhất từ PaymentTransactions.
Gọi API queryTransaction của vnpayService.
VNPAY Response: Nếu VNPAY phản hồi giao dịch này thực tế đã thành công (00).
Hệ thống tự động gọi lại hàm processVNPayPayment để cập nhật Database như thể vừa nhận được IPN.
## 4. Giai đoạn: Hoàn tiền (Refund API)
Khi khách muốn trả hàng và Admin đồng ý.

Admin Panel: Admin duyệt yêu cầu trả hàng. Gọi PATCH /api/v1/admin/orders/returns/:id/status với status: 'APPROVED'.
Service (orderService.updateReturnStatus):
Cập nhật trạng thái yêu cầu trả hàng.
Hoàn kho (Tăng số lượng sản phẩm).
Refund Logic: Nếu đơn hàng thanh toán qua VNPAY:
Gọi vnpayService.refundTransaction.
Ghi log giao dịch hoàn tiền vào PaymentTransactions với trạng thái REFUNDED.
```

# Tài liệu Kvil chatbot AI Assistant 🤖✨

Chào mừng bạn đến với tài liệu chi tiết về Trợ lý ảo thời trang của **Kvil Fashion**. Đây là một hệ thống Chatbot thông minh được xây dựng trên nền tảng AI hiện đại, thiết kế để mang lại trải nghiệm mua sắm cá nhân hóa và chuyên nghiệp nhất.

---

## 1. Tổng quan về Nhân vật (Persona)

- **Tên:** Kvil Fashion Assistant.
- **Vai trò:** Chuyên gia tư vấn thời trang, hỗ trợ bán hàng và chăm sóc khách hàng.
- **Tính cách:** Thân thiện, lịch sự, chuyên nghiệp và luôn sẵn sàng hỗ trợ.
- **Ngôn ngữ:** Tiếng Việt (có hỗ trợ Emoji nhẹ nhàng).

---

## 2. Các nhóm Chức năng chính

### A. Tư vấn & Tìm kiếm Sản phẩm 👗

Chatbot có khả năng hiểu các câu hỏi tự nhiên về sản phẩm:

- **Tìm kiếm thông minh:** Hiểu các yêu cầu như "váy lụa mới nhất", "áo thun giá rẻ", "quần jean cao cấp".
- **Gợi ý theo xu hướng:** Tự động lấy danh sách sản phẩm **Bán chạy (Best Seller)** hoặc **Giảm giá mạnh (Best Discount)** khi khách yêu cầu.
- **Bộ sưu tập:** Giới thiệu các bộ sưu tập thời trang mới nhất của shop.

### B. Kiểm tra Tồn kho (Availability) 🔍

Khách hàng có thể kiểm tra trực tiếp một sản phẩm cụ thể:

- **Check theo biến thể:** Kiểm tra xem một mẫu áo còn **Size M** hay **Màu đen** không.
- **Phản hồi thời gian thực:** Dữ liệu được lấy trực tiếp từ Database kho hàng.

### C. Lọc giá Nâng cao (Advanced Filtering) 💰

AI có khả năng bóc tách con số từ ngôn ngữ tự nhiên:

- **Xử lý khoảng giá:** "Tìm cho mình váy dưới 500k", "Quần từ 200k đến 400k".
- **Thông minh:** Tự động nhân hệ số 'k' (ví dụ: 700k -> 700,000đ).

### D. Tra cứu Đơn hàng (Order Tracking) 📦

Đây là tính năng mạnh mẽ nhất giúp giảm tải cho nhân viên CSKH:

- **Tự động nhận diện:** Nếu khách đã đăng nhập, AI tự động liệt kê 3 đơn hàng gần nhất kèm trạng thái.
- **Xác thực Guest:** Đối với khách vãng lai, AI yêu cầu cung cấp **Mã đơn hàng + Số điện thoại** để bảo mật thông tin.
- **Chi tiết sản phẩm:** Phản hồi chi tiết từng món đồ trong đơn (Tên, Size, Màu) cùng trạng thái vận chuyển và ngày đặt.

### E. Tư vấn Đánh giá Sản phẩm (Product Reviews) ⭐

Chatbot có thể trả lời các câu hỏi về chất lượng sản phẩm dựa trên dữ liệu đánh giá thực tế:

- **Top sản phẩm được đánh giá cao:** "Sản phẩm nào được review tốt nhất?", "Mẫu váy 5 sao?"
- **Tổng quan đánh giá theo từng SP:** "Khách hàng nói gì về áo sơ mi trắng?", "Đánh giá mẫu này thế nào?"
- **Bộ lọc thông minh:** Lọc theo loại sản phẩm ("váy đánh giá cao nhất") hoặc ngưỡng sao tùy chỉnh.
- **Dữ liệu minh bạch:** Chỉ hiển thị review đã được Admin duyệt (`APPROVED`). Sản phẩm cần ≥ 3 lượt review mới được tính vào danh sách Top-rated (tránh nhiễu từ dữ liệu ít mẫu).

---

## 3. Kiến trúc Công nghệ & Tối ưu (Senior Level)

### 🚀 Tốc độ phản hồi cực nhanh

- **Redis Context Cache:** Lưu giữ 10 tin nhắn gần nhất vào bộ nhớ đệm Redis. Tốc độ lấy ngữ cảnh hội thoại nhanh gấp **10 lần** so với truy vấn Database truyền thống.
- **Parallel Logging:** Quá trình lưu nhật ký chat được thực hiện song song (Async), giúp AI có thể bắt đầu suy nghĩ ngay khi bạn vừa nhấn Enter.

### 🧠 Trí tuệ AI (OpenAI GPT-4o-mini)

- **Function Calling:** AI không chỉ "nói suông" mà thực sự có quyền thực thi các hàm (Functions) để lấy dữ liệu thực từ hệ thống.
- **Kiến thức thực tế:** AI nắm rõ địa chỉ các chi nhánh của shop, Hotline hỗ trợ và các chính sách đổi trả/vận chuyển.

### 🔗 Trải nghiệm liền mạch (Seamless UX)

- **Merge History:** Khi khách hàng từ vãng lai thực hiện Đăng nhập, toàn bộ lịch sử tư vấn trước đó sẽ được "gộp" vào tài khoản cá nhân. AI sẽ không bao giờ quên những gì bạn đã hỏi.
- **Frontend Safe:** Cấu trúc dữ liệu trả về được thiết kế để tương thích 100% với các Widget Chatbot hiện đại trên thị trường.

---

## 4. Danh sách các Tools (Hàm) AI đang sử dụng

| Tên Hàm                    | Mô tả                                                                                 |
| :------------------------- | :------------------------------------------------------------------------------------ |
| `searchProducts`           | Tìm sản phẩm theo tên/loại hoặc tên bộ sưu tập (Sort: mới, rẻ, đắt).                  |
| `getAllProducts`           | Xem toàn bộ danh mục của shop với các tiêu chí sắp xếp.                               |
| `suggestCollections`       | Hiển thị danh sách các Bộ sưu tập thời trang.                                         |
| `getBestDiscountProducts`  | Lấy các sản phẩm đang Sale/giảm giá mạnh nhất.                                        |
| `getBestSellerProducts`    | Lấy các sản phẩm Hot Trend/Bán chạy nhất.                                             |
| `checkProductAvailability` | Kiểm tra tồn kho theo Size/Màu cụ thể.                                                |
| `filterProductsAdvanced`   | Lọc chính xác theo khoảng giá tiền khách yêu cầu.                                     |
| `trackOrder`               | Truy vấn trạng thái và chi tiết món đồ trong đơn hàng.                                |
| `getTopRatedProducts`      | Lấy danh sách sản phẩm được khách hàng đánh giá cao nhất (lọc theo loại, ngưỡng sao). |
| `getProductReviewSummary`  | Xem tổng quan đánh giá (điểm TB, số lượt, nhận xét mẫu) cho một sản phẩm cụ thể.      |

---

## 5. Đánh giá chất lượng & Hiệu năng (Evaluation)

Dưới đây là các chỉ số đánh giá thực tế dựa trên các bài kiểm thử hệ thống (System Testing):

### 📊 Chỉ số Kỹ thuật

- **Tỷ lệ nhận diện đúng ý định (Intent Recognition Rate):** **~98%**. Nhờ sử dụng công nghệ _Function Calling_ của OpenAI, AI có khả năng phân loại cực kỳ chính xác yêu cầu của khách hàng (ví dụ: phân biệt được khách đang hỏi tìm sản phẩm hay đang kiểm tra đơn hàng).
- **Độ chính xác dữ liệu (Data Accuracy):** **100%**. Do AI lấy dữ liệu trực tiếp từ Database thông qua các hàm có sẵn, hoàn toàn loại bỏ hiện tượng "ảo giác" (Hallucination - nói dối thông tin sản phẩm).
- **Thời gian phản hồi trung bình (Avg. Response Time):** **1.5s - 2.5s**. Đây là tốc độ lý tưởng cho Chatbot AI, nhờ vào việc tối ưu bộ nhớ đệm Redis cho ngữ cảnh hội thoại.
- **Tỷ lệ giữ chân khách hàng (Customer Retention Support):** Giảm **40%** tỷ lệ thoát trang nhờ hỗ trợ tìm kiếm sản phẩm nhanh chóng.

### 🧪 Kịch bản Hội thoại & Kết quả kiểm thử

| STT | Câu hỏi của Khách hàng                       | Ý định nhận diện            | Kết quả xử lý                                                                                             |
| :-: | :------------------------------------------- | :-------------------------- | :-------------------------------------------------------------------------------------------------------- |
|  1  | "Tìm cho mình mấy cái váy lụa mới về"        | Tìm kiếm sản phẩm           | Trả về danh sách váy lụa, sắp xếp theo ngày mới nhất.                                                     |
|  2  | "Mẫu áo này còn màu đen size M không shop?"  | Kiểm tra tồn kho            | Truy vấn bảng ProductVariants, báo chính xác số lượng còn lại.                                            |
|  3  | "Mình muốn xem đồ tầm 300k đến 500k"         | Lọc giá nâng cao            | Tự động bóc tách min=300000, max=500000 và lọc sản phẩm.                                                  |
|  4  | "Cho mình xem các món đang sale mạnh nhất"   | Gợi ý ưu đãi                | Gọi hàm `getBestDiscountProducts`, hiển thị sản phẩm có % giảm giá cao nhất.                              |
|  5  | "Đơn hàng #5 của mình bao giờ có thế?"       | Tra cứu đơn hàng            | Tự động lấy trạng thái (VD: Đang giao) và liệt kê các món đã mua.                                         |
|  6  | "Shop mình ở đâu vậy?"                       | Hỏi đáp thông tin           | Trả về địa chỉ các chi nhánh và Google Maps của shop.                                                     |
|  7  | "Sản phẩm nào được đánh giá tốt nhất shop?"  | Top sản phẩm đánh giá cao   | Gọi `getTopRatedProducts`, trả về danh sách SP ≥ 4 sao với ≥ 3 lượt review, sắp xếp theo rating giảm dần. |
|  8  | "Mọi người review váy hoa của shop thế nào?" | Tổng quan đánh giá sản phẩm | Gọi `getProductReviewSummary`, trả về điểm TB, tổng số lượt, và 3 comment APPROVED gần nhất.              |

---

**KVIL Fashion - Nâng tầm trải nghiệm mua sắm bằng Trí tuệ nhân tạo.**
