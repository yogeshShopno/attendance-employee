// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    sourcemap: false, // Prevent .map files (hides source code structure)
    minify: 'terser', // Minifies JS output
    terserOptions: {
      compress: {
        drop_console: true,   // Remove all console.* calls
        drop_debugger: true,  // Remove debugger statements
      },
    },
  },
})
