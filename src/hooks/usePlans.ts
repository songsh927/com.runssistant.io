import { useQuery } from '@tanstack/react-query'
import * as plansApi from '@/api/plans'

export function useCurrentPlan() {
  return useQuery({
    queryKey: ['plans', 'current'],
    queryFn: () => plansApi.getCurrent(),
    staleTime: 5 * 60 * 1000,
  })
}
