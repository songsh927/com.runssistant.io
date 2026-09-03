import { expect, test } from '@playwright/test'
import { AUTH_FILE } from './shared'

test.use({ storageState: AUTH_FILE })

test.describe('Home dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows coaching CTA', async ({ page }) => {
    await expect(page.getByText('오늘의 코칭')).toBeVisible()
    await expect(page.getByText('코칭 받기 →')).toBeVisible()
  })

  test('coaching CTA navigates to /coach', async ({ page }) => {
    await page.getByText('코칭 받기 →').click()
    await expect(page).toHaveURL('/coach')
  })

  test('shows bottom nav with 4 tabs', async ({ page }) => {
    const nav = page.locator('nav')
    await expect(nav.getByText('홈')).toBeVisible()
    await expect(nav.getByText('기록')).toBeVisible()
    await expect(nav.getByText('코치')).toBeVisible()
    await expect(nav.getByText('설정')).toBeVisible()
  })

  test('weekly progress area renders', async ({ page }) => {
    await page
      .locator('.animate-pulse')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => null)
    const hasRing = await page.locator('svg circle').count()
    const hasNoGoalMsg = await page.getByText('주간 목표가 없습니다').count()
    expect(hasRing + hasNoGoalMsg).toBeGreaterThan(0)
  })

  test('FAB navigates to /runs/new', async ({ page }) => {
    await page.locator('a[href="/runs/new"]').last().click()
    await expect(page).toHaveURL('/runs/new')
  })
})
