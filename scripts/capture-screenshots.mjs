import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = 'docs/screenshots'
const TOKEN = 'demo-token'

const user = {
  id: 'u1',
  name: '김러너',
  email: 'runner@example.com',
  location: '서울',
  created_at: '2025-01-01T00:00:00Z',
  onboarding_completed: true,
}

const runs = [
  {
    id: 'r1',
    run_date: '2026-09-06',
    distance_km: 16.2,
    duration_sec: 5760,
    run_type: 'long_run',
    rpe: 6,
    notes: '한강 롱런. 후반 페이스 유지 성공.',
    avg_pace_sec: 356,
    avg_pace_display: "5'56\"",
    weather_snapshot: {
      temp_c: 21,
      feels_like_c: 20,
      humidity: 55,
      condition: '맑음',
      wind_speed_ms: 2.1,
    },
    created_at: '2026-09-06T09:00:00Z',
  },
  {
    id: 'r2',
    run_date: '2026-09-04',
    distance_km: 8.0,
    duration_sec: 2400,
    run_type: 'interval',
    rpe: 8,
    notes: '400m x 8 인터벌.',
    avg_pace_sec: 300,
    avg_pace_display: "5'00\"",
    weather_snapshot: null,
    created_at: '2026-09-04T18:30:00Z',
  },
  {
    id: 'r3',
    run_date: '2026-09-02',
    distance_km: 6.0,
    duration_sec: 2160,
    run_type: 'easy',
    rpe: 4,
    notes: null,
    avg_pace_sec: 360,
    avg_pace_display: "6'00\"",
    weather_snapshot: {
      temp_c: 24,
      feels_like_c: 25,
      humidity: 60,
      condition: '구름조금',
      wind_speed_ms: 1.5,
    },
    created_at: '2026-09-02T07:00:00Z',
  },
]

const weeklyStats = {
  week_start: '2026-09-01',
  total_km: 30.2,
  target_km: 40,
  progress_pct: 76,
  session_count: 3,
  avg_pace_sec: 338,
  avg_pace_display: "5'38\"",
  avg_rpe: 6,
  run_type_breakdown: { easy: 1, interval: 1, long_run: 1 },
}

const trend = Array.from({ length: 12 }).map((_, i) => {
  const km = [22, 25, 28, 24, 30, 32, 27, 35, 31, 29, 36, 30][i]
  const paceSec = 360 - i * 2
  return {
    week_start: `2026-0${i < 3 ? 7 : i < 8 ? 8 : 9}-0${(i % 4) + 1}`,
    total_km: km,
    session_count: 3 + (i % 2),
    avg_pace_sec: paceSec,
    avg_pace_display: `${Math.floor(paceSec / 60)}'${String(paceSec % 60).padStart(2, '0')}"`,
  }
})

const personalBests = [
  { distance_bucket: '5K', best_pace_sec: 288, best_pace_display: "4'48\"", achieved_on: '2026-08-15' },
  { distance_bucket: '10K', best_pace_sec: 312, best_pace_display: "5'12\"", achieved_on: '2026-07-28' },
  { distance_bucket: 'Half', best_pace_sec: 348, best_pace_display: "5'48\"", achieved_on: '2026-06-30' },
]

const plan = {
  id: 'p1',
  user_id: 'u1',
  goal_id: 'g1',
  week_start: '2026-09-01',
  planned_sessions: [
    { day: 'Mon', type: 'easy', distance_km: 6, pace_range: { min: "6'00\"", max: "6'30\"" }, status: 'completed', actual_distance_km: 6, run_id: 'r3', unplanned: false },
    { day: 'Tue', type: 'rest', distance_km: 0, pace_range: null, status: 'planned', actual_distance_km: null, run_id: null, unplanned: false },
    { day: 'Wed', type: 'interval', distance_km: 8, pace_range: null, status: 'completed', actual_distance_km: 8, run_id: 'r2', unplanned: false },
    { day: 'Thu', type: 'easy', distance_km: 6, pace_range: null, status: 'planned', actual_distance_km: null, run_id: null, unplanned: false },
    { day: 'Fri', type: 'rest', distance_km: 0, pace_range: null, status: 'planned', actual_distance_km: null, run_id: null, unplanned: false },
    { day: 'Sat', type: 'long_run', distance_km: 16, pace_range: null, status: 'completed', actual_distance_km: 16.2, run_id: 'r1', unplanned: false },
    { day: 'Sun', type: 'tempo', distance_km: 8, pace_range: null, status: 'planned', actual_distance_km: null, run_id: null, unplanned: false },
  ],
  total_planned_km: 44,
  completed_km: 30.2,
  remaining_km: 13.8,
  progress_pct: 76,
  adjustments_log: [],
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-06T00:00:00Z',
}

const activeGoal = {
  id: 'g1',
  user_id: 'u1',
  goal_type: 'race',
  weekly_km_target: null,
  race_name: '춘천마라톤 하프',
  race_date: '2026-10-26',
  race_target_time: 6300,
  race_distance_km: 21.1,
  status: 'active',
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-01T00:00:00Z',
}

const completedGoals = [
  {
    id: 'g0',
    user_id: 'u1',
    goal_type: 'weekly_volume',
    weekly_km_target: 30,
    race_name: null,
    race_date: null,
    race_target_time: null,
    race_distance_km: null,
    status: 'completed',
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-07-31T00:00:00Z',
  },
]

const coachResponse = {
  session_id: 's1',
  recommendation: {
    run_type: 'tempo',
    distance_km: 8,
    pace_range: { min: "5'10\"", max: "5'25\"" },
    warmup: '10분 조깅 + 동적 스트레칭',
    main_session: '5km 템포 구간을 5\'10"~5\'25" 페이스로 꾸준히 유지하세요.',
    cooldown: '10분 회복 조깅 후 정적 스트레칭',
    reasoning:
      '이번 주 볼륨(30.2km)이 목표의 76%에 도달했고 최근 롱런 회복도 양호합니다. 레이스 페이스 적응을 위해 템포런을 추천합니다.',
    motivation: '춘천 하프까지 D-49. 지금의 페이스 감각을 몸에 새길 시간이에요! 🔥',
  },
  weekly_context: {
    completed_km: 30.2,
    target_km: 40,
    progress_pct: 76,
    remaining_days: 1,
    sessions_done: 3,
    plan_adjustment: null,
  },
  weather: { temp_c: 22, humidity: 58, condition: '맑음' },
}

function json(route, body) {
  // Let top-level navigations (document requests to /runs, /goals, ...) fall through
  // to Vite's SPA fallback; only fulfill the app's XHR/fetch API calls.
  if (route.request().resourceType() === 'document') return route.continue()
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
}

// Anchor to the origin root so Vite module URLs (/src/api/runs.ts, etc.) are NOT intercepted.
const O = 'http://localhost:5173'
async function setupMocks(context) {
  await context.route(`${O}/auth/me`, (r) => json(r, user))
  await context.route(new RegExp(`^${O}/stats/weekly`), (r) => json(r, weeklyStats))
  await context.route(new RegExp(`^${O}/stats/trend`), (r) => json(r, trend))
  await context.route(new RegExp(`^${O}/stats/personal-bests`), (r) => json(r, personalBests))
  await context.route(new RegExp(`^${O}/plans/current`), (r) => json(r, plan))
  await context.route(new RegExp(`^${O}/goals/active`), (r) => json(r, activeGoal))
  await context.route(new RegExp(`^${O}/goals(\\?|$)`), (r) => {
    const u = new URL(r.request().url())
    if (u.searchParams.get('status') === 'completed') return json(r, completedGoals)
    return json(r, [activeGoal])
  })
  await context.route(new RegExp(`^${O}/coach/recommend`), (r) => json(r, coachResponse))
  await context.route(new RegExp(`^${O}/runs/[\\w-]+$`), (r) => json(r, runs[0]))
  await context.route(new RegExp(`^${O}/runs(\\?|$)`), (r) => json(r, runs))
}

async function seedAuth(page, onboarded = true) {
  await page.addInitScript(
    ([token, u]) => {
      localStorage.setItem('auth', JSON.stringify({ state: { token, user: u }, version: 0 }))
    },
    [TOKEN, { ...user, onboarding_completed: onboarded }],
  )
}

async function goto(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => {
    const r = document.getElementById('root')
    return r && r.innerHTML.length > 200
  })
}

async function shot(page, name, waitText) {
  if (waitText) {
    await page.getByText(waitText, { exact: false }).first().waitFor({ timeout: 8000 }).catch(() => {})
  }
  await page.waitForTimeout(700)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('captured', name)
}

const run = async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    locale: 'ko-KR',
  })
  await setupMocks(context)
  const page = await context.newPage()

  // 1. Login (no auth)
  await goto(page, '/login')
  await shot(page, '01-login', '런시스턴트')

  // 2. Onboarding
  await seedAuth(page, false)
  await goto(page, '/onboarding')
  await shot(page, '02-onboarding')

  // 3. Home dashboard
  await seedAuth(page, true)
  await goto(page, '/')
  await shot(page, '03-home', '오늘의 코칭')

  // 4. Coach — submit to render recommendation
  await goto(page, '/coach')
  const coachBtn = page.getByRole('button', { name: /코칭 받기/ })
  if (await coachBtn.count()) {
    await coachBtn.first().click()
  }
  await shot(page, '04-coach', '메인 세션')

  // 5. Runs list
  await goto(page, '/runs')
  await shot(page, '05-runs', '러닝 기록')

  // 6. Run detail
  await goto(page, '/runs/r1')
  await shot(page, '06-run-detail', '기록 상세')

  // 7. Run log form
  await goto(page, '/runs/new')
  await shot(page, '07-run-log', '러닝 기록')

  // 8. Goals
  await goto(page, '/goals')
  await shot(page, '08-goals', '목표')

  await browser.close()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
