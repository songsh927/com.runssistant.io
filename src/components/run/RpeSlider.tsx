import { rpeEmoji } from '@/utils/format'

type RpeSliderProps = {
  value: number
  onChange: (v: number) => void
}

export default function RpeSlider({ value, onChange }: RpeSliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[var(--color-text-muted)]">
        운동 강도 (RPE) {value ? `${value}/10 ${rpeEmoji(value)}` : ''}
      </label>
      <input
        type="range"
        min={1}
        max={10}
        value={value ?? 5}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--color-accent)]"
      />
      <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
        <span>쉬움 1</span>
        <span>10 최고</span>
      </div>
    </div>
  )
}
