interface ChipOption<T extends string> {
  value: T
  label: string
  sublabel?: string
}

interface ChipSelectProps<T extends string> {
  options: ChipOption<T>[]
  value: T | T[]
  onChange: (value: T | T[]) => void
  multiple?: boolean
  columns?: 2 | 3 | 4
}

export default function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  multiple = false,
  columns = 2,
}: ChipSelectProps<T>) {
  const selected = Array.isArray(value) ? value : value ? [value] : []

  function handleSelect(v: T) {
    if (multiple) {
      const arr = Array.isArray(value) ? value : []
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
      onChange(next)
    } else {
      onChange(v)
    }
  }

  const gridCols = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns]

  return (
    <div className={`grid ${gridCols} gap-2`}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={isSelected}
            onClick={() => handleSelect(opt.value)}
            className={`min-h-[44px] rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
              isSelected
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                : 'border-[var(--color-surface-2)] bg-[var(--color-surface)] text-[var(--color-text)]'
            }`}
          >
            <div className="font-medium">{opt.label}</div>
            {opt.sublabel && (
              <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">{opt.sublabel}</div>
            )}
          </button>
        )
      })}
    </div>
  )
}
