src/
├── assets/ # Tài nguyên tĩnh (Hình ảnh, fonts, global CSS)
├── components/ # Các UI component (nút bấm, form, modal...)
│ ├── admin/ # Component chỉ dùng cho admin (AdminSidebar, AdminHeader...)
│ ├── user/ # Component chỉ dùng cho user (ProductCard, Banner, UserFooter...)
│ └── shared/ # Component dùng chung cho cả 2 bên (Button, Input, LoadingSpinner...)
├── layouts/ # Nơi chứa các vỏ bọc giao diện
│ ├── AdminLayout.jsx/ # Layout của admin (bao gồm Sidebar + Header + Content Area)
│ └── UserLayout.jsx/ # Layout của user (bao gồm Navbar + Main Content + Footer)
├── pages/ # Các trang hiển thị chính (Views)
│ ├── admin/ # Dashboard, Quản lý người dùng, Quản lý sản phẩm...
│ └── user/ # Trang chủ, Chi tiết sản phẩm, Giỏ hàng, Thông tin cá nhân...
├── routes/ # Cấu hình định tuyến (Routing)
├── AppRoutes.jsx
│ ├── adminRoutes.jsx # Định nghĩa các đường dẫn của Admin
│ ├── userRoutes.jsxx # Định nghĩa các đường dẫn của User
├── services/ # Các hàm gọi API (Axios, Fetch)
├── store/ # Quản lý trạng thái cục bộ (Redux Toolkit)
└── utils/ # Các hàm tiện ích (axios)
| ├── axosCustomize.js
| ├── i18n.js

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
