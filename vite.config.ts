import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const backendUrl = 'http://localhost:8000'
const proxyPaths = ['/auth', '/users', '/runs', '/stats', '/goals', '/plans', '/coach']

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Running Coach',
        short_name: 'RunCoach',
        description: 'AI 기반 러닝 코치',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^\/(auth|users|runs|stats|goals|plans|coach)(\/.*)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
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
