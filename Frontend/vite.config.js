import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
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
    // [SENIOR] Cấu hình ổn định nhất cho Vite 7 trên môi trường Production
    chunkSizeWarningLimit: 1500, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Chỉ tách duy nhất thư viện Excel vì nó quá nặng và không phụ thuộc React
          if (id.includes('node_modules')) {
            if (id.includes('exceljs')) {
              return 'vendor-excel';
            }
          }
        }
      }
    }
  }
})