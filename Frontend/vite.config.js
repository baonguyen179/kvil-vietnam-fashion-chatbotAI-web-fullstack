import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    strictPort: true
  },
  build: {
    // [SENIOR OPTIMIZATION] Giải quyết cảnh báo "large chunks"
    chunkSizeWarningLimit: 1000, // Tăng giới hạn cảnh báo lên 1000kB
    rollupOptions: {
      output: {
        // Tách nhỏ các thư viện lớn để trình duyệt cache hiệu quả hơn
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Tách Ant Design vì nó rất nặng
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'vendor-antd';
            }
            // Tách các thư viện xử lý File/Excel (thường chỉ dùng ở trang Admin)
            if (id.includes('exceljs') || id.includes('file-saver')) {
              return 'vendor-excel';
            }
            // Tách Recharts (đồ thị)
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Các thư viện core của React/Redux
            if (id.includes('react') || id.includes('redux')) {
              return 'vendor-core';
            }
            // Mặc định gom các thư viện nhỏ khác vào 'vendor'
            return 'vendor';
          }
        }
      }
    }
  }
})