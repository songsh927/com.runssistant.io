import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import RunCard from '@/components/run/RunCard'
import { useRuns } from '@/hooks/useRuns'
import type { Run } from '@/types/run'

function groupByMonth(runs: Run[]): Record<string, Run[]> {
  return runs.reduce<Record<string, Run[]>>((acc, run) => {
    const key = format(parseISO(run.run_date), 'yyyy년 MM월', { locale: ko })
    acc[key] = [...(acc[key] ?? []), run]
    return acc
  }, {})
}

export default function RunListPage() {
  const { data: runs, isLoading } = useRuns()

  return (
    <div className="relative flex flex-col pb-20">
      <div className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
        <h1 className="text-base font-semibold text-[var(--color-text)]">러닝 기록</h1>
      </div>

      {isLoading && (
        <div className="flex h-40 items-center justify-center text-[var(--color-text-muted)]">
          불러오는 중...
        </div>
      )}

      {!isLoading && (!runs || runs.length === 0) && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-[var(--color-text-muted)]">아직 기록이 없어요.</p>
          <Link to="/runs/new" className="text-sm text-[var(--color-accent)]">
            첫 러닝 기록하기 →
          </Link>
        </div>
      )}

      {runs && runs.length > 0 && (
        <div className="flex flex-col gap-6 p-4">
          {Object.entries(groupByMonth(runs)).map(([month, monthRuns]) => (
            <div key={month} className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold text-[var(--color-text-muted)]">{month}</h2>
              {monthRuns.map((run) => (
                <RunCard key={run.id} run={run} />
              ))}
            </div>
          ))}
        </div>
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
