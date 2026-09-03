import apiClient from './client'
import type { Run, RunCreate, RunListParams, RunUpdate } from '@/types/run'

export async function list(params?: RunListParams): Promise<Run[]> {
  return apiClient
    .get('runs', { searchParams: params as Record<string, string | number> })
    .json<Run[]>()
}

export async function get(id: string): Promise<Run> {
  return apiClient.get(`runs/${id}`).json<Run>()
}

export async function create(body: RunCreate): Promise<Run> {
  return apiClient.post('runs', { json: body }).json<Run>()
}

export async function update(id: string, body: RunUpdate): Promise<Run> {
  return apiClient.put(`runs/${id}`, { json: body }).json<Run>()
}

export async function remove(id: string): Promise<void> {
  await apiClient.delete(`runs/${id}`)
}
