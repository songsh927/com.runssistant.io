import { usePersonalBests } from '@/hooks/useStats'
import type { PersonalBest } from '@/types/stats'

export default function PersonalBests() {
  const { data, isLoading } = usePersonalBests()

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-surface)] p-4">
      <h2 className="text-xs font-semibold text-[var(--color-text-muted)]">개인 기록</h2>
      {!data || data.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">아직 기록 없음</p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--color-surface-2)]">
          {data.map((pb: PersonalBest) => (
            <div key={pb.distance_bucket} className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-[var(--color-text)]">
                {pb.distance_bucket}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-[var(--color-accent)]">
                  {pb.best_pace_display}
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">{pb.achieved_on}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
