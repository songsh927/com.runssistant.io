const DAYS = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' },
]

interface DayPickerProps {
  value: string[]
  onChange: (days: string[]) => void
}

export default function DayPicker({ value, onChange }: DayPickerProps) {
  function toggle(day: string) {
    const next = value.includes(day) ? value.filter((d) => d !== day) : [...value, day]
    onChange(next)
  }

  return (
    <div className="flex gap-1.5">
      {DAYS.map((d) => {
        const selected = value.includes(d.value)
        return (
          <button
            key={d.value}
            type="button"
            role="checkbox"
            aria-checked={selected}
            onClick={() => toggle(d.value)}
            className={`flex h-[44px] flex-1 items-center justify-center rounded-full text-sm font-medium transition-colors ${
              selected
                ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
            }`}
          >
            {d.label}
          </button>
        )
      })}
    </div>
  )
}
