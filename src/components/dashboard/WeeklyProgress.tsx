import { Link } from 'react-router-dom'

type Props = {
  totalKm: number
  targetKm: number | null
  sessionCount: number
}

export default function WeeklyProgress({ totalKm, targetKm, sessionCount }: Props) {
  if (targetKm === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-[var(--color-surface)] p-6">
        <p className="text-sm text-[var(--color-text-muted)]">주간 목표가 없습니다</p>
        <Link to="/goals" className="text-sm text-[var(--color-accent)]">
          목표 설정하기 →
        </Link>
      </div>
    )
  }

  const pct = targetKm > 0 ? Math.min(Math.round((totalKm / targetKm) * 100), 100) : 0
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct / 100)

  const ringColor =
    pct >= 100 ? '#22c55e' : pct >= 60 ? 'var(--color-accent)' : 'var(--color-text-muted)'

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-[var(--color-surface)] p-6">
      <div className="relative flex items-center justify-center">
        <svg width="132" height="132" className="-rotate-90">
          <circle
            cx="66"
            cy="66"
            r={radius}
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth="10"
          />
          <circle
            cx="66"
            cy="66"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-bold text-[var(--color-text)]">{totalKm.toFixed(1)}</span>
          <span className="text-xs text-[var(--color-text-muted)]">/ {targetKm}km</span>
          <span className="text-sm font-semibold text-[var(--color-accent)]">{pct}%</span>
        </div>
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">이번 주 {sessionCount}회 완료</p>
    </div>
  )
}
