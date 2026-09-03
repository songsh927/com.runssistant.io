import type { RunType } from '@/types/run'
import { runTypeLabel } from '@/utils/format'

const colorMap: Record<RunType, string> = {
  easy: 'bg-[var(--color-easy)]/20 text-[var(--color-easy)]',
  tempo: 'bg-[var(--color-tempo)]/20 text-[var(--color-tempo)]',
  interval: 'bg-[var(--color-interval)]/20 text-[var(--color-interval)]',
  long_run: 'bg-[var(--color-long)]/20 text-[var(--color-long)]',
  race: 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]',
  recovery: 'bg-[var(--color-rest)]/20 text-[var(--color-rest)]',
}

export default function RunTypeBadge({ type }: { type: RunType }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[type]}`}>
      {runTypeLabel(type)}
    </span>
  )
}
