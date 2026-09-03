import { useState } from 'react'
import Button from '@/components/common/Button'
import RpeSlider from '@/components/run/RpeSlider'
import type { RecommendRequest } from '@/types/coach'

type Props = {
  onSubmit: (body: RecommendRequest) => void
  isPending: boolean
}

export default function ConditionInput({ onSubmit, isPending }: Props) {
  const [rpe, setRpe] = useState(5)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ rpe, notes: notes.trim() || undefined })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl bg-[var(--color-surface)] p-4"
    >
      <p className="text-sm font-semibold text-[var(--color-text)]">오늘 어떠세요?</p>
      <RpeSlider value={rpe} onChange={setRpe} />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-[var(--color-text-muted)]">한마디 (선택)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="어제 다리가 좀..."
          rows={2}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
        />
      </div>
      <Button type="submit" disabled={isPending} fullWidth>
        {isPending ? '추천 받는 중...' : '🏃 코칭 받기'}
      </Button>
    </form>
  )
}
