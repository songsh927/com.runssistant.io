export interface PaceRange {
  min: string
  max: string
}

export interface PlannedSession {
  day: string
  type: string
  distance_km: number
  pace_range: PaceRange | null
  status: string
  actual_distance_km: number | null
  run_id: string | null
  unplanned: boolean
}

export interface WeeklyPlan {
  id: string
  user_id: string
  goal_id: string | null
  week_start: string
  planned_sessions: PlannedSession[]
  total_planned_km: number | null
  completed_km: number
  remaining_km: number | null
  progress_pct: number | null
  adjustments_log: Record<string, unknown>[]
  created_at: string
  updated_at: string
}
