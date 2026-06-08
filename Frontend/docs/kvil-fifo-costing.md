# KVIL — Tính Lời Lỗ Chính Xác: Bình Quân Gia Quyền (AVG)

> **Mức áp dụng:** Mức 2 — Biết lời lỗ chính xác. Phù hợp shop nhỏ, chuẩn VAS Việt Nam.  
> **Nguyên tắc:** Chỉ thêm 1 cột `costPrice` vào `InventoryLogs`. Không thêm bảng mới.

---

## 1. NGUYÊN LÝ

```
Mỗi lần nhập kho → ghi giá vốn lô đó vào InventoryLogs.costPrice
Khi bán → tính avgCostPrice từ tất cả lô còn trong kho
Lãi gộp = giá bán - avgCostPrice
```

**Ví dụ:**

| Lô                 | Số lượng     | Giá vốn | Thành tiền |
| ------------------ | ------------ | ------- | ---------- |
| Lô 1 (tháng trước) | 10 chiếc     | 200k    | 2.000k     |
| Lô 2 (hôm nay)     | 10 chiếc     | 250k    | 2.500k     |
| **Tổng kho**       | **20 chiếc** | —       | **4.500k** |

```
avgCostPrice = 4.500k / 20 = 225k

Bán 1 chiếc giá 350k → lãi = 350k - 225k = 125k
Bán 1 chiếc giá 300k → lãi = 300k - 225k = 75k
```

---

## 2. THAY ĐỔI DB — CHỈ THÊM 1 CỘT

```sql
ALTER TABLE InventoryLogs ADD COLUMN costPrice DECIMAL(15,2) DEFAULT 0;
-- Chỉ điền khi type = 'IN'. Các type khác để 0.
```

> Không thêm bảng mới. Không breaking change.

---

## 3. LOGIC CODE

### Nhập kho (type = IN)

```javascript
// Nhân viên KD nhập thêm bắt buộc điền costPrice
await InventoryLogs.create({
  variantId,
  userId,
  type: "IN",
  quantity: 10,
  costPrice: 200000, // ← bắt buộc > 0 khi type=IN
  note: "Lô hè 2025",
});
await ProductVariants.increment("stock", { by: 10, where: { id: variantId } });
```

### Tính avgCostPrice khi bán

```javascript
async function getAvgCostPrice(variantId) {
  // Lấy tất cả lô IN còn đóng góp vào kho hiện tại
  const logs = await InventoryLogs.findAll({
    where: { variantId, type: "IN", costPrice: { [Op.gt]: 0 } },
  });

  const totalQty = logs.reduce((s, l) => s + l.quantity, 0);
  const totalCost = logs.reduce(
    (s, l) => s + l.quantity * parseFloat(l.costPrice),
    0,
  );

  return totalQty > 0 ? totalCost / totalQty : 0;
  // (10×200k + 10×250k) / 20 = 225k
}
```

### Ghi lãi vào OrderItems khi tạo đơn

```javascript
// Trong transaction tạo đơn hàng — thêm 2 dòng này
const avgCost = await getAvgCostPrice(item.variantId);
await OrderItems.create({
  orderId,
  variantId: item.variantId,
  quantity: item.quantity,
  price: item.currentPrice, // giá bán snapshot
  costPrice: avgCost, // ← thêm cột này vào OrderItems
});
```

> Thêm cột `costPrice DECIMAL(15,2) DEFAULT 0` vào `OrderItems` để lưu snapshot giá vốn tại thời điểm bán.

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
| Nhập lô mới giá cao hơn | avgCostPrice tự tăng lên, áp dụng cho các đơn tiếp theo                                       |
| Hủy đơn                 | Hoàn stock bình thường, avgCost không đổi (không cần revert)                                  |
| Hàng trả về (Return)    | Ghi `InventoryLogs(type='RETURN', costPrice=giá vốn lúc bán)` — lấy từ `OrderItems.costPrice` |
| Admin đổi giá bán       | Không ảnh hưởng gì — costPrice và price độc lập                                               |
| Bán lỗ (flash sale)     | Hệ thống vẫn chạy, Dashboard hiện grossProfit âm → cảnh báo                                   |
| Điều chỉnh kho (ADJUST) | Ghi `costPrice = avgCostPrice hiện tại` của variant đó                                        |

---

## 6. SCHEMA DELTA TỔNG KẾT

```sql
-- 1. Thêm vào InventoryLogs (đã có sẵn bảng)
ALTER TABLE InventoryLogs ADD COLUMN costPrice DECIMAL(15,2) DEFAULT 0;

-- 2. Thêm vào OrderItems (đã có sẵn bảng)
ALTER TABLE OrderItems ADD COLUMN costPrice DECIMAL(15,2) DEFAULT 0;
```

**Chỉ 2 dòng ALTER. Không bảng mới. Không thay đổi logic cũ.**

---

_Phương pháp: Weighted Average Cost (Bình quân gia quyền) — chuẩn VAS Việt Nam_  
_Phù hợp: Shop thời trang quy mô vừa và nhỏ như KVIL KO-ISAN_
