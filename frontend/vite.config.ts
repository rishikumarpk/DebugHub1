import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:3001'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': apiUrl,
        '/auth': apiUrl
      }
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
