# 검증/갭 분석: 온보딩 플로우 & 러너 프로필 (plan-phase2)

**대상 계획**: `.claude/plans/plan-phase2.md`
**검증일**: 2026-09-07
**커밋 상태**: `b8035a8 변경사항 적용` (워킹트리 clean)
**빌드 상태**: `tsc --noEmit` clean · `oxlint` clean

> plan-phase2.md의 모든 핵심 항목은 이미 구현·커밋됨. 이 문서는 계획 대비 **실제 구현의 일치 여부와 미비점**만 기록한다. 코드는 수정하지 않았다.

---

## 1. 요약

| 구분 | 결과 |
|---|---|
| 핵심 기능 (타입/API/훅/라우팅/가드/온보딩 위자드/프로필 수정) | ✅ 계획대로 구현 |
| 계획과의 의도적 편차 | 3건 (기능 동일, 위치/표현만 다름) |
| 실질 미비점 (Gap) | 3건 — **테스트 부재**, 접근성 일부, 애니메이션 |
| CRITICAL/보안 이슈 | 없음 |

---

## 2. 계획 항목별 검증

| 계획 항목 | 파일 | 상태 | 비고 |
|---|---|---|---|
| §4 타입 정의 | `src/types/profile.ts` | ✅ | 계획과 1:1. `history`는 `string \| null`로 확장 |
| §5 API 레이어 | `src/api/profile.ts` | ✅ | `POST/GET/PATCH users/profile` — `docs/api.md`와 일치 |
| §6 훅 | `src/hooks/useProfile.ts` | ✅ | `staleTime 30m`, `retry:false`, `setQueryData` + `updateUser` |
| §7 authStore | `src/stores/authStore.ts` | ✅ | `onboarding_completed`, `updateUser` |
| §8 403 핸들링 | `src/api/client.ts` | ✅ | `body.error.code` **및** `body.code` 양쪽 대응 (계획보다 견고) |
| §2 라우팅 + 가드 | `src/App.tsx` | ✅ | `RequireOnboarding` Outlet 가드, `/onboarding`·`/settings/profile` |
| §9.1 OnboardingWizard | `OnboardingWizard.tsx` | ✅ | 5스텝, sessionStorage 저장/복원/클리어, 제출 시 `/`로 replace |
| §9.2–9.6 스텝 컴포넌트 | `Step*.tsx`, `ProfileSummary.tsx` | ✅ | 5개 스텝 + 요약 모두 존재 |
| §10 재사용 컴포넌트 | `ChipSelect / DayPicker / InjuryPartCard / StepProgress` | ✅ | 44px 터치타깃 준수 (InjuryPartCard만 36px) |
| §11 Zod 검증 | `src/utils/validation.ts` | ✅ | `validateStep` step별 분기 구현 |
| §12 프로필 수정 | `ProfileEditPage.tsx`, `SettingsPage.tsx` | ✅ | 섹션별 인라인 편집 + 설정 요약 카드 |
| §13.4 온보딩 재진입 | `OnboardingWizard.tsx` | ✅ | `sessionStorage` 복원 |

---

## 3. 계획과의 의도적 편차 (기능 동일 — 조치 불필요)

1. **코치 fallback 위치** — 계획 §3은 `components/coach/CoachChat.tsx`에 두라 했으나, 실제로는 `src/pages/CoachPage.tsx`(13행)에서 `onboarding_completed` 확인 후 `/onboarding` 안내. 동작 동일.
2. **StepCrossTraining UI** — 계획 §9.4는 설명문 포함 세로 체크리스트, 실제는 `ChipSelect` 그리드. 선택 기능 동일, 시각 표현만 다름.
3. **ProfileEditPage 편집 방식** — 계획 §12는 "탭/아코디언", 실제는 섹션별 "수정→인라인 편집→저장". 온보딩 컴포넌트 재사용이라는 의도 충족.

---

## 4. 실질 미비점 (Gap)

### GAP-1. 테스트 전무 — HIGH
- `tests/e2e/`에 auth·coach·goals·home·runs 스펙은 있으나 **온보딩/프로필 관련 테스트가 없음**.
- 단위 테스트(`validateStep`, `ChipSelect` 단일/복수 토글)도 없음.
- 프로젝트 규칙(testing.md: 80% 커버리지 + 핵심 플로우 E2E) 미충족.
- 권장: `validateStep` 단위 테스트 + "가입→온보딩 4스텝→제출→홈" E2E 1건.

### GAP-2. 접근성 부분 미구현 — MEDIUM
- `ChipSelect`: `role`/`aria-checked`는 있으나 계획 §13.3의 **방향키 이동(radiogroup/키보드 네비)** 미구현. (Space/Enter는 `<button>` 기본 동작으로 커버됨)
- `InjuryPartCard`: 상태 버튼에 `role`/`aria-checked`/그룹 라벨 **없음** (일반 button). 스크린리더가 선택 상태를 안내하지 못함.
- 슬라이더(`StepExperience`)의 `aria-*`는 ✅ 구현됨.
- 권장: `InjuryPartCard`에 `role="radio"` + `aria-checked`, 각 부위 컨테이너에 `role="radiogroup"` + `aria-label`.

### GAP-3. 애니메이션 미구현 — LOW
- 계획 §13.2: 스텝 좌우 슬라이드, 칩 `scale(0.95)→1`, 프로그레스 width transition.
- 실제: `framer-motion` 미설치. `StepProgress`는 `transition-all`(색 채움)만, 버튼은 `transition-colors/opacity`. **스텝 전환 슬라이드·칩 스케일 없음.**
- 기능/접근성엔 영향 없음. UX 향상 항목.

---

## 5. 사소한 관찰 (NOTE)

- **검증 스키마 편차**: 계획 §11은 `runs_per_week min(0)`, 구현은 `min(1)` (슬라이더 기본 3, 범위 1~7). 0회/주는 비현실적이라 합리적 편차이나 계획 문서와 불일치.
- **409 `PROFILE_ALREADY_EXISTS`**: `useCreateProfile`에서 개별 처리 없이 위자드의 일반 에러 메시지로 노출됨. 이미 온보딩한 사용자는 `RequireOnboarding`이 진입을 막으므로 실사용 위험은 낮음.
- **InjuryPartCard 터치타깃**: `min-h-[36px]`로 프로젝트 규칙(최소 44px)보다 작음.

---

## 6. 권장 후속 작업 (우선순위순)

| 순위 | 작업 | 근거 |
|---|---|---|
| 1 | `validateStep` 단위 테스트 + 온보딩 E2E 1건 | GAP-1, testing 규칙 |
| 2 | `InjuryPartCard` a11y (`radiogroup`/`aria-checked`) + 44px | GAP-2, 규칙 |
| 3 | `ChipSelect` 방향키 네비게이션 | GAP-2, 계획 §13.3 |
| 4 | 스텝 전환/칩 스케일 애니메이션 | GAP-3, 계획 §13.2 |
| 5 | 계획 문서상 `runs_per_week` 범위를 구현(1~7)에 맞춰 정정 | NOTE |

> 위 작업은 이번 검증 범위 밖(코드 미수정)이며, 실행 여부는 별도 지시 대기.
