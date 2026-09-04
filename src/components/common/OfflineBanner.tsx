import { useUIStore } from '@/stores/uiStore'

export default function OfflineBanner() {
  const isOnline = useUIStore((s) => s.isOnline)

  if (isOnline) return null

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-[var(--color-warning)] px-4 py-2 text-xs font-semibold text-[var(--color-bg)]"
    >
      <span>●</span>
      <span>오프라인 상태입니다. 기록은 온라인 복귀 후 저장됩니다.</span>
    </div>
  )
}
