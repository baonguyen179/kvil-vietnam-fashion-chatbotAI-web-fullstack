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

| STT | API | Method | Vai trò | Mô tả / Ngữ cảnh |
|:---:|:---|:---:|:---:|:---|
| 1 | `/auth/register` | POST | GUEST | Đăng ký tài khoản mới |
| 2 | `/auth/login` | POST | GUEST | Đăng nhập hệ thống |
| 3 | `/auth/logout` | POST | ALL | Đăng xuất |
| 4 | `/auth/refresh` | POST | ALL | Refresh lại access token bằng refresh token |
| 5 | `/auth/forgot-password/send-otp` | POST | GUEST | Gửi OTP quên mật khẩu |
| 6 | `/auth/forgot-password/reset` | POST | GUEST | Đặt lại mật khẩu với OTP |
| 7 | `/categories` | GET | ALL | Lấy danh sách danh mục sản phẩm |
| 8 | `/products` | GET | ALL | Lấy danh sách tất cả sản phẩm |
| 9 | `/products/search` | GET | ALL | Tìm kiếm sản phẩm |
| 10 | `/products/best-seller` | GET | ALL | Lấy danh sách sản phẩm bán chạy |
| 11 | `/products/:id` | GET | ALL | Lấy chi tiết một sản phẩm |
| 12 | `/collections` | GET | ALL | Lấy danh sách collections (bộ sưu tập) |
| 13 | `/collections/:slug` | GET | ALL | Lấy chi tiết collection theo slug |
| 14 | `/coupons/check` | GET | ALL | Kiểm tra tính hợp lệ của coupon |
| 15 | `/coupons` | GET | ALL | Lấy danh sách coupon công khai |
| 16 | `/colors` | GET | ALL | Lấy danh sách màu sắc |
| 17 | `/sizes` | GET | ALL | Lấy danh sách kích thước |
| 18 | `/vnpay/ipn` | GET | SERVER | VNPay IPN webhook (cập nhật trạng thái thanh toán ngầm) |
| 19 | `/vnpay/return` | GET | GUEST | Redirect URL từ VNPay sau khi thanh toán xong |
| 20 | `/order/vnpay-url/guest` | POST | GUEST | Lấy lại link thanh toán VNPay cho khách vãng lai |
| 21 | `/order/guest/:id` | GET | GUEST | Lấy chi tiết đơn hàng cho khách vãng lai |
| 22 | `/order/guest/recover` | POST | GUEST | Khôi phục danh sách đơn hàng cho khách vãng lai qua email |
| 23 | `/chatbot/message` | POST | ALL | Gửi tin nhắn cho chatbot AI |
| 24 | `/chatbot/history` | GET | ALL | Lấy lịch sử chat (dựa trên session/cookie) |
| 25 | `/reviews/verify-token` | GET | ALL | Xác thực token của link đánh giá (gửi qua email) |
| 26 | `/products/:id/reviews` | GET | ALL | Lấy danh sách đánh giá của sản phẩm |
| 27 | `/reviews` | POST | GUEST/USER | Gửi đánh giá sản phẩm (yêu cầu token hợp lệ trong query) |

---

## 3. Danh sách User APIs
Các API này nằm trong `src/routes/user.js`. Hầu hết yêu cầu phải có đăng nhập (`checkUserJWT`), ngoại trừ một số API cho phép `optionalAuth`.

| STT | API | Method | Vai trò | Mô tả / Ngữ cảnh |
|:---:|:---|:---:|:---:|:---|
| 1 | `/user/orders` | POST | ALL | Tạo đơn hàng mới (Hỗ trợ cả User & Guest qua `optionalAuth`) |
| 2 | `/auth/change-password` | PATCH | USER | Thay đổi mật khẩu khi đã đăng nhập |
| 3 | `/user/profile` | GET | USER | Lấy thông tin tài khoản cá nhân |
| 4 | `/user/profile` | PUT | USER | Cập nhật thông tin cá nhân |
| 5 | `/user/addresses` | GET | USER | Lấy danh sách địa chỉ giao hàng của User |
| 6 | `/user/addresses` | POST | USER | Thêm mới địa chỉ giao hàng |
| 7 | `/user/addresses/:id` | PUT | USER | Cập nhật địa chỉ giao hàng |
| 8 | `/user/addresses/:id` | DELETE | USER | Xóa địa chỉ giao hàng |
| 9 | `/user/addresses/:id/default`| PATCH | USER | Đặt làm địa chỉ mặc định |
| 10 | `/user/carts` | GET | USER | Lấy danh sách sản phẩm trong giỏ hàng |
| 11 | `/user/carts` | POST | USER | Thêm sản phẩm vào giỏ hàng |
| 12 | `/user/carts/:id` | PUT | USER | Cập nhật số lượng sản phẩm trong giỏ hàng |
| 13 | `/user/carts/:id` | DELETE | USER | Xóa một sản phẩm khỏi giỏ hàng |
| 14 | `/user/orders` | GET | USER | Lấy lịch sử đơn hàng của User |
| 15 | `/user/orders/:id` | GET | USER | Xem chi tiết một đơn hàng của User |
| 16 | `/user/orders/:id/cancel` | PUT | USER | Hủy đơn hàng (nếu thỏa mãn điều kiện) |
| 17 | `/user/orders/:id/return` | POST | USER | Yêu cầu trả hàng cho đơn đã nhận |
| 18 | `/user/orders/:id/payment-url`| GET | USER | Lấy link thanh toán VNPay lại (đơn pending) |
| 19 | `/user/orders/:id/review-tokens`| GET | USER | Lấy token để review các sản phẩm trong đơn đã hoàn thành |

---

## 4. Danh sách Admin APIs
Các API này nằm trong `src/routes/admin.js`. Yêu cầu đăng nhập (`checkUserJWT`) và quyền tương ứng (`checkUserPermission`).

| STT | Phân hệ | API | Method | Quyền yêu cầu | Mô tả |
|:---:|:---|:---|:---:|:---|:---|
| 1 | Users | `/admin/users` | GET | `users.manage` | Lấy danh sách admin & users |
| 2 | Users | `/admin/users` | POST | `users.manage` | Tạo tài khoản admin mới |
| 3 | Users | `/admin/users/:id/role` | PATCH | `users.manage` | Đổi role cho user |
| 4 | Roles & Perms | `/admin/roles` | GET | `users.manage` | Lấy danh sách roles |
| 5 | Roles & Perms | `/admin/roles` | POST | `users.manage` | Tạo role mới |
| 6 | Roles & Perms | `/admin/roles/:id` | PUT | `users.manage` | Sửa thông tin role |
| 7 | Roles & Perms | `/admin/roles/:id` | DELETE | `users.manage` | Xóa role |
| 8 | Roles & Perms | `/admin/roles/:id/permissions`| POST | `users.manage` | Gán permissions cho role |
| 9 | Roles & Perms | `/admin/permissions` | GET | `users.manage` | Lấy danh sách các permissions hệ thống |
| 10 | Inventory | `/admin/inventory/logs` | GET | `inventory.read` | Xem lịch sử nhập/xuất kho |
| 11 | Inventory | `/admin/inventory/import/template` | GET | `inventory.read` | Lấy template file excel nhập kho |
| 12 | Inventory | `/admin/inventory/import` | POST | `inventory.update`, `products.update`| Nhập kho bằng file (multer) |
| 13 | Inventory | `/admin/inventory/import-manual` | POST | `inventory.update`, `products.update`| Nhập kho thủ công hàng loạt bằng JSON |
| 14 | Inventory | `/admin/inventory/adjust` | POST | `inventory.update` | Điều chỉnh tồn kho thủ công |
| 15 | Payments | `/admin/payments/transactions` | GET | `payments.read` | Xem danh sách giao dịch VNPay |
| 16 | Returns | `/admin/orders/returns` | GET | `orders.read` | Lấy danh sách các yêu cầu trả hàng |
| 17 | Returns | `/admin/orders/returns/:id/status`| PATCH | `orders.update` | Duyệt/Từ chối yêu cầu trả hàng |
| 18 | Categories | `/admin/categories` | POST | `categories.manage` | Tạo danh mục mới |
| 19 | Categories | `/admin/categories/:id` | PUT | `categories.manage` | Cập nhật danh mục |
| 20 | Categories | `/admin/categories/:id` | DELETE | `categories.manage` | Xóa danh mục |
| 21 | Products | `/admin/products` | POST | `products.create` | Tạo sản phẩm |
| 22 | Products | `/admin/products/:id` | PUT | `products.update` | Cập nhật thông tin chung của sản phẩm |
| 23 | Products | `/admin/products/:id` | DELETE | `products.delete` | Xóa sản phẩm |
| 24 | Products | `/admin/products/:id/variants`| POST | `products.update` | Thêm biến thể cho sản phẩm |
| 25 | Products | `/admin/variants/:variantId` | PUT | `products.update` | Cập nhật thông tin một biến thể |
| 26 | Products | `/admin/products/:id/images` | POST | `products.update` | Upload thêm ảnh sản phẩm (Cloudinary) |
| 27 | Products | `/admin/products/images/:imageId`| DELETE| `products.update` | Xóa ảnh của sản phẩm |
| 28 | Colors | `/admin/colors` | POST | `products.update` | Tạo màu mới |
| 29 | Colors | `/admin/colors/:id` | PUT | `products.update` | Cập nhật màu |
| 30 | Colors | `/admin/colors/:id` | DELETE | `products.update` | Xóa màu |
| 31 | Sizes | `/admin/sizes` | POST | `products.update` | Tạo kích thước mới |
| 32 | Sizes | `/admin/sizes/:id` | PUT | `products.update` | Cập nhật kích thước |
| 33 | Sizes | `/admin/sizes/:id` | DELETE | `products.update` | Xóa kích thước |
| 34 | Collections | `/admin/collections` | POST | `collections.manage` | Tạo bộ sưu tập (có hình ảnh banner) |
| 35 | Collections | `/admin/collections/:id` | PUT | `collections.manage` | Sửa thông tin bộ sưu tập |
| 36 | Collections | `/admin/collections/:id/products`| POST | `collections.manage` | Thêm các sản phẩm vào bộ sưu tập |
| 37 | Collections | `/admin/collections/:id/products`| DELETE| `collections.manage` | Bỏ các sản phẩm ra khỏi bộ sưu tập |
| 38 | Orders | `/admin/orders` | GET | `orders.read` | Lấy danh sách toàn bộ đơn hàng |
| 39 | Orders | `/admin/orders/:id/status` | PATCH | `orders.update` | Cập nhật trạng thái đơn hàng (duyệt, giao...) |
| 40 | Orders | `/admin/orders/:id/payment` | PATCH | `orders.update` | Cập nhật trạng thái thanh toán |
| 41 | Reviews | `/admin/reviews` | GET | `orders.read` | Xem danh sách đánh giá của KH |
| 42 | Reviews | `/admin/reviews/:id/status` | PATCH | `orders.update` | Đổi trạng thái đánh giá (hiện/ẩn) |
| 43 | VNPay | `/admin/orders/:id/vnpay-sync` | PATCH | `orders.update` | QueryDR VNPay để đồng bộ kết quả thanh toán |
| 44 | Coupons | `/admin/coupons` | POST | `coupons.manage` | Tạo mã giảm giá mới |
| 45 | Coupons | `/admin/coupons` | GET | `coupons.manage` | Lấy danh sách tất cả mã giảm giá |
| 46 | Coupons | `/admin/coupons/:id` | PUT | `coupons.manage` | Sửa mã giảm giá |
| 47 | Coupons | `/admin/coupons/:id` | DELETE | `coupons.manage` | Xóa mã giảm giá |
| 48 | Dashboard | `/admin/dashboard/stats` | GET | `dashboard.read` | Lấy số liệu thống kê Dashboard |
| 49 | Chatbot | `/admin/chatbot/stats` | GET | `chatbot.read` | Lấy thống kê hiệu suất chatbot |
| 50 | Chatbot | `/admin/chatbot/sessions` | GET | `chatbot.read` | Lấy danh sách các phiên chat |
| 51 | Chatbot | `/admin/chatbot/sessions/:sessionId`| GET| `chatbot.read` | Xem chi tiết tin nhắn trong một phiên chat |
| 52 | Chatbot | `/admin/chatbot/sessions/:sessionId`| DELETE|`chatbot.manage` | Xóa một phiên chat |
| 53 | Chatbot | `/admin/chatbot/users/:userId`| DELETE | `chatbot.manage` | Xóa toàn bộ lịch sử chat của user |

---

## Ghi chú về Ràng buộc & Công nghệ:
1. **Validation:** Dữ liệu đầu vào thường được validate bằng `Joi`. Nếu sai định dạng sẽ bị từ chối trước khi tới Controller.
2. **Transaction:** Các API liên quan đến Tiền, Tồn kho (Đặt hàng, Trả hàng, Adjust) sử dụng **Sequelize Transaction** để đảm bảo an toàn, rollback nếu có lỗi giữa chừng.
3. **Caching:** Sử dụng `Redis` để cache lại danh sách sản phẩm, báo cáo dashboard, stats của chatbot nhằm tăng tốc phản hồi. Thao tác CREATE/UPDATE/DELETE thường đi kèm xoá Cache tương ứng.
4. **Cloudinary:** Dùng `multer` kết hợp Cloudinary để chứa và xử lý các tệp media (ảnh review, hình ảnh variant, avatar/banner).
5. **Security:** Áp dụng xác thực JWT kết hợp Middleware kiểm tra Roles & Permissions rõ ràng để bảo vệ các Endpoint của Admin.
