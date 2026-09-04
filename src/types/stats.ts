export interface WeeklyStats {
  week_start: string
  total_km: number
  target_km: number | null
  progress_pct: number | null
  session_count: number
  avg_pace_sec: number | null
  avg_pace_display: string | null
  avg_rpe: number | null
  run_type_breakdown: Record<string, number>
}

export interface TrendPoint {
  week_start: string
  total_km: number
  session_count: number
  avg_pace_sec: number | null
  avg_pace_display: string | null
}

export interface PersonalBest {
  distance_bucket: string
  best_pace_sec: number
  best_pace_display: string
  achieved_on: string
}
