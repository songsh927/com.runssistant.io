import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/common/Button'
import type { RecommendResponse } from '@/types/coach'
import { coachRunTypeLabel, formatDistance } from '@/utils/format'

type Props = { result: RecommendResponse }

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl bg-[var(--color-surface-2)] p-3">
      <p className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">{title}</p>
      <p className="text-sm text-[var(--color-text)]">{content}</p>
    </div>
  )
}

export default function RecommendationCard({ result }: Props) {
  const { recommendation: rec, weekly_context: ctx, weather } = result
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const navigate = useNavigate()

  const canLog = rec.run_type !== 'rest'

  const handleRunNow = () => {
    navigate('/runs/new', {
      state: { prefill: { run_type: rec.run_type, distance_km: rec.distance_km } },
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-surface)] p-4">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold text-[var(--color-text)]">
          {coachRunTypeLabel(rec.run_type)}
        </span>
        <span className="text-sm text-[var(--color-text-muted)]">
          {formatDistance(rec.distance_km)}
        </span>
        {rec.pace_range && (
          <span className="text-xs text-[var(--color-accent)]">
            {rec.pace_range.min}~{rec.pace_range.max}/km
          </span>
        )}
      </div>

      <Section title="워밍업" content={rec.warmup} />
      <Section title="메인 세션" content={rec.main_session} />
      <Section title="쿨다운" content={rec.cooldown} />

      <p className="text-sm text-[var(--color-text-muted)]">💬 "{rec.motivation}"</p>

      <button
        type="button"
        onClick={() => setReasoningOpen((v) => !v)}
        className="text-left text-xs text-[var(--color-accent)]"
      >
        왜 이 추천? {reasoningOpen ? '▲' : '▼'}
      </button>
      {reasoningOpen && (
        <p className="rounded-xl bg-[var(--color-surface-2)] p-3 text-xs text-[var(--color-text-muted)]">
          {rec.reasoning}
        </p>
      )}

      <p className="text-xs text-[var(--color-text-muted)]">
        {weather && weather.temp_c != null
          ? `☀️ ${weather.temp_c}° 습도 ${weather.humidity ?? '-'}% ${weather.condition ?? ''}`
          : '날씨 정보 없음'}
      </p>

      {ctx.target_km != null && ctx.progress_pct != null ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-[var(--color-text-muted)]">
            이번 주 진행: {ctx.completed_km.toFixed(1)}/{ctx.target_km}km {ctx.progress_pct}%
          </p>
          <div className="h-1.5 rounded-full bg-[var(--color-surface-2)]">
            <div
              className="h-1.5 rounded-full bg-[var(--color-accent)]"
              style={{ width: `${Math.min(ctx.progress_pct, 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-[var(--color-text-muted)]">
          이번 주 완료: {ctx.completed_km.toFixed(1)}km
        </p>
      )}

      {canLog && (
        <Button type="button" fullWidth onClick={handleRunNow}>
          ✅ 이 루틴으로 뛰기
        </Button>
      )}
    </div>
  )
}
