import type { PlannedSession } from '@/types/plan'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_KO = ['월', '화', '수', '목', '금', '토', '일']

function sessionIcon(sessions: PlannedSession[], day: string): string {
  const match = sessions.find((s) => s.day === day)
  if (!match) return '-'
  if (match.status === 'completed') return '✅'
  if (match.unplanned) return '➕'
  return '📋'
}

type Props = { sessions: PlannedSession[] }

export default function WeeklyCalendar({ sessions }: Props) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4">
      <p className="mb-3 text-xs font-semibold text-[var(--color-text-muted)]">이번 주</p>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((day, i) => (
          <div key={day} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-[var(--color-text-muted)]">{DAY_KO[i]}</span>
            <span className="text-base leading-none">{sessionIcon(sessions, day)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
