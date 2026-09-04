import { useQuery } from '@tanstack/react-query'
import * as statsApi from '@/api/stats'

export function useWeeklyStats() {
  return useQuery({
    queryKey: ['stats', 'weekly'],
    queryFn: () => statsApi.getWeekly(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useVolumeTrend(weeks = 12) {
  return useQuery({
    queryKey: ['stats', 'trend', weeks],
    queryFn: () => statsApi.getTrend(weeks),
    staleTime: 10 * 60 * 1000,
  })
}

export function usePersonalBests() {
  return useQuery({
    queryKey: ['stats', 'personal-bests'],
    queryFn: () => statsApi.getPersonalBests(),
    staleTime: 10 * 60 * 1000,
  })
}
