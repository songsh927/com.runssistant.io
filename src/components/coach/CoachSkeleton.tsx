export default function CoachSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-surface)] p-4 animate-pulse">
      <div className="h-5 w-1/3 rounded bg-[var(--color-surface-2)]" />
      <div className="h-4 w-2/3 rounded bg-[var(--color-surface-2)]" />
      <div className="h-16 rounded-xl bg-[var(--color-surface-2)]" />
      <div className="h-16 rounded-xl bg-[var(--color-surface-2)]" />
      <div className="h-16 rounded-xl bg-[var(--color-surface-2)]" />
      <div className="h-4 w-1/2 rounded bg-[var(--color-surface-2)]" />
      <div className="h-4 w-3/4 rounded bg-[var(--color-surface-2)]" />
      <div className="h-10 rounded-xl bg-[var(--color-surface-2)]" />
    </div>
  )
}
