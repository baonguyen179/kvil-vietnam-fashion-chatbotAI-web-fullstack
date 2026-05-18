# Quy trình và Phân quyền Quản lý Kho hàng (Inventory Management Workflow)

Tài liệu này xác định các tác nhân, ca sử dụng và quy tắc nghiệp vụ cốt lõi của hệ thống quản lý kho hàng Kvil, đảm bảo tính thống nhất trong phát triển và vận hành Back-office.

## 1. Hệ thống Tác nhân (Actors)

### A. Tác nhân Con người (Human Actors)
*   **Thủ kho (Warehouse Keeper):** 
    *   Trách nhiệm: Vận hành vật lý, nhập hàng, kiểm đếm.
    *   Use Cases: Nhập kho hàng loạt (Excel), Xem nhật ký biến động kho, Tải tệp mẫu.
*   **Phòng Kế toán (Accountant):** 
    *   Trách nhiệm: Kiểm soát tài sản, đối soát dòng tiền.
    *   Use Cases: Thực hiện bút toán điều chỉnh kho (Adjust), Đối soát giao dịch VNPay, Duyệt hoàn tiền đơn hàng.
*   **Phòng Kinh doanh (Sales):** 
    *   Trách nhiệm: Thúc đẩy doanh số, quản trị danh mục.
    *   Use Cases: Quản lý sản phẩm/biến thể, Thiết lập khuyến mãi, Xem tồn kho (Read-only), Duyệt đơn hàng/trả hàng.
*   **Super Admin:** 
    *   Trách nhiệm: Quản trị hệ thống toàn cục.
    *   Use Cases: Quản lý nhân sự (Users), Phân quyền ma trận (Roles/Permissions), Giám sát Dashboard.

### B. Tác nhân Hệ thống (System Actor)
*   **VNPay:** Tự động xác thực giao dịch trực tuyến.
*   **Internal System:** Tự động khấu trừ tồn kho khi có đơn hàng (Order) và hoàn tồn khi hủy đơn/trả hàng (Return).

---

## 2. Danh sách Ca sử dụng Cốt lõi (Core Use Cases)

| Tên ca sử dụng | Tác nhân chính | Route / Controller |
| :--- | :--- | :--- |
| **Xem Nhật ký kho** | Thủ kho, Kế toán | `GET /admin/inventory/logs` |
| **Nhập kho hàng loạt** | Thủ kho | `POST /admin/inventory/import` |
| **Bút toán điều chỉnh** | Kế toán | `POST /admin/inventory/adjust` |
| **Đối soát Thanh toán** | Kế toán | `GET /admin/payments/transactions` |
| **Đồng bộ VNPay** | Kế toán, Sales | `PATCH /admin/orders/:id/vnpay-sync` |
| **Quản lý Sản phẩm** | Sales | `POST/PUT /admin/products` |
| **Duyệt Trả hàng** | Sales | `PATCH /admin/orders/returns/:id/status` |

---

## 3. Quy tắc Nghiệp vụ (Business Rules)

### 3.1. Kiến trúc Nhật ký biến động (Event Sourcing)
*   Tuyệt đối KHÔNG cho phép sửa đè trực tiếp cột `stock` trong bảng `ProductVariants`.
*   Mọi thay đổi tồn kho phải thông qua bảng `InventoryLogs`.
*   Hệ thống tự động tính toán tồn kho dựa trên các bản ghi Log (Delta).

### 3.2. Tính toàn vẹn (ACID & Row Locking)
*   Khi thực hiện nhập kho hoặc điều chỉnh kho, bắt buộc sử dụng **Sequelize Transaction**.
*   Sử dụng `lock: true` (SELECT ... FOR UPDATE) trên dòng biến thể đang cập nhật để tránh lỗi **Race Condition** khi có nhiều người cùng nhập hàng hoặc khách đang đặt hàng cùng lúc.

### 3.3. Quy trình Sửa sai (Compensating Transaction)
*   Nếu phát hiện lỗi nhập liệu, tác nhân Kế toán phải dùng chức năng **Điều chỉnh kho (Adjust)** để tạo một bản ghi bù trừ (Ví dụ: -5 để giảm bớt 5 sản phẩm nhập thừa).
*   Ghi chú (Note) trong bút toán điều chỉnh là bắt buộc và phải có độ dài tối thiểu 10 ký tự để giải trình lý do.

---

## 4. Ghi chú Phân quyền (RBAC)
*   Quyền `inventory.read`: Gán cho Thủ kho, Kế toán, Sales.
*   Quyền `inventory.update`: Chỉ gán cho Thủ kho (đối với Import) và Kế toán (đối với Adjust).
*   Quyền `orders.update`: Gán cho Sales để duyệt đơn.
