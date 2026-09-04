import ChipSelect from './ChipSelect'
import type { CrossTraining } from '@/types/profile'

const CROSS_OPTIONS = [
  { value: 'weight' as CrossTraining, label: '웨이트' },
  { value: 'swimming' as CrossTraining, label: '수영' },
  { value: 'cycling' as CrossTraining, label: '사이클' },
  { value: 'yoga' as CrossTraining, label: '요가' },
  { value: 'boxing' as CrossTraining, label: '복싱' },
  { value: 'hiking' as CrossTraining, label: '등산' },
]

interface StepCrossTrainingProps {
  value: CrossTraining[]
  onChange: (value: CrossTraining[]) => void
}

export default function StepCrossTraining({ value, onChange }: StepCrossTrainingProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">크로스 트레이닝</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          러닝 외에 병행하는 운동이 있나요? <span className="text-xs">(선택 없어도 됩니다)</span>
        </p>
      </div>

      <ChipSelect
        multiple
        columns={3}
        options={CROSS_OPTIONS}
        value={value}
        onChange={(v) => onChange(v as CrossTraining[])}
      />
    </div>
  )
}
