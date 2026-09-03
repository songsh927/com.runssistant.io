import { Link } from 'react-router-dom'
import WeeklyCalendar from '@/components/dashboard/WeeklyCalendar'
import WeeklyProgress from '@/components/dashboard/WeeklyProgress'
import RunCard from '@/components/run/RunCard'
import { useCurrentPlan } from '@/hooks/usePlans'
import { useRuns } from '@/hooks/useRuns'
import { useWeeklyStats } from '@/hooks/useStats'

export default function HomePage() {
  const { data: stats, isLoading: statsLoading } = useWeeklyStats()
  const { data: plan } = useCurrentPlan()
  const { data: recentRuns } = useRuns({ limit: 3 })

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {statsLoading ? (
        <div className="h-48 rounded-2xl bg-[var(--color-surface)] animate-pulse" />
      ) : (
        <WeeklyProgress
          totalKm={stats?.total_km ?? 0}
          targetKm={stats?.target_km ?? null}
          sessionCount={stats?.session_count ?? 0}
        />
      )}

      <WeeklyCalendar sessions={plan?.planned_sessions ?? []} />

      <Link
        to="/coach"
        className="flex flex-col gap-1 rounded-2xl bg-[var(--color-surface)] p-4 hover:bg-[var(--color-surface-2)] transition-colors"
      >
        <p className="text-xs font-semibold text-[var(--color-accent)]">오늘의 코칭</p>
        <p className="text-sm text-[var(--color-text)]">AI 코치에게 오늘의 러닝을 추천 받으세요</p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">코칭 받기 →</p>
      </Link>

      {recentRuns && recentRuns.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)]">최근 러닝</h2>
          {recentRuns.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </section>
      )}

      <Link
        to="/runs/new"
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)] text-2xl text-[var(--color-bg)] shadow-lg"
      >
        +
      </Link>
    </div>
  )
}
