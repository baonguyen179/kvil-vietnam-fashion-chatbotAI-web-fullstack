# CHI TIẾT LUỒNG ĐĂNG NHẬP & XỬ LÝ JWT (AUTHENTICATION & AUTHORIZATION FLOW)

Tài liệu này phân tích chi tiết cơ chế xác thực (Authentication), phân quyền (Authorization) và quy trình tự động làm mới token (Silent Token Refresh) giữa Frontend (React/Redux/Axios) và Backend (NodeJS/Express/Sequelize) trong hệ thống thời trang Kvil.

---

## 1. Sơ đồ kiến trúc tổng quan

Hệ thống sử dụng cơ chế kết hợp song song hai loại Token:

- **Access Token (JWT):** Có hạn sử dụng ngắn ( 15 phút ), lưu ở bộ nhớ tạm (Redux Store) trên Client. Đính kèm trong header `Authorization: Bearer <token>` để gọi API.
- **Refresh Token (JWT):** Có hạn sử dụng dài (7 ngày), lưu trong **HttpOnly Cookie** ở Browser (chống tấn công XSS). Lưu trữ trong database để kiểm tra tính hợp lệ và thu hồi khi cần.

### 1.1 Tóm tắt luồng đăng nhập (Login Flow)

Luồng đăng nhập diễn ra theo các bước tuần tự sau:

1. **Client gửi yêu cầu:** Người dùng điền thông tin đăng nhập trên giao diện. Frontend gửi request `POST /api/v1/auth/login` (kèm `guestSessionId` từ cookie nếu có).
2. **Backend kiểm tra tài khoản:**
   - Kiểm tra định dạng qua Joi Validation ở Controller.
   - Tìm kiếm user trong database bằng `email` .
   - Xác thực mật khẩu thông qua `bcrypt.compare`.
3. **Backend tạo Token & cập nhật DB:**
   - Lấy vai trò (Roles) và quyền hạn (Permissions) từ RBAC Service.
   - Tạo **Access Token** (ký bằng `JWT_SECRET`) và **Refresh Token** (ký bằng `JWT_REFRESH_SECRET`).
   - Cập nhật trường `refresh_token` trong bảng `Users` của database.
4. **Hợp nhất lịch sử Chat (nếu có `guestSessionId`):**
   - Chuyển toàn bộ dữ liệu lịch sử chat của Session khách vãng lai sang User ID vừa đăng nhập.
   - Dọn dẹp cache lịch sử chat và context tương ứng trong Redis.
5. **Backend trả phản hồi:**
   - Đặt `refresh_token` vào HttpOnly Cookie.
   - Trả `access_token` cùng thông tin User (`id`, `fullName`, `roles`, `permissions`) về Client trong Response Body.
6. **Frontend lưu trữ:** Lưu Access Token và User Info vào Redux Store để sử dụng cho các request tiếp theo.

### 1.2 Tóm tắt cơ chế tự động làm mới Token (Auto-Refresh Token Flow)

Khi Access Token hết hạn, hệ thống tự động gia hạn token dưới nền theo quy trình sau:

1. **API trả về lỗi hết hạn:** Client gửi một request thông thường kèm Access Token đã hết hạn. Backend kiểm tra bằng middleware `checkUserJWT` và trả về mã HTTP `401 Unauthorized` kèm `{ EC: -99, EM: "Access Token is expired" }`.
2. **Axios Response Interceptor bắt lỗi:** Interceptor ở Frontend phát hiện mã lỗi `401` và `EC: -99`.
3. **Xử lý hàng đợi và khóa tiến trình:**
   - Đặt cờ `isRefreshing = true` để ngăn các request tiếp theo chạy song song.
   - Các request gửi đi cùng lúc sẽ được giữ lại trong hàng đợi `failedQueue` (dưới dạng các Promise đang chờ).
4. **Yêu cầu cấp lại Token mới:**
   - Frontend gửi request `POST /api/v1/auth/refresh` bằng một instance Axios riêng (kèm `withCredentials: true` để tự động gửi HttpOnly Cookie chứa `refresh_token`).
5. **Backend xác thực & xoay vòng Token:**
   - Backend giải mã và kiểm tra Refresh Token.
   - Đối chiếu với DB để đảm bảo token khớp với của User.
   - Ký Access Token mới và Refresh Token mới (Token Rotation), cập nhật lại Refresh Token mới trong DB.
   - Trả về Access Token mới và set Cookie Refresh Token mới.
6. **Cập nhật & thử lại các request:**
   - Frontend lưu Access Token mới vào Redux Store.
   - Thực thi lại các request đang đợi trong `failedQueue` với Access Token mới.
   - Thực thi lại request gốc bị lỗi lúc đầu.
   - Đặt lại `isRefreshing = false` để giải phóng tiến trình.

---

## 2. Chi tiết luồng đăng nhập (Login Flow)

### 2.1 Tại Backend (`authService.js` - `userLogin`)

Khi Controller gọi hàm `userLogin(rawUserData, guestSessionId = null)`:

1.  **Tìm kiếm User:** Truy vấn database tìm người dùng dựa trên `email` hoặc `phone`.
2.  **Xác thực mật khẩu:** Sử dụng `bcrypt.compare` so sánh mật khẩu người dùng nhập với hash lưu trong database (`checkPassword`).
3.  **Tải quyền hạn:** Nếu đúng mật khẩu, gọi `rbacService.getUserFullDetails(user.id)` để truy xuất toàn bộ danh sách vai trò (`roles`) và quyền hạn (`permissions`) được cấu hình cho User (đã gộp và lọc trùng lặp).
4.  **Tạo JWT Payload:**
    ```js
    let payload = {
      id: user.id,
      fullName: user.fullName,
      role: roles[0] || ROLES.CUSTOMER,
      roles: roles,
      permissions: permissions,
    };
    ```
5.  **Tạo Token & Cập nhật Database:**
    - Ký **Access Token** với mã bí mật `JWT_SECRET` và thời gian sống `JWT_EXPIRESIN` qua hàm `createAccessJWT(payload)`.
    - Ký **Refresh Token** với mã bí mật `JWT_REFRESH_SECRET` và thời gian sống `JWT_REFRESH_EXPIRESIN` qua hàm `createRefreshJWT(payload)`.
    - Cập nhật trường `refresh_token` trong bảng `Users` của database để làm cơ sở đối chiếu cho các lần gia hạn tiếp theo.
6.  **Gộp Lịch sử Chat (Guest Session Merge):**
    - Nếu có `guestSessionId` (User nhắn tin với AI Chatbot trước khi đăng nhập):
      - Cập nhật toàn bộ các `ChatLog` từ `sessionId = guestSessionId` và `userId = null` thành `userId = user.id`.
      - Thực hiện dọn dẹp các cache lịch sử chat và context trong Redis:
        - `chat:history:session:${guestSessionId}:*`
        - `chat:history:user:${user.id}:*`
        - `chat:context:session:${guestSessionId}`
        - `chat:context:user:${user.id}`
        - _(Mục đích: AI nhận diện được ngữ cảnh hợp nhất sau khi chuyển trạng thái thành viên)._
7.  **Kết quả:** Trả về `{ EC: 0, EM: 'Success!', DT: { access_token, refresh_token, user } }`. Controller nhận kết quả này sẽ thiết lập cookie `refresh_token` với cờ `httpOnly: true`, `secure: true` (trên production) và trả Access Token kèm User Info trong response body về Client.

---

## 3. Cơ chế tự động làm mới Token (Silent Token Refresh)

Quy trình tự động gia hạn token diễn ra hoàn toàn ẩn dưới nền (silent refresh) nhờ Axios Interceptors trên Frontend kết hợp API Refresh Token trên Backend.

### 3.1 Gửi request từ Frontend (`axiosCustomize.js`)

- **Request Interceptor:** Trước khi gửi bất kỳ request nào, interceptor sẽ lấy `access_token` từ Redux Store và đính kèm vào header `Authorization: Bearer <token>`.
- **Lưu ý:** Không ghi đè nếu header `Authorization` đã được set thủ công (ví dụ: các request kiểm tra tính hợp lệ đặc biệt).

### 3.2 Phát hiện Token hết hạn tại Backend (`JWTAction.js` - `checkUserJWT`)

1.  Hàm `checkUserJWT` giải mã token bằng `verifyAccessToken(token)`.
2.  Nếu token hết hạn (`jsonwebtoken` ném lỗi `TokenExpiredError`), hàm trả về chuỗi `"EXPIRED"`.
3.  Middleware trả về mã lỗi HTTP **401 Unauthorized** kèm mã lỗi chuẩn của hệ thống:
    ```json
    {
      "EC": -99, // errorCode.TOKEN_EXPIRED
      "EM": "Access Token is expired",
      "DT": ""
    }
    ```

### 3.3 Đánh chặn lỗi và gia hạn tại Frontend (`axiosCustomize.js`)

Khi response trả về có status `401` và yêu cầu chưa từng được thử lại (`!originalRequest._retry`):

1.  **Hàng đợi Request đồng thời (failedQueue & isRefreshing):**
    - Nếu đang có một tiến trình refresh token đang chạy (`isRefreshing === true`), các request khác bị lỗi 401 tiếp theo sẽ được đẩy vào hàng đợi `failedQueue` dưới dạng Promise đang chờ.
2.  **Bắt đầu quá trình Refresh:**
    - Đánh dấu `originalRequest._retry = true` và `isRefreshing = true`.
    - Gửi request `POST /api/v1/auth/refresh` bằng một instance Axios mới (để tránh lặp đệ quy interceptor) kèm tùy chọn `{ withCredentials: true }` (để Browser tự động đính kèm HttpOnly Cookie chứa `refresh_token`).
3.  **Xử lý tại Backend (`authService.js` - `refreshUserToken`):**
    - Nhận `oldRefreshToken` từ Cookie.
    - Xác thực định dạng bằng `verifyRefreshToken`.
    - Truy vấn database xem token này có thuộc về user nào không: `db.User.findOne({ where: { refresh_token: oldRefreshToken } })`. Điều này giúp ngăn chặn các Refresh Token giả mạo hoặc đã bị thu hồi.
    - Tải lại danh sách vai trò/quyền mới nhất từ `rbacService`.
    - **Token Rotation:** Ký Access Token mới và Refresh Token mới. Cập nhật Refresh Token mới vào database của User (quay vòng token để tăng tính bảo mật).
    - Trả về cho Client cặp Token mới.
4.  **Hoàn tất tại Frontend:**
    - **Thành công (EC === 0):**
      - Cập nhật Access Token mới vào Redux Store (`setAccessToken`).
      - Cập nhật User Info mới vào Redux Store (nếu vai trò/quyền có thay đổi).
      - Cập nhật header `Authorization` của `originalRequest` bằng token mới.
      - Kích hoạt hàng đợi `failedQueue` chạy lại bằng token mới qua hàm `processQueue(null, newAccessToken)`.
      - Thực hiện gửi lại request gốc và trả về kết quả.
    - **Thất bại (Token Refresh hết hạn / không khớp DB):**
      - Hủy bỏ phiên đăng nhập bằng cách dispatch `logout()`.
      - Giải phóng hàng đợi với lỗi qua `processQueue(error)`.
      - Chuyển hướng người dùng về trang `/login` (`window.location.href = '/login'`).
    - **Finally:** Đặt `isRefreshing = false`.

---

## 4. Cơ chế Middleware phân quyền (Authorization Middlewares)

Backend sử dụng file [`JWTAction.js`](file:///d:/Hoc_code/Hoc_JS/NEW_kvil-vietnam-fashion-chatbotAI-web-fullstack/Backend/src/middleware/JWTAction.js) để bảo vệ các routes tùy thuộc vào vai trò (Roles) và quyền hạn (Permissions).

### 4.1 `checkUserJWT`

- **Mục đích:** Bắt buộc người dùng phải đăng nhập.
- **Luồng:** Trích xuất token -> Xác thực -> Gán `req.user = decoded` và `req.token = token` -> `next()`.
- **Mã phản hồi:** Trả về HTTP 401 khi token bị thiếu, hết hạn (`TOKEN_EXPIRED`) hoặc không hợp lệ.

### 4.2 `checkUserPermission(...args)`

- **Mục đích:** Phân quyền chi tiết (Fine-grained Authorization) sau khi đã qua `checkUserJWT`.
- **Cơ chế hoạt động:**
  1.  **Super Admin Bypass:** Nếu danh sách vai trò của người dùng (`req.user.roles`) chứa `SUPER_ADMIN`, cho phép đi qua ngay lập tức mà không cần kiểm tra quyền con.
  2.  **Kiểm tra theo Quyền (Permissions):**
      - Nếu truyền vào mảng permissions cần thiết (ví dụ: `checkUserPermission(['ADMIN'], ['products.read'])`), middleware sẽ kiểm tra xem người dùng có đầy đủ các quyền đó không (`requiredPermissions.every(...)`).
      - Nếu thiếu quyền, trả về HTTP 403 Forbidden.
  3.  **Kiểm tra theo Vai trò (Roles):**
      - Nếu chỉ truyền vào vai trò (ví dụ: `checkUserPermission('ADMIN', 'SALES')`), middleware kiểm tra xem người dùng có ít nhất một trong các vai trò được cho phép không.
      - Nếu không thỏa mãn, trả về HTTP 403 Forbidden.
  4.  **Bảo vệ Route Quản trị mặc định (Admin Route Regex):**
      - Nếu endpoint khớp với định dạng `/api/v*/admin/*` (Regex: `/\/api\/v\d+\/admin(\/|$)/`), hệ thống sẽ kiểm tra xem người dùng có thuộc nhóm `ADMIN_ROLES` (được cấu hình trong `src/config/roles.js`) hay không.
      - Nếu không thuộc nhóm Admin, trả về HTTP 403 Forbidden.

### 4.3 `optionalAuth`

- **Mục đích:** Xác thực không bắt buộc. Thường dùng cho các API hỗ trợ cả khách vãng lai (Guest) lẫn thành viên đăng nhập (User) - Ví dụ: Chatbot, xem sản phẩm, tạo đơn hàng.
- **Luồng:**
  - Nếu không gửi kèm token trong Header: Cho đi qua và coi như Guest (`req.user` sẽ là `undefined`).
  - Nếu có gửi kèm token: Bắt buộc phải là token hợp lệ và còn hạn (nếu hết hạn hoặc lỗi sẽ trả về HTTP 401).

---

## 5. Tham chiếu các biến môi trường cấu hình JWT

Các giá trị cấu hình được quản lý tập trung trong file `.env` (không commit lên Git):

| Biến môi trường         | Mục đích                                        | Ví dụ giá trị                     |
| :---------------------- | :---------------------------------------------- | :-------------------------------- |
| `JWT_SECRET`            | Khóa bí mật dùng để ký và giải mã Access Token  | `kvil_secret_key_2026`            |
| `JWT_EXPIRESIN`         | Thời gian hết hạn của Access Token              | `1h` (1 giờ) hoặc `15m` (15 phút) |
| `JWT_REFRESH_SECRET`    | Khóa bí mật dùng để ký và giải mã Refresh Token | `kvil_refresh_secret_key_2026`    |
| `JWT_REFRESH_EXPIRESIN` | Thời gian hết hạn của Refresh Token             | `30d` (30 ngày)                   |

---

> [!IMPORTANT]
> **Quy tắc bảo mật quan trọng:**
>
> 1. Tránh lưu Access Token ở localStorage/sessionStorage để ngăn ngừa các cuộc tấn công đánh cắp phiên qua XSS.
> 2. Refresh Token luôn được bảo vệ bằng cờ `HttpOnly` và `SameSite` để ngăn Javascript phía client truy cập trực tiếp.
> 3. Cơ chế đối chiếu Refresh Token với database cùng với Token Rotation đảm bảo khi Refresh Token cũ bị lộ, kẻ tấn công cũng không thể tái sử dụng lâu dài và hệ thống dễ dàng thu hồi token bằng cách xóa/null trường `refresh_token` trong DB.
