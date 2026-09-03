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
