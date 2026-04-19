**THÔNG BÁO BẢN CẬP NHẬT MỚI NHẤT (Frontend - Nâng cấp trang Tài khoản & Đồng bộ dữ liệu)**

- **Đồng bộ hóa dữ liệu (Real-time Sync)**:
  - Triển khai cơ chế **Outlet Context** trong `AccountLayout`, giúp tự động làm mới cột "Tổng tin tài khoản" ngay khi người dùng cập nhật hồ sơ thành công mà không cần reload trang.
- **Nâng cấp User Account Summary**:
  - Chuyển đổi logic lấy dữ liệu: Gọi trực tiếp API `getUserProfile` để đảm bảo thông tin luôn chính xác và đầy đủ nhất từ Database.
  - Hiển thị chi tiết: Họ tên, Email, Số điện thoại, Ngày sinh (định dạng chuẩn vi-VN) và Giới tính.
  - Tích hợp bộ quay Loading (`Loader2`) giúp trải nghiệm người dùng mượt mà hơn.
- **Sửa lỗi Hệ thống**:
  - Khắc phục triệt để lỗi cú pháp `Declaration or statement expected` tại `AccountLayout.jsx`.
  - Tối ưu hóa việc fetch dữ liệu ngầm (background fetching) để giữ giao diện ổn định khi cập nhật.

---

**THÔNG BÁO BẢN CẬP NHẬT TRƯỚC (Frontend - Bộ sưu tập Động, Nâng cấp Header & Sửa lỗi khởi tạo)**

---

**THÔNG BÁO BẢN CẬP NHẬT TRƯỚC (Frontend - Tái thiết kế Giao diện & Sản phẩm động)**

- **Thiết kế Giao diện Tổng thể (UI/UX Redesign)**:
  - **Header Động**: Chuyển sang bố cục 2 hàng chuyên nghiệp, tự động thu gọn và sắp xếp lại các icon khi scroll (hiệu ứng Shrink Header).
  - **Footer Chuyên sâu**: Triển khai Footer 2 hàng với đầy đủ thông tin liên hệ, liên kết chính sách và bản quyền.
- **Tính năng Sản phẩm Động (Dynamic Products)**:
  - **Best Sellers Section**: Kết nối API lấy danh sách sản phẩm bán chạy nhất từ Backend, hiển thị dưới dạng Grid 10 sản phẩm (5 cột trên Desktop).
  - **Global `ProductCard`**: Tách ProductCard thành component dùng chung, tích hợp các tính năng cao cấp:
    - **Hover Image Switch**: Tự động chuyển đổi giữa ảnh chính và ảnh phụ khi di chuột (hiệu ứng Cross-fade).
    - **Auto Pricing**: Tự động tính toán giá khuyến mãi, hiển thị song song giá gốc (gạch ngang) và giá bán.
    - **Discount Badge**: Nhãn giảm giá nổi bật góc ảnh.
    - **Smart Truncate**: Tự động cắt gọn khi tên sản phẩm quá dài để giữ Grid luôn cân đối.

---

**THÔNG BÁO BẢN CẬP NHẬT TRƯỚC (Admin - Giám sát Chatbot AI)**

- **Quản lý & Giám sát Chatbot** — `ChatbotManagePage`:
  - Hệ thống thẻ thống kê (Stats Cards): Tổng tin nhắn, tổng phiên, tin nhắn hôm nay, tỷ lệ phản hồi của BOT.
  - Theo dõi danh sách phiên chat (Sessions) với bộ lọc đa năng: Tìm kiếm nội dung tin, lọc theo loại (User/Guest), lọc theo khoảng thời gian (RangePicker).
  - Chi tiết phiên chat (`admin.chatbot.session.detail.drawer.jsx`): Hiển thị hội thoại dạng bong bóng (bubble) trực quan, phân biệt rõ người dùng và BOT, hiển thị các sản phẩm được BOT gợi ý.
  - Tính năng xóa phiên chat với cơ chế **Optimistic UI**, tự động cập nhật lại bảng và số liệu thống kê ngay lập tức.
  - Tích hợp `src/services/chatbotService.js` xử lý toàn bộ logic nghiệp vụ và tương tác API Backend.

---

**THÔNG BÁO BẢN CẬP NHẬT TRƯỚC (Admin - Dashboard & Thống kê số liệu)**

- **Dashboard Thống kê (Business Overview)** — `DashboardPage`:
  - Hệ thống thẻ tóm tắt (Summary Cards) hiển thị: Doanh thu, Tổng đơn hàng, Đơn chờ xử lý.
  - Tự động format số lượng lớn (Ví dụ: 1.2 tỷ, 500 triệu) giúp giao diện gọn gàng, chuyên nghiệp.
  - Biểu đồ vùng (Area Chart) sử dụng **Recharts**: Thể hiện trực quan biến động Doanh thu và Số lượng đơn hàng theo thời gian.
  - Bộ chọn khoảng thời gian (RangePicker) kết hợp các Preset nhanh (7 ngày, 30 ngày, 90 ngày).
  - Tích hợp `src/services/dashboardService.js` lấy dữ liệu thời gian thực từ Backend.

- **Quản lý Mã giảm giá (Coupon Management)** — `CouponManagePage`:
  - Bảng danh sách với **Progress bar** theo dõi lượt dùng, tự động cảnh báo mã hết hạn.
  - Modal tạo/sửa chuyên sâu với ràng buộc logic ngày bắt đầu/kết thúc và loại giảm giá (Cố định/%).

- **Kiến trúc & Tối ưu**:
  - Module hóa các component Dashboard thành `admin.stats.cards.jsx` và `admin.revenue.chart.jsx`.
  - Fix triệt để các lỗi `deprecated` của Ant Design v5 (Thay `Space direction="vertical"` bằng `Flex vertical`).

---

> **THÔNG BÁO (Cập nhật cũ hơn - Admin - Quản lý Mã giảm giá)**
>
> - **Chi tiết tính năng Coupons**:
>   - Tìm kiếm theo mã code + filter theo trạng thái `isActive`.
>   - **Optimistic delete**: xóa ngay khỏi local state, không cần refetch toàn bộ danh sách.
>   - **Fix Sidebar**: Mục Coupons trỏ đúng đến `/admin/coupons`.

---


> **THÔNG BÁO (Cập nhật cũ hơn - Admin - Quản lý Đơn hàng & Bộ sưu tập)**
>
> - **Quản lý Bộ sưu tập (Collection Management)** — `CollectionManagePage`:
>   - Tạo / Sửa bộ sưu tập qua `admin.collection.modal.jsx`: upload ảnh Banner (Dragger), Switch `isActive`, slug tự sinh từ backend.
>   - Quản lý sản phẩm thuộc BST qua `admin.collection.drawer.jsx` dùng component **Transfer** (kéo trái/phải), tự so sánh `originalKeys` vs `targetKeys` để chỉ gọi API add/remove những thay đổi thực sự.
>   - Thêm `src/services/collectionService.js` với đầy đủ 6 method: CRUD collection + thêm/xóa sản phẩm.
>
> - **Quản lý Đơn hàng (Order Management)** — `OrderManagePage`:
>   - Bộ lọc 4 chiều đồng thời: `status`, `paymentStatus`, `paymentMethod`, `deliveryMethod` — reset về trang 1 khi đổi filter.
>   - Cập nhật trạng thái đơn và trạng thái thanh toán với **Optimistic UI**: cập nhật local state ngay lập tức, không refetch toàn bộ danh sách sau mỗi thao tác.
>   - Drawer chi tiết (`admin.order.detail.drawer.jsx`) hiển thị đầy đủ: thông tin khách, breakdown tài chính (tạm tính / ship / giảm / tổng), cập nhật nhanh ngay trong drawer.
>   - Thêm `src/services/orderService.js` với 3 method: `getAdminOrders`, `updateOrderStatus`, `updatePaymentStatus`.
>   - **Fix:** `formatCurrency` dùng `parseFloat()` thay vì `typeof === 'number'` để xử lý đúng trường hợp Sequelize trả `DECIMAL` dưới dạng **string**.
>
> - **Constants tách biệt** — `src/constants/orderConstants.js`:
>   - Single-source-of-truth cho toàn bộ enum/label của Order (`ORDER_STATUS_CONFIG`, `PAYMENT_METHOD_LABELS`, `DELIVERY_METHOD_LABELS`, các Option arrays cho Select filter).
>   - Khi backend thay đổi giá trị enum, chỉ cần sửa đúng một file này.
>
> - **Fix Bug Sidebar**:
>   - Sửa `<Link href>` → `<Link to>` cho mục **Orders** và **Coupons** trong `admin.sidebar.jsx` (tránh full-page reload).
>   - Mục **Orders** trỏ đúng đến `/admin/orders`.

---


> **THÔNG BÁO (Cập nhật cũ hơn - Quản trị Hệ thống E-Commerce Chuyên Sâu: Sản Phẩm & Danh Mục)**
>
> - **Kiến trúc Giao diện Đồng bộ (Uniform UI Architecture)**:
>   - Tái cấu trúc chuẩn hóa đồng bộ 3 màn hình Admin chủ lực (`UserManagePage`, `CategoryManagePage`, `ProductManagePage`). 
>   - Toàn bộ được đặt trong khối `<Card>` nổi bo góc mềm mại, kết hợp linh hoạt `TailwindCSS` với component `Typography.Title` nhằm tạo phong cách cao cấp và chuyên nghiệp.
>   - Phân tách code sạch sẽ nhờ phân rã các Modal và Drawer thành các thành phần nằm trong `src/components/admin/...`.
>
> - **Quản lý Danh mục (Category Management)**:
>   - Khởi tạo service độc lập lấy dữ liệu, kết nối API.
>   - Tích hợp Table với công cụ hiển thị Name và Slug. Loại bỏ các input dư thừa không có trong Design Backend để đạt hiệu suất cao.
>
> - **Khởi tạo Hệ thống Sản phẩm Phân lớp (Advanced Product Mgt)**:
>   - Hệ thống cho phép quản trị nhiều chiều một sản phẩm E-commerce (Data đa tầng):
>     1. **Thông tin gốc**: Thêm / Sửa qua `admin.product.modal.jsx` (Tên, Mã Danh mục lấy động từ Category, Giá, Rating).
>     2. **Biến thể chi tiết**: Ngăn phụ `admin.variant.drawer.jsx` chuyên liệt kê Màu sắc, Size, Tồn kho thực tế (Stock).
>     3. **Thư viện Hình ảnh**: Sử dụng `admin.image.drawer.jsx` cho phép đẩy nhiều File ảnh một lượt bằng định dạng Binary `FormData` đi thẳng lên Cloudinary, và có khả năng xóa từng ảnh. Tự động nhận diện Thumbnail mặc định.

---


> **THÔNG BÁO (Cập nhật cũ hơn - Quản trị Quyền, Đăng xuất Redux Thunk & Xử lý Cookie)**
>
> - **Cấp Quyền & Hủy Quyền (Role Management)**:
>   - Hoàn thiện tính năng Quản lý phân quyền tại `UserManagePage` sử dụng `Popconfirm` của Ant Design để bảo vệ thao tác, tránh bấm nhầm.
>   - Phân loại rõ ràng nút bấm mạ vàng "Cấp quyền" (đối với User) và nút đỏ "Hủy quyền" (đối với Admin).
>   - Tích hợp vòng lặp bảo vệ (Self-check): Nút "Hủy quyền" tự động bị vô hiệu hóa (disabled) nếu Admin đang cố gắng giáng chức chính mình. Bảng (Table) sẽ tự động reload ngay sau khi phân quyền thành công.
> 
> - **Đăng xuất (Logout) & Redux AsyncThunk**:
>   - Gói gọn tiến trình đăng xuất thông qua `performLogout` thunk bên trong `authSlice.js`.
>   - Luồng AsyncThunk cho phép gọi API `POST /api/v1/auth/logout` để clear token ở nền tảng Backend trước, sau đó tự động kích hoạt reducer `logout()` dọn dẹp LocalStorage & Redux State phía Frontend, giúp mã nguồn tại các Component gọi hàm trở nên vô cùng ngắn gọn (`await dispatch(performLogout())`).
> 
> - **Xử lý Triệt để Lỗi Cookie CORS (SameSite/Secure)**:
>   - Khắc phục lỗi kẹt thẻ Refresh Token (cấp thành 2 thẻ) do xung đột cấu hình giữa hàm Tạo và Xóa cookie.
>   - Áp dụng cấu hình linh hoạt biến môi trường: `sameSite: 'none'` + `secure: true` khi build trên Production và `sameSite: 'lax'` + `secure: false` khi chạy Localhost, đảm bảo luồng Cookie lưu/xóa thông suốt trên cả Browser lẫn API Tester.
> 
> - **Validation (Kiểm tra nhập liệu Form)**:
>   - Bổ sung xác thực độ dài Mật khẩu (tối thiểu 6 ký tự) tại `LoginPage.jsx`. Hoạt động song song 2 lớp: cảnh báo chữ đỏ ngay lập tức theo thời gian thực (Real-time) và chặn Submit bằng `toast.error` bật lên khi cố ý bỏ qua cảnh báo.

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
