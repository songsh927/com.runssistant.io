import type { OnboardingState } from '@/types/profile'

const LEVEL_LABELS: Record<string, string> = {
  beginner: '입문 (0~3개월)',
  novice: '초급 (3~12개월)',
  intermediate: '중급 (1~3년)',
  advanced: '상급 (3년+)',
}

const DISTANCE_LABELS: Record<string, string> = {
  under_5km: '5km 이하',
  '5_10km': '5~10km',
  '10_21km': '10~21km',
  half_plus: '하프+',
}

const TYPE_LABELS: Record<string, string> = {
  easy: '이지런',
  tempo: '템포런',
  interval: '인터벌',
  long_run: '장거리',
  race: '레이스',
  recovery: '회복런',
}

const DAY_LABELS: Record<string, string> = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
  sun: '일',
}

const TIME_LABELS: Record<string, string> = {
  under_30min: '30분 미만',
  '30_60min': '30~60분',
  '60_90min': '60~90분',
  unlimited: '제한 없음',
}

const CROSS_LABELS: Record<string, string> = {
  weight: '웨이트',
  swimming: '수영',
  cycling: '사이클',
  yoga: '요가',
  boxing: '복싱',
  hiking: '등산',
}

const PART_LABELS: Record<string, string> = {
  knee: '무릎',
  ankle: '발목',
  achilles: '아킬레스',
  shin: '정강이',
  hip_back: '고관절·허리',
  plantar_fascia: '족저근막',
}

const STATUS_LABELS: Record<string, string> = {
  none: '없음',
  mild: '경미',
  caution: '주의',
  severe: '심각',
}

interface ProfileSummaryProps {
  state: OnboardingState
}

export default function ProfileSummary({ state }: ProfileSummaryProps) {
  const { experience, training, cross_training, injuries } = state
  const injuryStatus = (injuries.status ?? {}) as Record<string, string>
  const hasInjury = Object.values(injuryStatus).some((s) => s !== 'none')

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">프로필 확인</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          아래 내용으로 등록됩니다. 수정이 필요하면 이전 단계로 돌아가세요.
        </p>
      </div>

      <SummarySection title="경험">
        <Row label="수준" value={LEVEL_LABELS[experience.level ?? ''] ?? '-'} />
        <Row label="주간 횟수" value={`${experience.runs_per_week ?? '-'}회`} />
        <Row label="최장 거리" value={DISTANCE_LABELS[experience.longest_distance ?? ''] ?? '-'} />
      </SummarySection>

      <SummarySection title="훈련 패턴">
        <Row
          label="선호 타입"
          value={(training.preferred_types ?? []).map((t) => TYPE_LABELS[t]).join(', ') || '-'}
        />
        <Row
          label="가능 요일"
          value={(training.available_days ?? []).map((d) => DAY_LABELS[d]).join(', ') || '-'}
        />
        <Row label="1회 시간" value={TIME_LABELS[training.time_per_session ?? ''] ?? '-'} />
      </SummarySection>

      <SummarySection title="크로스 트레이닝">
        <Row label="활동" value={cross_training.map((c) => CROSS_LABELS[c]).join(', ') || '없음'} />
      </SummarySection>

      <SummarySection title="부상 상태">
        {hasInjury ? (
          Object.entries(injuryStatus)
            .filter(([, s]) => s !== 'none')
            .map(([part, status]) => (
              <Row
                key={part}
                label={PART_LABELS[part] ?? part}
                value={STATUS_LABELS[status] ?? status}
              />
            ))
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">부상 없음</p>
        )}
      </SummarySection>
    </div>
  )
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[var(--color-surface)] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="shrink-0 text-sm text-[var(--color-text-muted)]">{label}</span>
      <span className="text-right text-sm font-medium text-[var(--color-text)]">{value}</span>
    </div>
  )
}
