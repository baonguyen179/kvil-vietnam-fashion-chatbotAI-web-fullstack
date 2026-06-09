# Kịch Bản Kiểm Thử (Test Scenarios) — Quy Trình Nghiệp Vụ Khép Kín Kvil

Tài liệu này cung cấp các kịch bản kiểm thử tiêu chuẩn để nghiệm thu các chức năng nghiệp vụ khép kín mới được triển khai: **Hold Stock Scheduler**, **Trả hàng 2 bước**, **Hoàn tiền VNPay một phần (Partial Refund)** và **Hoàn tiền COD**.

---

## KỊCH BẢN 1: Hold Stock Scheduler (Tự động giải phóng tồn kho)

### Test Case 1.1: Tự động hủy đơn và hoàn kho VNPay quá hạn 15 phút
*   **Mục tiêu**: Đảm bảo đơn hàng VNPay không thanh toán đúng hạn sẽ bị hủy tự động và kho trực tuyến được cộng lại.
*   **Tiền điều kiện**: 
    *   Sản phẩm A (biến thể S-White) đang có tồn kho trực tuyến là `10`.
    *   Hệ thống đang hoạt động bình thường, scheduler đang chạy.
*   **Các bước thực hiện**:
    1. Truy cập Web khách hàng, đặt mua 2 sản phẩm A bằng phương thức thanh toán **VNPay**.
    2. Chuyển hướng đến trang VNPay nhưng **không thực hiện thanh toán** (để yên trang hoặc đóng tab).
    3. Kiểm tra ngay tồn kho sản phẩm A trên trang admin hoặc DB.
    4. Chờ 16 phút.
    5. Kiểm tra trạng thái đơn hàng trên trang quản trị hoặc DB.
    6. Kiểm tra lại tồn kho sản phẩm A và xem Lịch sử kho (Inventory Logs).
*   **Kết quả mong đợi (Expected Results)**:
    *   *Sau bước 2*: Tồn kho sản phẩm A giảm xuống còn `8`. Hệ thống tạo 1 log kho dạng `HOLD` số lượng `-2` cho đơn hàng vừa tạo.
    *   *Sau bước 5*: Trạng thái đơn hàng chuyển sang `cancelled` (Đã hủy).
    *   *Sau bước 6*: Tồn kho sản phẩm A quay lại là `10`. Hệ thống tạo 1 log kho dạng `UNHOLD` số lượng `+2` với ghi chú: `[AUTO] Hủy tạm giữ do đơn #... quá hạn (VNPay quá 15 phút)`.

### Test Case 1.2: Tự động hủy đơn và hoàn kho COD quá hạn 24 giờ
*   **Mục tiêu**: Đảm bảo đơn COD chưa được Sales xác nhận sau 24h sẽ bị hủy tự động.
*   **Tiền điều kiện**:
    *   Sản phẩm A đang có tồn kho trực tuyến là `10`.
    *   Đã chỉnh sửa trường `createdAt` của đơn hàng thử nghiệm lùi về trước thời điểm hiện tại 25 tiếng (để giả lập 24h trôi qua).
*   **Các bước thực hiện**:
    1. Khách hàng đặt mua 1 sản phẩm A, chọn thanh toán **COD**.
    2. Kiểm tra tồn kho của sản phẩm A (giảm còn `9`).
    3. Giả lập đơn hàng quá hạn 24h bằng cách cập nhật cột `createdAt` của đơn hàng trong database lùi lại 25 giờ trước.
    4. Chờ scheduler quét (tối đa 5 phút).
    5. Kiểm tra trạng thái đơn hàng và tồn kho sản phẩm A.
*   **Kết quả mong đợi (Expected Results)**:
    *   Trạng thái đơn hàng chuyển sang `cancelled`.
    *   Tồn kho sản phẩm A được cộng lại thành `10`.
    *   Ghi log kho dạng `UNHOLD` số lượng `+1` với ghi chú: `[AUTO] Hủy tạm giữ do đơn #... quá hạn (COD quá 24 giờ)`.

---

## KỊCH BẢN 2: Quy Trình Trả Hàng & Hoàn Tiền 2 Bước

### Test Case 2.1: Yêu cầu trả hàng đơn COD (Phía Khách hàng)
*   **Mục tiêu**: Kiểm tra giao diện yêu cầu trả hàng đơn COD bắt buộc điền thông tin tài khoản ngân hàng và đóng gói lý do chính xác.
*   **Tiền điều kiện**: Tài khoản khách hàng có một đơn hàng COD ở trạng thái `delivered` (Đã hoàn thành).
*   **Các bước thực hiện**:
    1. Đăng nhập tài khoản khách hàng, truy cập mục **Đơn hàng của tôi**.
    2. Tìm đơn hàng COD đã hoàn thành, nhấn nút **Yêu cầu trả hàng**.
    3. Kiểm tra xem form trả hàng có xuất hiện khối "Thông tin nhận hoàn tiền (Đơn COD)" hay không.
    4. Để trống một trong các trường ngân hàng, số tài khoản, hoặc tên chủ tài khoản và nhấn **Gửi yêu cầu**.
    5. Điền đầy đủ thông tin ngân hàng (ví dụ: Vietcombank, STK: 1234567, Tên: NGUYEN VAN A), nhập lý do trả hàng, tải lên ít nhất 1 ảnh minh chứng và nhấn **Gửi yêu cầu**.
    6. Đăng nhập trang quản trị Admin, vào mục **Quản lý yêu cầu trả hàng**, mở chi tiết yêu cầu vừa tạo.
*   **Kết quả mong đợi (Expected Results)**:
    *   *Bước 3*: Form xuất hiện đầy đủ 3 trường: Ngân hàng (dạng Select chọn nhanh), Số tài khoản, Tên chủ tài khoản.
    *   *Bước 4*: Hệ thống báo lỗi bằng toast message yêu cầu điền đầy đủ thông tin ngân hàng.
    *   *Bước 5*: Gửi yêu cầu thành công, modal đóng lại.
    *   *Bước 6*: Trong DB, trường `reason` lưu định dạng: `[Thông tin hoàn tiền: Vietcombank - 1234567 - NGUYEN VAN A] - Lý do: <Lý do thực tế>`. Trên giao diện Admin, khối thông tin ngân hàng được tự động parse ra hiển thị trực quan riêng biệt (Số tài khoản có nút Click để Copy). Khối lý do trả hàng chỉ hiển thị phần `<Lý do thực tế>`.

### Test Case 2.2: CSKH Duyệt Yêu Cầu (Bước 1)
*   **Mục tiêu**: Đảm bảo bước duyệt của CSKH không làm thay đổi tồn kho và chưa kích hoạt lệnh hoàn tiền.
*   **Tiền điều kiện**: Có yêu cầu trả hàng ở trạng thái `PENDING` (Chờ duyệt).
*   **Các bước thực hiện**:
    1. Đăng nhập tài khoản quản trị (Role có quyền `orders.update`, ví dụ: SALES).
    2. Truy cập **Quản lý yêu cầu trả hàng**, mở yêu cầu đang chờ duyệt, nhấn nút **Duyệt trả hàng** (hoặc Approve).
    3. Kiểm tra trạng thái của yêu cầu trả hàng và trạng thái đơn hàng liên quan.
    4. Kiểm tra tồn kho của sản phẩm trong đơn hàng (Xem có bị cộng lại không).
    5. Kiểm tra log giao dịch hoàn tiền (Xem có lệnh refund nào được gửi đi hoặc ghi nhận không).
*   **Kết quả mong đợi (Expected Results)**:
    *   Yêu cầu trả hàng chuyển sang trạng thái `APPROVED` (nhãn hiển thị trên UI: "Chờ nhận hàng").
    *   Đơn hàng liên quan chuyển sang trạng thái `return_approved`.
    *   **Tồn kho của sản phẩm không thay đổi** (chưa được cộng lại).
    *   **Không có giao dịch hoàn tiền nào được thực hiện** (chưa gửi lệnh hoàn tiền).

### Test Case 2.3: Thủ kho nhận hàng hoàn — Tình trạng: Nguyên vẹn (Bước 2)
*   **Mục tiêu**: Xác nhận thủ kho nhận hàng hoàn nguyên vẹn sẽ thực hiện cộng lại kho bán lẻ trực tuyến và hoàn tiền cho khách.
*   **Tiền điều kiện**: Đơn hàng có yêu cầu trả hàng đang ở trạng thái `APPROVED` ("Chờ nhận hàng").
*   **Các bước thực hiện**:
    1. Đăng nhập tài khoản thủ kho (Role có quyền `inventory.update`, ví dụ: SUPER_ADMIN hoặc INVENTORY).
    2. Truy cập **Quản lý yêu cầu trả hàng**, tìm yêu cầu đang ở trạng thái "Chờ nhận hàng".
    3. Nhấn nút **Xác nhận nhận hàng hoàn** (hình dấu tích xanh hoặc ở footer modal chi tiết).
    4. Trong modal chọn tình trạng hàng, chọn **Nguyên vẹn (Cộng kho)** và nhấn Xác nhận.
    5. Kiểm tra tồn kho trực tuyến của sản phẩm đó và xem lịch sử kho (Inventory Logs).
    6. Kiểm tra giao dịch hoàn tiền tương ứng:
        *   *Nếu là VNPay*: Kiểm tra log `PaymentTransaction` mới tạo.
        *   *Nếu là COD*: Kiểm tra xem có giao dịch `COD_REFUND` mới ở trạng thái `PENDING` với số tiền âm hay không.
*   **Kết quả mong đợi (Expected Results)**:
    *   Trạng thái đơn hàng chuyển thành `returned`. Trạng thái yêu cầu trả hàng chuyển thành `REFUNDED` ("Đã nhận & hoàn tiền").
    *   Tồn kho của biến thể sản phẩm **được cộng lại đầy đủ**.
    *   Có một bản ghi lịch sử kho mới dạng `RETURN` với ghi chú: `Hoàn kho bán lẻ (hàng nguyên vẹn) — Đơn #...`.
    *   *Đối với đơn VNPay*: Gọi API hoàn tiền một phần thành công. Ghi nhận giao dịch hoàn tiền thành công với số tiền bằng `finalAmount - 15.000đ` (trừ phí ship ngược).
    *   *Đối với đơn COD*: Tạo giao dịch `COD_REFUND` số tiền `- (finalAmount - 15.000đ)` ở trạng thái `PENDING` (chờ Kế toán chuyển khoản ngân hàng thực tế).

### Test Case 2.4: Thủ kho nhận hàng hoàn — Tình trạng: Lỗi/Hỏng (Bước 2)
*   **Mục tiêu**: Xác nhận thủ kho nhận hàng hoàn bị lỗi sẽ ghi nhận kho phế phẩm, KHÔNG cộng lại kho trực tuyến, nhưng vẫn tiến hành hoàn tiền cho khách.
*   **Tiền điều kiện**: Đơn hàng có yêu cầu trả hàng đang ở trạng thái `APPROVED` ("Chờ nhận hàng").
*   **Các bước thực hiện**:
    1. Thực hiện các bước giống Test Case 2.3 nhưng tại bước chọn tình trạng hàng, chọn **Lỗi/Hỏng (Phế phẩm)**.
    2. Kiểm tra tồn kho bán lẻ trực tuyến của sản phẩm (xem có thay đổi không).
    3. Kiểm tra lịch sử kho (Inventory Logs).
    4. Kiểm tra giao dịch hoàn tiền.
*   **Kết quả mong đợi (Expected Results)**:
    *   Trạng thái đơn hàng chuyển thành `returned`. Trạng thái yêu cầu trả hàng chuyển thành `REFUNDED` ("Đã nhận & hoàn tiền").
    *   Tồn kho bán lẻ trực tuyến **không thay đổi** (không bị cộng lại).
    *   Có một bản ghi lịch sử kho mới dạng `RETURN_DEFECTIVE` (kho phế phẩm) với ghi chú: `Nhập kho phế phẩm (hàng lỗi/hỏng) — Đơn #...`.
    *   Giao dịch hoàn tiền vẫn được thực hiện đầy đủ (VNPay Partial Refund hoặc COD Pending Refund trừ đi 15.000đ phí ship).
