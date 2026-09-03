import { dDay } from '@/utils/format'

type Props = { raceDate: string }

export default function RaceCountdown({ raceDate }: Props) {
  const label = dDay(raceDate)
  return (
    <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-bold text-[var(--color-bg)]">
      {label}
    </span>
  )
}
