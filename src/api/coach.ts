import apiClient from './client'
import type { RecommendRequest, RecommendResponse } from '@/types/coach'

export async function recommend(body: RecommendRequest): Promise<RecommendResponse> {
  return apiClient.post('coach/recommend', { json: body , timeout: 200000}).json<RecommendResponse>()
}
