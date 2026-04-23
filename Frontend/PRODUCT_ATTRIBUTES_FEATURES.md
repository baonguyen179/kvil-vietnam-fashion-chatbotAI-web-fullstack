# Tài liệu Chức năng: Quản lý Thuộc tính Sản phẩm (Colors & Sizes)

Tài liệu này tổng hợp toàn bộ các chức năng đã được triển khai và nâng cấp liên quan đến hệ thống quản lý Màu sắc và Kích cỡ trong dự án.

## 1. Phân hệ Quản trị (Admin Dashboard)

### 1.1. Trang Quản lý Thuộc tính (`ColorSizeManagePage`)
Giao diện tập trung quản lý các thuộc tính cốt lõi của sản phẩm, tích hợp trong mục **"Catalog > Colors & Sizes"**.

*   **Quản lý Màu sắc (Colors):**
    *   **Xem danh sách:** Hiển thị ID, Tên màu, và ô xem trước màu sắc/pattern.
    *   **Thêm/Sửa màu sắc:** 
        *   Hỗ trợ nhập mã **Hex Code** thủ công.
        *   Hỗ trợ chọn màu trực quan qua **Bảng màu (Color Picker)**.
        *   Hỗ trợ mã **CSS Gradient** (ví dụ: hồng sọc trắng) để hiển thị các mẫu màu phức tạp.
    *   **Xóa màu:** Xóa các màu không còn sử dụng.

*   **Quản lý Kích cỡ (Sizes):**
    *   **Xem danh sách:** Hiển thị ID, Tên size (S, M, L...), và mô tả chi tiết.
    *   **Thêm/Sửa kích cỡ:**
        *   Nhập tên size.
        *   Nhập **Mô tả gợi ý (Size Guide)**: Hỗ trợ nhập nhiều dòng (ví dụ: Chiều cao/Cân nặng tương ứng) để hiển thị cho khách hàng.
    *   **Xóa kích cỡ:** Gỡ bỏ các size khỏi hệ thống.

### 1.2. Quản lý Biến thể Sản phẩm (`AdminVariantDrawer`)
Nâng cấp luồng tạo SKU cho sản phẩm.

*   **Chọn thuộc tính động:** Thay vì nhập tay "Đỏ", "XL", Admin giờ đây chọn trực tiếp từ danh sách Màu sắc và Kích cỡ đã định nghĩa sẵn qua dropdown (`Select`).
*   **Hiển thị trực quan:** Trong danh sách chọn màu, hiển thị kèm ô màu thực tế để tránh nhầm lẫn.
*   **Đồng bộ dữ liệu:** Biến thể được lưu trữ theo ID quan hệ (`colorId`, `sizeId`), đảm bảo tính nhất quán dữ liệu khi thay đổi tên thuộc tính.

---

## 2. Phân hệ Người dùng (User Frontend)

### 2.1. Trang Chi tiết Sản phẩm (`ProductDetailPage`)
*   **Bảng thông số gợi ý (Size Chart):**
    *   Dữ liệu được tải động từ Database thay vì fix cứng.
    *   **Thiết kế Grid Card:** Thông số được trình bày theo dạng lưới các thẻ hiện đại, gọn gàng, không chiếm nhiều diện tích như bảng truyền thống.
    *   **Tự động phân tách dòng:** Các gợi ý chiều cao, cân nặng được hiển thị dưới dạng danh sách dễ đọc.
*   **Lựa chọn thuộc tính:** Hệ thống tự động lọc các biến thể còn hàng (`stock > 0`) để người dùng chọn đúng size.

### 2.2. Danh sách sản phẩm & Bộ lọc (`ProductsLayout`)
*   **Bộ lọc thuộc tính động:** Danh sách màu sắc và kích cỡ ở sidebar được lấy trực tiếp từ API.
*   **Lọc chính xác:** Người dùng có thể lọc sản phẩm theo mã màu hoặc size cụ thể.
*   **Hiển thị Pattern:** Các màu dạng gradient (sọc, caro...) được hiển thị chính xác trên các chấm màu của bộ lọc.

### 2.3. Giỏ hàng (`Cart`)
*   **Hiển thị chi tiết:** Thông tin màu sắc và kích cỡ của sản phẩm trong giỏ hàng được hiển thị rõ ràng (ví dụ: "Size: L", "Màu sắc: Hồng sọc trắng").

---

## 3. Cấu trúc Dữ liệu & Backend
*   **Tính toàn vẹn:** Sử dụng liên kết quan hệ (Foreign Key) thay vì lưu chuỗi text đơn thuần.
*   **Kiểu dữ liệu TEXT:** Cột mô tả size đã được nâng cấp lên kiểu `TEXT` để lưu trữ các bảng hướng dẫn chọn size dài và chi tiết.
*   **API chuẩn hóa:** Hệ thống API `/api/v1/colors` và `/api/v1/sizes` hỗ trợ đầy đủ các thao tác CRUD với phân quyền bảo mật.
