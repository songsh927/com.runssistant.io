import ChipSelect from './ChipSelect'
import type { ExperienceLevel, ExperienceProfile, LongestDistance } from '@/types/profile'

const LEVEL_OPTIONS = [
  { value: 'beginner' as ExperienceLevel, label: '입문', sublabel: '0~3개월' },
  { value: 'novice' as ExperienceLevel, label: '초급', sublabel: '3~12개월' },
  { value: 'intermediate' as ExperienceLevel, label: '중급', sublabel: '1~3년' },
  { value: 'advanced' as ExperienceLevel, label: '상급', sublabel: '3년+' },
]

const DISTANCE_OPTIONS = [
  { value: 'under_5km' as LongestDistance, label: '5km 이하' },
  { value: '5_10km' as LongestDistance, label: '5~10km' },
  { value: '10_21km' as LongestDistance, label: '10~21km' },
  { value: 'half_plus' as LongestDistance, label: '하프+' },
]

interface StepExperienceProps {
  data: Partial<ExperienceProfile>
  onChange: (data: Partial<ExperienceProfile>) => void
}

export default function StepExperience({ data, onChange }: StepExperienceProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          러닝 경험이 어느 정도인가요?
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          코칭 강도와 용어 수준을 맞춰 드립니다
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--color-text)]">경험 수준</p>
        <ChipSelect
          options={LEVEL_OPTIONS}
          value={data.level ?? ('' as ExperienceLevel)}
          onChange={(v) => onChange({ ...data, level: v as ExperienceLevel })}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--color-text)]">
          주간 러닝 횟수:{' '}
          <span className="text-[var(--color-accent)]">{data.runs_per_week ?? 3}회</span>
        </p>
        <input
          type="range"
          min={1}
          max={7}
          value={data.runs_per_week ?? 3}
          aria-label="주간 러닝 횟수"
          aria-valuemin={1}
          aria-valuemax={7}
          aria-valuenow={data.runs_per_week ?? 3}
          onChange={(e) => onChange({ ...data, runs_per_week: Number(e.target.value) })}
          className="w-full accent-[var(--color-accent)]"
        />
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>1회</span>
          <span>7회</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-[var(--color-text)]">최근 가장 긴 러닝</p>
        <ChipSelect
          options={DISTANCE_OPTIONS}
          value={data.longest_distance ?? ('' as LongestDistance)}
          onChange={(v) => onChange({ ...data, longest_distance: v as LongestDistance })}
        />
      </div>
    </div>
  )
}
