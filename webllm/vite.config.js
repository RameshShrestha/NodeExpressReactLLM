import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    build: {
    sourcemap: true, // or 'inline' for a single file
  },
  server: {
    port : 5173,
    proxy: {
      '/dataprovider': {
        target: 'http://localhost:5000/', // The address of your Express server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/dataprovider/, ''),
      },
    },
  }
})
