import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProfile } from '@/hooks/useProfile'
import { validateStep } from '@/utils/validation'
import type {
  CrossTraining,
  ExperienceProfile,
  InjuryProfile,
  OnboardingState,
  TrainingProfile,
} from '@/types/profile'
import StepProgress from './StepProgress'
import StepExperience from './StepExperience'
import StepTraining from './StepTraining'
import StepCrossTraining from './StepCrossTraining'
import StepInjuries from './StepInjuries'
import ProfileSummary from './ProfileSummary'

const SESSION_KEY = 'onboarding-state'
const TOTAL_STEPS = 5

const DEFAULT_INJURIES: InjuryProfile = {
  status: {
    knee: 'none',
    ankle: 'none',
    achilles: 'none',
    shin: 'none',
    hip_back: 'none',
    plantar_fascia: 'none',
  },
  history: null,
}

function loadState(): OnboardingState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw) as OnboardingState
  } catch {
    // ignore parse errors
  }
  return {
    step: 0,
    experience: {},
    training: {},
    cross_training: [],
    injuries: DEFAULT_INJURIES,
  }
}

function saveState(state: OnboardingState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

const STEP_TITLES = ['경험', '훈련', '크로스 트레이닝', '부상', '확인']

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const { mutate: createProfile, isPending, error } = useCreateProfile()
  const [state, setState] = useState<OnboardingState>(loadState)

  function update(patch: Partial<OnboardingState>) {
    setState((s) => {
      const next = { ...s, ...patch }
      saveState(next)
      return next
    })
  }

  function goNext() {
    if (state.step < TOTAL_STEPS - 1) update({ step: state.step + 1 })
  }

  function goPrev() {
    if (state.step > 0) update({ step: state.step - 1 })
  }

  function handleSubmit() {
    createProfile(
      {
        experience: state.experience as ExperienceProfile,
        training: state.training as TrainingProfile,
        cross_training: state.cross_training as CrossTraining[],
        injuries: (state.injuries ?? DEFAULT_INJURIES) as InjuryProfile,
      },
      {
        onSuccess: () => {
          sessionStorage.removeItem(SESSION_KEY)
          navigate('/', { replace: true })
        },
      },
    )
  }

  const canAdvance = validateStep(state)
  const isLastStep = state.step === TOTAL_STEPS - 1

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <div className="sticky top-0 z-10 bg-[var(--color-bg)] px-4 pb-2 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">{STEP_TITLES[state.step]}</span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {state.step + 1} / {TOTAL_STEPS}
          </span>
        </div>
        <StepProgress current={state.step} total={TOTAL_STEPS} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {state.step === 0 && (
          <StepExperience
            data={state.experience}
            onChange={(experience) => update({ experience })}
          />
        )}
        {state.step === 1 && (
          <StepTraining data={state.training} onChange={(training) => update({ training })} />
        )}
        {state.step === 2 && (
          <StepCrossTraining
            value={state.cross_training}
            onChange={(cross_training) => update({ cross_training })}
          />
        )}
        {state.step === 3 && (
          <StepInjuries
            data={state.injuries}
            onChange={(injuries) => update({ injuries: injuries as InjuryProfile })}
          />
        )}
        {state.step === 4 && <ProfileSummary state={state} />}
      </div>

      {error && (
        <div className="px-4 pb-2">
          <p className="rounded-xl bg-[var(--color-surface)] p-3 text-sm text-[var(--color-error)]">
            {error instanceof Error ? error.message : '프로필 저장에 실패했습니다.'}
          </p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 flex gap-3 border-t border-[var(--color-surface-2)] bg-[var(--color-bg)] px-4 pb-6 pt-3">
        {state.step > 0 && (
          <button
            type="button"
            onClick={goPrev}
            disabled={isPending}
            className="min-h-[44px] flex-1 rounded-xl border border-[var(--color-surface-2)] text-sm font-medium text-[var(--color-text-muted)] transition-colors disabled:opacity-50"
          >
            이전
          </button>
        )}
        <button
          type="button"
          onClick={isLastStep ? handleSubmit : goNext}
          disabled={!canAdvance || isPending}
          className="min-h-[44px] flex-1 rounded-xl bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-bg)] transition-opacity disabled:opacity-40"
        >
          {isPending ? '저장 중…' : isLastStep ? '시작하기' : '다음'}
        </button>
      </div>
    </div>
  )
}
