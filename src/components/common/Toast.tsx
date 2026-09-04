import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'

export default function Toast() {
  const toast = useUIStore((s) => s.toast)
  const clearToast = useUIStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(clearToast, 3000)
    return () => clearTimeout(id)
  }, [toast, clearToast])

  if (!toast) return null

  const isError = toast.type === 'error'

  return (
    <div
      role="alert"
      className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
        isError
          ? 'bg-[var(--color-error)] text-white'
          : 'bg-[var(--color-success)] text-[var(--color-bg)]'
      }`}
    >
      {toast.message}
    </div>
  )
}
