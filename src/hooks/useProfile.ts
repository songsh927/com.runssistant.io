import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileApi } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import type { RunnerProfile } from '@/types/profile'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
    staleTime: 30 * 60 * 1000,
    retry: false,
  })
}

export function useCreateProfile() {
  const qc = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)

  return useMutation({
    mutationFn: (data: Omit<RunnerProfile, 'onboarding_completed'>) => profileApi.create(data),
    onSuccess: (data) => {
      qc.setQueryData(['profile'], data)
      updateUser({ onboarding_completed: true })
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<Omit<RunnerProfile, 'onboarding_completed'>>) =>
      profileApi.update(data),
    onSuccess: (data) => {
      qc.setQueryData(['profile'], data)
    },
  })
}
