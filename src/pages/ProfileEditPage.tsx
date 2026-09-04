import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import type {
  CrossTraining,
  ExperienceProfile,
  InjuryProfile,
  TrainingProfile,
} from '@/types/profile'
import StepExperience from '@/components/onboarding/StepExperience'
import StepTraining from '@/components/onboarding/StepTraining'
import StepCrossTraining from '@/components/onboarding/StepCrossTraining'
import StepInjuries from '@/components/onboarding/StepInjuries'

type Section = 'experience' | 'training' | 'cross_training' | 'injuries'

const SECTION_LABELS: Record<Section, string> = {
  experience: '경험',
  training: '훈련 패턴',
  cross_training: '크로스 트레이닝',
  injuries: '부상 상태',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: '입문',
  novice: '초급',
  intermediate: '중급',
  advanced: '상급',
}
const DISTANCE_LABELS: Record<string, string> = {
  under_5km: '5km 이하',
  '5_10km': '5~10km',
  '10_21km': '10~21km',
  half_plus: '하프+',
}
const CROSS_LABELS: Record<string, string> = {
  weight: '웨이트',
  swimming: '수영',
  cycling: '사이클',
  yoga: '요가',
  boxing: '복싱',
  hiking: '등산',
}

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const { data: profile, isLoading, error } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const [activeSection, setActiveSection] = useState<Section | null>(null)
  const [draft, setDraft] = useState<{
    experience?: Partial<ExperienceProfile>
    training?: Partial<TrainingProfile>
    cross_training?: CrossTraining[]
    injuries?: Partial<InjuryProfile>
  }>({})

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-surface-2)] border-t-[var(--color-accent)]" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-sm text-[var(--color-text-muted)]">프로필을 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="min-h-[44px] rounded-xl border border-[var(--color-surface-2)] px-6 text-sm text-[var(--color-text-muted)]"
        >
          돌아가기
        </button>
      </div>
    )
  }

  function openSection(section: Section) {
    setDraft({
      experience: { ...profile!.experience },
      training: { ...profile!.training },
      cross_training: [...profile!.cross_training],
      injuries: { ...profile!.injuries },
    })
    setActiveSection(section)
  }

  function cancelEdit() {
    setActiveSection(null)
    setDraft({})
  }

  function saveSection() {
    if (!activeSection) return
    updateProfile(
      { [activeSection]: draft[activeSection] },
      {
        onSuccess: () => {
          setActiveSection(null)
          setDraft({})
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로"
          className="min-h-[44px] min-w-[44px] rounded-xl text-lg text-[var(--color-text-muted)]"
        >
          ←
        </button>
        <h1 className="text-base font-semibold text-[var(--color-text)]">러너 프로필 수정</h1>
      </div>

      {(Object.keys(SECTION_LABELS) as Section[]).map((section) => (
        <div key={section} className="rounded-2xl bg-[var(--color-surface)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-text)]">
              {SECTION_LABELS[section]}
            </span>
            {activeSection !== section && (
              <button
                type="button"
                onClick={() => openSection(section)}
                className="min-h-[36px] rounded-lg px-3 text-xs font-medium text-[var(--color-accent)]"
              >
                수정
              </button>
            )}
          </div>

          {activeSection === section ? (
            <>
              {section === 'experience' && (
                <StepExperience
                  data={draft.experience ?? {}}
                  onChange={(experience) => setDraft((d) => ({ ...d, experience }))}
                />
              )}
              {section === 'training' && (
                <StepTraining
                  data={draft.training ?? {}}
                  onChange={(training) => setDraft((d) => ({ ...d, training }))}
                />
              )}
              {section === 'cross_training' && (
                <StepCrossTraining
                  value={draft.cross_training ?? []}
                  onChange={(cross_training) => setDraft((d) => ({ ...d, cross_training }))}
                />
              )}
              {section === 'injuries' && (
                <StepInjuries
                  data={draft.injuries ?? {}}
                  onChange={(injuries) => setDraft((d) => ({ ...d, injuries }))}
                />
              )}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={isPending}
                  className="min-h-[44px] flex-1 rounded-xl border border-[var(--color-surface-2)] text-sm font-medium text-[var(--color-text-muted)] disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={saveSection}
                  disabled={isPending}
                  className="min-h-[44px] flex-1 rounded-xl bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-bg)] disabled:opacity-40"
                >
                  {isPending ? '저장 중…' : '저장'}
                </button>
              </div>
            </>
          ) : (
            <SectionPreview section={section} profile={profile} />
          )}
        </div>
      ))}
    </div>
  )
}

type ProfileSnapshot = import('@/types/profile').RunnerProfile

function SectionPreview({ section, profile }: { section: Section; profile: ProfileSnapshot }) {
  if (section === 'experience') {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        {LEVEL_LABELS[profile.experience.level] ?? profile.experience.level} · 주{' '}
        {profile.experience.runs_per_week}회 ·{' '}
        {DISTANCE_LABELS[profile.experience.longest_distance] ??
          profile.experience.longest_distance}
      </p>
    )
  }
  if (section === 'training') {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        {profile.training.preferred_types.join(', ')}
      </p>
    )
  }
  if (section === 'cross_training') {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        {profile.cross_training.length
          ? profile.cross_training.map((c) => CROSS_LABELS[c] ?? c).join(', ')
          : '없음'}
      </p>
    )
  }
  if (section === 'injuries') {
    const activeInjuries = Object.entries(profile.injuries.status).filter(([, s]) => s !== 'none')
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        {activeInjuries.length ? `${activeInjuries.length}개 부위 이상` : '부상 없음'}
      </p>
    )
  }
  return null
}
