import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// Plugin untuk membersihkan folder assets sebelum build
// agar file CSS/JS lama tidak menumpuk
function cleanAssetsPlugin() {
  return {
    name: 'clean-assets',
    buildStart() {
      const assetsDir = path.resolve(__dirname, '../backend/public/assets')
      if (fs.existsSync(assetsDir)) {
        fs.rmSync(assetsDir, { recursive: true, force: true })
        console.log('🧹 Cleaned old assets folder')
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cleanAssetsPlugin()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/gateway': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/APIGATELU': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../backend/public'),
    emptyOutDir: false,
  },
})
