# Plan: Sprint F4 — 차트 + PWA + 마무리

**Source**: `.claude/plans/running-coach-frontend-design.md` §5, §8, §10, §11.3, §12 (Sprint F4), §13
**Backend contract**: verified against `/Users/songseunghyeon/Desktop/com.runssistant.api` (`app/api/stats.py`, `app/schemas/stats.py`, `app/api/auth.py`, `app/schemas/auth.py`) — real code, not the design doc
**Scope**: Sprint F4 only — the final sprint. Builds on F0–F3. Adds trend/PB charts, PWA installability, offline/error/toast UX, responsive pass, and fills the `SettingsPage` stub.
**Package manager**: npm
**Complexity**: Medium
**완료 기준 (design doc)**: 홈 화면에 추가 → PWA로 실행 → 전체 플로우 동작

---

## Context

F0–F3 delivered the app shell, auth, run logging, goals, the home dashboard, and the AI coach. F4 is the polish + platform sprint. Eight deliverables from the design doc checklist (lines 939–950):

1. `PaceTrend` — 12-week pace line chart
2. `VolumeTrend` — 12-week volume bar chart
3. `PersonalBests` card
4. PWA setup (manifest, service worker, icons)
5. `OfflineBanner` — offline status indicator
6. Responsive pass (375px–768px)
7. Error boundary + toast
8. `SettingsPage` (profile, location)

The `uiStore` (`stores/uiStore.ts`) **already** has all the state these features need (`isOnline`, `pendingSyncCount`, `toast`, `setOnline`, `showToast`, `clearToast`). F4 builds the missing UI + wiring, not new state.

---

## Backend reality vs. design doc — MUST follow backend

Verified from `app/api/stats.py`, `app/schemas/stats.py`, `app/api/auth.py`, `app/schemas/auth.py`. Where the design doc disagrees, **the backend wins**.

| Topic | Design doc | Backend actually | Action |
|---|---|---|---|
| Trend endpoint | `statsApi.getTrend(weeks)` returning volume + pace series | `GET /stats/trend?weeks=12` (`ge=1, le=52`) → `list[TrendPoint]` | One endpoint feeds **both** PaceTrend and VolumeTrend |
| `TrendPoint` shape | not specified in doc | `{ week_start: date, total_km: float, session_count: int, avg_pace_sec: int\|null, avg_pace_display: str\|null }` | `total_km` = volume series; `avg_pace_sec` = pace series (**nullable** → skip/gap weeks with no runs) |
| Personal bests | `PersonalBests` card, shape unspecified | `GET /stats/personal-bests` → `list[PersonalBest]` = `{ distance_bucket: str, best_pace_sec: int, best_pace_display: str, achieved_on: date }` | Render bucket + pace + date. May be empty array (new user) |
| Weekly stats `progress_pct` | `progress_pct: number` | `progress_pct: int \| null` (already reflected in `types/stats.ts`) | no change |
| **Settings — profile edit** | "프로필, 위치 설정" (implies editable) | **No `PATCH`/`PUT` on user/profile.** Only `GET /auth/me` → `UserResponse { id, email, name, location\|null, created_at }` | **SettingsPage is read-only**: show profile (from `authStore.user`) + logout. Location **cannot be saved** — see Key decisions |

**Endpoints used (F4):** `GET /stats/trend?weeks=12`, `GET /stats/personal-bests`. Both require `Authorization: Bearer <token>` (handled globally by `api/client.ts`). No new backend calls for Settings (reuse existing `authStore.user` + `useLogout`).

---

## Key decisions

- **Charts library: Recharts** (design doc §2). Add `recharts`. `PaceTrend` = `LineChart`, `VolumeTrend` = `BarChart`, both `ResponsiveContainer`-wrapped for mobile width. Style with the CSS design tokens (`--color-accent`, run-type colors) via inline props — Recharts doesn't read Tailwind classes.
- **Pace axis is inverted intuition**: lower `avg_pace_sec` = faster = "better". Render the Y axis so faster paces read as improvement (reversed domain or clear labeling). Format ticks with `formatPace` from `utils/format.ts`.
- **Nullable pace weeks**: `avg_pace_sec` is null for weeks with no runs. Pass `null` (not `0`) to Recharts so the line shows a gap instead of diving to zero. Volume weeks always have `total_km` (0 if no runs).
- **Chart placement**: add the three components to `HomePage` (dashboard) below the existing F2 sections. The design doc §5.1 dashboard already anticipates trend/PB content. No new route.
- **New stats hooks mirror F3/F2 pattern**: extend `api/stats.ts` with `getTrend`/`getPersonalBests`, `hooks/useStats.ts` with `useVolumeTrend(weeks=12)` (staleTime 10m per §6.3) and `usePersonalBests()`. Extend `types/stats.ts` with `TrendPoint` + `PersonalBest`.
- **SettingsPage is read-only (backend constraint)**: display name / email / location / member-since from `authStore.user`, plus a logout button (reuse `useLogout` from `hooks/useAuth.ts`). **Do not build a location editor** — there is no write endpoint, and per repo `CLAUDE.md` (YAGNI, "No Speculative Code") we don't invent one. Note this gap in the plan output for the user to decide if a backend endpoint is wanted later.
- **OfflineBanner = read-only indicator, Level 1 only**: a small banner rendered in `AppShell` that shows when `uiStore.isOnline` is false. Wire `window` `online`/`offline` events to `uiStore.setOnline` via a tiny `useOnlineStatus` effect (or inline in `AppShell`). **The IndexedDB offline write queue (`useOfflineSync` + `offlineQueue.ts`, design doc §8.3 Level 2) is OUT of F4 scope** — the doc marks it "후순위" and the F4 checklist lists only `OfflineBanner`. `pendingSyncCount` stays wired but unused until a future Level-2 sprint.
- **Toast**: build a `Toast` component driven by `uiStore.toast` + `clearToast` (auto-dismiss on a timer), mounted once in `AppShell`. State already exists; only the view is missing.
- **Error boundary**: a class-based `ErrorBoundary` (React error boundaries must be class components) wrapping the routed content, showing a fallback + reload action. Mount in `App.tsx` (or around `AppShell`).
- **PWA**: add `vite-plugin-pwa` with `registerType: 'autoUpdate'` and the manifest from design doc §8.2 (dark theme `#0F172A`, standalone, `start_url: '/'`). Provide `public/icons/icon-192.png` + `icon-512.png`. `NetworkFirst` runtime caching for API GETs (24h). Verify SW registration doesn't fight the dev proxy (`vite.config.ts` proxies `/auth /runs /stats /goals /plans /coach`) — PWA plugin is dev-safe with `devOptions` disabled by default.
- **Responsive pass**: manual check at 375px and 768px across all pages; fix overflow/touch-target regressions only (min 44px per project `CLAUDE.md`). No redesign.
- **No new state store.** Reuse `uiStore` and `authStore` as-is.

---

## New dependencies

| Package | Why |
|---|---|
| `recharts` | PaceTrend + VolumeTrend charts (design doc §2, §11.3) |
| `vite-plugin-pwa` (dev) | manifest + service worker generation (design doc §8.2) |

**Deferred (not installed in F4):** `idb` — only needed for the Level-2 offline write queue, which is out of scope.

---

## Files to change

**Types (UPDATE)**
| File | Action | Why |
|---|---|---|
| `src/types/stats.ts` | UPDATE | add `TrendPoint`, `PersonalBest` matching backend schemas |

**API layer (UPDATE)**
| File | Action | Why |
|---|---|---|
| `src/api/stats.ts` | UPDATE | add `getTrend(weeks)` → `GET /stats/trend`, `getPersonalBests()` → `GET /stats/personal-bests` |

**Hooks (UPDATE)**
| File | Action | Why |
|---|---|---|
| `src/hooks/useStats.ts` | UPDATE | add `useVolumeTrend(weeks=12)` (staleTime 10m), `usePersonalBests()` |

**Components (CREATE)**
| File | Action | Why |
|---|---|---|
| `src/components/dashboard/PaceTrend.tsx` | CREATE | 12-week pace line chart |
| `src/components/dashboard/VolumeTrend.tsx` | CREATE | 12-week volume bar chart |
| `src/components/dashboard/PersonalBests.tsx` | CREATE | personal bests card list |
| `src/components/common/Toast.tsx` | CREATE | toast view bound to `uiStore` |
| `src/components/common/OfflineBanner.tsx` | CREATE | offline indicator bound to `uiStore.isOnline` |
| `src/components/common/ErrorBoundary.tsx` | CREATE | class-based error boundary + fallback |

**Pages / layout (UPDATE)**
| File | Action | Why |
|---|---|---|
| `src/pages/HomePage.tsx` | UPDATE | mount PaceTrend, VolumeTrend, PersonalBests |
| `src/pages/SettingsPage.tsx` | UPDATE | replace stub with read-only profile + logout |
| `src/components/layout/AppShell.tsx` | UPDATE | mount Toast + OfflineBanner; wire online/offline events to `uiStore.setOnline` |
| `src/App.tsx` | UPDATE | wrap routes in `ErrorBoundary` |

**Config / assets (UPDATE / CREATE)**
| File | Action | Why |
|---|---|---|
| `vite.config.ts` | UPDATE | add `VitePWA(...)` plugin (manifest + workbox runtimeCaching) |
| `public/icons/icon-192.png` | CREATE | PWA icon 192×192 |
| `public/icons/icon-512.png` | CREATE | PWA icon 512×512 |
| `package.json` | UPDATE | `recharts`, `vite-plugin-pwa` (via `npm install`) |

---

## Tasks

### Task 1: Stats types + API + hooks for trend and PBs
- **Action**: add `TrendPoint` and `PersonalBest` to `types/stats.ts` (exact backend field names/nullability); add `getTrend`/`getPersonalBests` to `api/stats.ts`; add `useVolumeTrend`/`usePersonalBests` to `hooks/useStats.ts`.
- **Mirror**: existing `getWeekly` / `useWeeklyStats` in the same files; query-key + staleTime conventions from design doc §6.3.
- **Validate**: `npm run build` (type-checks the new shapes).

### Task 2: PaceTrend + VolumeTrend charts
- **Action**: build both dashboard components with Recharts `ResponsiveContainer`; feed from `useVolumeTrend`; handle empty data + null pace weeks (gaps); format axes with `formatPace`/`formatDistance`; color with design tokens.
- **Mirror**: F2 dashboard components (`WeeklyProgress`, `WeeklyCalendar`) for card framing, loading skeleton, and empty-state patterns.
- **Validate**: `npm run dev` → dashboard renders both charts with real backend data; no console errors at 375px.

### Task 3: PersonalBests card
- **Action**: list `distance_bucket`, `best_pace_display`, `achieved_on`; empty-state ("아직 기록 없음") when the array is empty.
- **Mirror**: `RunCard` / F2 dashboard card styling; `EmptyState` pattern from design doc §3.
- **Validate**: renders for a user with and without runs.

### Task 4: Toast + OfflineBanner + online/offline wiring
- **Action**: `Toast` reads `uiStore.toast`, auto-dismisses, calls `clearToast`; `OfflineBanner` shows when `!isOnline`; mount both in `AppShell`; add `window` online/offline listeners → `setOnline`.
- **Mirror**: existing `uiStore` API; `Button`/`Card` styling from `components/common`.
- **Validate**: toggle DevTools "Offline" → banner appears/disappears; trigger a `showToast` (e.g. from an existing mutation success) → toast shows and clears.

### Task 5: ErrorBoundary
- **Action**: class component with `getDerivedStateFromError`/`componentDidCatch`; dark-theme fallback with a reload button; wrap routed content in `App.tsx`.
- **Mirror**: design tokens in `styles/index.css` for the fallback.
- **Validate**: temporarily throw in a page → fallback renders instead of a white screen; remove the test throw.

### Task 6: SettingsPage (read-only)
- **Action**: render `authStore.user` (name, email, location, created_at) + logout button via `useLogout`. Show "위치 미설정" when `location` is null. **No editable form** (no backend write endpoint).
- **Mirror**: `LoginPage`/`SignupPage` layout + `Button`; `authStore`/`useAuth` usage.
- **Validate**: `/settings` shows the logged-in user's info; logout returns to `/login`.

### Task 7: PWA (manifest + SW + icons)
- **Action**: add `VitePWA` to `vite.config.ts` (manifest per §8.2, `NetworkFirst` API caching, 24h); add 192/512 icons under `public/icons/`.
- **Mirror**: design doc §8.2 config block verbatim (adjust `urlPattern` to the real proxied paths, not `/api/*`).
- **Validate**: `npm run build && npm run preview` → Chrome DevTools ▸ Application ▸ Manifest is valid and "installable"; SW registers; icons load.

### Task 8: Responsive pass
- **Action**: walk every page at 375px and 768px; fix overflow and sub-44px touch targets only.
- **Mirror**: existing Tailwind breakpoints; project `CLAUDE.md` touch-target rule.
- **Validate**: no horizontal scroll at 375px on any route; interactive elements ≥ 44px.

---

## Validation

```bash
npm run lint          # oxlint clean
npm run build         # tsc + vite build passes (types + PWA generation)
npm run preview       # manual: installable PWA, charts render, offline banner, toast, settings, error boundary
```

Manual smoke (design doc 완료 기준): build → `npm run preview` → add to home screen → launch as standalone PWA → run the full flow (login → log run → dashboard charts update → coach → settings → logout).

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| No backend profile-write endpoint → Settings can't save location | High (confirmed) | Ship read-only Settings; flag to user that a `PATCH /auth/me` is needed for editable profile (out of F4 scope) |
| Recharts bundle size on a mobile PWA | Medium | Import only used chart pieces; rely on tree-shaking; check final bundle in `npm run build` output |
| PWA SW interfering with the dev proxy / stale caches | Medium | Keep PWA `devOptions` disabled; test caching only in `preview`; `registerType: autoUpdate` |
| Null `avg_pace_sec` weeks break the line chart | Medium | Pass `null` (gap), never coerce to `0`; verify with a new/low-activity account |
| Missing/incorrect PWA icons block installability | Low | Provide correct 192 + 512 PNGs; verify in DevTools ▸ Manifest |
| Recharts + React 19 / Vite 8 peer-dep friction | Low | Confirm a compatible `recharts` version at install; if blocked, fall back to a lightweight SVG chart (consistent with `WeeklyProgress`) |

---

## Acceptance

- [ ] `/stats/trend` and `/stats/personal-bests` wired through types → api → hooks, matching backend schemas
- [ ] PaceTrend, VolumeTrend, PersonalBests render on the dashboard (incl. empty/null states)
- [ ] Toast + OfflineBanner functional, driven by existing `uiStore`
- [ ] ErrorBoundary catches render errors with a themed fallback
- [ ] SettingsPage shows profile + logout (read-only; location gap noted)
- [ ] PWA installable: valid manifest, SW registers, icons load (verified in `preview`)
- [ ] No horizontal scroll at 375px; touch targets ≥ 44px
- [ ] `npm run lint` and `npm run build` pass
- [ ] Out-of-scope confirmed deferred: IndexedDB offline write queue (`useOfflineSync`, `offlineQueue.ts`, `idb`), coach feedback/history
