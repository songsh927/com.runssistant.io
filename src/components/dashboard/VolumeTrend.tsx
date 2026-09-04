import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useVolumeTrend } from '@/hooks/useStats'
import type { TrendPoint } from '@/types/stats'

function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-[var(--color-surface-2)] px-3 py-2 text-xs text-[var(--color-text)]">
      {payload[0].value.toFixed(1)}km
    </div>
  )
}

export default function VolumeTrend() {
  const { data, isLoading } = useVolumeTrend(12)

  if (isLoading) {
    return <div className="h-36 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-[var(--color-surface)] p-6">
        <p className="text-sm text-[var(--color-text-muted)]">아직 기록이 없습니다</p>
      </div>
    )
  }

  const maxKm = Math.max(...data.map((d: TrendPoint) => d.total_km), 1)

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-surface)] p-4">
      <h2 className="text-xs font-semibold text-[var(--color-text-muted)]">주간 볼륨 (12주)</h2>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barSize={14} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="week_start"
            tickFormatter={formatWeekLabel}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            domain={[0, maxKm * 1.2]}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v.toFixed(0)}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="total_km" radius={[4, 4, 0, 0]}>
            {data.map((entry: TrendPoint, index: number) => (
              <Cell
                key={index}
                fill={entry.total_km > 0 ? 'var(--color-accent)' : 'var(--color-surface-2)'}
                opacity={entry.total_km > 0 ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
