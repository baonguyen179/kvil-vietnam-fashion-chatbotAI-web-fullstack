# PROJECT RULES — Kvil Fashion Backend

> ⚠️ **AI AGENT: Đọc file này TRƯỚC KHI đề xuất hoặc viết bất kỳ code nào cho dự án này.**
> Mọi code được tạo ra phải tuân thủ toàn bộ các quy tắc dưới đây.

---

## 0. Nguyên tắc cốt lõi

- **Đóng vai Senior Fullstack Engineer** — Không viết code kiểu demo hay quick-fix.
- **Production-ready** — Mọi code phải sẵn sàng chạy trên môi trường thực (Render.com).
- **Scoped changes** — Chỉ sửa đúng phạm vi yêu cầu. Không refactor lan sang phần khác.
- **Hỏi lại nếu thiếu context** — Nếu không rõ format API, schema, hoặc lib đang dùng → PHẢI hỏi trước.

---

## 1. Ngôn ngữ & Runtime

> **Dự án hiện tại dùng JavaScript (CommonJS)**. Không tự ý chuyển sang TypeScript.

- Runtime: **Node.js**
- Module system: **CommonJS** (`require` / `module.exports`)
- Dev server: **Nodemon** (`npm run dev`)
- Không setup TypeScript, ts-node, tsx trừ khi có yêu cầu rõ ràng từ người dùng.

---

## 2. Kiến trúc & Code Style

### 2.1 Phân lớp bắt buộc
```
Routes → Controllers → Services → Models (DB) / Helpers (Utilities)
```

- **Routes**: Chỉ khai báo path + middleware + controller. Không có logic.
- **Controllers**: Nhận req → validate (Joi) → gọi service → trả res. Không có DB query.
- **Services**: Toàn bộ business logic + truy vấn DB. Luôn trả `{ EC, EM, DT }`.
- **Models**: Chỉ định nghĩa schema + associations. Không có logic nghiệp vụ.

### 2.2 Single Responsibility
- Mỗi file **không quá ~200 dòng**. Tách function nếu file quá dài.
- Mỗi function làm **đúng 1 việc**, đặt tên rõ ràng (không viết tắt khó hiểu).

### 2.3 Response format chuẩn
```js
// Mọi service PHẢI trả về format này.
// Mã EC (Error Code) BẮT BUỘC tuân theo file src/config/errorCodes.js
return { EC: 0, EM: 'Thành công', DT: data };               // EC: 0 (SUCCESS)
return { EC: 5, EM: 'Không tìm thấy sản phẩm', DT: '' };    // EC: 5 (NOT_FOUND)
return { EC: -1, EM: 'Lỗi hệ thống', DT: '' };             // EC: -1 (OTHER_ERROR)
```

---

## 3. Tài liệu API

- **KHÔNG setup Swagger, OpenAPI, hay bất kỳ công cụ sinh tài liệu tự động nào.**
- Tài liệu API được viết tay trong `API.md` và `doc/chatbot.md`.
- Mỗi endpoint **comment rõ ràng** ngay trên dòng route:

```js
// [GET] Lấy danh sách sản phẩm — Public, phân trang, lọc động
router.get('/products', productController.handleGetAllProducts);
```

---

## 4. Validation

- **Bắt buộc dùng Joi** cho tất cả input từ client (body, params, query).
- Schema đặt trong `src/validations/{domain}Validation.js`.
- Validate trong Controller **trước khi** gọi Service.

---

## 5. Error Handling & Edge Cases

Mọi feature PHẢI xử lý đủ các trạng thái:

| State | Bắt buộc |
|:---|:---:|
| Loading / Processing | ✅ |
| Success | ✅ |
| Error (API fail, timeout) | ✅ |
| Empty (không có dữ liệu) | ✅ |
| Not Found | ✅ |
| Unauthorized / Forbidden | ✅ |

**Edge cases bắt buộc phải cover:**
- `null` / `undefined` / empty string từ input
- DB query timeout
- Redis down → fallback gracefully (không crash)
- Race condition (dùng DB Transaction + pessimistic lock khi cần)
- Memory leak (đặc biệt với async/await trong loops — dùng `Promise.all` hợp lý)

---

## 6. Performance

- **Redis Cache**: Mọi GET query nặng PHẢI có cache (xem `ARCHITECTURE.md` mục 5 cho TTL chuẩn).
- **Khi update/delete**: Phải `delCache` hoặc `delByPattern` tương ứng.
- **Pagination**: Data list PHẢI có phân trang (mặc định `limit=10`).
- **Parallel**: Dùng `Promise.all()` khi các async ops độc lập nhau.
- **Tránh N+1**: Dùng Sequelize `include` thay vì query trong loop.
- **Attribute select**: Luôn chỉ định `attributes: [...]` trong query Sequelize.

---

## 7. Database & Sequelize

- Dùng **Migrations** cho mọi thay đổi schema (không `sync({ force: true })`).
- **Soft delete** (`paranoid: true`) cho các model quan trọng (Products).
- **DB Transaction** cho mọi operation ảnh hưởng nhiều bảng (đặt hàng, refund, review).
- Format `{ EC, EM, DT }` thống nhất kể cả khi không có data (`DT: ''` hoặc `DT: []`).

---

## 8. Authentication & Authorization

- JWT lưu trong **HttpOnly Cookie** (không localStorage).
- Middleware `JWTAction.checkUserJWT` → xác thực token.
- Middleware `JWTAction.checkUserPermission([], ['permission.name'])` → kiểm tra quyền.
- `optionalAuth` → cho phép cả user lẫn guest (ví dụ: tạo đơn hàng).

---

## 9. Môi trường (Dev vs Production)

| Mục | Dev | Production (Render.com) |
|:---|:---|:---|
| **Server** | Nodemon (hot-reload) | `node src/server.js` |
| **DB** | MySQL local | MySQL Cloud |
| **Redis** | Redis local | Redis Cloud |
| **Email** | Nodemailer (real SMTP) | Nodemailer (real SMTP) |
| **Cold start** | N/A | ~30s — timeout-sensitive |
| **Env vars** | `.env` file | Render Environment Variables |

- **Không commit** file `.env` lên Git.
- Luôn dùng `process.env.VARIABLE_NAME` — không hardcode giá trị nhạy cảm.
- Khi deploy Render: cẩn thận **case-sensitive** filesystem (Linux) — import path phải đúng hoa/thường.

---

## 10. Quy tắc đặt tên

| Loại | Convention | Ví dụ |
|:---|:---|:---|
| File | camelCase | `orderService.js`, `JWTAction.js` |
| Function | camelCase, động từ rõ ràng | `handleGetAdminOrders`, `getUserOrdersShort` |
| Variable | camelCase | `finalProducts`, `cacheKey` |
| Constant | UPPER_SNAKE_CASE | `PRODUCT_CACHE_TTL`, `MIN_REVIEW_COUNT` |
| Model | PascalCase | `ProductVariant`, `OrderItem` |
| DB Column | camelCase (Sequelize) | `ratingAvg`, `reviewCount` |

---

## 11. Commit Message

Format: `type: mô tả tiếng Việt ngắn gọn`

| Type | Khi nào dùng |
|:---|:---|
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Cấu trúc lại không thay đổi behavior |
| `docs` | Cập nhật tài liệu |
| `perf` | Tối ưu hiệu năng |
| `chore` | Config, dependency, build |

Ví dụ: `feat: thêm chatbot tool tra cứu sản phẩm đánh giá cao`

---

## 12. File/Folder không được sửa khi không có lý do

- `src/models/index.js` — File auto-load của Sequelize
- `src/config/errorCodes.js` — Chuẩn hóa mã lỗi toàn dự án
- `src/middleware/JWTAction.js` — Logic auth core
- `.gitignore`
