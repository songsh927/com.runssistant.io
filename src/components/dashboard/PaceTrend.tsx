import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useVolumeTrend } from '@/hooks/useStats'
import type { TrendPoint } from '@/types/stats'

function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatPaceTick(paceSeconds: number): string {
  const min = Math.floor(paceSeconds / 60)
  const sec = Math.round(paceSeconds % 60)
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-text)]">
      <p className="text-[var(--color-text-muted)]">{label ? formatWeekLabel(label) : ''}</p>
      <p>{formatPaceTick(payload[0].value)}/km</p>
    </div>
  )
}

export default function PaceTrend() {
  const { data, isLoading } = useVolumeTrend(12)

  if (isLoading) {
    return <div className="h-36 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
  }

  const withPace = data?.filter((d: TrendPoint) => d.avg_pace_sec !== null) ?? []

  if (withPace.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-[var(--color-surface)] p-6">
        <p className="text-sm text-[var(--color-text-muted)]">페이스 데이터가 없습니다</p>
      </div>
    )
  }

  const chartData = data?.map((d: TrendPoint) => ({
    ...d,
    avg_pace_sec: d.avg_pace_sec ?? null,
  }))

  const paceSecs = withPace.map((d: TrendPoint) => d.avg_pace_sec as number)
  const minPace = Math.min(...paceSecs)
  const maxPace = Math.max(...paceSecs)
  const padding = 15

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-surface)] p-4">
      <h2 className="text-xs font-semibold text-[var(--color-text-muted)]">페이스 트렌드 (12주)</h2>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: -4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-2)" vertical={false} />
          <XAxis
            dataKey="week_start"
            tickFormatter={formatWeekLabel}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            domain={[minPace - padding, maxPace + padding]}
            reversed
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatPaceTick}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="avg_pace_sec"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--color-accent)' }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-[var(--color-text-muted)]">↑ 위로 갈수록 빠른 페이스</p>
    </div>
  )
}
