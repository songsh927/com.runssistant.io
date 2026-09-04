import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
})

export const signupSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  location: z.string().optional(),
})

export const runFormSchema = z.object({
  run_date: z.string().min(1, '날짜를 선택하세요'),
  run_type: z.enum(['easy', 'tempo', 'interval', 'long_run', 'race', 'recovery']),
  distance_km: z
    .number({ invalid_type_error: '거리를 입력하세요' })
    .positive('거리는 0보다 커야 합니다'),
  duration_input: z.string().regex(/^\d+:\d{2}$/, '시간 형식: mm:ss'),
  rpe: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
})

export const goalFormSchema = z.discriminatedUnion('goal_type', [
  z.object({
    goal_type: z.literal('weekly_volume'),
    weekly_km_target: z
      .number({ invalid_type_error: '목표 거리를 입력하세요' })
      .positive('0보다 커야 합니다'),
  }),
  z.object({
    goal_type: z.literal('race'),
    race_name: z.string().min(1, '대회 이름을 입력하세요'),
    race_date: z.string().min(1, '대회 날짜를 선택하세요'),
    race_distance_km: z
      .number({ invalid_type_error: '대회 거리를 입력하세요' })
      .positive('0보다 커야 합니다'),
    race_target_time: z.number().positive().optional(),
  }),
])

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>
export type RunFormValues = z.infer<typeof runFormSchema>
export type GoalFormValues = z.infer<typeof goalFormSchema>

// ─── Onboarding / Profile schemas ───────────────────────────────────────────

import type { OnboardingState } from '@/types/profile'

export const experienceSchema = z.object({
  level: z.enum(['beginner', 'novice', 'intermediate', 'advanced']),
  runs_per_week: z.number().int().min(1).max(7),
  longest_distance: z.enum(['under_5km', '5_10km', '10_21km', 'half_plus']),
})

export const trainingSchema = z.object({
  preferred_types: z
    .array(z.enum(['easy', 'tempo', 'interval', 'long_run', 'race', 'recovery']))
    .min(1, '최소 1개 선택'),
  available_days: z.array(z.string()).min(1, '최소 1일 선택'),
  time_per_session: z.enum(['under_30min', '30_60min', '60_90min', 'unlimited']),
})

const injuryStatusSchema = z.object({
  knee: z.enum(['none', 'mild', 'caution', 'severe']),
  ankle: z.enum(['none', 'mild', 'caution', 'severe']),
  achilles: z.enum(['none', 'mild', 'caution', 'severe']),
  shin: z.enum(['none', 'mild', 'caution', 'severe']),
  hip_back: z.enum(['none', 'mild', 'caution', 'severe']),
  plantar_fascia: z.enum(['none', 'mild', 'caution', 'severe']),
})

export const injurySchema = z.object({
  status: injuryStatusSchema,
  history: z.string().max(500).optional().nullable(),
})

export const runnerProfileSchema = z.object({
  experience: experienceSchema,
  training: trainingSchema,
  cross_training: z.array(z.enum(['weight', 'swimming', 'cycling', 'yoga', 'boxing', 'hiking'])),
  injuries: injurySchema,
})

export function validateStep(state: OnboardingState): boolean {
  switch (state.step) {
    case 0:
      return experienceSchema.safeParse(state.experience).success
    case 1:
      return trainingSchema.safeParse(state.training).success
    case 2:
      return true
    case 3:
      return true
    case 4:
      return runnerProfileSchema.safeParse({
        experience: state.experience,
        training: state.training,
        cross_training: state.cross_training,
        injuries: state.injuries,
      }).success
    default:
      return false
  }
}
