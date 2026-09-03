import { Link } from 'react-router-dom'
import type { Run } from '@/types/run'
import { formatDistance, formatDuration } from '@/utils/format'
import RunTypeBadge from './RunTypeBadge'

export default function RunCard({ run }: { run: Run }) {
  return (
    <Link
      to={`/runs/${run.id}`}
      className="flex items-center justify-between rounded-xl bg-[var(--color-surface)] p-4 transition-colors hover:bg-[var(--color-surface-2)]"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <RunTypeBadge type={run.run_type} />
          <span className="text-xs text-[var(--color-text-muted)]">{run.run_date}</span>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text)]">
          <span>{formatDistance(run.distance_km)}</span>
          <span className="text-[var(--color-text-muted)]">{formatDuration(run.duration_sec)}</span>
        </div>
      </div>
      {run.avg_pace_display && (
        <span className="text-sm font-semibold text-[var(--color-accent)]">
          {run.avg_pace_display}
        </span>
      )}
    </Link>
  )
}
