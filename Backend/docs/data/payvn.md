# Tài liệu Tích hợp Thanh toán VNPAY - Kvil Vietnam

Tài liệu này mô tả chi tiết luồng xử lý, các API liên quan và cơ chế bảo mật của hệ thống thanh toán VNPAY trong dự án Kvil Vietnam Fashion.

## 1. Các Chức năng Chính

- **Tạo Link Thanh toán:** Chuyển đổi một đơn hàng từ trạng thái `Chờ thanh toán` sang trang cổng của VNPAY.
- **Xử lý IPN (Instant Payment Notification):** Nhận tín hiệu ngầm từ server VNPAY để cập nhật trạng thái đơn hàng chính xác ngay cả khi người dùng đóng trình duyệt.
- **Xử lý Return:** Xác thực và hiển thị kết quả thanh toán ngay lập tức cho người dùng khi quay lại Website.
- **Đồng bộ trạng thái (QueryDR):** Admin có thể chủ động kiểm tra trạng thái giao dịch với VNPay nếu IPN không đến được hệ thống.

## 2. Danh sách các API liên quan

### A. Phía Client (User/Guest)

| API                                   | Method | Mô tả                                                   | Bên gọi  |
| :------------------------------------ | :----: | :------------------------------------------------------ | :------- |
| `/api/v1/user/orders/:id/payment-url` | `GET`  | Lấy link thanh toán cho User đã đăng nhập               | Frontend |
| `/api/v1/order/vnpay-url/guest`       | `POST` | Lấy link thanh toán cho Khách vãng lai                  | Frontend |
| `/api/v1/vnpay/return`                | `GET`  | Kiểm tra và trả về kết quả thanh toán khi User quay lại | Frontend |

### B. Phía Server (VNPAY Callback)

| API                 | Method | Mô tả                                      | Bên gọi          |
| :------------------ | :----: | :----------------------------------------- | :--------------- |
| `/api/v1/vnpay/ipn` | `GET`  | VNPay gọi ngầm để Server cập nhật Database | **Server VNPAY** |

### C. Phía Quản trị (Admin)

| API                                   | Method  | Mô tả                                               | Bên gọi         |
| :------------------------------------ | :-----: | :-------------------------------------------------- | :-------------- |
| `/api/v1/admin/orders/:id/vnpay-sync` | `PATCH` | Gọi API QueryDR của VNPay để đồng bộ lại trạng thái | Admin Dashboard |
| `/api/v1/admin/payments/transactions` |  `GET`  | Xem danh sách các giao dịch thanh toán              | Admin Dashboard |

---

## 3. Luồng hoạt động (Workflow)

### Luồng Thanh toán (Normal Flow)

1. **Khởi tạo:** Người dùng chọn phương thức "Thanh toán qua VNPAY" tại trang Checkout.
2. **Yêu cầu URL:** Frontend gọi API lấy `payment-url`.
3. **Chuyển hướng:** Backend trả về một URL đã được ký (Secure Hash). Frontend chuyển hướng người dùng sang `sandbox.vnpayment.vn`.
4. **Thanh toán:** Người dùng nhập thông tin thẻ/ứng dụng ngân hàng và hoàn tất thanh toán trên VNPay.
5. **Kết thúc thanh toán:**
   - **Bước 5a (Return):** VNPay điều hướng trình duyệt người dùng về Website (Trang `/order/vnpay-return`). Frontend tại đây sẽ gọi API `/vnpay/return` để xác thực chữ ký và hiển thị thông báo "Thành công" hoặc "Thất bại".
   - **Bước 5b (IPN - Cực kỳ quan trọng):** Song song với 5a, Server VNPay sẽ gọi ngầm vào API `/vnpay/ipn` của Backend. Tại đây, Backend sẽ kiểm tra số tiền, chữ ký và cập nhật trạng thái đơn hàng vào Database (Trạng thái thanh toán: `PAID`, Trạng thái đơn hàng: `CONFIRMED`).

### Luồng Xử lý sự cố (Error/Fallback Flow)

- **Hủy thanh toán:** Nếu người dùng nhấn "Hủy" trên trang VNPay, hệ thống sẽ điều hướng về và hiển thị thông báo giao dịch bị hủy (EC: 24).
- **Mất IPN:** Nếu vì lý do mạng mà Server VNPay không gọi được IPN, Admin có thể dùng chức năng **Đồng bộ (vnpay-sync)** trong trang quản trị đơn hàng để tự động cập nhật lại trạng thái dựa trên dữ liệu thực tế từ VNPay.

---

## 4. Cơ chế Bảo mật

- **Checksum (HMACSHA512):** Tất cả các yêu cầu giữa Server và VNPay đều được ký bằng một Secret Key. Hệ thống luôn kiểm tra `vnp_SecureHash` trước khi tin tưởng bất kỳ dữ liệu nào.
- **Kiểm tra số tiền:** Trong API IPN, Backend luôn so sánh `vnp_Amount` nhận được với số tiền thực tế trong Đơn hàng để tránh gian lận thay đổi giá trị đơn hàng trên URL.
- **Idempotency:** Hệ thống kiểm tra xem đơn hàng đã được cập nhật trước đó chưa để tránh việc xử lý IPN trùng lặp.

Mô hình quy trình: Trả hàng

User gửi yêu cầu trả hàng ( kèm lý do + ảnh )
-> Hệ thống lưu vào ReturnRequests (Pending)

QUY TRÌNH 1: Khi KẾ TOÁN duyệt trả hàng (Có refund)
Nhân viên Kế toán chọn Yêu cầu -> Chọn Duyệt (Tạo phiếu Refund)

-> Hệ thống cập nhật ReturnRequests.status = 'REFUNDED'

-> Kế toán thực hiện chuyển khoản ngân hàng cho khách (hoặc tiền mặt)

-> Kế toán điền số tiền refund vào ReturnRequests.refundAmount

-> Sau khi chuyển tiền xong, Kế toán tích vào ô "Đã hoàn tiền"

-> Hệ thống trừ tồn kho (tăng ProductVariants.stock) + tạo InventoryLogs (Type: RETURN)

-> Gửi email thông báo Refund thành công cho User

QUY TRÌNH 2: Khi KINH DOANH duyệt trả hàng (Không refund)
Nhân viên Kinh doanh chọn Yêu cầu -> Chọn Duyệt (Không tạo phiếu Refund)

-> Hệ thống cập nhật ReturnRequests.status = 'APPROVED'

-> Nhân viên Kinh doanh cộng tồn kho (tăng ProductVariants.stock) + tạo InventoryLogs (Type: RETURN)

-> Trừ tiền khách (nếu đơn còn nợ)

-> Gửi email thông báo duyệt trả hàng thành công cho User

QUY TRÌNH 3: Khi từ chối trả hàng
Nhân viên Kinh doanh chọn Yêu cầu -> Chọn Từ chối

-> Hệ thống cập nhật ReturnRequests.status = 'REJECTED'

## -> Gửi email thông báo từ chối trả hàng cho User

_Tài liệu được soạn thảo bởi Kvil Development Team._
