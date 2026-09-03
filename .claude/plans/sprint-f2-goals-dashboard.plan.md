# Plan: Sprint F2 — 목표 + 대시보드

**Source**: `.claude/plans/running-coach-frontend-design.md` §5.1(HomePage), §5.5(GoalPage), §6.2/§6.3(hooks/cache), §9(types), §11.3(WeeklyProgress), §12(Sprint F2)
**Backend contract**: verified against real code at `/Users/songseunghyeon/Desktop/com.runssistant.api` (`app/api/{goals,stats,plans}.py`, `app/schemas/{goal,stats,plan}.py`) — **backend wins over design doc**
**Scope**: Sprint F2 only — builds on F1 (auth + run CRUD). Goals CRUD UI + Home dashboard.
**Package manager**: npm
**Complexity**: Medium
**완료 기준 (design doc)**: 홈에서 "이번 주 12/20km (60%)" 등을 한눈에 파악 가능

---

## Context

F1 delivered auth + full run CRUD wired to the live backend. F2 turns the two remaining stub screens into real product: the **Home dashboard** (weekly volume ring, this-week calendar, recent 3 runs, coaching CTA) and the **Goals** screen (create/edit weekly-volume or race goals, active-goal card with progress, race D-day). This is the first sprint to consume the `/goals`, `/stats`, `/plans` endpoints, so — as in F1 — the plan is grounded in the **actual** FastAPI contract, which diverges from the design doc in a few places (documented below).

The Vite dev proxy from F1 already forwards `/goals`, `/stats`, `/plans` → `http://localhost:8000`, so **no config/proxy changes are needed** in F2.

---

## Backend reality vs. design doc — MUST follow backend

Verified from `app/schemas/*.py` and `app/api/*.py`. Where the design doc disagrees, the backend wins.

| Topic | Design doc said | Backend actually | Action |
|---|---|---|---|
| `Goal` shape | no `user_id`/`updated_at` | includes `user_id`, `updated_at` | Add both to `types/goal.ts` |
| Goal delete | (implied "완료된 목표") | **No DELETE route** — only `PATCH /goals/{id}/status` `{status: completed\|abandoned}` | "완료/포기" = PATCH status, not delete |
| `WeeklyStats.progress_pct` | `number` | **`int \| null`** | `number \| null` |
| `WeeklyStats.avg_pace_sec` | `number` | **`int \| null`** (and `avg_pace_display: string \| null`) | nullable in type + UI |
| `WeeklyStats.target_km` | `number \| null` | `float \| null` | `number \| null`; null ⇒ no active weekly goal |
| Goal numeric fields | `number` | `Decimal` on input, **`float` on response** | type as `number \| null`; send plain numbers |
| Plan (current) | not fully specced | `GET /plans/current` **auto-creates + commits** a plan; returns `planned_sessions[]` | Home calendar reads `planned_sessions` |
| `race_target_time` | `number` (seconds) | `int \| null` seconds, optional | optional; format sec→`H:MM:SS` |

**Endpoints (all `Authorization: Bearer <token>`):**

- **Goals**: `POST /goals` (201, `GoalCreate`→`GoalResponse`) · `GET /goals?status=` (`GoalResponse[]`) · `GET /goals/active` (`GoalResponse`) · `PUT /goals/{id}` (`GoalUpdate`) · `PATCH /goals/{id}/status` (`{status}`→`GoalResponse`).
- **Stats**: `GET /stats/weekly?week_start=` (`WeeklyStats`) · `GET /stats/trend?weeks=12` (`TrendPoint[]`, F4) · `GET /stats/personal-bests` (`PersonalBest[]`, F4).
- **Plans**: `GET /plans/current` (`WeeklyPlanResponse`) · `GET /plans/history?weeks=8` · `GET /plans/{week_start}`.

**`GoalCreate` validation (backend enforces):**
- `goal_type: 'weekly_volume' | 'race'`
- `weekly_volume` ⇒ `weekly_km_target` required (`>0`)
- `race` ⇒ `race_name` + `race_date` + `race_distance_km` all required; `race_target_time` optional (`>0`)

**`WeeklyPlanResponse.planned_sessions[]`**: `{day, type, distance_km, pace_range?, status, actual_distance_km?, run_id?, unplanned}`.

---

## Key decisions

- **WeeklyProgress ring = custom SVG, NOT Recharts.** Design doc §11.3 explicitly allows "커스텀 SVG", Recharts is not yet a dependency, and **F4 is the charts sprint**. Adding Recharts now would be speculative (violates repo `CLAUDE.md` "No Speculative Code"). A ~30-line SVG `<circle>` with `stroke-dasharray` covers the ring.
- **"오늘의 코칭" CTA is a static link card** → `/coach`. The coach API call is F3 scope; F2 only renders the CTA. No `useCoach` in F2.
- **Recent 3 runs reuse `useRuns`** — call `useRuns({ limit: 3 })` (F1 hook already supports `RunListParams`). No new list logic.
- **This-week calendar reads `/plans/current`** `planned_sessions[]` (`status` + `unplanned`) to render ✅완료 / 📋예정 / `-`. `plans/current` auto-creates the week's plan server-side, so the client just renders it.
- **Goal "삭제" = `PATCH status`** (completed/abandoned). No delete UI/endpoint. Active-goal card shows 수정 (PUT) + 완료/포기 (PATCH). Completed/abandoned goals render in a read-only "완료된 목표" list.
- **Mirror F1 layering exactly**: `types/ → api/ (ky) → hooks/ (TanStack Query) → components/ → pages/`. Same file naming, same `qc.invalidateQueries` pattern, same `apiClient.get(...).json<T>()` style. No new abstractions.
- **Cache strategy** (design doc §6.3): `['stats']` staleTime 2m, `['goals']` 10m, `['plans']` 5m. Creating/updating a goal invalidates `['goals']` + `['stats']` (target_km changes) + `['plans']`.

---

## New dependencies

**None.** All F2 work uses already-installed deps (`@tanstack/react-query`, `date-fns`, `react-hook-form`, `zod`, `ky`, `zustand`). Recharts is deferred to F4.

---

## Files to change

**Types (CREATE `src/types/`)** — mirror backend response shapes 1:1 (root `CLAUDE.md` rule)
| File | Contents |
|---|---|
| `goal.ts` | `GoalType`, `GoalStatus`, `Goal` (incl. `user_id`,`updated_at`), `GoalCreate`, `GoalUpdate`, `GoalStatusUpdate` |
| `stats.ts` | `WeeklyStats` (`progress_pct`/`avg_pace_sec` nullable), `RunTypeBreakdown` |
| `plan.ts` | `PlannedSession`, `PaceRange`, `WeeklyPlan` |

**API (CREATE `src/api/`)** — reuse F1 `api/client.ts` `ky` instance, same style as `api/runs.ts`
| File | Functions |
|---|---|
| `goals.ts` | `list(status?)`, `getActive()`, `create(body)`, `update(id, body)`, `updateStatus(id, status)` |
| `stats.ts` | `getWeekly(weekStart?)` |
| `plans.ts` | `getCurrent()` |

**Hooks (CREATE `src/hooks/`)** — mirror `useRuns.ts`
| File | Hooks |
|---|---|
| `useGoals.ts` | `useGoals(status?)`, `useActiveGoal()`, `useCreateGoal()`, `useUpdateGoal(id)`, `useUpdateGoalStatus(id)` (invalidate `['goals']`,`['stats']`,`['plans']`) |
| `useStats.ts` | `useWeeklyStats()` (staleTime 2m) |
| `usePlans.ts` | `useCurrentPlan()` (staleTime 5m) |

**Utils (UPDATE `src/utils/`)**
- `format.ts` — add `formatRaceTime(sec)` (sec→`H:MM:SS`), `dDay(dateStr)` (→ `D-194` / `D-DAY` / `D+n`)
- `validation.ts` — add `goalFormSchema` (Zod discriminated on `goal_type`: weekly_volume ⇒ `weekly_km_target>0`; race ⇒ `race_name`+`race_date`+`race_distance_km` required, `race_target_time?`)

**Components (CREATE)**
- `components/goal/` — `GoalForm.tsx` (RHF+Zod; type toggle → conditional fields; reuse F1 `Button`/`Input`), `GoalCard.tsx` (active goal: progress bar + 수정/완료 actions), `RaceCountdown.tsx` (D-day badge)
- `components/dashboard/` — `WeeklyProgress.tsx` (custom SVG ring; 완료/목표 km + %; color: <60% gray, 60–99% blue, ≥100% green per §11.3), `WeeklyCalendar.tsx` (월–일 7칸, ✅/📋/`-` from plan)

**Pages**
- CREATE `GoalPage.tsx` (`/goals`) — `useActiveGoal` + `useGoals('completed')`; active `GoalCard`, "새 목표 만들기" → `GoalForm`, 완료된 목표 list
- UPDATE `HomePage.tsx` (stub → dashboard) — `WeeklyProgress` (`useWeeklyStats`), `WeeklyCalendar` (`useCurrentPlan`), 오늘의 코칭 CTA (static → `/coach`), 최근 러닝 3개 (`useRuns({limit:3})` + F1 `RunCard`), FAB → `/runs/new`
- UPDATE `App.tsx` — add `<Route path="goals" element={<GoalPage />} />` inside the existing `RequireAuth`/`AppShell` branch

---

## Tasks

### Task 1: Types + utils + validation
- Create `types/goal.ts`, `types/stats.ts`, `types/plan.ts` (backend-accurate; nullable where backend says `| None`). Extend `utils/format.ts` (`formatRaceTime`, `dDay`) and `utils/validation.ts` (`goalFormSchema`).
- **Validate**: `npm run build` type-checks.

### Task 2: API layer + hooks
- Create `api/goals.ts`, `api/stats.ts`, `api/plans.ts` on the F1 `ky` client (paths without leading `/`, `searchParams` for query args — mirror `api/runs.ts`). Create `hooks/useGoals.ts`, `useStats.ts`, `usePlans.ts` mirroring `useRuns.ts` (correct `queryKey`s + `staleTime`s + invalidations).
- **Validate**: build clean; no `avg_pace_sec` sent on writes; goal writes invalidate `['goals']`,`['stats']`,`['plans']`.

### Task 3: Goals screen
- `GoalForm` (RHF + `goalFormSchema`; `goal_type` toggle switches between weekly-volume and race fields; reuse `Button`/`Input`). `GoalCard` (active goal: target vs. this-week km progress bar via `useWeeklyStats`; 수정 → `GoalForm` prefilled with `useUpdateGoal`; 완료/포기 → `useUpdateGoalStatus`). `RaceCountdown` (`dDay`). `GoalPage` at `/goals` (active card + create + completed list). Add route to `App.tsx`.
- **Validate**: create weekly-volume goal → appears as active; create race goal → D-day shows; edit persists; 완료 moves it to completed list; no delete path.

### Task 4: Home dashboard
- `WeeklyProgress` (custom SVG ring, color thresholds per §11.3, handles `target_km === null` → "목표 없음" CTA to `/goals`). `WeeklyCalendar` (7-day row from `useCurrentPlan` `planned_sessions`). Rebuild `HomePage`: ring + calendar + 코칭 CTA (→`/coach`) + recent 3 runs (`useRuns({limit:3})` + `RunCard`) + FAB. Loading/empty states for each block.
- **Validate**: with runs logged this week, Home shows "이번 주 N/M km (P%)"; null target degrades gracefully; recent runs render; CTA navigates.

---

## Validation

```bash
npm install            # no new deps, but keep lockfile honest
npm run lint           # oxlint clean
npm run build          # tsc -b && vite build succeed
npm run dev            # with backend running on :8000
```

Backend must be up (`com.runssistant.api`: `uvicorn app.main:app --reload`, DB migrated).

Manual acceptance (완료 기준):
1. `/goals` → 새 목표 (weekly_volume, 20km/주) 생성 → active 카드에 표시.
2. Log runs this week (F1 flow) → `/` (Home) shows the ring at "12/20km 60%" style, 이번 주 3회, this-week calendar marking 완료/예정.
3. Create a race goal (name + date + distance) → active 카드에 D-day + 목표 시간(H:MM:SS).
4. Edit the active goal (PUT) → persists; 완료 처리(PATCH) → moves to "완료된 목표" list.
5. Home "오늘의 코칭" CTA → navigates to `/coach` (stub until F3). No console/CORS errors; 401 while unauthenticated → `/login`.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `progress_pct`/`avg_pace_sec` null crashes UI | Med | Nullable types + null-guards in ring/calendar/card |
| `target_km === null` (no active weekly goal) | High (first run) | Ring shows "목표 없음" + CTA to `/goals`, never divides by null |
| `/plans/current` side-effect (auto-create + commit) surprises | Low | Read-only consume; documented server behavior |
| Recharts assumed by design doc §11.3 | Low | Explicit decision: custom SVG in F2, Recharts deferred to F4 |
| Goal has no DELETE → user expects delete | Med | UI offers 완료/포기 (PATCH status) only; label clearly |
| Decimal→float precision on km targets | Low | Send plain numbers; display via existing `formatDistance` |

## Acceptance
- [ ] All 4 tasks complete
- [ ] `npm run lint` + `npm run build` pass
- [ ] Home dashboard shows weekly volume ring + calendar + recent runs + coaching CTA
- [ ] Goals: create/edit/complete for both weekly_volume and race; race D-day renders
- [ ] Types/enums/nullability match backend, not the design doc
- [ ] KISS: no Recharts, no new abstractions; only `components/goal/` + `components/dashboard/` added; reuse F1 `Button`/`Input`/`RunCard`

## Out of scope (later sprints)
- AI coaching call / CoachPage logic, "이 루틴으로 뛰기" pre-fill (F3)
- Pace/Volume trend charts, PersonalBests, `/stats/trend` + `/stats/personal-bests`, Recharts, PWA, offline, SettingsPage profile edit (F4)
