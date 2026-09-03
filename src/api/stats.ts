import apiClient from './client'
import type { WeeklyStats } from '@/types/stats'

export async function getWeekly(weekStart?: string): Promise<WeeklyStats> {
  return apiClient
    .get('stats/weekly', { searchParams: weekStart ? { week_start: weekStart } : {} })
    .json<WeeklyStats>()
}
