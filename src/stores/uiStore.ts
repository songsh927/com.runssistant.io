import { create } from 'zustand'

interface Toast {
  message: string
  type: 'success' | 'error'
}

interface UIState {
  isOnline: boolean
  pendingSyncCount: number
  toast: Toast | null
  setOnline: (isOnline: boolean) => void
  setPendingCount: (count: number) => void
  showToast: (message: string, type: Toast['type']) => void
  clearToast: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  isOnline: navigator.onLine,
  pendingSyncCount: 0,
  toast: null,
  setOnline: (isOnline) => set({ isOnline }),
  setPendingCount: (pendingSyncCount) => set({ pendingSyncCount }),
  showToast: (message, type) => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}))
