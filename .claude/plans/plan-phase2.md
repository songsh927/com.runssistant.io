# Running Coach — Frontend 수정사항: 온보딩 플로우 및 러너 프로필

> 기존 설계(`running-coach-frontend-design.md`) 구현 완료 기준.
> 이 문서는 러너 프로필 온보딩 UI 추가에 따른 변경사항만 다룬다.

---

## 1. 기능 개요

회원가입 직후 4단계 온보딩 위자드를 통해 러너 프로필을 수집한다.
설정 페이지에서 언제든 수정 가능하며, 온보딩 미완료 시 코칭 탭 접근을 차단한다.

### 사용자 플로우

```
회원가입 완료
  │
  ▼
온보딩 위자드 (4 step)
  Step 1: 러닝 경험
  Step 2: 훈련 습관
  Step 3: 병행 운동
  Step 4: 부상 현황
  │
  ▼
프로필 요약 확인 → 제출
  │
  ▼
홈 (대시보드) 진입
```

### 진입 조건

- 회원가입 직후 자동 진입
- 로그인 시 `onboarding_completed === false`이면 온보딩으로 리디렉트
- 코치 탭 접근 시 서버가 403(ONBOARDING_REQUIRED) 반환하면 온보딩으로 리디렉트

---

## 2. 라우팅 변경

### 추가 라우트

```
/onboarding              → OnboardingPage     (비인증 후 최초 진입)
/settings/profile        → ProfileEditPage    (설정 하위, 프로필 수정)
```

### 가드 로직

```typescript
// App.tsx — 라우터 내부

function RequireOnboarding({ children }: { children: ReactNode }) {
  const user = useAuthStore(s => s.user);

  if (user && !user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

// 적용
<Route element={<RequireAuth />}>
  <Route element={<RequireOnboarding />}>
    <Route element={<AppShell />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/runs/*" ... />
      <Route path="/coach" element={<CoachPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/profile" element={<ProfileEditPage />} />
      ...
    </Route>
  </Route>
  <Route path="/onboarding" element={<OnboardingPage />} />
</Route>
```

---

## 3. 프로젝트 구조 변경

### 신규 파일

```
src/
├── api/
│   └── profile.ts                 # 프로필 API (POST, GET, PATCH)
│
├── hooks/
│   └── useProfile.ts              # TanStack Query: 프로필 CRUD
│
├── pages/
│   ├── OnboardingPage.tsx         # 4단계 위자드 컨테이너
│   └── ProfileEditPage.tsx        # 설정 > 프로필 수정
│
├── components/
│   └── onboarding/
│       ├── OnboardingWizard.tsx    # 스텝 네비게이션 + 상태 관리
│       ├── StepExperience.tsx      # Step 1: 러닝 경험
│       ├── StepTraining.tsx        # Step 2: 훈련 습관
│       ├── StepCrossTraining.tsx   # Step 3: 병행 운동
│       ├── StepInjuries.tsx        # Step 4: 부상 현황
│       ├── ProfileSummary.tsx      # 최종 확인 화면
│       ├── ChipSelect.tsx          # 단일/복수 칩 선택
│       ├── InjuryPartCard.tsx      # 부위별 부상 상태 선택
│       └── DayPicker.tsx           # 요일 복수 선택
│
└── types/
    └── profile.ts                  # RunnerProfile 타입 정의
```

### 수정 파일

```
src/App.tsx                         # 라우팅 + RequireOnboarding 가드
src/stores/authStore.ts             # user에 onboarding_completed 추가
src/api/client.ts                   # 403 ONBOARDING_REQUIRED 핸들링
src/pages/SettingsPage.tsx          # 프로필 수정 링크 추가
src/components/coach/CoachChat.tsx  # 온보딩 미완료 시 안내 fallback
```

---

## 4. TypeScript 타입

```typescript
// types/profile.ts

export type ExperienceLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced';
export type LongestDistance = 'under_5km' | '5_10km' | '10_21km' | 'half_plus';
export type TimePerSession = 'under_30min' | '30_60min' | '60_90min' | 'unlimited';
export type InjuryStatus = 'none' | 'mild' | 'caution' | 'severe';
export type CrossTraining = 'weight' | 'swimming' | 'cycling' | 'yoga' | 'boxing' | 'hiking';
export type InjuryPart = 'knee' | 'ankle' | 'achilles' | 'shin' | 'hip_back' | 'plantar_fascia';

export interface ExperienceProfile {
  level: ExperienceLevel;
  runs_per_week: number;
  longest_distance: LongestDistance;
}

export interface TrainingProfile {
  preferred_types: RunType[];
  available_days: string[];        // 'mon' | 'tue' | ... | 'sun'
  time_per_session: TimePerSession;
}

export interface InjuryProfile {
  status: Record<InjuryPart, InjuryStatus>;
  history?: string;
}

export interface RunnerProfile {
  experience: ExperienceProfile;
  training: TrainingProfile;
  cross_training: CrossTraining[];
  injuries: InjuryProfile;
  onboarding_completed: boolean;
}

// 온보딩 위자드의 step별 부분 데이터
export interface OnboardingState {
  step: number;                         // 0-4 (4 = 요약)
  experience: Partial<ExperienceProfile>;
  training: Partial<TrainingProfile>;
  cross_training: CrossTraining[];
  injuries: Partial<InjuryProfile>;
}
```

---

## 5. API layer

```typescript
// api/profile.ts

import api from './client';
import type { RunnerProfile } from '@/types/profile';

export const profileApi = {
  create: (data: Omit<RunnerProfile, 'onboarding_completed'>) =>
    api.post('users/profile', { json: data }).json<RunnerProfile>(),

  get: () =>
    api.get('users/profile').json<RunnerProfile>(),

  update: (data: Partial<Omit<RunnerProfile, 'onboarding_completed'>>) =>
    api.patch('users/profile', { json: data }).json<RunnerProfile>(),
};
```

---

## 6. Hooks

```typescript
// hooks/useProfile.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile';
import { useAuthStore } from '@/stores/authStore';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
    staleTime: 30 * 60 * 1000,  // 30분 — 자주 안 바뀜
    retry: false,                // 404는 온보딩 미완료
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore(s => s.updateUser);

  return useMutation({
    mutationFn: profileApi.create,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      updateUser({ onboarding_completed: true });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });
}
```

---

## 7. Auth store 변경

```typescript
// stores/authStore.ts — 변경 부분

interface User {
  id: string;
  name: string;
  email: string;
  location: string;
  onboarding_completed: boolean;  // 추가
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  updateUser: (partial: Partial<User>) => void;  // 추가
  logout: () => void;
}
```

---

## 8. API client 변경 — 403 핸들링

```typescript
// api/client.ts — afterResponse hook 수정

afterResponse: [
  async (_request, _options, response) => {
    if (response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // 추가: 온보딩 미완료
    if (response.status === 403) {
      const body = await response.json().catch(() => null);
      if (body?.error?.code === 'ONBOARDING_REQUIRED') {
        window.location.href = '/onboarding';
      }
    }
  },
],
```

---

## 9. 컴포넌트 상세

### 9.1 OnboardingWizard — 상태 관리

```typescript
// components/onboarding/OnboardingWizard.tsx

export function OnboardingWizard() {
  const [state, setState] = useState<OnboardingState>({
    step: 0,
    experience: {},
    training: {},
    cross_training: [],
    injuries: {
      status: {
        knee: 'none', ankle: 'none', achilles: 'none',
        shin: 'none', hip_back: 'none', plantar_fascia: 'none',
      },
    },
  });

  const createProfile = useCreateProfile();
  const navigate = useNavigate();

  const canProceed = validateStep(state);

  function handleNext() {
    if (state.step < 4) {
      setState(s => ({ ...s, step: s.step + 1 }));
    }
  }

  function handleBack() {
    if (state.step > 0) {
      setState(s => ({ ...s, step: s.step - 1 }));
    }
  }

  async function handleSubmit() {
    await createProfile.mutateAsync({
      experience: state.experience as ExperienceProfile,
      training: state.training as TrainingProfile,
      cross_training: state.cross_training,
      injuries: state.injuries as InjuryProfile,
    });
    navigate('/', { replace: true });
  }

  const steps = [
    <StepExperience data={state.experience}
      onChange={exp => setState(s => ({ ...s, experience: exp }))} />,
    <StepTraining data={state.training}
      onChange={tr => setState(s => ({ ...s, training: tr }))} />,
    <StepCrossTraining data={state.cross_training}
      onChange={ct => setState(s => ({ ...s, cross_training: ct }))} />,
    <StepInjuries data={state.injuries}
      onChange={inj => setState(s => ({ ...s, injuries: inj }))} />,
    <ProfileSummary data={state} />,
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Progress bar */}
      <StepProgress current={state.step} total={5} />

      {/* Step content */}
      <div className="flex-1 px-4 py-6">
        {steps[state.step]}
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6 flex gap-3">
        {state.step > 0 && (
          <Button variant="secondary" onClick={handleBack} className="flex-1">
            이전
          </Button>
        )}
        {state.step < 4 ? (
          <Button onClick={handleNext} disabled={!canProceed} className="flex-1">
            다음
          </Button>
        ) : (
          <Button onClick={handleSubmit}
            loading={createProfile.isPending} className="flex-1">
            시작하기
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 9.2 StepExperience

```
┌─────────────────────────────────┐
│  ━━━━━━━━━━●━━━━━━━━━━━━━━━━━  │  ← progress (1/5)
├─────────────────────────────────┤
│                                 │
│  러닝 경험이 어느 정도인가요?     │
│  코칭 강도와 용어 수준을 맞춰     │
│  드립니다                        │
│                                 │
│  ┌──────────┐ ┌──────────┐     │
│  │입문       │ │초급       │     │  ← 2×2 칩 그리드
│  │0~3개월    │ │3~12개월   │     │
│  └──────────┘ └──────────┘     │
│  ┌──────────┐ ┌──────────┐     │
│  │중급 ✓    │ │상급       │     │
│  │1~3년     │ │3년+       │     │
│  └──────────┘ └──────────┘     │
│                                 │
│  주간 러닝 횟수                  │
│  1 ●───────────●──── 7          │
│         3회/주                   │
│                                 │
│  최근 가장 긴 러닝               │
│  ┌────────┐ ┌────────┐         │
│  │5km이하  │ │5~10km  │         │
│  └────────┘ └────────┘         │
│  ┌────────┐ ┌────────┐         │
│  │10~21km✓│ │하프+    │         │
│  └────────┘ └────────┘         │
│                                 │
│            ┌──────────┐         │
│            │  다음  →  │         │
│            └──────────┘         │
└─────────────────────────────────┘
```

**Validation**: level + runs_per_week + longest_distance 모두 선택 시 "다음" 활성화.

### 9.3 StepTraining

```
┌─────────────────────────────────┐
│  ━━━━━━━━━━━━━━●━━━━━━━━━━━━━  │  ← progress (2/5)
├─────────────────────────────────┤
│                                 │
│  주로 어떻게 훈련하나요?          │
│  현재 훈련 패턴을 파악합니다      │
│                                 │
│  선호 러닝 타입 (복수 선택)       │
│  ┌──────┐┌──────┐┌──────┐      │
│  │이지런✓││인터벌✓││템포런 │      │
│  └──────┘└──────┘└──────┘      │
│  ┌──────┐┌──────┐               │
│  │장거리 ││파틀렉 │               │
│  └──────┘└──────┘               │
│                                 │
│  러닝 가능 요일 (복수 선택)       │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐ │
│  │월✓││화 ││수✓││목 ││금 ││토✓││일 │ │
│  └──┘└──┘└──┘└──┘└──┘└──┘└──┘ │
│                                 │
│  1회 시간 여유                   │
│  ┌─────────┐ ┌─────────┐       │
│  │30분 이하 │ │30~60분 ✓│       │
│  └─────────┘ └─────────┘       │
│  ┌─────────┐ ┌─────────┐       │
│  │60~90분   │ │제한 없음 │       │
│  └─────────┘ └─────────┘       │
│                                 │
│   ┌────────┐  ┌──────────┐     │
│   │← 이전  │  │  다음  →  │     │
│   └────────┘  └──────────┘     │
└─────────────────────────────────┘
```

**Validation**: preferred_types 1개+, available_days 1개+, time_per_session 선택 시 활성화.

### 9.4 StepCrossTraining

```
┌─────────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━━●━━━━━━━━━  │  ← progress (3/5)
├─────────────────────────────────┤
│                                 │
│  병행하는 운동이 있나요?          │
│  교차 훈련 효과를 코칭에           │
│  반영합니다                      │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ☐ 웨이트 / 근력 운동     │   │  ← 체크리스트
│  │   코어, 하체 근력 보강    │   │
│  ├─────────────────────────┤   │
│  │ ☐ 수영                   │   │
│  │   유산소 + 부상 부위 회복  │   │
│  ├─────────────────────────┤   │
│  │ ☐ 자전거                 │   │
│  │   관절 부담 없는 유산소    │   │
│  ├─────────────────────────┤   │
│  │ ☐ 요가 / 필라테스         │   │
│  │   유연성, 코어 안정성      │   │
│  ├─────────────────────────┤   │
│  │ ✅ 복싱 / 격투기           │   │
│  │   전신 유산소, 심폐 강화   │   │
│  ├─────────────────────────┤   │
│  │ ☐ 등산 / 트레일           │   │
│  │   지형 적응, 하체 지구력   │   │
│  └─────────────────────────┘   │
│                                 │
│   ┌────────┐  ┌──────────┐     │
│   │← 이전  │  │  다음  →  │     │
│   └────────┘  └──────────┘     │
└─────────────────────────────────┘
```

**Validation**: 선택 없어도 통과 (병행 운동 없는 게 정상).

### 9.5 StepInjuries

```
┌─────────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━━━━━━●━━━━━  │  ← progress (4/5)
├─────────────────────────────────┤
│                                 │
│  현재 부상이나 통증이 있나요?     │
│  부상 부위를 보호하는 세션을       │
│  추천합니다                      │
│                                 │
│  ┌──── 무릎 ──────────────┐     │
│  │ [없음] [경미] [주의] [심각] │     │
│  └────────────────────────┘     │
│  ┌──── 발목 ──────────────┐     │
│  │ [없음] [경미] [주의] [심각] │     │
│  └────────────────────────┘     │
│  ┌──── 아킬레스건 ─────────┐    │
│  │ [없음] [경미] [주의] [심각] │    │
│  └────────────────────────┘     │
│  ┌──── 정강이 ────────────┐     │
│  │ [없음] [경미] [주의] [심각] │     │
│  └────────────────────────┘     │
│  ┌──── 허리/고관절 ────────┐    │
│  │ [없음] [경미] [주의] [심각] │    │
│  └────────────────────────┘     │
│  ┌──── 족저근막 ──────────┐     │
│  │ [없음] [경미] [주의] [심각] │     │
│  └────────────────────────┘     │
│                                 │
│  과거 부상 이력 (선택)           │
│  ┌─────────────────────────┐   │
│  │ 2024년 좌측 무릎 반월판   │   │
│  │ 수술...                  │   │
│  └─────────────────────────┘   │
│                                 │
│   ┌────────┐  ┌──────────┐     │
│   │← 이전  │  │  다음  →  │     │
│   └────────┘  └──────────┘     │
└─────────────────────────────────┘
```

**Validation**: 모든 부위 기본 "없음" 선택 상태로 시작, 항상 통과.

### 9.6 ProfileSummary (Step 5)

```
┌─────────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━●  │  ← progress (5/5)
├─────────────────────────────────┤
│                                 │
│  프로필을 확인해주세요            │
│  설정에서 언제든 수정 가능합니다   │
│                                 │
│  ┌─ 러닝 프로필 ──────────────┐ │
│  │  🏃 중급 러너               │ │
│  │  주 3회 · 최장 10~21km     │ │
│  │  1회 30~60분               │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─ 훈련 ─────────────────────┐ │
│  │  선호: 이지런, 인터벌        │ │
│  │  가용 요일: 월, 수, 토      │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─ 병행 운동 ────────────────┐ │
│  │  복싱 · 웨이트              │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─ 부상 현황 ────────────────┐ │
│  │  🟡 무릎: 경미              │ │
│  │  ✅ 나머지: 이상 없음        │ │
│  │  📝 2024년 좌측 무릎        │ │
│  │     반월판 수술              │ │
│  └─────────────────────────────┘ │
│                                 │
│   ┌────────┐  ┌──────────┐     │
│   │← 이전  │  │ 시작하기   │     │
│   └────────┘  └──────────┘     │
└─────────────────────────────────┘
```

---

## 10. 재사용 컴포넌트

### 10.1 ChipSelect

단일 선택과 복수 선택 모두 지원하는 칩 컴포넌트.

```typescript
interface ChipSelectProps<T extends string> {
  options: { value: T; label: string; sublabel?: string }[];
  value: T | T[];
  onChange: (value: T | T[]) => void;
  multiple?: boolean;
  columns?: 2 | 3 | 4;  // 그리드 열 수
}

export function ChipSelect<T extends string>({
  options, value, onChange, multiple = false, columns = 2,
}: ChipSelectProps<T>) {
  // ...
}
```

사용 예시:

```tsx
// 단일 선택
<ChipSelect
  options={[
    { value: 'beginner', label: '입문', sublabel: '0~3개월' },
    { value: 'novice', label: '초급', sublabel: '3~12개월' },
    { value: 'intermediate', label: '중급', sublabel: '1~3년' },
    { value: 'advanced', label: '상급', sublabel: '3년+' },
  ]}
  value={data.level}
  onChange={(v) => onChange({ ...data, level: v as ExperienceLevel })}
/>

// 복수 선택
<ChipSelect
  multiple
  columns={3}
  options={[
    { value: 'easy', label: '이지런' },
    { value: 'interval', label: '인터벌' },
    ...
  ]}
  value={data.preferred_types}
  onChange={(v) => onChange({ ...data, preferred_types: v as RunType[] })}
/>
```

### 10.2 DayPicker

요일 복수 선택 전용 컴포넌트. 7개 원형 버튼.

```typescript
interface DayPickerProps {
  value: string[];          // ['mon', 'wed', 'sat']
  onChange: (days: string[]) => void;
}

const DAYS = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' },
];
```

스타일: 44×44px 원형, 선택 시 accent 배경.

### 10.3 InjuryPartCard

부위별 부상 상태 4단계 선택.

```typescript
interface InjuryPartCardProps {
  part: InjuryPart;
  label: string;
  value: InjuryStatus;
  onChange: (status: InjuryStatus) => void;
}
```

칩 색상:
- 없음: 기본 (surface)
- 경미: 노랑 (warning background)
- 주의: 주황 (amber)
- 심각: 빨강 (danger background)

### 10.4 StepProgress

상단 프로그레스 바. 단계 표시.

```typescript
interface StepProgressProps {
  current: number;  // 0-based
  total: number;
}
```

5개 도트 + 연결 바, 현재 단계까지 accent 색상 채움.

---

## 11. Validation 스키마 (Zod)

```typescript
// utils/validation.ts — 추가

export const experienceSchema = z.object({
  level: z.enum(['beginner', 'novice', 'intermediate', 'advanced']),
  runs_per_week: z.number().int().min(0).max(7),
  longest_distance: z.enum(['under_5km', '5_10km', '10_21km', 'half_plus']),
});

export const trainingSchema = z.object({
  preferred_types: z.array(z.enum(['easy', 'tempo', 'interval', 'long', 'fartlek']))
    .min(1, '최소 1개 선택'),
  available_days: z.array(z.string()).min(1, '최소 1일 선택'),
  time_per_session: z.enum(['under_30min', '30_60min', '60_90min', 'unlimited']),
});

export const injurySchema = z.object({
  status: z.record(
    z.enum(['knee', 'ankle', 'achilles', 'shin', 'hip_back', 'plantar_fascia']),
    z.enum(['none', 'mild', 'caution', 'severe']),
  ),
  history: z.string().max(500).optional(),
});

export const runnerProfileSchema = z.object({
  experience: experienceSchema,
  training: trainingSchema,
  cross_training: z.array(
    z.enum(['weight', 'swimming', 'cycling', 'yoga', 'boxing', 'hiking'])
  ),
  injuries: injurySchema,
});

// Step별 validation
export function validateStep(state: OnboardingState): boolean {
  switch (state.step) {
    case 0:
      return experienceSchema.safeParse(state.experience).success;
    case 1:
      return trainingSchema.safeParse(state.training).success;
    case 2:
      return true;  // 병행 운동은 선택사항
    case 3:
      return true;  // 부상도 기본값(none)이면 통과
    case 4:
      return runnerProfileSchema.safeParse({
        experience: state.experience,
        training: state.training,
        cross_training: state.cross_training,
        injuries: state.injuries,
      }).success;
    default:
      return false;
  }
}
```

---

## 12. SettingsPage 프로필 수정

설정 페이지에 "러너 프로필" 섹션을 추가하여 온보딩 데이터를 수정할 수 있게 한다.
온보딩과 동일한 컴포넌트를 재사용하되 탭 형태로 표시 (위자드가 아닌 탭 전환).

```
┌─────────────────────────────────┐
│ ← 설정                         │
├─────────────────────────────────┤
│                                 │
│  계정                           │
│  ┌─────────────────────────┐   │
│  │ 이름: 승현               │   │
│  │ 이메일: sh@example.com   │   │
│  │ 위치: Seoul              │   │
│  └─────────────────────────┘   │
│                                 │
│  러너 프로필                     │
│  ┌─────────────────────────┐   │
│  │ 🏃 중급 러너 · 주 3회     │   │
│  │ 복싱, 웨이트 병행          │   │
│  │ 🟡 무릎 경미              │   │
│  │            [수정하기 →]    │   │
│  └─────────────────────────┘   │
│                                 │
│  앱 설정                        │
│  ┌─────────────────────────┐   │
│  │ 알림 설정                 │   │
│  │ 데이터 내보내기            │   │
│  │ 로그아웃                  │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  홈    기록    코치⚡   설정    │
└─────────────────────────────────┘
```

ProfileEditPage (`/settings/profile`)에서는 4개 섹션을 아코디언 또는 탭으로 표시.
각 섹션의 입력 컴포넌트는 온보딩과 동일한 것을 재사용.

---

## 13. UX 세부사항

### 13.1 스킵 불가

온보딩은 스킵할 수 없다. 코칭 품질에 직접 영향을 미치므로
"나중에" 옵션을 제공하지 않는다. 단, 각 step 내 선택사항(병행 운동, 부상 이력 텍스트)은
비어도 통과.

### 13.2 애니메이션

- Step 전환: 좌우 슬라이드 (framer-motion 또는 CSS transition)
- 칩 선택: scale(0.95) → scale(1) + accent 색 전환
- 프로그레스 바: width transition 0.3s ease

### 13.3 접근성

- 모든 칩에 role="radio" (단일) 또는 role="checkbox" (복수)
- aria-checked 상태 반영
- 키보드 네비게이션: 방향키로 칩 간 이동, Space/Enter로 선택
- 슬라이더: aria-label="주간 러닝 횟수", aria-valuemin/max/now

### 13.4 온보딩 재진입

사용자가 온보딩 중간에 앱을 닫아도 데이터 유실을 방지하기 위해
`sessionStorage`에 현재 상태를 저장한다.
온보딩 페이지 재진입 시 sessionStorage에서 복원.
온보딩 완료(POST 성공) 시 sessionStorage 클리어.

---

## 14. 실행 계획

### Step 1: 타입 + API + 라우팅 (0.5일)

- [ ] types/profile.ts 타입 정의
- [ ] api/profile.ts API 레이어
- [ ] hooks/useProfile.ts
- [ ] authStore에 onboarding_completed 추가
- [ ] App.tsx 라우팅 + RequireOnboarding 가드
- [ ] api/client.ts 403 핸들링

### Step 2: 온보딩 위자드 (1.5일)

- [ ] OnboardingWizard (스텝 컨테이너 + 네비게이션)
- [ ] StepProgress (프로그레스 바)
- [ ] ChipSelect (단일/복수 칩)
- [ ] DayPicker (요일 선택)
- [ ] InjuryPartCard (부상 상태 선택)
- [ ] StepExperience
- [ ] StepTraining
- [ ] StepCrossTraining
- [ ] StepInjuries
- [ ] ProfileSummary
- [ ] Validation (Zod)
- [ ] sessionStorage 임시 저장/복원

### Step 3: 프로필 수정 + 마무리 (0.5일)

- [ ] ProfileEditPage (설정 > 프로필 수정)
- [ ] SettingsPage에 프로필 요약 카드 + 수정 링크
- [ ] CoachPage 온보딩 미완료 fallback
- [ ] 전체 플로우 테스트: 가입 → 온보딩 → 코칭 → 설정 수정

**총 소요: ~2.5일**