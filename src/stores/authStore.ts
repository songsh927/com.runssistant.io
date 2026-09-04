import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth'

interface AuthState {
  token: string | null
  user: User | null
  setToken: (token: string) => void
  setAuth: (token: string, user: User) => void
  updateUser: (partial: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setAuth: (token, user) => set({ token, user }),
      updateUser: (partial) => set((s) => (s.user ? { user: { ...s.user, ...partial } } : {})),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth' },
  ),
)
