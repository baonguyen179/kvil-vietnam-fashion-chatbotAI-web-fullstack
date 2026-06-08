# KVIL — Dashboard Báo Cáo Kinh Doanh

> **Mục tiêu:** Cung cấp đủ thông tin cho cuộc họp tuần/tháng của ban lãnh đạo.  
> **Actor:** SALES, ACCOUNTANT, SUPER_ADMIN.  
> **Nguồn dữ liệu:** Toàn bộ từ schema hiện có — không thêm bảng mới.

---

## NHÓM 1 — TỔNG QUAN KINH DOANH

### 1.1 Doanh thu
```sql
-- Hôm nay
SELECT SUM(finalAmount) FROM Orders
WHERE status='delivered' AND DATE(createdAt) = CURDATE();

-- Tuần này
SELECT SUM(finalAmount) FROM Orders
WHERE status='delivered' AND YEARWEEK(createdAt) = YEARWEEK(NOW());

-- Tháng này vs tháng trước
SELECT
  SUM(CASE WHEN MONTH(createdAt)=MONTH(NOW()) THEN finalAmount ELSE 0 END) AS thisMonth,
  SUM(CASE WHEN MONTH(createdAt)=MONTH(NOW())-1 THEN finalAmount ELSE 0 END) AS lastMonth
FROM Orders WHERE status='delivered';
-- % tăng trưởng = (thisMonth - lastMonth) / lastMonth * 100
```

### 1.2 Đơn hàng
```sql
SELECT
  COUNT(*) AS total,
  SUM(status='delivered')  AS success,
  SUM(status='cancelled')  AS cancelled,
  SUM(status='returned')   AS returned
FROM Orders
WHERE MONTH(createdAt) = MONTH(NOW());
```

### 1.3 Khách hàng & AOV
```sql
-- Khách mới trong tháng (lần đầu đặt hàng)
SELECT COUNT(DISTINCT userId) FROM Orders
WHERE MONTH(createdAt)=MONTH(NOW())
AND userId NOT IN (
  SELECT DISTINCT userId FROM Orders WHERE createdAt < DATE_FORMAT(NOW(),'%Y-%m-01')
);

-- Khách quay lại (đặt >= 2 đơn, đơn gần nhất trong tháng này)
SELECT COUNT(DISTINCT userId) FROM Orders
WHERE MONTH(createdAt)=MONTH(NOW())
AND userId IN (
  SELECT userId FROM Orders GROUP BY userId HAVING COUNT(*) >= 2
);

-- AOV (Average Order Value)
SELECT AVG(finalAmount) AS aov FROM Orders
WHERE status='delivered' AND MONTH(createdAt)=MONTH(NOW());
```

---

## NHÓM 2 — SẢN PHẨM BÁN CHẠY NHẤT

```sql
SELECT
  p.name,
  SUM(oi.quantity) AS totalSold
FROM OrderItems oi
JOIN ProductVariants pv ON pv.id = oi.variantId
JOIN Products p ON p.id = pv.productId
JOIN Orders o ON o.id = oi.orderId
WHERE o.status = 'delivered'
  AND o.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.id
ORDER BY totalSold DESC
LIMIT 10;
```
**Dùng để:** Nhập thêm hàng, ưu tiên quảng cáo, đẩy lên trang chủ.

---

## NHÓM 3 — SẢN PHẨM BÁN CHẬM NHẤT

```sql
-- Sản phẩm có hàng trong kho nhưng bán ít nhất 30 ngày qua
SELECT
  p.name,
  COALESCE(SUM(oi.quantity), 0) AS totalSold,
  SUM(pv.stock) AS currentStock
FROM Products p
JOIN ProductVariants pv ON pv.productId = p.id
LEFT JOIN OrderItems oi ON oi.variantId = pv.id
  AND oi.orderId IN (
    SELECT id FROM Orders WHERE status='delivered'
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  )
GROUP BY p.id
HAVING currentStock > 0
ORDER BY totalSold ASC
LIMIT 10;
```
**Dùng để:** Flash sale, giảm giá, xả kho, ngừng sản xuất.

---

## NHÓM 4 — CẢNH BÁO SẮP HẾT HÀNG

```sql
SELECT
  p.name AS product,
  s.name AS size,
  c.name AS color,
  pv.stock
FROM ProductVariants pv
JOIN Products p ON p.id = pv.productId
JOIN Sizes s ON s.id = pv.sizeId
JOIN Colors c ON c.id = pv.colorId
WHERE pv.stock < 10 AND pv.stock > 0
ORDER BY pv.stock ASC;
```
**Ngưỡng:** `stock < 10` → cảnh báo vàng | `stock < 3` → cảnh báo đỏ.  
**Dùng để:** Yêu cầu sản xuất thêm, nhập nguyên liệu.

---

## NHÓM 5 — HÀNG TỒN KHO NHIỀU (CHÔN VỐN)

```sql
SELECT
  p.name,
  SUM(pv.stock) AS totalStock,
  SUM(pv.stock * il_avg.avgCost) AS estimatedValue -- giá trị vốn bị chôn
FROM Products p
JOIN ProductVariants pv ON pv.productId = p.id
LEFT JOIN (
  SELECT variantId,
    SUM(quantity * costPrice) / NULLIF(SUM(quantity), 0) AS avgCost
  FROM InventoryLogs WHERE type='IN' AND costPrice > 0
  GROUP BY variantId
) il_avg ON il_avg.variantId = pv.id
GROUP BY p.id
HAVING totalStock > 100   -- ngưỡng tùy chỉnh
ORDER BY totalStock DESC
LIMIT 10;
```
**Dùng để:** Biết kho đang chôn vốn bao nhiêu, ưu tiên đẩy bán.

---

## NHÓM 6 — TỐC ĐỘ BÁN HÀNG (SELL-THROUGH RATE)

```sql
SELECT
  p.name,
  SUM(oi.quantity)                               AS sold30d,
  SUM(il_in.totalIn)                             AS imported30d,
  ROUND(SUM(oi.quantity) / NULLIF(SUM(il_in.totalIn),0) * 100, 1) AS sellThroughRate
FROM Products p
JOIN ProductVariants pv ON pv.productId = p.id
LEFT JOIN (
  SELECT variantId, SUM(quantity) AS totalIn FROM InventoryLogs
  WHERE type='IN' AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  GROUP BY variantId
) il_in ON il_in.variantId = pv.id
LEFT JOIN OrderItems oi ON oi.variantId = pv.id
  AND oi.orderId IN (
    SELECT id FROM Orders WHERE status='delivered'
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  )
GROUP BY p.id
ORDER BY sellThroughRate DESC;
```

| Sell-through Rate | Ý nghĩa | Hành động |
|-------------------|---------|-----------|
| > 80% | Bán rất tốt | Nhập thêm ngay |
| 50% – 80% | Bình thường | Theo dõi |
| < 30% | Bán chậm | Flash sale / ngừng sản xuất |

---

## NHÓM 7 — DOANH THU THEO DANH MỤC

```sql
SELECT
  cat.name AS category,
  SUM(oi.price * oi.quantity) AS revenue
FROM OrderItems oi
JOIN ProductVariants pv ON pv.id = oi.variantId
JOIN Products p ON p.id = pv.productId
JOIN Categories cat ON cat.id = p.categoryId
JOIN Orders o ON o.id = oi.orderId
WHERE o.status = 'delivered'
  AND MONTH(o.createdAt) = MONTH(NOW())
GROUP BY cat.id
ORDER BY revenue DESC;
```
**Dùng để:** Biết nhóm sản phẩm nào là nguồn thu chính để ưu tiên đầu tư.

---

## NHÓM 8 — LỢI NHUẬN GỘP (CẦN costPrice Ở OrderItems)

```sql
SELECT
  MONTH(o.createdAt)                              AS month,
  SUM(oi.price * oi.quantity)                     AS revenue,
  SUM(oi.costPrice * oi.quantity)                 AS cogs,
  SUM((oi.price - oi.costPrice) * oi.quantity)    AS grossProfit,
  ROUND(
    SUM((oi.price - oi.costPrice) * oi.quantity)
    / NULLIF(SUM(oi.price * oi.quantity), 0) * 100
  , 1)                                            AS marginPercent
FROM Orders o
JOIN OrderItems oi ON oi.orderId = o.id
WHERE o.status = 'delivered'
GROUP BY MONTH(o.createdAt)
ORDER BY month DESC;
```
> **Yêu cầu:** `OrderItems.costPrice` đã được lưu tại thời điểm tạo đơn (xem file kvil-fifo-costing.md).

---

## NHÓM 9 — TOP KHÁCH HÀNG

```sql
SELECT
  u.fullName,
  u.email,
  COUNT(o.id)          AS orderCount,
  SUM(o.finalAmount)   AS totalSpent
FROM Users u
JOIN Orders o ON o.userId = u.id
WHERE o.status = 'delivered'
GROUP BY u.id
ORDER BY totalSpent DESC
LIMIT 10;
```
**Dùng để:** Tặng voucher, gán nhãn VIP, chăm sóc ưu tiên.

---

## NHÓM 10 — HIỆU QUẢ MÃ GIẢM GIÁ

```sql
SELECT
  c.code,
  c.discountType,
  c.discountValue,
  COUNT(o.id)              AS usedCount,
  SUM(o.discountAmount)    AS totalDiscounted,
  SUM(o.finalAmount)       AS revenueGenerated
FROM Coupons c
JOIN Orders o ON o.couponId = c.id
WHERE o.status = 'delivered'
  AND MONTH(o.createdAt) = MONTH(NOW())
GROUP BY c.id
ORDER BY usedCount DESC;
```
**Dùng để:** Biết mã nào hiệu quả, mã nào nên dừng hoặc điều chỉnh.

---

## API ENDPOINTS — ĐỀ XUẤT

```
GET /api/reports/overview          → Nhóm 1 (doanh thu + đơn + khách)
GET /api/reports/top-products      → Nhóm 2 (bán chạy)
GET /api/reports/slow-products     → Nhóm 3 (bán chậm)
GET /api/reports/low-stock         → Nhóm 4 (sắp hết)
GET /api/reports/overstock         → Nhóm 5 (tồn nhiều)
GET /api/reports/sell-through      → Nhóm 6 (tốc độ bán)
GET /api/reports/revenue-by-category → Nhóm 7
GET /api/reports/profit            → Nhóm 8 (lợi nhuận gộp)
GET /api/reports/top-customers     → Nhóm 9
GET /api/reports/coupon-performance → Nhóm 10

-- Query params chung:
?from=2025-06-01&to=2025-06-30   -- lọc theo khoảng thời gian
?limit=10                         -- giới hạn kết quả
```

**Phân quyền:**
- `SALES` → được truy cập nhóm 1,2,3,4,5,6,7,10
- `ACCOUNTANT` → được truy cập nhóm 1,7,8,9,10
- `SUPER_ADMIN` → toàn bộ

---

## SCHEMA DELTA — KHÔNG CẦN GÌ THÊM

Tất cả 10 nhóm báo cáo đều dùng schema hiện có.  
Điều kiện duy nhất: `OrderItems.costPrice` đã được implement (xem kvil-fifo-costing.md).

---

*Phục vụ: Họp kinh doanh tuần/tháng — Ban lãnh đạo KVIL KO-ISAN*
