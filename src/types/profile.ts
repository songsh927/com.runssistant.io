import type { RunType } from '@/types/run'

export type ExperienceLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced'
export type LongestDistance = 'under_5km' | '5_10km' | '10_21km' | 'half_plus'
export type TimePerSession = 'under_30min' | '30_60min' | '60_90min' | 'unlimited'
export type InjuryStatus = 'none' | 'mild' | 'caution' | 'severe'
export type CrossTraining = 'weight' | 'swimming' | 'cycling' | 'yoga' | 'boxing' | 'hiking'
export type InjuryPart = 'knee' | 'ankle' | 'achilles' | 'shin' | 'hip_back' | 'plantar_fascia'

export interface ExperienceProfile {
  level: ExperienceLevel
  runs_per_week: number
  longest_distance: LongestDistance
}

export interface TrainingProfile {
  preferred_types: RunType[]
  available_days: string[]
  time_per_session: TimePerSession
}

export interface InjuryProfile {
  status: Record<InjuryPart, InjuryStatus>
  history?: string | null
}

export interface RunnerProfile {
  experience: ExperienceProfile
  training: TrainingProfile
  cross_training: CrossTraining[]
  injuries: InjuryProfile
  onboarding_completed: boolean
}

export interface OnboardingState {
  step: number
  experience: Partial<ExperienceProfile>
  training: Partial<TrainingProfile>
  cross_training: CrossTraining[]
  injuries: Partial<InjuryProfile>
}
