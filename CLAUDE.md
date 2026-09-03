# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React 18 PWA frontend for an AI-powered running coach app. The backend API lives at `com.runssistant.api`. The full frontend design plan is at `.claude/plans/running-coach-frontend-design.md`.

## Commands

```bash
npm run dev        # Vite dev server (HMR)
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint
```

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 18 + TypeScript + Vite |
| Routing | React Router v7 (declarative, not file-based) |
| Client state | Zustand (`authStore`, `uiStore`) |
| Server state | TanStack Query (React Query) |
| Styling | Tailwind CSS 4 (dark theme only) |
| Forms | React Hook Form + Zod |
| HTTP | `ky` with auth interceptor |
| Charts | Recharts |
| PWA | vite-plugin-pwa (Workbox) |
| Offline DB | `idb` (IndexedDB wrapper) |

## Architecture

### Data flow

```
api/ (ky calls)  →  hooks/ (TanStack Query wrappers)  →  pages/  →  components/
```

- **`api/client.ts`**: Single `ky` instance. Sets `Authorization: Bearer <token>` on every request. On 401 → clears auth store and redirects to `/login`.
- **`hooks/`**: Each entity has its own hook file (`useRuns`, `useGoals`, `useStats`, `useCoach`, `usePlans`). These wrap TanStack Query's `useQuery`/`useMutation`. Coach recommendations are never cached (mutation only).
- **`stores/`**: Zustand handles two things only: JWT + user info (`authStore`, persisted to localStorage) and UI ephemeral state like toasts and online status (`uiStore`).

### Cache invalidation pattern

When a run is created/updated/deleted, invalidate `['runs']`, `['stats']`, and `['plans']` query keys. Coach recommendations do not use query cache.

### Offline support

- **Level 1 (default)**: App shell cached by service worker; API GET requests use `NetworkFirst` strategy with 24h expiry.
- **Level 2 (opt-in)**: Runs that fail to POST are queued to IndexedDB (`utils/offlineQueue.ts`). `useOfflineSync` hook flushes the queue when `window` fires the `online` event.

### Auth guard

Protected routes require a valid token in `authStore`. Unauthenticated users are redirected to `/login`. The `ky` after-response hook handles expired tokens globally.

### Routes

```
/login, /signup          → unauthenticated
/                        → HomePage (dashboard)
/runs/new                → RunLogPage
/runs                    → RunListPage
/runs/:id                → RunDetailPage
/goals                   → GoalPage
/coach                   → CoachPage (core feature)
/settings                → SettingsPage
```

## Key Conventions

- **`src/types/`**: TypeScript types mirror the API response shapes 1:1. Do not invent wrapper types.
- **`utils/format.ts`**: All pace/duration/distance formatting lives here (`formatPace`, `formatDuration`, `formatDistance`, `rpeEmoji`, `runTypeLabel`).
- **`utils/validation.ts`**: Zod schemas for forms. `runFormSchema` is the canonical run input validator.
- **Design tokens**: CSS variables in `styles/index.css`. Use `--color-accent` (`sky-400`) for CTAs and the coach tab. Run types each have their own color (`--color-easy`, `--color-tempo`, etc.).
- **Touch targets**: Minimum 44px for all interactive elements — this app is used outdoors with one hand.
- **`RecommendationCard`**: The "이 루틴으로 뛰기" button passes coach recommendation data to `RunLogPage` via React Router state (`useLocation`) to pre-fill the run form.
