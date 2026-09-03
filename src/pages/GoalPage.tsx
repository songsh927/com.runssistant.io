import { useState } from 'react'
import GoalCard from '@/components/goal/GoalCard'
import GoalForm from '@/components/goal/GoalForm'
import Button from '@/components/common/Button'
import {
  useActiveGoal,
  useCreateGoal,
  useGoals,
  useUpdateGoal,
  useUpdateGoalStatus,
} from '@/hooks/useGoals'
import { useWeeklyStats } from '@/hooks/useStats'
import type { Goal } from '@/types/goal'
import type { GoalFormValues } from '@/utils/validation'

export default function GoalPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const { data: activeGoal } = useActiveGoal()
  const { data: completedGoals } = useGoals('completed')
  const { data: stats } = useWeeklyStats()

  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal(editingGoal?.id ?? '')
  const updateStatus = useUpdateGoalStatus(activeGoal?.id ?? '')

  function handleSubmit(values: GoalFormValues) {
    if (editingGoal) {
      const body =
        values.goal_type === 'weekly_volume'
          ? { weekly_km_target: values.weekly_km_target }
          : {
              race_name: values.race_name,
              race_date: values.race_date,
              race_distance_km: values.race_distance_km,
              race_target_time: values.race_target_time,
            }
      updateGoal.mutate(body, {
        onSuccess: () => {
          setEditingGoal(null)
          setShowForm(false)
        },
      })
    } else {
      const body =
        values.goal_type === 'weekly_volume'
          ? { goal_type: 'weekly_volume' as const, weekly_km_target: values.weekly_km_target }
          : {
              goal_type: 'race' as const,
              race_name: values.race_name,
              race_date: values.race_date,
              race_distance_km: values.race_distance_km,
              race_target_time: values.race_target_time,
            }
      createGoal.mutate(body, {
        onSuccess: () => setShowForm(false),
      })
    }
  }

  function handleCancel() {
    setEditingGoal(null)
    setShowForm(false)
  }

  return (
    <div className="flex flex-col pb-20">
      <div className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
        <h1 className="text-base font-semibold text-[var(--color-text)]">목표</h1>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {activeGoal && !showForm && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-[var(--color-text-muted)]">활성 목표</h2>
            <GoalCard
              goal={activeGoal}
              totalKm={stats?.total_km ?? 0}
              onEdit={() => {
                setEditingGoal(activeGoal)
                setShowForm(true)
              }}
              onComplete={() => updateStatus.mutate({ status: 'completed' })}
              onAbandon={() => {
                if (confirm('목표를 포기하시겠습니까?')) {
                  updateStatus.mutate({ status: 'abandoned' })
                }
              }}
            />
          </section>
        )}

        {showForm && (
          <section className="rounded-2xl bg-[var(--color-surface)] p-4">
            <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
              {editingGoal ? '목표 수정' : '새 목표'}
            </h2>
            <GoalForm
              defaultValues={editingGoal ?? undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isPending={createGoal.isPending || updateGoal.isPending}
            />
          </section>
        )}

        {!showForm && !activeGoal && (
          <Button fullWidth onClick={() => setShowForm(true)}>
            + 새 목표 만들기
          </Button>
        )}

        {completedGoals && completedGoals.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-[var(--color-text-muted)]">완료된 목표</h2>
            {completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-2xl bg-[var(--color-surface)] p-4 flex items-center gap-3"
              >
                <span className="text-base">✅</span>
                <div className="flex flex-col">
                  <p className="text-sm text-[var(--color-text)]">
                    {goal.goal_type === 'weekly_volume'
                      ? `주간 ${goal.weekly_km_target}km`
                      : goal.race_name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {new Date(goal.created_at).toLocaleDateString('ko-KR')} –{' '}
                    {new Date(goal.updated_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
