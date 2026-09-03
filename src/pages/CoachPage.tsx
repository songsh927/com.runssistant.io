import { useState } from 'react'
import CoachSkeleton from '@/components/coach/CoachSkeleton'
import ConditionInput from '@/components/coach/ConditionInput'
import RecommendationCard from '@/components/coach/RecommendationCard'
import { useCoachRecommend } from '@/hooks/useCoach'
import type { RecommendRequest, RecommendResponse } from '@/types/coach'

export default function CoachPage() {
  const [result, setResult] = useState<RecommendResponse | null>(null)
  const { mutate, isPending, error } = useCoachRecommend()

  const handleSubmit = (body: RecommendRequest) => {
    setResult(null)
    mutate(body, { onSuccess: (data) => setResult(data) })
  }

  const errMsg =
    error instanceof Error
      ? error.message
      : error
        ? '추천을 받지 못했습니다. 다시 시도해 주세요.'
        : null

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <h1 className="text-base font-semibold text-[var(--color-text)]">AI 코치</h1>
      <ConditionInput onSubmit={handleSubmit} isPending={isPending} />
      {errMsg && (
        <p className="rounded-xl bg-[var(--color-surface)] p-3 text-sm text-red-400">{errMsg}</p>
      )}
      {isPending && <CoachSkeleton />}
      {result && <RecommendationCard result={result} />}
    </div>
  )
}
