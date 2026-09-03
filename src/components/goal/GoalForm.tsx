import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import type { Goal } from '@/types/goal'
import { goalFormSchema, type GoalFormValues } from '@/utils/validation'

type Props = {
  defaultValues?: Goal
  onSubmit: (values: GoalFormValues) => void
  onCancel: () => void
  isPending?: boolean
}

export default function GoalForm({ defaultValues, onSubmit, onCancel, isPending }: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: defaultValues
      ? defaultValues.goal_type === 'weekly_volume'
        ? {
            goal_type: 'weekly_volume',
            weekly_km_target: defaultValues.weekly_km_target ?? undefined,
          }
        : {
            goal_type: 'race',
            race_name: defaultValues.race_name ?? '',
            race_date: defaultValues.race_date ?? '',
            race_distance_km: defaultValues.race_distance_km ?? undefined,
            race_target_time: defaultValues.race_target_time ?? undefined,
          }
      : { goal_type: 'weekly_volume' },
  })

  const goalType = watch('goal_type')

  useEffect(() => {
    if (!defaultValues) {
      reset(
        goalType === 'weekly_volume'
          ? { goal_type: 'weekly_volume' }
          : { goal_type: 'race', race_name: '', race_date: '' },
      )
    }
  }, [goalType, defaultValues, reset])

  const anyErrors = errors as Record<string, { message?: string }>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Controller
          name="goal_type"
          control={control}
          render={({ field }) => (
            <>
              {(['weekly_volume', 'race'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => field.onChange(t)}
                  className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
                    field.value === t
                      ? 'bg-[var(--color-accent)] text-[var(--color-bg)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {t === 'weekly_volume' ? '주간 볼륨' : '대회 목표'}
                </button>
              ))}
            </>
          )}
        />
      </div>

      {goalType === 'weekly_volume' && (
        <Input
          label="주간 목표 거리 (km)"
          type="number"
          step="0.1"
          min="0"
          placeholder="예: 40"
          error={anyErrors.weekly_km_target?.message}
          {...register('weekly_km_target', { valueAsNumber: true })}
        />
      )}

      {goalType === 'race' && (
        <>
          <Input
            label="대회 이름"
            placeholder="예: 서울마라톤 2027"
            error={anyErrors.race_name?.message}
            {...register('race_name')}
          />
          <Input
            label="대회 날짜"
            type="date"
            error={anyErrors.race_date?.message}
            {...register('race_date')}
          />
          <Input
            label="대회 거리 (km)"
            type="number"
            step="0.1"
            min="0"
            placeholder="예: 42.195"
            error={anyErrors.race_distance_km?.message}
            {...register('race_distance_km', { valueAsNumber: true })}
          />
          <Input
            label="목표 시간 (초, 선택)"
            type="number"
            min="0"
            placeholder="예: 14400 (4시간)"
            error={anyErrors.race_target_time?.message}
            {...register('race_target_time', { valueAsNumber: true })}
          />
        </>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
          취소
        </Button>
        <Button type="submit" disabled={isPending} fullWidth>
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  )
}
