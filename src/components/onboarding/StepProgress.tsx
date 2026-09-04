interface StepProgressProps {
  current: number
  total: number
}

export default function StepProgress({ current, total }: StepProgressProps) {
  return (
    <div className="flex items-center gap-1.5 px-4 pt-4">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i <= current ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-2)]'
          }`}
        />
      ))}
    </div>
  )
}
