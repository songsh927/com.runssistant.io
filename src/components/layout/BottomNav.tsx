import { NavLink } from 'react-router-dom'

type Tab = { to: string; label: string; icon: string; accent?: boolean }

const tabs: Tab[] = [
  { to: '/', label: '홈', icon: '🏠' },
  { to: '/runs', label: '기록', icon: '📋' },
  { to: '/coach', label: '코치', icon: '⚡', accent: true },
  { to: '/settings', label: '설정', icon: '⚙️' },
]

export default function BottomNav() {
  return (
    <nav className="flex border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      {tabs.map(({ to, label, icon, accent }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            [
              'flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors',
              isActive
                ? accent
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text)]'
                : 'text-[var(--color-text-muted)]',
            ].join(' ')
          }
        >
          <span className={accent ? 'text-xl' : 'text-lg'}>{icon}</span>
          <span className={accent ? 'font-semibold text-[var(--color-accent)]' : ''}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
