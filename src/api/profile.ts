import apiClient from './client'
import type { RunnerProfile } from '@/types/profile'

type ProfileCreate = Omit<RunnerProfile, 'onboarding_completed'>
type ProfileUpdate = Partial<ProfileCreate>

export const profileApi = {
  create: (data: ProfileCreate) =>
    apiClient.post('users/profile', { json: data }).json<RunnerProfile>(),

  get: () => apiClient.get('users/profile').json<RunnerProfile>(),

  update: (data: ProfileUpdate) =>
    apiClient.patch('users/profile', { json: data }).json<RunnerProfile>(),
}
