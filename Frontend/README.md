> **THÔNG BÁO (Cập nhật mới)**
> Hệ thống Global State bằng **Redux Toolkit** và **Redux Persist** đã được thiết lập thành công.
>
> - Đã cấu hình và bật tính năng lưu state cố định xuống LocalStorage (chống mất dữ liệu khi user ấn F5/Reload) cho các slice: `auth`, `cart`, `theme`.
>
> **Lưu ý & Việc cần làm (To-Do cho team):**
>
> 1. Vui lòng chạy lệnh `npm install` ở Terminal trước khi chạy dự án để kéo các thư viện mới (`@reduxjs/toolkit`, `redux-persist`...).
> 2. Nếu tạo thêm State/Slice mới mà muốn dữ liệu không bị xóa mất khi tải lại trang, hãy nhớ bổ sung tên tên Reducer đó vào mảng `whitelist` nằm trong file `src/redux/store.js`.
> 3. Tham khảo code mẫu tại `src/redux/slices/` để nắm rõ cấu trúc và chuẩn mực viết code Redux chung của nhóm nhé!

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
│ └──auth/
│   ├── Login.jsx
│   ├── Register.jsx
│   └── ForgotPassword.jsx
├── routes/ # Cấu hình định tuyến (Routing Configuration)
│ ├── AppRoutes.jsx # Cấu hình Route gốc (App-level)
│ ├── adminRoutes.jsx # Danh sách Route của Admin (có check quyền)
│ └── userRoutes.jsx # Danh sách Route của User
├── services/ # Nơi chứa các hàm gọi API (VD: authService.js, productService.js)
├── redux/ # Cấu hình Redux store và các Slices
│   ├── slices/ # Các slice của Redux
│   │   ├── authSlice.js # Slice của Redux
│   │   └── userSlice.js # Slice của Redux
│   └── store.js # Store của Redux
└── utils/ # Các hàm tiện ích / cấu hình chung (Helpers/Configs)
├── axiosCustomize.js # Cấu hình Axios instance (Base URL, Token Headers)
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

## 4. Quy chuẩn khi code (Code Conventions)

Để giữ cho source code sạch sẽ, mọi người vui lòng tuân thủ các quy tắc sau:

````markdown
```bash
#Vị trí Component:
- Nếu bạn tạo một cái nút (Button) chỉ dùng riêng cho trang Admin, hãy để nó vào components/admin/. Nếu trang User cũng có thể xài cái nút đó, hãy đưa nó ra components/shared/.

# Gọi API:
- KHÔNG viết trực tiếp hàm axios.get vào bên trong Component. Hãy định nghĩa nó ở trong thư mục services/ sau đó import vào Component để dùng.

# Sử dụng UI Library:
-Hạn chế trộn lẫn antd và shadcn trên cùng một màn hình để tránh xung đột CSS và làm nặng trang.

# Biến môi trường:
- Các thông tin nhạy cảm (như API Endpoint) phải được lưu trong file .env (ví dụ: VITE_API_BASE_URL). Không hardcode link API vào source.
```
````
