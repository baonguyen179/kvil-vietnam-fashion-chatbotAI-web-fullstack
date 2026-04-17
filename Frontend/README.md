**THÔNG BÁO BẢN CẬP NHẬT MỚI NHẤT (Quản trị Quyền, Đăng xuất Redux Thunk & Xử lý Cookie)**

- **Cấp Quyền & Hủy Quyền (Role Management)**:
  - Hoàn thiện tính năng Quản lý phân quyền tại `UserManagePage` sử dụng `Popconfirm` của Ant Design để bảo vệ thao tác, tránh bấm nhầm.
  - Phân loại rõ ràng nút bấm mạ vàng "Cấp quyền" (đối với User) và nút đỏ "Hủy quyền" (đối với Admin).
  - Tích hợp vòng lặp bảo vệ (Self-check): Nút "Hủy quyền" tự động bị vô hiệu hóa (disabled) nếu Admin đang cố gắng giáng chức chính mình. Bảng (Table) sẽ tự động reload ngay sau khi phân quyền thành công.

- **Đăng xuất (Logout) & Redux AsyncThunk**:
  - Gói gọn tiến trình đăng xuất thông qua `performLogout` thunk bên trong `authSlice.js`.
  - Luồng AsyncThunk cho phép gọi API `POST /api/v1/auth/logout` để clear token ở nền tảng Backend trước, sau đó tự động kích hoạt reducer `logout()` dọn dẹp LocalStorage & Redux State phía Frontend, giúp mã nguồn tại các Component gọi hàm trở nên vô cùng ngắn gọn (`await dispatch(performLogout())`).

- **Xử lý Triệt để Lỗi Cookie CORS (SameSite/Secure)**:
  - Khắc phục lỗi kẹt thẻ Refresh Token (cấp thành 2 thẻ) do xung đột cấu hình giữa hàm Tạo và Xóa cookie.
  - Áp dụng cấu hình linh hoạt biến môi trường: `sameSite: 'none'` + `secure: true` khi build trên Production và `sameSite: 'lax'` + `secure: false` khi chạy Localhost, đảm bảo luồng Cookie lưu/xóa thông suốt trên cả Browser lẫn API Tester.

- **Validation (Kiểm tra nhập liệu Form)**:
  - Bổ sung xác thực độ dài Mật khẩu (tối thiểu 6 ký tự) tại `LoginPage.jsx`. Hoạt động song song 2 lớp: cảnh báo chữ đỏ ngay lập tức theo thời gian thực (Real-time) và chặn Submit bằng `toast.error` bật lên khi cố ý bỏ qua cảnh báo.

---

> **THÔNG BÁO (Cập nhật cũ hơn - Layout & Khởi tạo Admin Dashboard)**
>
> - Khởi tạo trang `UserManagePage` sử dụng **Ant Design** làm chủ đạo nhằm đồng bộ chuẩn Layout Admin. Đã ráp thành công Bảng dữ liệu (Table), Phân trang (Pagination), Regex tìm kiếm và Lọc (Filters) theo Role.
> - Sửa lỗi sử dụng sai thuộc tính `<Link href>` thành `<Link to>` của thư viện `react-router-dom` tại Admin Sidebar, qua đó ngăn chặn 100% tình trạng Reload toàn trang web khi admin đang di chuyển giữa các chuyên mục.
> - Triển khai thiết kế giao diện `ForgotPasswordPage` với cơ chế Chuyển bước trong cùng một màn hình (Step-by-step).
> - Tách luồng gọi `/api/v1/auth/refresh` bằng `axios` thuần thay vì dùng biến `instance` cũ, kết hợp cờ `_retry` để phá vỡ vòng lặp vô hạn (Infinite Interceptor Loop) giúp ổn định hệ thống.

---

> **THÔNG BÁO (Cập nhật cũ hơn - Core Authentication & Auto-Refresh Token)**
>
> - Tái cấu trúc (Refactor) hệ thống **Axios Interceptor** (`utils/axiosCustomize.js`) cùng lõi Global State `authSlice.js` nhằm thiết lập cơ chế thay Token vô hình:
>   1. Tự động kẹp `access_token` vào tất cả các gói Header để truy xuất Protected Route.
>   2. Khi Backend dội về lỗi hết hạn Token (HTTP `401 Unauthorized`), kích hoạt rào chắn `isRefreshing = true` và bắt nhốt toàn bộ call API đang chờ vào một `failedQueue`.
>   3. Gọi ngầm kèm Cookie sang `/refresh` lấy Token mới rồi giải cứu hàng chờ. Nếu Refresh Token cũng hết đát, hệ thống sẽ chốt chặn vòng cuối, dội lệnh `logout()` khóa tài khoản lại và đá người dùng ra khỏi giao diện nội bộ.
> - Thiết kế hệ rào chắn Route:
>   - `<PublicRoute>`: Nhận diện Auth trong Redux, cản không cho User đã login vô tình quay về trang Đăng nhập / Đăng ký.
>   - `<PrivateRoute>`: Kiểm duyêt Role (Phân biệt Admin vs User), đá những đối tượng thâm nhập trái phép.

---

> **THÔNG BÁO (Cập nhật cũ hơn - Cấu trúc Redux & Routing)**
>
> - Đã tách và phân mảnh `AppRoutes.jsx` gốc thành `UserRoutes.jsx` và `AdminRoutes.jsx` để bảo toàn tính minh bạch đường dẫn.
> - Thành tựu cài cắm hệ thống **Redux Toolkit** và **Redux Persist**. Toàn vẹn 3 kho Store lớn: `auth`, `cart`, `theme` được lưu bóng xuống `localStorage`. Bất kể bạn bấm Reload hay F5, trải nghiệm giỏ hàng / phiên login và chế độ Ban đêm (Theme) vẫn được bảo lưu hoàn mỹ.

---

````markdown
```bash
# Cấu trúc thư mục
src/
├── assets/ # Tài nguyên tĩnh (Hình ảnh, fonts, file global CSS)
├── components/ # Các UI component tái sử dụng được
│ ├── admin/ # Component CHỈ DÙNG cho admin (VD: AdminSidebar, StatCard...)
│ ├── user/ # Component CHỈ DÙNG cho user (VD: ProductCard, HeroBanner...)
│ └── ui/ # Component dùng CHUNG cho cả 2 bên (VD: Button, Input, Modal, LoadingSpinner...)
├── layouts/ # Nơi chứa các "vỏ bọc" (Layout) giao diện
│ ├── AdminLayout.jsx # Chứa Sidebar + Header + thẻ <Outlet /> cho trang Admin
│ └── UserLayout.jsx # Chứa Navbar + Footer + thẻ <Outlet /> cho trang User
├── pages/ # Các trang hiển thị chính (Views) ghép nối từ các components
│ ├── admin/ # Dashboard, Quản lý người dùng, Quản lý sản phẩm...
│ └── user/ # Trang chủ, Chi tiết sản phẩm, Giỏ hàng, Hồ sơ...
│ └── auth/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── ForgotPasswordPage.jsx
├── routes/ # Cấu hình định tuyến (Routing Configuration)
│ ├── AppRoutes.jsx # Cấu hình Route gốc (App-level)
│ ├── AdminRoutes.jsx # Danh sách Route của Admin (có check quyền)
│ ├── UserRoutes.jsx # Danh sách Route của User
│ ├── PrivateRoute.jsx # Route bảo vệ
│ └── PublicRoute.jsx # Route public
├── services/ # Nơi chứa các hàm gọi API (VD: authService.js, userService.js)
├── redux/ # Cấu hình Redux store và các Slices
│   ├── slices/ # Các slice của Redux
│   │   ├── authSlice.js
│   │   ├── cartSlice.js
│   │   └── themeSlice.js
│   └── store.js # Store của Redux
└── utils/ # Các hàm tiện ích / cấu hình chung (Helpers/Configs)
├── axiosCustomize.js # Cấu hình Axios instance (Base URL, Tái phát Token)
└── i18n.js # Cấu hình ngôn ngữ hệ thống
```
````

# Tài liệu Hướng dẫn Phát triển Frontend (Frontend Setup & Architecture)

Chào mừng bạn đến với source code Frontend của dự án! Tài liệu này sẽ giúp bạn hiểu rõ các công nghệ đang được sử dụng, cấu trúc thư mục và quy chuẩn để chúng ta có thể làm việc cùng nhau một cách trơn tru nhất.

## 1. Cài đặt và Chạy dự án (Getting Started)

Dự án này sử dụng **Vite** làm build tool, giúp tốc độ khởi động và HMR (Hot Module Replacement) cực kỳ nhanh.

```bash
# 1. Cài đặt các thư viện (Dependencies)
npm install

# 2. Chạy server ở chế độ phát triển (Development)
npm run dev

# 3. Build dự án để đưa lên production
npm run build
```

## 2. Tech Stack (Các công nghệ & Thư viện cốt lõi)

Dự án sử dụng React 19 mới nhất. Dưới đây là phân loại các thư viện để bạn biết khi nào nên dùng cái gì:

````markdown
```bash
# Giao diện & Styling (UI & CSS)
- Tailwind CSS v4 (tailwindcss): Hệ thống CSS chính của dự án.
- Shadcn UI (radix-ui, clsx, tailwind-merge): Bộ UI component tùy biến cao, thường được sử dụng cho phía User để giao diện độc bản và đẹp mắt.
- Ant Design (antd): Thư viện UI có sẵn nhiều component phức tạp (Table, DatePicker...). Được khuyến nghị sử dụng chủ yếu ở trang Admin để tiết kiệm thời gian dựng form/bảng.
- Lucide React (lucide-react): Thư viện Icon chính thức của dự án.
- Tailwind Animate (tw-animate-css): Hỗ trợ các hiệu ứng animation nhanh qua class của Tailwind.

# Quản lý trạng thái (State Management)
- Redux Toolkit (@reduxjs/toolkit, react-redux): Xử lý Global State (ví dụ: thông tin User đang đăng nhập, giỏ hàng).
- Redux Persist (redux-persist): Giúp lưu tự động state của Redux xuống localStorage, đảm bảo người dùng F5 không bị mất dữ liệu đăng nhập.

# Định tuyến & Gọi API (Routing & API)
- React Router DOM v6: Xử lý điều hướng trang (routing).
- Axios (axios): Thư viện gọi API chính. Đã được config sẵn các Interceptors (tự động gắn token) tại utils/axiosCustomize.js.

# Các tiện ích khác (Utilities)
- i18next (i18next, react-i18next): Hỗ trợ đa ngôn ngữ (Tiếng Anh / Tiếng Việt).
- React Toastify (react-toastify): Hiển thị thông báo (toast/alert) góc màn hình khi thành công/thất bại.
- NProgress (nprogress): Hiển thị thanh loading mỏng ở cạnh trên màn hình mỗi khi chuyển trang hoặc chờ API.
```
````

## 3. Quy chuẩn khi code (Code Conventions)

Để giữ cho source code sạch sẽ, mọi người vui lòng tuân thủ các quy tắc sau:

````markdown
```bash
# Vị trí Component:
- Nếu bạn tạo một cái nút (Button) chỉ dùng riêng cho trang Admin, hãy để nó vào components/admin/. Nếu trang User cũng có thể xài cái nút đó, hãy đưa nó ra components/shared/ hoặc components/ui/.

# Gọi API:
- KHÔNG viết trực tiếp hàm axios.get vào bên trong Component. Hãy định nghĩa nó ở trong thư mục services/ sau đó import vào Component để dùng. Dễ dàng bảo trì và quản lý tập trung.

# Sử dụng UI Library:
- Hạn chế trộn lẫn antd và shadcn trên cùng một màn hình để tránh xung đột CSS và làm nặng trang.
- Môi trường Admin -> Khuyên dùng Ant Design. Môi trường User -> Khuyên dùng Shadcn UI + Tailwind CSS.

# Biến môi trường:
- Các thông tin nhạy cảm (như API Endpoint) phải được lưu trong file .env (ví dụ: VITE_API_URL). Không hardcode link API vào source.
```
````

# 🗄️ Cấu trúc Cơ sở dữ liệu (Database Schema)

Hệ thống được thiết kế theo mô hình CSDL quan hệ (RDBMS), chia thành 6 module nghiệp vụ chính để dễ dàng quản lý và mở rộng.

---

## 1. Module Người dùng (User Management)

### `Users` (Tài khoản người dùng)

| Cột             | Kiểu dữ liệu | Ràng buộc | Mô tả                                 |
| :-------------- | :----------- | :-------- | :------------------------------------ |
| `id`            | int          | **PK**    | ID định danh tài khoản                |
| `email`         | string       | Unique    | Email đăng nhập                       |
| `phone`         | string       | Unique    | Số điện thoại đăng nhập               |
| `password`      | string       |           | Mật khẩu (đã băm/hashed)              |
| `fullName`      | string       |           | Họ và tên đầy đủ                      |
| `birthday`      | date         |           | Ngày tháng năm sinh                   |
| `gender`        | boolean      |           | Giới tính                             |
| `role`          | string       |           | Quyền hạn: `'ADMIN'` hoặc `'USER'`    |
| `refresh_token` | text         |           | Token dùng để cấp lại phiên đăng nhập |
| `createdAt`     | datetime     |           | Thời gian tạo tài khoản               |
| `updatedAt`     | datetime     |           | Thời gian cập nhật gần nhất           |

### `UserAddresses` (Sổ địa chỉ giao hàng)

| Cột             | Kiểu dữ liệu | Ràng buộc            | Mô tả                        |
| :-------------- | :----------- | :------------------- | :--------------------------- |
| `id`            | int          | **PK**               | ID định danh địa chỉ         |
| `userId`        | int          | **FK** -> `Users.id` | Chủ sở hữu địa chỉ           |
| `receiverName`  | string       |                      | Tên người nhận hàng          |
| `phoneNumber`   | string       |                      | Số điện thoại nhận hàng      |
| `province`      | string       |                      | Tỉnh / Thành phố             |
| `ward`          | string       |                      | Quận / Huyện / Phường / Xã   |
| `detailAddress` | string       |                      | Số nhà, tên đường chi tiết   |
| `isDefault`     | boolean      |                      | Cờ đánh dấu địa chỉ mặc định |

---

## 2. Module Sản phẩm & Danh mục (Product Catalog)

### `Categories` (Danh mục sản phẩm)

| Cột    | Kiểu dữ liệu | Ràng buộc | Mô tả                                    |
| :----- | :----------- | :-------- | :--------------------------------------- |
| `id`   | int          | **PK**    | ID danh mục                              |
| `name` | string       |           | Tên danh mục (VD: Áo thun nam)           |
| `slug` | string       | Unique    | Đường dẫn thân thiện (VD: `ao-thun-nam`) |

### `Products` (Sản phẩm gốc)

| Cột               | Kiểu dữ liệu | Ràng buộc                 | Mô tả                      |
| :---------------- | :----------- | :------------------------ | :------------------------- |
| `id`              | int          | **PK**                    | ID sản phẩm                |
| `categoryId`      | int          | **FK** -> `Categories.id` | Thuộc danh mục nào         |
| `name`            | string       |                           | Tên sản phẩm               |
| `description`     | text         |                           | Mô tả chi tiết sản phẩm    |
| `basePrice`       | decimal      |                           | Giá gốc (mặc định)         |
| `discountPercent` | int          |                           | Phần trăm giảm giá (0-100) |

### `ProductVariants` (Biến thể sản phẩm: Size, Màu)

| Cột         | Kiểu dữ liệu | Ràng buộc               | Mô tả                                      |
| :---------- | :----------- | :---------------------- | :----------------------------------------- |
| `id`        | int          | **PK**                  | ID biến thể                                |
| `productId` | int          | **FK** -> `Products.id` | Thuộc sản phẩm gốc nào                     |
| `size`      | string       |                         | Kích cỡ (S, M, L, XL...)                   |
| `color`     | string       |                         | Màu sắc (Red, Blue, Black...)              |
| `stock`     | int          |                         | Số lượng tồn kho thực tế                   |
| `price`     | decimal      |                         | Giá riêng của biến thể (nếu có chênh lệch) |
| `sku`       | string       | Unique                  | Mã SKU quản lý kho                         |

### `ProductImages` (Thư viện ảnh sản phẩm)

| Cột         | Kiểu dữ liệu | Ràng buộc               | Mô tả                                      |
| :---------- | :----------- | :---------------------- | :----------------------------------------- |
| `id`        | int          | **PK**                  | ID hình ảnh                                |
| `productId` | int          | **FK** -> `Products.id` | Thuộc sản phẩm nào                         |
| `imageUrl`  | string       |                         | Link URL trực tiếp đến ảnh (từ Cloudinary) |
| `publicId`  | string       |                         | ID quản lý trên Cloudinary (dùng để xóa)   |
| `isMain`    | boolean      |                         | `true`: Là ảnh đại diện thumbnail          |

---

## 3. Module Bộ sưu tập (Collections)

### `Collections` (Nhóm sản phẩm nổi bật theo sự kiện)

| Cột           | Kiểu dữ liệu | Ràng buộc | Mô tả                        |
| :------------ | :----------- | :-------- | :--------------------------- |
| `id`          | int          | **PK**    | ID bộ sưu tập                |
| `name`        | string       |           | Tên BST (VD: Mùa Hè 2024)    |
| `slug`        | string       | Unique    | URL slug (VD: `mua-he-2024`) |
| `description` | text         |           | Mô tả BST                    |
| `bannerUrl`   | string       |           | Link ảnh bìa banner          |
| `isActive`    | boolean      |           | Trạng thái hiển thị          |

### `CollectionProducts` (Bảng trung gian N-N)

| Cột            | Kiểu dữ liệu | Ràng buộc                  | Mô tả                    |
| :------------- | :----------- | :------------------------- | :----------------------- |
| `collectionId` | int          | **FK** -> `Collections.id` | ID Bộ sưu tập            |
| `productId`    | int          | **FK** -> `Products.id`    | ID Sản phẩm thuộc BST đó |

---

## 4. Module Giỏ hàng (Cart)

### `Carts` (Giỏ hàng của người dùng)

| Cột      | Kiểu dữ liệu | Ràng buộc            | Mô tả             |
| :------- | :----------- | :------------------- | :---------------- |
| `id`     | int          | **PK**               | ID giỏ hàng       |
| `userId` | int          | **FK** -> `Users.id` | Khách hàng sở hữu |

### `CartItems` (Chi tiết món hàng trong giỏ)

| Cột         | Kiểu dữ liệu | Ràng buộc                      | Mô tả                         |
| :---------- | :----------- | :----------------------------- | :---------------------------- |
| `id`        | int          | **PK**                         | ID dòng giỏ hàng              |
| `cartId`    | int          | **FK** -> `Carts.id`           | Nằm trong giỏ hàng nào        |
| `variantId` | int          | **FK** -> `ProductVariants.id` | Mã biến thể (Màu/Size cụ thể) |
| `quantity`  | int          |                                | Số lượng đặt mua              |

---

## 5. Module Khuyến mãi & Đơn hàng (Sales & Checkout)

### `Coupons` (Mã giảm giá)

| Cột                 | Kiểu dữ liệu | Ràng buộc | Mô tả                                                |
| :------------------ | :----------- | :-------- | :--------------------------------------------------- |
| `id`                | int          | **PK**    | ID mã giảm giá                                       |
| `code`              | string       | Unique    | Mã nhập (VD: `KM_HE_2024`)                           |
| `discountType`      | string       |           | Loại giảm: `'fixed'` (tiền mặt) hoặc `'percent'` (%) |
| `discountValue`     | decimal      |           | Mức giảm (VD: 50000 hoặc 10)                         |
| `minOrderValue`     | decimal      |           | Giá trị đơn tối thiểu để áp mã                       |
| `maxDiscountAmount` | decimal      |           | Giới hạn số tiền giảm tối đa (dành cho loại %)       |
| `startDate`         | datetime     |           | Thời gian bắt đầu hiệu lực                           |
| `endDate`           | datetime     |           | Thời gian hết hạn                                    |
| `usageLimit`        | int          |           | Tổng số lượt dùng tối đa                             |
| `usedCount`         | int          |           | Số lượt đã được sử dụng thực tế                      |
| `isActive`          | boolean      |           | Cờ trạng thái bật/tắt                                |

### `Orders` (Đơn đặt hàng)

| Cột                   | Kiểu dữ liệu | Ràng buộc                     | Mô tả                                                                    |
| :-------------------- | :----------- | :---------------------------- | :----------------------------------------------------------------------- |
| `id`                  | int          | **PK**                        | ID đơn hàng                                                              |
| `userId`              | int          | **FK** -> `Users.id` (Null)   | ID khách hàng (Null nếu là khách vãng lai)                               |
| `couponId`            | int          | **FK** -> `Coupons.id` (Null) | Mã giảm giá đã áp dụng (nếu có)                                          |
| `totalBeforeDiscount` | decimal      |                               | Tổng tiền hàng ban đầu                                                   |
| `discountAmount`      | decimal      |                               | Tổng số tiền được giảm                                                   |
| `shippingFee`         | decimal      |                               | Phí vận chuyển                                                           |
| `finalAmount`         | decimal      |                               | Tổng tiền khách phải thanh toán                                          |
| `paymentMethod`       | string       |                               | Phương thức: `'COD'`, `'BANK_TRANSFER'`...                               |
| `paymentStatus`       | boolean      |                               | `true`: Đã thanh toán, `false`: Chưa thanh toán                          |
| `deliveryMethod`      | string       |                               | `'store_pickup'` (Nhận tại cửa hàng), `'home_delivery'` (Giao tận nơi)   |
| `shippingAddress`     | text         |                               | Địa chỉ giao hàng đầy đủ (Dạng text lưu vết)                             |
| `status`              | string       |                               | Trạng thái: `pending`, `confirmed`, `shipping`, `delivered`, `cancelled` |

### `OrderItems` (Chi tiết các món trong đơn)

| Cột         | Kiểu dữ liệu | Ràng buộc                      | Mô tả                                                       |
| :---------- | :----------- | :----------------------------- | :---------------------------------------------------------- |
| `id`        | int          | **PK**                         | ID dòng chi tiết                                            |
| `orderId`   | int          | **FK** -> `Orders.id`          | Nằm trong đơn hàng nào                                      |
| `variantId` | int          | **FK** -> `ProductVariants.id` | Mã biến thể cụ thể đã mua                                   |
| `quantity`  | int          |                                | Số lượng mua                                                |
| `price`     | decimal      |                                | Giá chốt **tại thời điểm mua** (chống thay đổi giá sau này) |

---

## 6. Module Hỗ trợ khách hàng (Customer Support)

### `ChatLogs` (Lịch sử trò chuyện Chatbot AI)

| Cột         | Kiểu dữ liệu | Ràng buộc                   | Mô tả                                         |
| :---------- | :----------- | :-------------------------- | :-------------------------------------------- |
| `id`        | int          | **PK**                      | ID dòng chat                                  |
| `userId`    | int          | **FK** -> `Users.id` (Null) | ID người dùng (Null nếu chưa đăng nhập)       |
| `sessionId` | string       |                             | ID phiên chat (gom nhóm tin nhắn của 1 phiên) |
| `sender`    | string       |                             | Người gửi: `'USER'` hoặc `'BOT'`              |
| `message`   | text         |                             | Nội dung tin nhắn                             |
| `metadata`  | text         |                             | (JSON) Mảng ID sản phẩm mà BOT gợi ý          |
