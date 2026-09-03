import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Header from './Header'

export default function AppShell() {
  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-[var(--color-bg)]">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
