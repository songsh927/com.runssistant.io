import type { PaceRange } from './plan'

export type CoachRunType = 'easy' | 'tempo' | 'interval' | 'long_run' | 'recovery' | 'rest'

export interface CoachRecommendation {
  run_type: CoachRunType
  distance_km: number
  pace_range: PaceRange | null
  warmup: string
  main_session: string
  cooldown: string
  reasoning: string
  motivation: string
}

export interface WeeklyContext {
  completed_km: number
  target_km: number | null
  progress_pct: number | null
  remaining_days: number
  sessions_done: number
  plan_adjustment: string | null
}

export interface WeatherContext {
  temp_c: number | null
  humidity: number | null
  condition: string | null
}

export interface RecommendRequest {
  rpe?: number
  notes?: string
}

export interface RecommendResponse {
  session_id: string
  recommendation: CoachRecommendation
  weekly_context: WeeklyContext
  weather: WeatherContext | null
}
