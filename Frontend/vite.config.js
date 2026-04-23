import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    splitVendorChunkPlugin() // [SENIOR] Sử dụng plugin chính thức để tách vendor an toàn
  ],
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
    // [SENIOR] Ưu tiên sự ổn định trên môi trường Production
    chunkSizeWarningLimit: 2000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          // CHỈ tách các thư viện cực nặng và không phụ thuộc trực tiếp vào runtime của React
          if (id.includes('node_modules')) {
            if (id.includes('exceljs') || id.includes('file-saver')) {
              return 'vendor-excel-processing';
            }
            if (id.includes('recharts')) {
              return 'vendor-analytics-charts';
            }
            // Để các thư viện React, Antd, Lucide... cho splitVendorChunkPlugin tự xử lý an toàn
          }
        }
      }
    }
  }
})