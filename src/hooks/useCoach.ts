import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as coachApi from '@/api/coach'
import type { RecommendRequest } from '@/types/coach'

export function useCoachRecommend() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: RecommendRequest) => coachApi.recommend(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}
