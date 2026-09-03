import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const backendUrl = 'http://localhost:8000'
const proxyPaths = ['/auth', '/runs', '/stats', '/goals', '/plans', '/coach']

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  server: {
    proxy: Object.fromEntries(
      proxyPaths.map((path) => [
        path,
        {
          target: backendUrl,
          changeOrigin: true,
          bypass: (req) => {
            if (req.headers.accept?.includes('text/html')) return '/index.html'
          },
        },
      ]),
    ),
  },
})
