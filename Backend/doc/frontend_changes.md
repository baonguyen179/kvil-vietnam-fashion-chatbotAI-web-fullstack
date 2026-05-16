# Thay đổi cấu trúc Database (Product Variants) - Hướng dẫn cho Frontend

Chào team Frontend, phía Backend vừa thực hiện một bản cập nhật lớn liên quan đến cấu trúc của bảng `ProductVariants`. Chúng tôi đã chuyển đổi `size` và `color` từ kiểu **String** sang dạng **Relational Object** (Foreign Key trỏ tới bảng `Sizes` và `Colors`).

Điều này giúp quản lý dữ liệu đồng nhất hơn (hiển thị mã màu Hex, mô tả Size) nhưng sẽ yêu cầu Frontend phải cập nhật lại cách truy xuất (map/đọc) dữ liệu trong các file Component và Redux.

Dưới đây là chi tiết các thay đổi:

---

## 1. Thay đổi cấu trúc của `variant` trong Product

Khi bạn gọi các API lấy sản phẩm (`GET /products`, `GET /products/:id`, `GET /products/search`...), mảng `variants` sẽ trả về dữ liệu với cấu trúc mới.

**Cấu trúc CŨ:**

```json
{
  "id": 1,
  "stock": 50,
  "price": 200000,
  "color": "Đỏ",
  "size": "M"
}
```

**Cấu trúc MỚI:**

```json
{
  "id": 1,
  "stock": 50,
  "price": 200000,
  "colorId": 1,
  "sizeId": 1,
  "color": {
    "id": 1,
    "name": "Đỏ",
    "hexCode": "#FF0000"
  },
  "size": {
    "id": 1,
    "name": "M"
  }
}
```

**📌 Hành động phía Frontend:**
-Tạo service colorService và sizeService để lấy danh sách màu và size

- Bất cứ nơi nào bạn đang hiển thị tên màu, thay vì in `variant.color`, hãy sửa thành `variant.color.name`.
- Tương tự, đổi `variant.size` thành `variant.size.name`.
- Nếu UI của bạn có ô chọn màu sắc trực quan (Color Picker/Swatches), bạn có thể sử dụng `variant.color.hexCode` thay vì chỉ in ra chữ.

---

## 2. API Quản trị Sản phẩm (Admin) - Thêm Variant

Khi Admin thêm mới một biến thể cho sản phẩm qua API `POST /admin/products/:id/variants`, payload cũng bị thay đổi.

**Payload CŨ:**

```json
{
  "color": "Đỏ",
  "size": "M",
  "stock": 100,
  "sku": "AOD-M",
  "price": 150000
}
```

**Payload MỚI (Bắt buộc):**

```json
{
  "colorId": 1,
  "sizeId": 1,
  "stock": 100,
  "sku": "AOD-M",
  "price": 150000
}
```

**📌 Hành động phía Frontend:**

- Trong Admin Dashboard, khi tạo biến thể, bạn cần gọi API lấy danh sách Màu/Size (xem mục 4 bên dưới) để render ra thẻ `<select>` hoặc `<Select>` của Ant Design cho người dùng chọn, sau đó lấy ra `value` là `id` để gửi xuống form.

---

## 3. Cập nhật trang Giỏ Hàng (Cart)

API `GET /api/v1/user/carts` trả về cấu trúc mới do `variant` bên trong `cartItems` cũng thay đổi theo.

**📌 Hành động phía Frontend:**

- Trong Component Giỏ hàng, khi in tên màu và size của từng sản phẩm, đổi từ:
  `item.variant.color` ➡️ `item.variant.color.name`
  `item.variant.size` ➡️ `item.variant.size.name`

---

## 4. Các API Mới để lấy dữ liệu (Public)

Bạn có thể gọi 2 API sau mà không cần token để lấy toàn bộ danh sách Màu sắc và Kích cỡ nhằm đổ vào các dropdown, filter...

- **`GET /api/v1/colors`**
  - Trả về: `[ { "id": 1, "name": "Đỏ", "hexCode": "#FF0000" }, ... ]`
- **`GET /api/v1/sizes`**
  - Trả về: `[ { "id": 1, "name": "M", "description": "Dưới 50kg" }, ... ]`

_(Dữ liệu từ 2 API này đã được Backend Cache siêu tốc bằng Redis, bạn có thể gọi thoải mái ở mọi màn hình không sợ lag)._

---

## 5. API Tra cứu/Xem đơn hàng (KHÔNG cần sửa đổi)

Tin vui là ở trang **Chi tiết đơn hàng** hoặc API **Chatbot** tra cứu đơn, Backend đã tự động làm phẳng (Flatten) dữ liệu thành `item.color` và `item.size` (kiểu chuỗi) như cũ. Bạn **không cần phải sửa đổi** bất cứ đoạn code nào ở phần Lịch sử Đơn hàng.

---

_Vui lòng search (Ctrl + Shift + F) toàn bộ project Frontend các từ khóa `.color` và `.size` ở các thư mục liên quan đến product/cart để sửa một lượt tránh lỗi màn hình trắng nhé! Cảm ơn team._
