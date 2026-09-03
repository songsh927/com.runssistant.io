import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RunForm from '@/components/run/RunForm'
import RunTypeBadge from '@/components/run/RunTypeBadge'
import Button from '@/components/common/Button'
import { useRun, useUpdateRun, useDeleteRun } from '@/hooks/useRuns'
import { formatDistance, formatDuration, parseDurationToSec, rpeEmoji } from '@/utils/format'
import type { RunFormValues } from '@/utils/validation'

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-[var(--color-surface)] p-3">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p
        className={`text-sm font-semibold ${accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'}`}
      >
        {value}
      </p>
    </div>
  )
}

export default function RunDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)

  const { data: run, isLoading } = useRun(id ?? '')
  const { mutate: updateRun, isPending: isUpdating } = useUpdateRun(id ?? '')
  const { mutate: deleteRun, isPending: isDeleting } = useDeleteRun()

  const handleUpdate = (data: RunFormValues) => {
    updateRun(
      {
        run_date: data.run_date,
        run_type: data.run_type,
        distance_km: data.distance_km,
        duration_sec: parseDurationToSec(data.duration_input),
        rpe: data.rpe ?? null,
        notes: data.notes ?? null,
      },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const handleDelete = () => {
    if (!id || !confirm('이 기록을 삭제할까요?')) return
    deleteRun(id, { onSuccess: () => navigate('/runs') })
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-[var(--color-text-muted)]">
        불러오는 중...
      </div>
    )
  }
  if (!run) {
    return (
      <div className="flex h-40 items-center justify-center text-[var(--color-text-muted)]">
        기록을 찾을 수 없습니다.
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-[var(--color-text-muted)]">
            ← 뒤로
          </button>
          <h1 className="text-base font-semibold text-[var(--color-text)]">기록 상세</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setIsEditing((v) => !v)}>
            {isEditing ? '취소' : '수정'}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            삭제
          </Button>
        </div>
      </div>

      {isEditing ? (
        <RunForm
          defaultValues={run}
          onSubmit={handleUpdate}
          isPending={isUpdating}
          submitLabel="수정 저장"
        />
      ) : (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <RunTypeBadge type={run.run_type} />
            <span className="text-sm text-[var(--color-text-muted)]">{run.run_date}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="거리" value={formatDistance(run.distance_km)} />
            <Stat label="시간" value={formatDuration(run.duration_sec)} />
            <Stat label="페이스" value={run.avg_pace_display ?? '-'} accent />
          </div>
          {run.rpe != null && (
            <div className="rounded-xl bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">운동 강도</p>
              <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                {run.rpe}/10 {rpeEmoji(run.rpe)}
              </p>
            </div>
          )}
          {run.weather_snapshot ? (
            <div className="rounded-xl bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">날씨</p>
              <p className="mt-1 text-sm text-[var(--color-text)]">
                {run.weather_snapshot.condition} {run.weather_snapshot.temp_c}°C / 체감{' '}
                {run.weather_snapshot.feels_like_c}°C
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">날씨 없음</p>
            </div>
          )}
          {run.notes && (
            <div className="rounded-xl bg-[var(--color-surface)] p-3">
              <p className="text-xs text-[var(--color-text-muted)]">메모</p>
              <p className="mt-1 text-sm text-[var(--color-text)]">{run.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
