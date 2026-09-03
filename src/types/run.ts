export type RunType = 'easy' | 'tempo' | 'interval' | 'long_run' | 'race' | 'recovery'

export interface WeatherSnapshot {
  temp_c: number
  feels_like_c: number
  humidity: number
  condition: string
  wind_speed_ms: number
}

export interface Run {
  id: string
  run_date: string
  distance_km: number
  duration_sec: number
  run_type: RunType
  rpe: number | null
  notes: string | null
  avg_pace_sec: number | null
  avg_pace_display: string | null
  weather_snapshot: WeatherSnapshot | null
  created_at: string
}

export interface RunCreate {
  run_date: string
  distance_km: number
  duration_sec: number
  run_type: RunType
  rpe?: number
  notes?: string
}

export interface RunUpdate {
  run_date?: string
  distance_km?: number
  duration_sec?: number
  run_type?: RunType
  rpe?: number | null
  notes?: string | null
}

export interface RunListParams {
  from?: string
  to?: string
  limit?: number
  offset?: number
}
