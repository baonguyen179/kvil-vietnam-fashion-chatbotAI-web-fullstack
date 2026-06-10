# Bảng Điều Khiển Thủ Kho & Phân Tách Quyền Hạn Trạng Thái Đơn Hàng

Tài liệu này mô tả chi tiết chức năng **Bảng điều khiển Thủ kho (Warehouse Dashboard)** mới và hệ thống **Phân tách quyền hạn chi tiết (Granular Permissions)** theo quy trình Order State Machine của thương hiệu thời trang Kvil.

---

## 1. Tổng quan chức năng

Trang quản trị kho hàng cũ (chỉ hiển thị nhật ký) đã được nâng cấp toàn diện thành một **Bảng điều khiển Thủ kho đa năng (Warehouse Dashboard)**. Chức năng mới giúp tối ưu hóa nghiệp vụ vận hành thực tế của kho, CSKH và kế toán, chia tách rõ ràng các nhiệm vụ vật lý và các trạng thái của đơn hàng.

Đầu trang được tích hợp **Thẻ báo cáo KPI (WarehouseStats)** giúp thủ kho nhìn vào nhận diện ngay số lượng công việc đang chờ xử lý theo thời gian thực.

---

## 2. Kiến trúc Module & Tách nhỏ Component

Để đảm bảo quy tắc thiết kế SRP (Single Responsibility Principle) và giữ cho các file có độ dài tối ưu (dưới 150-200 dòng), mã nguồn Frontend đã được chia nhỏ thành các component độc lập:

| Component / File | Đường dẫn | Chức năng chính |
| :--- | :--- | :--- |
| **Main Dashboard Container** | [InventoryLogPage.jsx](file:///d:/Hoc_code/Hoc_JS/NEW_kvil-vietnam-fashion-chatbotAI-web-fullstack/Frontend/src/pages/admin/InventoryLogPage.jsx) | Quản lý state chung, phân quyền user, hiển thị Tabs chính và gọi các modal nhập/điều chỉnh kho. |
| **KPI Stats Cards** | [WarehouseStats.jsx](file:///d:/Hoc_code/Hoc_JS/NEW_kvil-vietnam-fashion-chatbotAI-web-fullstack/Frontend/src/pages/admin/WarehouseStats.jsx) | Hiển thị 4 thẻ đếm dữ liệu chờ: giao ĐVVC, nhận tại quầy, nhận hàng hoàn và tồn kho cảnh báo. |
| **Tab 1: Lịch sử kho** | Nằm trong `InventoryLogPage.jsx` | Hiển thị lịch sử biến động kho hàng (IN, OUT, HOLD, UNHOLD, ADJUST, RETURN). Hỗ trợ lọc loại, ngày, xuất Excel và nhập Excel. |
| **Tab 2: Chờ bàn giao ĐVVC** | [WarehouseOutboundTab.jsx](file:///d:/Hoc_code/Hoc_JS/NEW_kvil-vietnam-fashion-chatbotAI-web-fullstack/Frontend/src/pages/admin/WarehouseOutboundTab.jsx) | Danh sách đơn hàng giao tận nơi (`home_delivery`) cần đóng gói. Cho phép mở rộng dòng (Expandable) xem chi tiết SKU để nhặt hàng. |
| **Tab 3: Khách nhận tại quầy** | [WarehousePickupTab.jsx](file:///d:/Hoc_code/Hoc_JS/NEW_kvil-vietnam-fashion-chatbotAI-web-fullstack/Frontend/src/pages/admin/WarehousePickupTab.jsx) | Danh sách đơn hàng nhận tại cửa hàng (`store_pickup`). |
| **Tab 4: Chờ nhận hàng hoàn** | [WarehouseReturnsTab.jsx](file:///d:/Hoc_code/Hoc_JS/NEW_kvil-vietnam-fashion-chatbotAI-web-fullstack/Frontend/src/pages/admin/WarehouseReturnsTab.jsx) | Danh sách hàng hoàn trả đã được CSKH duyệt lý thuyết, chờ thủ kho kiểm tra hàng vật lý thực tế. |
| **Tab 5: Cảnh báo tồn kho** | [WarehouseLowStockTab.jsx](file:///d:/Hoc_code/Hoc_JS/NEW_kvil-vietnam-fashion-chatbotAI-web-fullstack/Frontend/src/pages/admin/WarehouseLowStockTab.jsx) | Hiển thị các biến thể có số lượng tồn kho thấp dưới ngưỡng cảnh báo ($\le 10$). |

---

## 3. Quy trình Nghiệp vụ tại các Tabs của Thủ kho

### Tab 2: Chờ bàn giao ĐVVC (Outbound Delivery)
- **Đối tượng:** Đơn hàng có trạng thái `confirmed` (Đã xác nhận) và hình thức giao hàng là `home_delivery`.
- **Hành động vật lý:** Thủ kho xem danh sách sản phẩm cần nhặt (SKU, Tên SP, Màu, Size, Số lượng) bằng cách click mở rộng dòng. Tiến hành đóng gói kiện hàng và dán nhãn vận chuyển của đơn vị vận chuyển (ĐVVC).
- **Cập nhật hệ thống:** Sau khi giao gói hàng vật lý cho shipper, thủ kho nhấn nút **"Đã bàn giao"**.
  - Trạng thái đơn hàng chuyển thành `shipping` (Đang giao).
  - Tồn kho của các biến thể tương ứng tự động giảm xuống.
  - Ghi log tồn kho loại `OUT` (Xuất kho bán hàng) kèm mã đơn hàng và ID của thủ kho thực hiện.

### Tab 3: Khách nhận tại quầy (Store Pickup)
- **Đối tượng:** Đơn hàng ở trạng thái `confirmed` và hình thức nhận hàng là `store_pickup`. Kiện hàng lúc này vẫn được giữ nguyên trong kho và chưa bị trừ tồn.
- **Hành động vật lý:** Khách hàng đến cửa hàng đọc mã đơn và nhận sản phẩm vật lý trực tiếp.
- **Cập nhật hệ thống:** Nhân viên cửa hàng/thủ kho nhấn nút **"Khách đã nhận hàng"**.
  - Trạng thái đơn chuyển thẳng từ `confirmed` sang `delivered` (Đã giao).
  - Tồn kho tự động trừ đi tại thời điểm này.
  - Ghi log kho loại `OUT` với ghi chú: *Khách nhận trực tiếp tại cửa hàng*.

### Tab 4: Chờ nhận hàng hoàn (Inbound Returns)
- **Đối tượng:** Các yêu cầu trả hàng ở trạng thái `APPROVED` từ CSKH (đơn hàng ở trạng thái `return_approved`).
- **Hành động vật lý:** Kiện hàng hoàn trả từ khách hàng được gửi về kho. Thủ kho khui hộp kiểm tra tình trạng sản phẩm thực tế.
- **Cập nhật hệ thống:** Thủ kho nhấn nút **"Xác nhận nhận hàng"**, hệ thống mở một Modal yêu cầu phân loại tình trạng:
  - **Nguyên vẹn (Cộng kho):** Sản phẩm còn đủ tem mác, chưa qua sử dụng. 
    * Trạng thái đơn chuyển sang `returned`.
    * Số lượng sản phẩm tự động **cộng trả lại vào kho bán lẻ trực tuyến**.
    * Ghi log kho loại `RETURN` (Nhập lại hàng hoàn - Nguyên vẹn).
    * Kích hoạt cơ chế hoàn tiền cho khách hàng (VNPay tự động hoàn, COD tạo log chờ kế toán chuyển khoản).
  - **Lỗi/Hỏng (Phế phẩm):** Sản phẩm rách, bẩn, mất form do lỗi của khách hoặc ĐVVC.
    * Trạng thái đơn chuyển sang `returned`.
    * **KHÔNG cộng lại số lượng vào kho bán lẻ trực tuyến** để tránh bán sản phẩm hỏng cho khách khác.
    * Ghi log kho loại `RETURN_DEFECTIVE` (Nhập kho phế phẩm).
    * Vẫn kích hoạt cơ chế hoàn tiền bình thường cho khách hàng.

### Tab 5: Cảnh báo tồn kho thấp (Low Stock Alert)
- **Đối tượng:** Các biến thể sản phẩm có số lượng tồn kho hiện tại nhỏ hơn hoặc bằng 10.
- **Mục đích:** Giúp thủ kho và bộ phận sản xuất theo dõi sát sao lượng tồn để chủ động lập kế hoạch sản xuất thêm hoặc nhập kho bổ sung.
- **Thao tác nhanh:** Tích hợp nút **"Điều chỉnh"** nhanh để thực hiện bút toán điều chỉnh kho (ADJUST) mà không cần chuyển trang.

---

## 4. Bản đồ phân tách quyền hạn (Granular Permissions Matrix)

Quyền cập nhật đơn hàng cồng kềnh trước đây (`orders.update`) đã được tách nhỏ thành **8 quyền hạn chi tiết** tương ứng với từng giai đoạn và vai trò của các phòng ban trong Order State Machine:

| Mã quyền mới | Tên hiển thị / Diễn giải quyền | Vai trò đề xuất |
| :--- | :--- | :--- |
| `orders.update_confirm` | Xác nhận đơn hàng mới (`pending` $\rightarrow$ `confirmed`) | Sales (COD) / Hệ thống tự động (VNPay) |
| `orders.update_ship` | Xác nhận bàn giao vận chuyển (`confirmed` $\rightarrow$ `shipping` hoặc `delivered` cho quầy) | **Thủ kho** / Nhân viên bán hàng |
| `orders.update_complete` | Xác nhận giao hàng thành công (`shipping` $\rightarrow$ `delivered`) | Đơn vị vận chuyển (GHTK) / Sales |
| `orders.update_cancel` | Quyền hủy đơn hàng (trả lại tồn kho) | Sales / Admin |
| `orders.update_payment` | Cập nhật trạng thái thanh toán & Đồng bộ VNPay | Kế toán / Admin |
| `orders.update_approve_return` | Duyệt / Từ chối yêu cầu trả hàng từ khách hàng (Duyệt lý thuyết) | CSKH (Chăm sóc khách hàng) |
| `orders.update_receive_return` | Xác nhận nhận hàng hoàn vật lý & Phân loại hàng (Duyệt thực tế) | **Thủ kho** |
| `reviews.update_status` | Cập nhật trạng thái ẩn/hiện đánh giá của khách hàng | CSKH / Admin |

### Nguyên tắc bảo mật và giao diện người dùng (UI UX Security):
- **Super Admin Bypass:** Vai trò `SUPER_ADMIN` luôn có toàn bộ các quyền trên mặc định mà không cần gán thủ công.
- **Bảo vệ trên giao diện (Disabled Actions & Tooltips):**
  - Hệ thống tự động kiểm tra mảng `user.permissions` của người dùng đang đăng nhập.
  - Nếu người dùng không có quyền tương ứng (ví dụ: Thủ kho không có quyền duyệt đơn mới `orders.update_confirm`), các nút hành động sẽ bị **vô hiệu hóa (disabled)** trên giao diện.
  - Khi di chuột vào nút bị khóa, hệ thống hiển thị một **Tooltip** ghi rõ lý do bị khóa và quyền hạn cần có (Ví dụ: *"Bạn không có quyền xác nhận nhận hàng hoàn (Yêu cầu: orders.update_receive_return)"*).
  - Phía Backend kiểm tra nghiêm ngặt quyền hạn tại Controller. Mọi hành vi cố tình gọi API mà không có quyền hợp lệ đều bị trả về mã lỗi **`403 Forbidden`**.
