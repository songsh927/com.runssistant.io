# Plan: Sprint F3 — AI 코칭 (핵심)

**Source**: `.claude/plans/running-coach-frontend-design.md` §5.3, §6.2, §7, §11, §12 (Sprint F3)
**Backend contract**: verified against `/Users/songseunghyeon/Desktop/com.runssistant.api` (`app/api/coach.py`, `app/schemas/coach.py`) — real code, not the design doc
**Scope**: Sprint F3 only — builds on F0/F1/F2. Turns the `CoachPage` stub into the app's core screen.
**Package manager**: npm (no new dependencies)
**Complexity**: Medium
**완료 기준 (design doc)**: 컨디션 입력 → AI 추천 수신 → 추천 기반 기록 입력 전체 플로우

---

## Context

F2 delivered goals + the home dashboard. F3 builds the headline feature: the AI coach. The user reports today's condition (RPE + optional note), submits, and the backend LLM returns a structured "mission briefing" — run type, distance, pace range, warmup/main/cooldown, reasoning, motivation — plus this week's context and weather. The user then taps **"이 루틴으로 뛰기"** to jump to `RunLogPage` with the form pre-filled from the recommendation.

Per the project `CLAUDE.md`: the pre-fill is passed via **React Router state** (`useLocation`), and `RunLogPage` reads it to seed the form. `RunLogPage` does **not** currently read router state, so that wiring is part of this sprint.

---

## Backend reality vs. design doc — MUST follow backend

Verified from `app/schemas/coach.py` and `app/api/coach.py`. Where the design doc disagrees, **the backend wins**.

| Topic | Design doc (`types/coach.ts`) | Backend actually | Action |
|---|---|---|---|
| Recommend request | `{ rpe: number; notes?: string }` (rpe required) | `RecommendRequest { rpe: int \| None; notes: str \| None }` — **rpe optional** | rpe optional in type + Zod; still collect it in the UI |
| Response weather | `weather: WeatherSnapshot` (temp_c, humidity, condition, wind_mps) | `weather: WeatherContext \| None` = `{ temp_c, humidity, condition }` **all nullable, whole object nullable** | New `WeatherContext` type; render "날씨 정보 없음" when null |
| `pace_range` | `{ min: string; max: string }` (required) | `PaceRange \| None` — **nullable** | `pace_range: PaceRange \| null`; hide pace line when null |
| `WeeklyContext` | all fields present | `target_km: float\|None`, `progress_pct: int\|None`, `plan_adjustment: str\|None` nullable; **no `remaining_km`** | Match nullable fields; progress bar handles null target |
| `run_type` enum | `RunType` (has `race`, no `rest`) | `CoachRunType = easy\|tempo\|interval\|long_run\|recovery\|rest` — **has `rest`, no `race`** | Add `CoachRunType`; map to loggable `RunType` for pre-fill |
| Response id field | `session_id` | `session_id` (recommend response) BUT feedback wants `coaching_session_id` | Only `recommend` is in F3 scope — see below |
| Feedback / history | in `api/coach.ts` | `POST /coach/feedback {coaching_session_id, rating 1-5}`, `GET /coach/history` | **Out of F3 scope** (not in F3 checklist) — do not build |

**Endpoint used (F3):** `POST /coach/recommend` (`Authorization: Bearer <token>`), body `RecommendRequest`, returns `RecommendResponse`.
`RecommendResponse = { session_id, recommendation: CoachRecommendation, weekly_context: WeeklyContext, weather: WeatherContext | null }`.

---

## Key decisions

- **`useCoachRecommend` is a mutation, never cached** (design doc §6.3: `['coach']` = 캐싱 안함). On success, invalidate `['plans']` (a recommend call commits a plan server-side, as in F2's `/plans/current`). Keep the result in local page state, not query cache.
- **Feedback & history are out of scope.** The F3 checklist (design doc lines 929–935) lists only recommend → display → pre-fill. Per repo `CLAUDE.md` ("No Speculative Code", YAGNI), `api/coach.ts` ships `recommend` only. Feedback/history land in a later sprint if ever requested.
- **Pre-fill via router state** (matches project `CLAUDE.md`): `RecommendationCard` navigates to `/runs/new` with `state: { prefill: {...} }`. `RunLogPage` reads `useLocation().state?.prefill` and passes it to `RunForm` as new optional `prefill` props. `RunForm` already accepts `defaultValues?: Run` for edit mode; add a separate lightweight `prefill` path so we don't fake a full `Run` object.
- **`run_type` mapping for pre-fill**: coach may return `rest`, which is not a loggable `RunType`. When `run_type === 'rest'`, hide the "이 루틴으로 뛰기" button (you don't log a rest day). All other coach types (`easy|tempo|interval|long_run|recovery`) are valid `RunType`s and pass through directly.
- **RPE reuse**: reuse the existing `RpeSlider` from F1 (`components/run/RpeSlider.tsx`) for the condition input — no new slider. Clears the reuse bar.
- **No new shared UI, no new deps.** Reuse `Button`, `Input`, `RpeSlider`, `RunTypeBadge`, `formatDistance`, `runTypeLabel`. Skeleton is a few inline `animate-pulse` divs (same pattern as `HomePage`).
- **`runTypeLabel` gap**: current `TYPE_LABELS`/`runTypeLabel` (`utils/format.ts`) covers `easy|tempo|interval|long_run|race|recovery` but **not `rest`**. Add a `rest: '휴식'` label so coach output renders. This is additive, one line.

---

## New dependencies

None. Everything reuses installed packages (react, react-router-dom, @tanstack/react-query, react-hook-form, zod, ky).

---

## Files to change

**Types (CREATE)**
| File | Action | Why |
|---|---|---|
| `src/types/coach.ts` | CREATE | `CoachRunType`, `CoachRecommendation`, `WeeklyContext`, `WeatherContext`, `RecommendRequest`, `RecommendResponse` — mirror backend `schemas/coach.py` 1:1 |

**Utils (UPDATE)**
| File | Action | Why |
|---|---|---|
| `src/utils/format.ts` | UPDATE | add `rest: '휴식'` to the run-type label map so coach `rest` renders |

**API (CREATE)**
| File | Action | Why |
|---|---|---|
| `src/api/coach.ts` | CREATE | `recommend(body)` → `POST coach/recommend`. (No feedback/history — out of scope) |

**Hooks (CREATE)**
| File | Action | Why |
|---|---|---|
| `src/hooks/useCoach.ts` | CREATE | `useCoachRecommend()` mutation; `onSuccess` invalidates `['plans']`; no caching |

**Components (CREATE)**
| File | Action | Why |
|---|---|---|
| `src/components/coach/ConditionInput.tsx` | CREATE | RPE (`RpeSlider`) + optional note textarea + "코칭 받기" submit; disabled while pending |
| `src/components/coach/RecommendationCard.tsx` | CREATE | Renders recommendation (run_type + distance + pace, warmup/main/cooldown, motivation, collapsible reasoning), weather, weekly-context bar, and the "이 루틴으로 뛰기" CTA (router-state pre-fill) |
| `src/components/coach/CoachSkeleton.tsx` | CREATE | Loading skeleton shown while the mutation is pending |

**Pages (UPDATE)**
| File | Action | Why |
|---|---|---|
| `src/pages/CoachPage.tsx` | UPDATE | Replace stub: `ConditionInput` → `useCoachRecommend` → skeleton / `RecommendationCard`; holds the response in local state |
| `src/pages/RunLogPage.tsx` | UPDATE | Read `useLocation().state?.prefill`; pass to `RunForm` |
| `src/components/run/RunForm.tsx` | UPDATE | Accept optional `prefill` (run_type/distance_km) to seed a fresh form (separate from `defaultValues` edit path) |

---

## Tasks

### Task 1: Coach types + label fix
- Create `types/coach.ts` mirroring `schemas/coach.py` exactly (nullable `pace_range`, `weather`, `target_km`, `progress_pct`, `plan_adjustment`; `CoachRunType` with `rest`, no `race`).
- Add `rest: '휴식'` to the label map in `utils/format.ts`.
- **Validate**: `npm run build` type-checks.

### Task 2: API + hook
- Create `api/coach.ts` with `recommend(body: RecommendRequest): Promise<RecommendResponse>` on the F0 `ky` client (`coach/recommend`, no leading `/`).
- Create `hooks/useCoach.ts` → `useCoachRecommend()` mutation; `onSuccess` invalidates `['plans']`.
- **Validate**: build clean; no `['coach']` query key created (mutation only).

### Task 3: Condition input + skeleton
- `ConditionInput`: reuse `RpeSlider` (RPE 1–10) + notes `<textarea>` (optional) + `Button` "🏃 코칭 받기"; disable + spinner text while `isPending`.
- `CoachSkeleton`: `animate-pulse` blocks matching the recommendation layout.
- **Validate**: build clean; 44px min touch targets on submit + slider.

### Task 4: RecommendationCard + weekly/weather/reasoning
- Header: `runTypeLabel(run_type)` + `formatDistance(distance_km)` + pace line (`{min}~{max}/km`, hidden when `pace_range === null`).
- Three sections: 워밍업 / 메인 세션 / 쿨다운 (warmup/main_session/cooldown strings).
- 💬 motivation line.
- "왜 이 추천?" — collapsible `reasoning` (`useState` toggle; no library).
- Weather: `☀️ {temp_c}° 습도 {humidity}% {condition}` when present, else "날씨 정보 없음".
- Weekly context bar: `{completed_km}/{target_km}km {progress_pct}%` progress bar; when `target_km`/`progress_pct` null, show completed-only text (no bar).
- **Validate**: build clean; renders with all-null optional fields without crashing.

### Task 5: "이 루틴으로 뛰기" pre-fill wiring
- In `RecommendationCard`, CTA `useNavigate('/runs/new', { state: { prefill: { run_type, distance_km } } })`. Hide the CTA when `run_type === 'rest'`.
- `RunForm`: add optional `prefill?: { run_type: RunType; distance_km: number }`; when present (and no `defaultValues`), seed `defaultValues` with it (date = today, rpe default) instead of the blank defaults.
- `RunLogPage`: `const prefill = useLocation().state?.prefill`; pass to `RunForm`.
- **Validate**: build + lint clean; tapping CTA lands on `/runs/new` with run_type + distance pre-filled.

### Task 6: CoachPage assembly
- Replace stub: local state `const [result, setResult] = useState<RecommendResponse | null>(null)`; `ConditionInput` `onSubmit` → `mutate(body, { onSuccess: setResult })`; render `CoachSkeleton` while `isPending`, `RecommendationCard` when `result`.
- Surface `error.message` (backend `{error:{code,message}}`, same shape F1 handles) on failure.
- **Validate**: full manual flow (below).

---

## Validation

```bash
npm run lint          # oxlint clean
npm run build         # tsc -b && vite build succeed
npm run dev           # with backend running on :8000
```

Backend must be up: in `com.runssistant.api` run `uvicorn app.main:app --reload` with DB migrated and an **LLM key configured** (the recommend node calls an LLM via `app/graph/nodes/llm_coach.py`). Without it, `/coach/recommend` will error — the UI must surface that error, not crash. `OWM_API_KEY` optional → `weather` comes back `null` (UI shows "날씨 정보 없음").

Manual acceptance (완료 기준):
1. `/coach` → set RPE, optional note → "코칭 받기" → skeleton shows while pending.
2. Recommendation renders: run type + distance + pace, warmup/main/cooldown, motivation, weather (or "날씨 정보 없음"), weekly progress bar.
3. "왜 이 추천?" expands/collapses the reasoning.
4. "이 루틴으로 뛰기" → `/runs/new` with run_type + distance pre-filled → save creates a run.
5. Backend/LLM error → visible error message, no white screen.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| LLM key missing → `/coach/recommend` errors | High (dev env) | Surface `error.message`; recommend is a mutation so failure is isolated to the page |
| Nullable fields (`pace_range`, `weather`, `target_km`, `progress_pct`) crash render | Med | Match backend nullability in `types/coach.ts`; guard every optional in JSX |
| `run_type: 'rest'` not a loggable `RunType` | Med | Hide "이 루틴으로 뛰기" for `rest`; add `rest` label for display only |
| Slow LLM response (multi-second) | Med | Skeleton + disabled submit; mutation `isPending` gates the UI |
| Pre-fill state lost on refresh (router state is ephemeral) | Low | Acceptable — `/runs/new` still works blank; pre-fill is a convenience path |
| Recommend commits a plan server-side → stale home | Low | `onSuccess` invalidates `['plans']` |

## Acceptance
- [ ] All 6 tasks complete
- [ ] `npm run lint` + `npm run build` pass
- [ ] End-to-end: condition → recommend → display → pre-filled run log works against live backend
- [ ] Types match backend `schemas/coach.py`, not the design doc (nullable weather/pace/context; `rest` in enum)
- [ ] KISS/YAGNI: recommend-only (no feedback/history), no new deps, reuse `RpeSlider`/`Button`/`Input`

## Out of scope (later sprints)
- `POST /coach/feedback` (rating 1–5) + `GET /coach/history` — not in the F3 checklist.
- Charts, PWA, offline queue, `SettingsPage`, error boundary/toast — Sprint F4.
