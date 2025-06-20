// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy konfiqurasiyası
    proxy: {
      // Əgər sorğu /api ilə başlayırsa...
      '/api': {
        // ...həmin sorğunu bu ünvana yönləndir
        target: 'http://localhost:5000',
        // Origin-i dəyişmək üçün (CORS xətalarının qarşısını alır)
        changeOrigin: true,
      }
    }
  }
})