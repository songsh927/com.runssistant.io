import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import RpeSlider from './RpeSlider'
import type { Run, RunType } from '@/types/run'
import { calcPaceSec, formatPace, parseDurationToSec, secToDurationInput } from '@/utils/format'
import { runFormSchema, type RunFormValues } from '@/utils/validation'

const RUN_TYPES: RunType[] = ['easy', 'tempo', 'interval', 'long_run', 'race', 'recovery']
const TYPE_LABELS: Record<RunType, string> = {
  easy: '이지런',
  tempo: '템포런',
  interval: '인터벌',
  long_run: '장거리',
  race: '레이스',
  recovery: '회복런',
}

type Prefill = { run_type: RunType; distance_km: number }

type RunFormProps = {
  defaultValues?: Run
  prefill?: Prefill
  onSubmit: (data: RunFormValues) => void
  isPending: boolean
  submitLabel?: string
}

export default function RunForm({
  defaultValues,
  prefill,
  onSubmit,
  isPending,
  submitLabel = '저장',
}: RunFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RunFormValues>({
    resolver: zodResolver(runFormSchema),
    defaultValues: defaultValues
      ? {
          run_date: defaultValues.run_date,
          run_type: defaultValues.run_type,
          distance_km: defaultValues.distance_km,
          duration_input: secToDurationInput(defaultValues.duration_sec),
          rpe: defaultValues.rpe ?? undefined,
          notes: defaultValues.notes ?? '',
        }
      : {
          run_date: new Date().toISOString().slice(0, 10),
          run_type: prefill?.run_type ?? 'easy',
          distance_km: prefill?.distance_km,
          rpe: 5,
        },
  })

  const distanceKm = watch('distance_km')
  const durationInput = watch('duration_input')
  const durationSec = parseDurationToSec(durationInput ?? '')
  const paceSec = calcPaceSec(distanceKm ?? 0, durationSec)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 p-4">
      <Input label="날짜" type="date" error={errors.run_date?.message} {...register('run_date')} />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--color-text-muted)]">운동 종류</label>
        <Controller
          name="run_type"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {RUN_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => field.onChange(t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    field.value === t
                      ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          )}
        />
        {errors.run_type && (
          <p className="text-xs text-[var(--color-error)]">{errors.run_type.message}</p>
        )}
      </div>

      <Input
        label="거리 (km)"
        type="number"
        step="0.01"
        placeholder="5.00"
        error={errors.distance_km?.message}
        {...register('distance_km', { valueAsNumber: true })}
      />

      <div className="flex flex-col gap-1">
        <Input
          label="시간 (mm:ss)"
          type="text"
          placeholder="30:00"
          error={errors.duration_input?.message}
          {...register('duration_input')}
        />
        {paceSec > 0 && (
          <p className="text-xs text-[var(--color-accent)]">예상 페이스: {formatPace(paceSec)}</p>
        )}
      </div>

      <Controller
        name="rpe"
        control={control}
        render={({ field }) => (
          <RpeSlider value={field.value ?? 5} onChange={(v) => setValue('rpe', v)} />
        )}
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--color-text-muted)]">메모 (선택)</label>
        <textarea
          {...register('notes')}
          placeholder="오늘 러닝 어땠나요?"
          rows={3}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
        />
      </div>

      <Button type="submit" disabled={isPending} fullWidth>
        {isPending ? '저장 중...' : submitLabel}
      </Button>
    </form>
  )
}
