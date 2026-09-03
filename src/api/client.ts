import ky from 'ky'
import { useAuthStore } from '@/stores/authStore'

const apiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401 && !request.url.includes('/auth/')) {
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      },
    ],
  },
  retry: { limit: 2, methods: ['get'] },
})

export default apiClient
