import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as runsApi from '@/api/runs'
import type { RunCreate, RunListParams, RunUpdate } from '@/types/run'

export function useRuns(params?: RunListParams) {
  return useQuery({
    queryKey: ['runs', params],
    queryFn: () => runsApi.list(params),
  })
}

export function useRun(id: string) {
  return useQuery({
    queryKey: ['runs', id],
    queryFn: () => runsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: RunCreate) => runsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['runs'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useUpdateRun(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: RunUpdate) => runsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['runs'] })
    },
  })
}

export function useDeleteRun() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => runsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['runs'] })
    },
  })
}
