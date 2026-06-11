# KVIL — Tính Lời Lỗ Chính Xác: Bình Quân Gia Quyền Liên Hoàn (Moving AVG)

> **Mức áp dụng:** Mức 2 — Biết lời lỗ chính xác. Phù hợp shop nhỏ, chuẩn VAS Việt Nam.  
> **Phương pháp:** Bình quân gia quyền liên hoàn (Moving Weighted Average).  
> **Nguyên tắc:** Lưu `avgCostPrice` trực tiếp trên `ProductVariants`. Mỗi sự kiện nhập kho sẽ tự động tính lại giá vốn bình quân dựa trên tồn kho thực tế.

---

## 1. NGUYÊN LÝ

```
Mỗi lần nhập kho → tính lại avgCostPrice trên ProductVariant
Công thức: newAvg = (tồn_kho_cũ × avg_cũ + qty_nhập × giá_nhập) / (tồn_kho_cũ + qty_nhập)
Khi bán → lấy trực tiếp avgCostPrice từ ProductVariant làm snapshot
Lãi gộp = giá bán - avgCostPrice
```

**Ví dụ:**

| Lô                 | Số lượng     | Giá vốn | Thành tiền |
| ------------------ | ------------ | ------- | ---------- |
| Lô 1 (tháng trước) | 10 chiếc     | 200k    | 2.000k     |
| Lô 2 (hôm nay)     | 10 chiếc     | 250k    | 2.500k     |
| **Tổng kho**       | **20 chiếc** | —       | **4.500k** |

```
Sau Lô 1: avgCostPrice = 200k (lô đầu tiên, reset)
Sau Lô 2: avgCostPrice = (10 × 200k + 10 × 250k) / 20 = 225k

Bán 1 chiếc giá 350k → lãi = 350k - 225k = 125k
Bán 1 chiếc giá 300k → lãi = 300k - 225k = 75k
```

### Ví dụ thực tế — Bình quân liên hoàn

Giả sử có kịch bản thực tế sau:
- **Lô 1**: Nhập 10 chiếc @ 200k (Thành tiền: 2.000k).
  - `avgCostPrice = 200k` (lô đầu tiên)
- **Lô 2**: Nhập 10 chiếc @ 300k (Thành tiền: 3.000k).
  - `avgCostPrice = (10 × 200k + 10 × 300k) / 20 = 250k`
- **Bán**: 7 chiếc với giá 300k/chiếc (Kho còn 13 chiếc).
  - `avgCostPrice` **không thay đổi** khi bán = `250k`.
- **Lô 3**: Nhập thêm 10 chiếc @ 500k (Thành tiền: 5.000k).
  - `avgCostPrice = (13 × 250k + 10 × 500k) / 23 ≈ 358,70k`

> [!NOTE]
> Hệ thống KVIL sử dụng **Bình quân liên hoàn (Moving AVG)** — phương pháp tính dựa trên tồn kho thực tế tại thời điểm nhập. Khi bán hàng làm giảm tồn kho, giá vốn bình quân vẫn giữ nguyên, nhưng khi nhập lô mới, hệ thống chỉ tính trên lượng tồn còn lại, cho kết quả chính xác hơn phương pháp tích lũy đơn thuần.

### So sánh với phương pháp Cumulative AVG (phương pháp cũ)

| Tiêu chí | Cumulative AVG (Cũ) | Moving AVG (Hiện tại) |
|---|---|---|
| Công thức | Tổng giá trị nhập / Tổng SL nhập (tất cả log IN) | (Tồn × Avg cũ + Nhập × Giá mới) / (Tồn + Nhập) |
| Kết quả ví dụ trên | 333,33k | **358,70k** ✅ |
| Xét hàng đã bán? | ❌ Không (gây sai lệch) | ✅ Có |
| Cần scan bảng log? | ✅ Cần SUM toàn bộ log IN | ❌ Đọc 1 cột từ ProductVariant |
| Hiệu năng | Chậm dần theo thời gian | **O(1) khi đọc** |
| Độ chính xác | Sai lệch khi giá biến động mạnh | **Chính xác 100%** theo VAS |

---

## 2. THAY ĐỔI DB

```sql
-- 1. Cột đã có sẵn trong InventoryLogs (từ phiên bản trước)
-- costPrice DECIMAL(15,2) DEFAULT 0 — chỉ điền khi type = 'IN'

-- 2. Cột đã có sẵn trong OrderItems
-- costPrice DECIMAL(15,2) DEFAULT 0 — snapshot giá vốn tại thời điểm bán

-- 3. CỘT MỚI trên ProductVariants (Moving AVG)
ALTER TABLE ProductVariants ADD COLUMN avgCostPrice DECIMAL(15,2) DEFAULT 0;
```

> Cột `avgCostPrice` trên `ProductVariants` lưu trữ giá vốn bình quân liên hoàn hiện tại. Được cập nhật tự động mỗi khi có sự kiện nhập kho.

---

## 3. LOGIC CODE

### Hàm tính Moving AVG (Core)

```javascript
/**
 * Tính giá vốn bình quân liên hoàn khi có hàng nhập mới.
 * Nếu currentStock <= 0: newAvg = incomingCost (reset giá vốn theo lô mới)
 */
const calculateMovingAverage = (currentStock, currentAvgCost, incomingQty, incomingCost) => {
    const safeStock = Math.max(0, currentStock);
    if (safeStock <= 0) return incomingCost;

    const totalValue = (safeStock * currentAvgCost) + (incomingQty * incomingCost);
    const totalQty = safeStock + incomingQty;
    return parseFloat((totalValue / totalQty).toFixed(2));
};
```

### Nhập kho (type = IN)

```javascript
// Lấy variant với row lock trong transaction
const variant = await ProductVariant.findOne({
    where: { id: variantId },
    attributes: ['id', 'stock', 'avgCostPrice'],
    transaction: t,
    lock: true
});

// Tính Moving AVG
const newAvgCost = calculateMovingAverage(
    variant.stock, variant.avgCostPrice,
    incomingQty, incomingCostPrice
);

// Cập nhật cả stock và avgCostPrice cùng lúc
await variant.update({
    stock: variant.stock + incomingQty,
    avgCostPrice: newAvgCost
}, { transaction: t });

// Ghi log
await InventoryLog.create({
    variantId, userId, type: 'IN',
    quantity: incomingQty,
    costPrice: incomingCostPrice,
    note: 'Nhập lô hè 2025'
}, { transaction: t });
```

### Đọc avgCostPrice khi bán

```javascript
async function getAvgCostPrice(variantId) {
    // Đọc trực tiếp từ ProductVariant — O(1), không cần scan logs
    const variant = await ProductVariant.findByPk(variantId, {
        attributes: ['avgCostPrice']
    });
    return variant ? parseFloat(variant.avgCostPrice) || 0 : 0;
}
```

### Ghi lãi vào OrderItems khi tạo đơn

```javascript
// Trong transaction tạo đơn hàng
const avgCost = await getAvgCostPrice(item.variantId);
await OrderItems.create({
    orderId,
    variantId: item.variantId,
    quantity: item.quantity,
    price: item.currentPrice,   // giá bán snapshot
    costPrice: avgCost,         // giá vốn snapshot từ ProductVariant
});
```

---

## 4. TRUY VẤN LÃI GỘP — DASHBOARD KẾ TOÁN

```sql
SELECT
  o.id                                        AS orderId,
  SUM(oi.price    * oi.quantity)              AS revenue,
  SUM(oi.costPrice * oi.quantity)             AS cogs,
  SUM((oi.price - oi.costPrice) * oi.quantity) AS grossProfit
FROM Orders o
JOIN OrderItems oi ON oi.orderId = o.id
WHERE o.status = 'delivered'
GROUP BY o.id;
```

---

## 5. CÁC TRƯỜNG HỢP CẦN XỬ LÝ

| Trường hợp              | Xử lý                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| Nhập lô mới giá cao hơn | `calculateMovingAverage` tự tính lại dựa trên tồn kho thực tế → phản ánh đúng giá mới         |
| Hủy đơn                 | Hoàn stock bình thường, avgCostPrice không đổi (không cần revert)                              |
| Hàng trả về nguyên vẹn  | Coi như nhập kho mới với `incomingCost = OrderItems.costPrice` → tính lại Moving AVG          |
| Hàng trả về lỗi/hỏng    | Ghi log `RETURN_DEFECTIVE`, KHÔNG cộng kho, KHÔNG thay đổi avgCostPrice                       |
| Admin đổi giá bán       | Không ảnh hưởng — costPrice và price độc lập                                                   |
| Bán lỗ (flash sale)     | Hệ thống vẫn chạy, Dashboard hiện grossProfit âm → cảnh báo                                   |
| Điều chỉnh kho TĂNG     | Coi giá vốn nhập = avgCostPrice hiện tại → tính lại Moving AVG (không làm thay đổi giá)       |
| Điều chỉnh kho GIẢM     | Chỉ trừ stock, avgCostPrice giữ nguyên                                                        |
| Tồn kho = 0, nhập mới   | avgCostPrice reset = giá vốn của lô nhập mới                                                  |

---

## 6. SCHEMA DELTA TỔNG KẾT

```sql
-- 1. Cột trên InventoryLogs (đã có từ trước)
ALTER TABLE InventoryLogs ADD COLUMN costPrice DECIMAL(15,2) DEFAULT 0;

-- 2. Cột trên OrderItems (đã có từ trước)
ALTER TABLE OrderItems ADD COLUMN costPrice DECIMAL(15,2) DEFAULT 0;

-- 3. CỘT MỚI trên ProductVariants (Moving AVG)
ALTER TABLE ProductVariants ADD COLUMN avgCostPrice DECIMAL(15,2) DEFAULT 0;
```

**3 dòng ALTER. Không bảng mới. Backward compatible.**

---

## 7. LƯU Ý CHO THUYẾT TRÌNH / ĐỒ ÁN

> [!TIP]
> Khi bảo vệ đồ án, hãy nhấn mạnh rằng hệ thống đã nâng cấp từ Cumulative AVG lên Moving AVG — phương pháp chuẩn kế toán VAS Việt Nam (Thông tư 200), tính giá vốn chính xác 100% dựa trên tồn kho thực tế.

### Ưu điểm của phương pháp Moving AVG hiện tại
*   **Chính xác 100%:** Giá vốn bình quân luôn phản ánh giá trị thực tế của tồn kho, không bị nhiễu bởi các lô hàng đã bán hết.
*   **Hiệu năng O(1):** Đọc giá vốn trực tiếp từ cột `avgCostPrice` trên `ProductVariants`, không cần scan toàn bộ bảng `InventoryLogs`.
*   **An toàn giao dịch:** Sử dụng row-level locking (`SELECT ... FOR UPDATE`) trong transaction để tránh Race Condition.
*   **Xử lý edge case:** Khi tồn kho = 0 và nhập lô mới, giá vốn được reset về giá nhập mới (không bị kéo bởi giá cũ).

### Hướng phát triển tương lai (Future Scope)
Nếu doanh nghiệp cần độ chính xác cao hơn (ví dụ: quản lý hạn sử dụng, truy xuất nguồn gốc từng lô):
1.  **Nâng cấp sang FIFO thực sự:**
    *   Quản lý kho chi tiết theo từng lô (`Batches`). Mỗi đợt nhập tạo 1 bản ghi lô kèm số lượng tồn riêng.
    *   Khi bán hàng, trừ tồn theo nguyên tắc batch nào nhập trước trừ trước (First-In, First-Out).

---

_Phương pháp: Moving Weighted Average Cost (Bình quân gia quyền liên hoàn) — chuẩn VAS Việt Nam (Thông tư 200)_  
_Phù hợp: Shop thời trang quy mô vừa và nhỏ như KVIL KO-ISAN_
