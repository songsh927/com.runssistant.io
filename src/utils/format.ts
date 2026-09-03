import type { CoachRunType } from '@/types/coach'
import type { RunType } from '@/types/run'

export function formatPace(totalSec: number): string {
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}/km`
}

export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDistance(km: number): string {
  return `${km.toFixed(2)}km`
}

export function rpeEmoji(rpe: number): string {
  if (rpe <= 3) return '😊'
  if (rpe <= 5) return '🙂'
  if (rpe <= 7) return '😤'
  if (rpe <= 9) return '😰'
  return '🤯'
}

const RUN_TYPE_LABELS: Record<RunType, string> = {
  easy: '이지런',
  tempo: '템포런',
  interval: '인터벌',
  long_run: '장거리',
  race: '레이스',
  recovery: '회복런',
}

export function runTypeLabel(type: RunType): string {
  return RUN_TYPE_LABELS[type]
}

const COACH_RUN_TYPE_LABELS: Record<CoachRunType, string> = {
  easy: '이지런',
  tempo: '템포런',
  interval: '인터벌',
  long_run: '장거리',
  recovery: '회복런',
  rest: '휴식',
}

export function coachRunTypeLabel(type: CoachRunType): string {
  return COACH_RUN_TYPE_LABELS[type]
}

export function parseDurationToSec(input: string): number {
  const parts = input.split(':').map(Number)
  if (parts.some(isNaN)) return 0
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

export function secToDurationInput(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function calcPaceSec(distanceKm: number, durationSec: number): number {
  if (distanceKm <= 0) return 0
  return Math.round(durationSec / distanceKm)
}

export function formatRaceTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function dDay(dateStr: string): string {
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'D-DAY'
  if (diff > 0) return `D-${diff}`
  return `D+${Math.abs(diff)}`
}
