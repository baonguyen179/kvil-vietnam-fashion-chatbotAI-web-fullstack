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
    // [SENIOR OPTIMIZATION] Tối ưu hóa Chunking để tránh lỗi Runtime
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // [CRITICAL FIX] Gộp React và Ant Design vào cùng một chunk
            // Điều này đảm bảo antd luôn tìm thấy React.createContext khi khởi tạo
            if (
              id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('react-router-dom') ||
              id.includes('antd') ||
              id.includes('@ant-design')
            ) {
              return 'vendor-framework';
            }
            
            // Tách các thư viện quản lý State
            if (id.includes('redux') || id.includes('@reduxjs')) {
              return 'vendor-state';
            }

            // Tách các thư viện nặng không dùng thường xuyên (chỉ dùng ở Admin/Charts)
            if (id.includes('exceljs') || id.includes('recharts') || id.includes('file-saver')) {
              return 'vendor-heavy';
            }

            // Các thư viện nhỏ khác
            return 'vendor-others';
          }
        }
      }
    }
  }
})