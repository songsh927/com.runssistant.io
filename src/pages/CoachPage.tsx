import { useState } from 'react'
import { Link } from 'react-router-dom'
import CoachSkeleton from '@/components/coach/CoachSkeleton'
import ConditionInput from '@/components/coach/ConditionInput'
import RecommendationCard from '@/components/coach/RecommendationCard'
import { useCoachRecommend } from '@/hooks/useCoach'
import { useAuthStore } from '@/stores/authStore'
import type { RecommendRequest, RecommendResponse } from '@/types/coach'

export default function CoachPage() {
  const user = useAuthStore((s) => s.user)

  if (user && !user.onboarding_completed) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-4xl">🏃</p>
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          러너 프로필을 먼저 등록해 주세요
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          AI 코치는 회원님의 러닝 경험과 목표를 바탕으로 추천합니다.
        </p>
        <Link
          to="/onboarding"
          className="min-h-[44px] rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)]"
        >
          프로필 등록하기
        </Link>
      </div>
    )
  }

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
