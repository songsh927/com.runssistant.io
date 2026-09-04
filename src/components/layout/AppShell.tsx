import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import OfflineBanner from '@/components/common/OfflineBanner'
import Toast from '@/components/common/Toast'
import { useUIStore } from '@/stores/uiStore'
import BottomNav from './BottomNav'
import Header from './Header'

export default function AppShell() {
  const setOnline = useUIStore((s) => s.setOnline)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-[var(--color-bg)]">
      <Header />
      <OfflineBanner />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <Toast />
    </div>
  )
}
