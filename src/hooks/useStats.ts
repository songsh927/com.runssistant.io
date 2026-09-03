import { useQuery } from '@tanstack/react-query'
import * as statsApi from '@/api/stats'

export function useWeeklyStats() {
  return useQuery({
    queryKey: ['stats', 'weekly'],
    queryFn: () => statsApi.getWeekly(),
    staleTime: 2 * 60 * 1000,
  })
}
