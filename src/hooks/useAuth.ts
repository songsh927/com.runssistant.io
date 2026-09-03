import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as authApi from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import type { LoginRequest, SignupRequest } from '@/types/auth'

export function useLogin() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const { setToken, setAuth } = useAuthStore.getState()
      const { access_token } = await authApi.login(body)
      setToken(access_token)
      const user = await authApi.getMe()
      setAuth(access_token, user)
    },
    onSuccess: () => navigate('/'),
  })
}

export function useSignup() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (body: SignupRequest) => {
      const { setToken, setAuth } = useAuthStore.getState()
      const { access_token } = await authApi.signup(body)
      setToken(access_token)
      const user = await authApi.getMe()
      setAuth(access_token, user)
    },
    onSuccess: () => navigate('/'),
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  return () => {
    logout()
    navigate('/login')
  }
}
