import type { InjuryPart, InjuryStatus } from '@/types/profile'

const STATUSES: { value: InjuryStatus; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'mild', label: '경미' },
  { value: 'caution', label: '주의' },
  { value: 'severe', label: '심각' },
]

const selectedColors: Record<InjuryStatus, string> = {
  none: 'border-[var(--color-surface-2)] bg-[var(--color-surface-2)] text-[var(--color-text)]',
  mild: 'border-yellow-500 bg-yellow-500/20 text-yellow-400',
  caution: 'border-orange-500 bg-orange-500/20 text-orange-400',
  severe: 'border-red-500 bg-red-500/20 text-red-400',
}

interface InjuryPartCardProps {
  part: InjuryPart
  label: string
  value: InjuryStatus
  onChange: (status: InjuryStatus) => void
}

export default function InjuryPartCard({ label, value, onChange }: InjuryPartCardProps) {
  return (
    <div className="rounded-xl bg-[var(--color-surface)] p-3">
      <p className="mb-2 text-sm font-medium text-[var(--color-text)]">{label}</p>
      <div className="flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className={`min-h-[36px] flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
              value === s.value
                ? selectedColors[s.value]
                : 'border-[var(--color-surface-2)] bg-transparent text-[var(--color-text-muted)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
