export type GoalType = 'weekly_volume' | 'race'
export type GoalStatus = 'active' | 'completed' | 'abandoned'

export interface Goal {
  id: string
  user_id: string
  goal_type: GoalType
  weekly_km_target: number | null
  race_name: string | null
  race_date: string | null
  race_target_time: number | null
  race_distance_km: number | null
  status: GoalStatus
  created_at: string
  updated_at: string
}

export interface GoalCreate {
  goal_type: GoalType
  weekly_km_target?: number
  race_name?: string
  race_date?: string
  race_target_time?: number
  race_distance_km?: number
}

export interface GoalUpdate {
  weekly_km_target?: number
  race_name?: string
  race_date?: string
  race_target_time?: number
  race_distance_km?: number
}

export interface GoalStatusUpdate {
  status: 'completed' | 'abandoned'
}
