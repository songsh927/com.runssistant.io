import { useLocation, useNavigate } from 'react-router-dom'
import RunForm from '@/components/run/RunForm'
import { useCreateRun } from '@/hooks/useRuns'
import type { RunType } from '@/types/run'
import { parseDurationToSec } from '@/utils/format'
import type { RunFormValues } from '@/utils/validation'

export default function RunLogPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefill = location.state?.prefill as { run_type: RunType; distance_km: number } | undefined
  const { mutate, isPending } = useCreateRun()

  const handleSubmit = (data: RunFormValues) => {
    mutate(
      {
        run_date: data.run_date,
        run_type: data.run_type,
        distance_km: data.distance_km,
        duration_sec: parseDurationToSec(data.duration_input),
        rpe: data.rpe,
        notes: data.notes,
      },
      { onSuccess: (run) => navigate(`/runs/${run.id}`) },
    )
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
        <button onClick={() => navigate(-1)} className="text-[var(--color-text-muted)]">
          ← 뒤로
        </button>
        <h1 className="text-base font-semibold text-[var(--color-text)]">러닝 기록</h1>
      </div>
      <RunForm onSubmit={handleSubmit} isPending={isPending} submitLabel="저장" prefill={prefill} />
    </div>
  )
}
