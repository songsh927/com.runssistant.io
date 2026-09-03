import apiClient from './client'
import type { Goal, GoalCreate, GoalStatusUpdate, GoalUpdate } from '@/types/goal'

export async function list(status?: string): Promise<Goal[]> {
  return apiClient.get('goals', { searchParams: status ? { status } : {} }).json<Goal[]>()
}

export async function getActive(): Promise<Goal> {
  return apiClient.get('goals/active').json<Goal>()
}

export async function create(body: GoalCreate): Promise<Goal> {
  return apiClient.post('goals', { json: body }).json<Goal>()
}

export async function update(id: string, body: GoalUpdate): Promise<Goal> {
  return apiClient.put(`goals/${id}`, { json: body }).json<Goal>()
}

export async function updateStatus(id: string, body: GoalStatusUpdate): Promise<Goal> {
  return apiClient.patch(`goals/${id}/status`, { json: body }).json<Goal>()
}
