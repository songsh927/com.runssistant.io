import apiClient from './client'
import type { PersonalBest, TrendPoint, WeeklyStats } from '@/types/stats'

export async function getWeekly(weekStart?: string): Promise<WeeklyStats> {
  return apiClient
    .get('stats/weekly', { searchParams: weekStart ? { week_start: weekStart } : {} })
    .json<WeeklyStats>()
}

export async function getTrend(weeks = 12): Promise<TrendPoint[]> {
  return apiClient.get('stats/trend', { searchParams: { weeks } }).json<TrendPoint[]>()
}

export async function getPersonalBests(): Promise<PersonalBest[]> {
  return apiClient.get('stats/personal-bests').json<PersonalBest[]>()
}
