import ChipSelect from './ChipSelect'
import DayPicker from './DayPicker'
import type { TimePerSession, TrainingProfile } from '@/types/profile'
import type { RunType } from '@/types/run'

const TYPE_OPTIONS = [
  { value: 'easy' as RunType, label: '이지런' },
  { value: 'tempo' as RunType, label: '템포런' },
  { value: 'interval' as RunType, label: '인터벌' },
  { value: 'long_run' as RunType, label: '장거리' },
  { value: 'race' as RunType, label: '레이스' },
  { value: 'recovery' as RunType, label: '회복런' },
]

const TIME_OPTIONS = [
  { value: 'under_30min' as TimePerSession, label: '30분 미만' },
  { value: '30_60min' as TimePerSession, label: '30~60분' },
  { value: '60_90min' as TimePerSession, label: '60~90분' },
  { value: 'unlimited' as TimePerSession, label: '제한 없음' },
]

interface StepTrainingProps {
  data: Partial<TrainingProfile>
  onChange: (data: Partial<TrainingProfile>) => void
}

export default function StepTraining({ data, onChange }: StepTrainingProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">주로 어떻게 훈련하나요?</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">현재 훈련 패턴을 파악합니다</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--color-text)]">
          선호 러닝 타입 <span className="text-xs text-[var(--color-text-muted)]">(복수 선택)</span>
        </p>
        <ChipSelect
          multiple
          columns={3}
          options={TYPE_OPTIONS}
          value={data.preferred_types ?? []}
          onChange={(v) => onChange({ ...data, preferred_types: v as RunType[] })}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--color-text)]">
          러닝 가능 요일 <span className="text-xs text-[var(--color-text-muted)]">(복수 선택)</span>
        </p>
        <DayPicker
          value={data.available_days ?? []}
          onChange={(days) => onChange({ ...data, available_days: days })}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--color-text)]">1회 시간 여유</p>
        <ChipSelect
          options={TIME_OPTIONS}
          value={data.time_per_session ?? ('' as TimePerSession)}
          onChange={(v) => onChange({ ...data, time_per_session: v as TimePerSession })}
        />
      </div>
    </div>
  )
}
