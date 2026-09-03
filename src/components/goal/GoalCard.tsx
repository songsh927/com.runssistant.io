import Button from '@/components/common/Button'
import RaceCountdown from './RaceCountdown'
import type { Goal } from '@/types/goal'
import { formatDistance, formatRaceTime } from '@/utils/format'

type Props = {
  goal: Goal
  totalKm?: number
  onEdit: () => void
  onComplete: () => void
  onAbandon: () => void
}

export default function GoalCard({ goal, totalKm = 0, onEdit, onComplete, onAbandon }: Props) {
  const isWeekly = goal.goal_type === 'weekly_volume'
  const target = goal.weekly_km_target ?? 0
  const pct = target > 0 ? Math.min(Math.round((totalKm / target) * 100), 100) : 0

  return (
    <div className="rounded-2xl bg-[var(--color-surface)] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          {isWeekly ? (
            <p className="text-sm font-semibold text-[var(--color-text)]">
              주간 {formatDistance(target)} 목표
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-[var(--color-text)]">🏁 {goal.race_name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {formatDistance(goal.race_distance_km ?? 0)}
                {goal.race_target_time != null && (
                  <span> · 목표 {formatRaceTime(goal.race_target_time)}</span>
                )}
              </p>
            </>
          )}
        </div>
        {!isWeekly && goal.race_date && <RaceCountdown raceDate={goal.race_date} />}
      </div>

      {isWeekly && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-[var(--color-text-muted)]">
            이번 주: {formatDistance(totalKm)} / {formatDistance(target)} ({pct}%)
          </p>
          <div className="h-2 rounded-full bg-[var(--color-surface-2)]">
            <div
              className="h-2 rounded-full bg-[var(--color-accent)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="ghost" onClick={onEdit} fullWidth>
          수정
        </Button>
        <Button variant="ghost" onClick={onComplete} fullWidth>
          완료
        </Button>
        <Button variant="danger" onClick={onAbandon} fullWidth>
          포기
        </Button>
      </div>
    </div>
  )
}
