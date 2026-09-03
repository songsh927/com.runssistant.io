import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as goalsApi from '@/api/goals'
import type { GoalCreate, GoalStatusUpdate, GoalUpdate } from '@/types/goal'

export function useGoals(status?: string) {
  return useQuery({
    queryKey: ['goals', status],
    queryFn: () => goalsApi.list(status),
    staleTime: 10 * 60 * 1000,
  })
}

export function useActiveGoal() {
  return useQuery({
    queryKey: ['goals', 'active'],
    queryFn: () => goalsApi.getActive(),
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: GoalCreate) => goalsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useUpdateGoal(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: GoalUpdate) => goalsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useUpdateGoalStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: GoalStatusUpdate) => goalsApi.updateStatus(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}
