import InjuryPartCard from './InjuryPartCard'
import type { InjuryPart, InjuryProfile, InjuryStatus } from '@/types/profile'

const PARTS: { part: InjuryPart; label: string }[] = [
  { part: 'knee', label: '무릎' },
  { part: 'ankle', label: '발목' },
  { part: 'achilles', label: '아킬레스' },
  { part: 'shin', label: '정강이' },
  { part: 'hip_back', label: '고관절·허리' },
  { part: 'plantar_fascia', label: '족저근막' },
]

const DEFAULT_STATUS: InjuryProfile['status'] = {
  knee: 'none',
  ankle: 'none',
  achilles: 'none',
  shin: 'none',
  hip_back: 'none',
  plantar_fascia: 'none',
}

interface StepInjuriesProps {
  data: Partial<InjuryProfile>
  onChange: (data: Partial<InjuryProfile>) => void
}

export default function StepInjuries({ data, onChange }: StepInjuriesProps) {
  const status = data.status ?? DEFAULT_STATUS

  function handleStatusChange(part: InjuryPart, s: InjuryStatus) {
    onChange({ ...data, status: { ...status, [part]: s } })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">부상 & 통증 이력</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          현재 상태를 선택해 주세요 (모두 없음이어도 됩니다)
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {PARTS.map(({ part, label }) => (
          <InjuryPartCard
            key={part}
            part={part}
            label={label}
            value={status[part]}
            onChange={(s) => handleStatusChange(part, s)}
          />
        ))}
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-[var(--color-text)]">
          부상 이력 메모 <span className="text-xs text-[var(--color-text-muted)]">(선택)</span>
        </p>
        <textarea
          rows={3}
          maxLength={500}
          placeholder="예: 2024년 무릎 수술 후 회복 중"
          value={data.history ?? ''}
          onChange={(e) => onChange({ ...data, history: e.target.value || null })}
          className="w-full rounded-xl border border-[var(--color-surface-2)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
        />
      </div>
    </div>
  )
}
