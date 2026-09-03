import apiClient from './client'
import type { WeeklyPlan } from '@/types/plan'

export async function getCurrent(): Promise<WeeklyPlan> {
  return apiClient.get('plans/current').json<WeeklyPlan>()
}
