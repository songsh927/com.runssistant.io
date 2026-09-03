# Running Coach — Frontend Design & Execution Plan

## 1. Overview

서버 구현 완료. React PWA 프론트엔드를 구축한다.
러닝 앱 특성상 모바일 퍼스트, 야외에서 한 손으로 조작하는 시나리오가 기본이다.

### 핵심 원칙

- **Mobile-first**: 모든 화면을 모바일 뷰포트(375px)에서 먼저 설계
- **Offline-resilient**: 러닝 기록 입력은 오프라인에서도 가능, 복귀 시 sync
- **One-hand friendly**: 하단 네비게이션, 큰 터치 타겟(최소 44px)
- **Glanceable**: 대시보드는 5초 안에 "이번 주 어떤지" 파악 가능

---

## 2. Tech stack

| Layer           | Choice                      | Reason                                        |
|-----------------|------------------------------|-----------------------------------------------|
| Framework       | React 18 + TypeScript        | 생태계, PWA 지원                               |
| Build           | Vite                         | 빠른 HMR, 가벼운 설정                          |
| Routing         | React Router v7              | 파일 기반 아님, 선언적 라우팅                    |
| State           | Zustand                      | 가볍고 boilerplate 적음, persist 미들웨어 있음   |
| Server state    | TanStack Query (React Query) | 캐싱, optimistic update, offline 지원           |
| Styling         | Tailwind CSS 4               | 유틸리티 기반, 모바일 대응 빠름                   |
| Charts          | Recharts                     | React 네이티브, 반응형, 가벼움                   |
| Forms           | React Hook Form + Zod        | 성능 좋고 validation 타입 안전                   |
| PWA             | Vite PWA Plugin (vite-plugin-pwa) | Service worker + manifest 자동 생성        |
| HTTP client     | ky (or axios)                | 인터셉터, retry, 가벼움                         |
| Date            | date-fns                     | 트리 쉐이킹, 불변성, 로케일 지원                 |
| Offline storage | idb (IndexedDB wrapper)      | 오프라인 큐 관리용                               |
| Linting         | ESLint + Prettier            | 코드 품질                                       |

---

## 3. Project structure

```
running-coach-web/
├── public/
│   ├── icons/                  # PWA 아이콘 (192x192, 512x512)
│   └── manifest.json           # → vite-plugin-pwa가 생성
│
├── src/
│   ├── main.tsx                # App entry
│   ├── App.tsx                 # Router + Layout 구성
│   ├── vite-env.d.ts
│   │
│   ├── api/                    # API layer
│   │   ├── client.ts           # ky instance (baseURL, auth interceptor)
│   │   ├── auth.ts             # login, signup
│   │   ├── runs.ts             # run CRUD
│   │   ├── goals.ts            # goal CRUD
│   │   ├── plans.ts            # weekly plan
│   │   ├── coach.ts            # AI coaching
│   │   └── stats.ts            # dashboard stats
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts          # 인증 상태 + 로그인/로그아웃
│   │   ├── useRuns.ts          # TanStack Query: run CRUD
│   │   ├── useGoals.ts         # TanStack Query: goal CRUD
│   │   ├── usePlans.ts         # TanStack Query: weekly plan
│   │   ├── useCoach.ts         # TanStack Query: AI 추천 mutation
│   │   ├── useStats.ts         # TanStack Query: stats queries
│   │   └── useOfflineSync.ts   # 오프라인 큐 관리
│   │
│   ├── stores/                 # Zustand stores
│   │   ├── authStore.ts        # JWT token, user info
│   │   └── uiStore.ts          # 토스트, 모달, 로딩 상태
│   │
│   ├── pages/                  # Route pages
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── HomePage.tsx        # 대시보드 (기본 랜딩)
│   │   ├── RunLogPage.tsx      # 러닝 기록 입력
│   │   ├── RunListPage.tsx     # 러닝 기록 목록
│   │   ├── RunDetailPage.tsx   # 러닝 기록 상세
│   │   ├── GoalPage.tsx        # 목표 설정/관리
│   │   ├── CoachPage.tsx       # AI 코칭 (핵심 화면)
│   │   └── SettingsPage.tsx    # 프로필, 위치 설정
│   │
│   ├── components/             # 재사용 컴포넌트
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # 하단 네비 + 콘텐츠 영역
│   │   │   ├── BottomNav.tsx   # 하단 탭 네비게이션
│   │   │   └── Header.tsx      # 페이지 헤더
│   │   │
│   │   ├── run/
│   │   │   ├── RunForm.tsx     # 러닝 기록 입력 폼
│   │   │   ├── RunCard.tsx     # 기록 목록 카드
│   │   │   ├── PaceInput.tsx   # 페이스 입력 (mm:ss 포맷)
│   │   │   ├── RpeSlider.tsx   # RPE 1-10 슬라이더
│   │   │   └── RunTypeBadge.tsx # easy/tempo/interval 배지
│   │   │
│   │   ├── goal/
│   │   │   ├── GoalForm.tsx    # 목표 설정 폼
│   │   │   ├── GoalCard.tsx    # 목표 카드 (진행률 포함)
│   │   │   └── RaceCountdown.tsx # 대회 D-day 카운트다운
│   │   │
│   │   ├── coach/
│   │   │   ├── CoachChat.tsx   # AI 코칭 대화형 UI
│   │   │   ├── ConditionInput.tsx # RPE + 메모 입력
│   │   │   ├── RecommendationCard.tsx # AI 추천 결과 카드
│   │   │   └── SessionDetail.tsx # 워밍업/메인/쿨다운 상세
│   │   │
│   │   ├── dashboard/
│   │   │   ├── WeeklyProgress.tsx  # 주간 볼륨 링 차트
│   │   │   ├── WeeklyCalendar.tsx  # 이번 주 달력 (완료/예정)
│   │   │   ├── PaceTrend.tsx       # 페이스 트렌드 라인 차트
│   │   │   ├── VolumeTrend.tsx     # 주간 볼륨 막대 차트
│   │   │   └── PersonalBests.tsx   # 개인 기록 카드
│   │   │
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       ├── Spinner.tsx
│   │       ├── EmptyState.tsx
│   │       └── OfflineBanner.tsx  # 오프라인 상태 안내
│   │
│   ├── utils/
│   │   ├── format.ts           # 페이스 표시 (sec → m:ss), 거리 포맷
│   │   ├── date.ts             # 주 시작일 계산, 상대 시간
│   │   ├── validation.ts       # Zod 스키마
│   │   └── offlineQueue.ts     # IndexedDB 오프라인 큐 로직
│   │
│   ├── types/                  # TypeScript 타입 정의
│   │   ├── run.ts
│   │   ├── goal.ts
│   │   ├── plan.ts
│   │   ├── coach.ts
│   │   └── stats.ts
│   │
│   └── styles/
│       └── index.css           # Tailwind 진입점 + 커스텀 CSS vars
│
├── index.html
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env
```

---

## 4. Routing

```
/login                  → LoginPage         (비인증)
/signup                 → SignupPage         (비인증)
/                       → HomePage          (대시보드, 인증 필수)
/runs/new               → RunLogPage        (러닝 기록 입력)
/runs                   → RunListPage       (기록 목록)
/runs/:id               → RunDetailPage     (기록 상세)
/goals                  → GoalPage          (목표 관리)
/coach                  → CoachPage         (AI 코칭)
/settings               → SettingsPage      (설정)
```

### Bottom navigation (4탭)

```
┌──────────┬──────────┬──────────┬──────────┐
│   홈     │   기록    │  코치 ⚡  │   설정   │
│  (Home)  │  (Runs)  │ (Coach)  │(Settings)│
└──────────┴──────────┴──────────┴──────────┘
        /         /runs       /coach      /settings
```

코치 탭이 핵심이므로 시각적으로 강조 (accent 색상 또는 크기).
목표 관리는 설정 하위 또는 대시보드에서 진입.

---

## 5. Screen designs

### 5.1 HomePage (대시보드)

사용자가 앱을 열면 가장 먼저 보는 화면.
"이번 주 어떤지" 5초 안에 파악 가능해야 한다.

```
┌─────────────────────────────────┐
│ Running Coach           [이름]  │  ← Header
├─────────────────────────────────┤
│                                 │
│    ┌─────────────────────┐      │
│    │   ● 12 / 20 km     │      │  ← 주간 볼륨 링 차트
│    │     60%             │      │     큰 숫자로 진행률 표시
│    │   이번 주 3회 완료    │      │
│    └─────────────────────┘      │
│                                 │
│  ┌─ 이번 주 ──────────────────┐ │
│  │ 월  화  수  목  금  토  일  │ │  ← 주간 캘린더
│  │ ✅  -  ✅  -  ✅  📋  -   │ │     ✅완료 📋예정 -없음
│  └────────────────────────────┘ │
│                                 │
│  ┌─ 오늘의 코칭 ─────────────┐  │
│  │ "이지런 5km 추천"         │  │  ← AI 추천 요약
│  │ 기온 25° 습도 55%         │  │     탭하면 /coach로
│  │        [코칭 받기 →]       │  │
│  └────────────────────────────┘ │
│                                 │
│  ┌─ 최근 러닝 ────────────────┐ │
│  │ 9/2 이지런 5.2km 6:00/km  │ │  ← 최근 3개
│  │ 9/1 인터벌 6km  5:15/km   │ │
│  │ 8/30 장거리 12km 6:30/km  │ │
│  └────────────────────────────┘ │
│                                 │
│ [+ 러닝 기록하기]     (FAB)     │  ← Floating Action Button
├─────────────────────────────────┤
│  홈    기록    코치⚡   설정    │  ← Bottom Nav
└─────────────────────────────────┘
```

### 5.2 RunLogPage (러닝 기록 입력)

가장 자주 사용하는 화면. 러닝 직후 땀에 젖은 손으로 입력하는 상황.
큰 입력 필드, 최소한의 필수 항목.

```
┌─────────────────────────────────┐
│ ← 러닝 기록                     │
├─────────────────────────────────┤
│                                 │
│  날짜                           │
│  ┌─────────────────────────┐    │
│  │ 2026. 9. 3 (오늘)   ▼  │    │  ← date picker
│  └─────────────────────────┘    │
│                                 │
│  러닝 타입                      │
│  ┌─────┬──────┬──────┬─────┐   │
│  │Easy │Tempo │Inter │Long │   │  ← 칩 선택
│  └─────┴──────┴──────┴─────┘   │
│                                 │
│  거리 (km)        시간          │
│  ┌──────────┐   ┌──────────┐   │
│  │  5.2     │   │ 31:12    │   │  ← 큰 숫자 입력
│  └──────────┘   └──────────┘   │
│                                 │
│  → 페이스: 6:00/km  (자동계산)  │
│                                 │
│  오늘 컨디션 (RPE)              │
│  1 ●─────────●──── 10          │  ← 슬라이더
│         6                       │
│  😊 보통                        │  ← RPE에 따라 이모지
│                                 │
│  메모 (선택)                    │
│  ┌─────────────────────────┐   │
│  │ 한강 반포대교 코스.       │   │
│  │ 바람 좀 불었지만 쾌적.    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │        저장하기           │   │  ← Primary CTA
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  홈    기록    코치⚡   설정    │
└─────────────────────────────────┘
```

### 5.3 CoachPage (AI 코칭) — 핵심 화면

대화형보다는 "오늘의 미션 브리핑" 느낌.
컨디션 입력 → AI 추천 수신 → 세션 상세 확인 흐름.

```
┌─────────────────────────────────┐
│ ← AI 코치                      │
├─────────────────────────────────┤
│                                 │
│  ┌─ 오늘 어떠세요? ───────────┐ │
│  │                             │ │
│  │  컨디션 (RPE)               │ │
│  │  1 ●─────────●──── 10      │ │
│  │        6                    │ │
│  │                             │ │
│  │  한마디 (선택)              │ │
│  │  ┌──────────────────────┐  │ │
│  │  │ 어제 다리가 좀...     │  │ │
│  │  └──────────────────────┘  │ │
│  │                             │ │
│  │  ┌──────────────────────┐  │ │
│  │  │   🏃 코칭 받기        │  │ │
│  │  └──────────────────────┘  │ │
│  └─────────────────────────────┘ │
│                                 │
│  ── AI 추천이 여기에 표시됨 ──  │
│                                 │
│  ┌─ 오늘의 러닝 ──────────────┐ │
│  │                             │ │
│  │  🏃 템포런  6.0km           │ │  ← run_type + distance
│  │  페이스 5:20~5:40/km        │ │
│  │                             │ │
│  │  ┌─ 워밍업 ──────────────┐ │ │
│  │  │ 1km 이지런 + 동적     │ │ │
│  │  │ 스트레칭 5분           │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  │  ┌─ 메인 세션 ───────────┐ │ │
│  │  │ 4km 템포런             │ │ │
│  │  │ 5:20~5:40 페이스.      │ │ │
│  │  │ 2km 지점에서 페이스    │ │ │
│  │  │ 확인 후 유지.          │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  │  ┌─ 쿨다운 ──────────────┐ │ │
│  │  │ 1km 조깅 + 정적       │ │ │
│  │  │ 스트레칭 5분           │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  │  💬 "템포런은 레이스 페이스 │ │  ← motivation
│  │   감각을 만드는 투자!       │ │
│  │   4km만 집중!"             │ │
│  │                             │ │
│  │  ┌─ 왜 이 추천? ─────────┐ │ │
│  │  │ 이번 주 20km 중 12km   │ │ │  ← reasoning (접기/펼치기)
│  │  │ 완료. 남은 3일에...     │ │ │
│  │  └───────────────────────┘ │ │
│  │                             │ │
│  │  ☀️ 25° 습도 55% 맑음      │ │  ← weather
│  │                             │ │
│  │  이번 주 진행: 12/20km 60% │ │  ← weekly context
│  │  ████████░░░░░░             │ │
│  │                             │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────┐    │
│  │  ✅ 이 루틴으로 뛰기      │    │  ← 탭하면 RunLogPage에
│  └─────────────────────────┘    │     추천 정보 pre-fill
│                                 │
├─────────────────────────────────┤
│  홈    기록    코치⚡   설정    │
└─────────────────────────────────┘
```

### 5.4 RunListPage (러닝 기록 목록)

```
┌─────────────────────────────────┐
│ 러닝 기록                [필터] │
├─────────────────────────────────┤
│                                 │
│  ── 2026년 9월 ──               │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 9/3 (수)  템포런         │   │
│  │ 6.0km  31:12  5:12/km   │   │
│  │ RPE 6  ☀️ 25°           │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 9/2 (화)  이지런         │   │
│  │ 5.2km  31:12  6:00/km   │   │
│  │ RPE 4  ⛅ 26°           │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │ 9/1 (월)  인터벌          │   │
│  │ 6.0km  28:30  4:45/km   │   │
│  │ RPE 8  ☀️ 24°           │   │
│  └─────────────────────────┘   │
│                                 │
│  ── 2026년 8월 ──               │
│  ...                            │
│                                 │
├─────────────────────────────────┤
│  홈    기록    코치⚡   설정    │
└─────────────────────────────────┘
```

### 5.5 GoalPage (목표 관리)

```
┌─────────────────────────────────┐
│ ← 목표                         │
├─────────────────────────────────┤
│                                 │
│  ┌─ 활성 목표 ────────────────┐ │
│  │  🏁 서울마라톤 2027         │ │
│  │  42.195km | 목표 4:00:00   │ │
│  │  D-194                      │ │
│  │                             │ │
│  │  주간 목표: 40km/주         │ │
│  │  이번 주: 12/40km (30%)    │ │
│  │  █████░░░░░░░░░░░           │ │
│  │                     [수정]  │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────┐    │
│  │  + 새 목표 만들기         │    │
│  └─────────────────────────┘    │
│                                 │
│  ── 완료된 목표 ──              │
│  ┌─────────────────────────┐   │
│  │ ✅ 주간 30km 달성 (8주)   │   │
│  │ 2026.07 - 2026.08        │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│  홈    기록    코치⚡   설정    │
└─────────────────────────────────┘
```

---

## 6. State management

### 6.1 Zustand stores — 클라이언트 전용 상태

```typescript
// stores/authStore.ts
interface AuthState {
  token: string | null;
  user: { id: string; name: string; email: string; location: string } | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

// stores/uiStore.ts
interface UIState {
  isOnline: boolean;
  pendingSyncCount: number;
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type: string) => void;
}
```

Zustand의 `persist` 미들웨어로 authStore를 localStorage에 자동 저장.
앱 재실행 시 토큰이 유지되어 재로그인 불필요.

### 6.2 TanStack Query — 서버 상태

```typescript
// hooks/useRuns.ts
export function useRuns(params?: RunListParams) {
  return useQuery({
    queryKey: ['runs', params],
    queryFn: () => runsApi.list(params),
    staleTime: 5 * 60 * 1000,  // 5분
  });
}

export function useCreateRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: runsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

// hooks/useCoach.ts
export function useCoachRecommend() {
  return useMutation({
    mutationFn: coachApi.recommend,
    // 추천은 캐싱하지 않음, 매번 fresh
  });
}

// hooks/useStats.ts
export function useWeeklyStats() {
  return useQuery({
    queryKey: ['stats', 'weekly'],
    queryFn: statsApi.getWeekly,
    staleTime: 2 * 60 * 1000,  // 2분 — 기록 추가 시 invalidate
  });
}

export function useVolumeTrend(weeks = 12) {
  return useQuery({
    queryKey: ['stats', 'trend', weeks],
    queryFn: () => statsApi.getTrend(weeks),
    staleTime: 10 * 60 * 1000,  // 10분
  });
}
```

### 6.3 Query 캐시 전략 요약

| Query key          | staleTime | 갱신 시점                        |
|--------------------|-----------|----------------------------------|
| `['runs']`         | 5분       | 기록 생성/수정/삭제 시 invalidate |
| `['stats']`        | 2분       | 기록 변경 시 invalidate           |
| `['plans']`        | 5분       | 코칭 후 invalidate               |
| `['goals']`        | 10분      | 목표 변경 시 invalidate           |
| `['coach']`        | 캐싱 안함  | 매번 mutation                    |

---

## 7. API client

```typescript
// api/client.ts
import ky from 'ky';
import { useAuthStore } from '@/stores/authStore';

const apiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token;
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      },
    ],
  },
  retry: { limit: 2, methods: ['get'] },
});

export default apiClient;
```

```typescript
// api/runs.ts
import api from './client';
import type { Run, RunCreate, RunListParams } from '@/types/run';

export const runsApi = {
  list: (params?: RunListParams) =>
    api.get('runs', { searchParams: params }).json<Run[]>(),

  get: (id: string) =>
    api.get(`runs/${id}`).json<Run>(),

  create: (data: RunCreate) =>
    api.post('runs', { json: data }).json<Run>(),

  update: (id: string, data: Partial<RunCreate>) =>
    api.put(`runs/${id}`, { json: data }).json<Run>(),

  delete: (id: string) =>
    api.delete(`runs/${id}`).json<void>(),
};
```

```typescript
// api/coach.ts
import api from './client';
import type { CoachRequest, CoachResponse } from '@/types/coach';

export const coachApi = {
  recommend: (data: CoachRequest) =>
    api.post('coach/recommend', { json: data }).json<CoachResponse>(),

  feedback: (sessionId: string, rating: number) =>
    api.post('coach/feedback', { json: { session_id: sessionId, rating } }).json(),

  history: (limit = 10) =>
    api.get('coach/history', { searchParams: { limit } }).json(),
};
```

---

## 8. Offline support

### 8.1 전략

PWA 오프라인 지원은 두 가지 레벨로 나눈다:

- **Level 1 (MVP)**: 앱 셸 캐싱 + 읽기 전용 오프라인
- **Level 2 (후순위)**: 러닝 기록 오프라인 입력 + 온라인 복귀 시 sync

### 8.2 Level 1 구현 — Vite PWA

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Running Coach',
        short_name: 'RunCoach',
        description: 'AI 기반 러닝 코치',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            // API GET 요청: 네트워크 우선, 실패 시 캐시
            urlPattern: /\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
});
```

### 8.3 Level 2 — 오프라인 기록 입력 큐

```typescript
// utils/offlineQueue.ts
import { openDB, DBSchema } from 'idb';

interface OfflineDB extends DBSchema {
  pendingRuns: {
    key: string;
    value: {
      id: string;       // 임시 UUID
      data: RunCreate;
      createdAt: number;
    };
  };
}

const dbPromise = openDB<OfflineDB>('running-coach-offline', 1, {
  upgrade(db) {
    db.createObjectStore('pendingRuns', { keyPath: 'id' });
  },
});

export async function queueRun(data: RunCreate) {
  const db = await dbPromise;
  await db.put('pendingRuns', {
    id: crypto.randomUUID(),
    data,
    createdAt: Date.now(),
  });
}

export async function syncPendingRuns() {
  const db = await dbPromise;
  const pending = await db.getAll('pendingRuns');

  for (const item of pending) {
    try {
      await runsApi.create(item.data);
      await db.delete('pendingRuns', item.id);
    } catch {
      break;  // 네트워크 에러면 중단, 다음 sync 시 재시도
    }
  }
}

export async function getPendingCount(): Promise<number> {
  const db = await dbPromise;
  return db.count('pendingRuns');
}
```

```typescript
// hooks/useOfflineSync.ts
export function useOfflineSync() {
  const setOnline = useUIStore(s => s.setOnline);
  const setPendingCount = useUIStore(s => s.setPendingCount);

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true);
      await syncPendingRuns();
      setPendingCount(await getPendingCount());
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
}
```

---

## 9. TypeScript types

서버 응답과 1:1 대응하는 타입 정의.

```typescript
// types/run.ts
export interface Run {
  id: string;
  run_date: string;          // "2026-09-02"
  distance_km: number;
  duration_sec: number;
  avg_pace_sec: number;
  avg_pace_display: string;  // "6:00/km"
  run_type: RunType;
  rpe: number | null;
  notes: string | null;
  weather_snapshot: WeatherSnapshot | null;
  created_at: string;
}

export type RunType = 'easy' | 'tempo' | 'interval' | 'long' | 'race' | 'other';

export interface RunCreate {
  run_date: string;
  distance_km: number;
  duration_sec: number;
  run_type: RunType;
  rpe?: number;
  notes?: string;
}

export interface WeatherSnapshot {
  temp_c: number;
  humidity: number;
  condition: string;
  wind_mps: number;
}

// types/coach.ts
export interface CoachRequest {
  rpe: number;
  notes?: string;
}

export interface CoachResponse {
  session_id: string;
  recommendation: Recommendation;
  weekly_context: WeeklyContext;
  weather: WeatherSnapshot;
}

export interface Recommendation {
  run_type: RunType;
  distance_km: number;
  pace_range: { min: string; max: string };
  warmup: string;
  main_session: string;
  cooldown: string;
  reasoning: string;
  motivation: string;
}

export interface WeeklyContext {
  completed_km: number;
  target_km: number;
  progress_pct: number;
  remaining_days: number;
  sessions_done: number;
  plan_adjustment: string | null;
}

// types/goal.ts
export interface Goal {
  id: string;
  goal_type: 'weekly_volume' | 'race';
  weekly_km_target: number | null;
  race_name: string | null;
  race_date: string | null;
  race_target_time: number | null;
  race_distance_km: number | null;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
}

// types/stats.ts
export interface WeeklyStats {
  week_start: string;
  total_km: number;
  target_km: number | null;
  progress_pct: number;
  session_count: number;
  avg_pace_sec: number;
  avg_pace_display: string;
  avg_rpe: number | null;
  run_type_breakdown: Record<RunType, number>;
}
```

---

## 10. Utility functions

```typescript
// utils/format.ts

/** 초 → "m:ss/km" */
export function formatPace(paceSeconds: number): string {
  const min = Math.floor(paceSeconds / 60);
  const sec = Math.round(paceSeconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

/** 초 → "HH:MM:SS" 또는 "MM:SS" */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** 거리 표시: 5.0 → "5", 5.2 → "5.2" */
export function formatDistance(km: number): string {
  return km % 1 === 0 ? km.toFixed(0) : km.toFixed(1);
}

/** RPE → 이모지 */
export function rpeEmoji(rpe: number): string {
  if (rpe <= 3) return '😴';
  if (rpe <= 5) return '😊';
  if (rpe <= 7) return '😤';
  if (rpe <= 9) return '🥵';
  return '💀';
}

/** RunType → 한글 라벨 */
export function runTypeLabel(type: RunType): string {
  const labels: Record<RunType, string> = {
    easy: '이지런', tempo: '템포런', interval: '인터벌',
    long: '장거리', race: '레이스', other: '기타',
  };
  return labels[type];
}
```

---

## 11. Key component specs

### 11.1 RunForm — validation (Zod)

```typescript
import { z } from 'zod';

export const runFormSchema = z.object({
  run_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  distance_km: z.number().positive().max(200),
  duration_sec: z.number().int().positive().max(86400),
  run_type: z.enum(['easy', 'tempo', 'interval', 'long', 'race', 'other']),
  rpe: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(500).optional(),
});
```

### 11.2 RpeSlider

- 1-10 연속 슬라이더
- 터치 드래그 지원 (touchmove)
- 현재 값에 따라 색상 그라데이션 (초록 → 노랑 → 빨강)
- 이모지 + 한글 라벨 (1-2: 매우 쉬움 / 3-4: 쉬움 / 5-6: 보통 / 7-8: 힘듦 / 9-10: 매우 힘듦)

### 11.3 WeeklyProgress (링 차트)

- 중앙에 큰 숫자: 완료 km / 목표 km
- 링 애니메이션: mount 시 0%에서 채워지는 효과
- 색상: 60% 미만 → 회색, 60-99% → 파랑, 100%+ → 초록 (달성)
- SVG 기반 (Recharts PieChart 또는 커스텀 SVG)

### 11.4 RecommendationCard

- AI 응답 대기 중: 스켈레톤 + "코치가 분석 중..." 메시지
- reasoning 섹션: 기본 접힘, 탭으로 펼침 (Disclosure)
- "이 루틴으로 뛰기" 버튼: RunLogPage로 이동, 추천 데이터를 pre-fill
  (run_type, distance_km 등을 query param 또는 state로 전달)

---

## 12. Execution plan

### Sprint F0: Project setup (1일)

- [ ] Vite + React + TypeScript 초기화
- [ ] Tailwind CSS 설정
- [ ] ESLint + Prettier 설정
- [ ] 프로젝트 구조 (폴더, alias 설정)
- [ ] API client (ky) + auth interceptor
- [ ] Zustand stores (auth, ui)
- [ ] React Router 라우팅 + AppShell + BottomNav

**완료 기준:** 빈 탭 4개가 하단 네비로 전환되는 앱 셸 동작

### Sprint F1: Auth + 러닝 기록 (2일)

- [ ] LoginPage, SignupPage
- [ ] RunLogPage (RunForm + PaceInput + RpeSlider)
- [ ] RunListPage (RunCard 목록 + 월별 그루핑)
- [ ] RunDetailPage (상세 + 수정/삭제)
- [ ] useRuns hook (TanStack Query)
- [ ] 입력 validation (React Hook Form + Zod)
- [ ] 페이스 자동 계산 (거리/시간 입력 시 실시간)

**완료 기준:** 회원가입 → 로그인 → 러닝 기록 입력 → 목록 확인 플로우 완성

### Sprint F2: 목표 + 대시보드 (2일)

- [ ] GoalPage (GoalForm + GoalCard + RaceCountdown)
- [ ] HomePage 대시보드 구성
  - WeeklyProgress (링 차트)
  - WeeklyCalendar (이번 주 요약)
  - 최근 러닝 3개
  - 오늘의 코칭 요약 CTA
- [ ] useGoals, useStats, usePlans hooks
- [ ] 주간 볼륨 진행률 표시

**완료 기준:** 홈에서 이번 주 12/20km (60%) 등 한눈에 파악 가능

### Sprint F3: AI 코칭 (2일) — 핵심

- [ ] CoachPage (ConditionInput + RecommendationCard + SessionDetail)
- [ ] useCoach hook (mutation + loading state)
- [ ] 추천 대기 중 스켈레톤 UI
- [ ] reasoning 접기/펼치기
- [ ] "이 루틴으로 뛰기" → RunLogPage pre-fill 연동
- [ ] 날씨 정보 표시
- [ ] 주간 컨텍스트 프로그레스 바

**완료 기준:** 컨디션 입력 → AI 추천 수신 → 추천 기반 기록 입력 전체 플로우

### Sprint F4: 차트 + PWA + 마무리 (2일)

- [ ] PaceTrend (라인 차트, 12주)
- [ ] VolumeTrend (막대 차트, 12주)
- [ ] PersonalBests 카드
- [ ] PWA 설정 (manifest, service worker, 아이콘)
- [ ] OfflineBanner (오프라인 상태 안내)
- [ ] 반응형 점검 (375px ~ 768px)
- [ ] 에러 바운더리 + 토스트
- [ ] SettingsPage (프로필, 위치 설정)

**완료 기준:** 홈 화면에 추가 → PWA로 실행 → 전체 플로우 동작

---

## 13. Design tokens

```css
/* styles/index.css */

@layer base {
  :root {
    /* Palette — 어두운 배경 + 밝은 액센트 */
    --color-bg:         #0F172A;   /* slate-900 */
    --color-surface:    #1E293B;   /* slate-800 */
    --color-surface-2:  #334155;   /* slate-700 */
    --color-text:       #F1F5F9;   /* slate-100 */
    --color-text-muted: #94A3B8;   /* slate-400 */
    --color-border:     #334155;   /* slate-700 */

    /* Accent */
    --color-accent:     #38BDF8;   /* sky-400, 코칭·CTA */
    --color-accent-dim: #0EA5E9;   /* sky-500 */

    /* Run type colors */
    --color-easy:       #4ADE80;   /* green-400 */
    --color-tempo:      #FACC15;   /* yellow-400 */
    --color-interval:   #FB923C;   /* orange-400 */
    --color-long:       #A78BFA;   /* violet-400 */
    --color-rest:       #94A3B8;   /* slate-400 */

    /* Functional */
    --color-success:    #4ADE80;
    --color-warning:    #FACC15;
    --color-error:      #F87171;

    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;

    /* Radius */
    --radius-sm: 0.5rem;
    --radius-md: 0.75rem;
    --radius-lg: 1rem;
    --radius-full: 9999px;
  }
}
```

---

## 14. Key design decisions

### 14.1 왜 Zustand + TanStack Query 조합?

Redux는 boilerplate가 과하다. Zustand는 클라이언트 전용 상태 (auth, UI)만 담당하고,
서버 상태 (runs, goals, stats)는 TanStack Query가 캐싱·갱신·동기화를 전담한다.
두 관심사를 명확히 분리하면 상태 관리 복잡도가 크게 낮아진다.

### 14.2 왜 하단 네비 4탭?

러닝 앱은 모바일에서 쓴다. 하단 네비는 엄지 하나로 닿고,
4탭은 인지 부하가 낮다 (5탭 이상은 라벨이 작아져서 터치 미스 증가).
코치 탭을 시각적으로 강조하여 핵심 가치를 명확히 한다.

### 14.3 왜 다크 테마 기본?

러닝은 주로 이른 아침이나 저녁에 한다.
밝은 화면은 야외 러닝 전후로 눈이 부시고,
다크 테마는 OLED 기기에서 배터리도 절약된다.
라이트 테마 전환은 Phase 2에서 추가 가능.

### 14.4 코치 페이지를 왜 채팅 UI가 아니라 "미션 브리핑" 구조로?

채팅 UI는 자유도가 높지만, 러닝 코칭은 정형화된 정보를 전달하는 게 목적이다.
워밍업/메인/쿨다운 구조가 명확하고, 페이스 범위나 거리 같은 숫자가 중요한데
채팅 버블 안에 넣으면 가독성이 떨어진다.
카드 기반 구조화된 레이아웃이 "이 정보대로 실행하면 된다"는 확신을 준다.
```
