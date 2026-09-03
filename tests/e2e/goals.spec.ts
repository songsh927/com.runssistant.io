import { expect, test } from '@playwright/test'
import { AUTH_FILE } from './shared'

test.use({ storageState: AUTH_FILE })

test.describe('Goals', () => {
  test.describe.configure({ mode: 'serial' })

  test('goals page loads', async ({ page }) => {
    await page.goto('/goals')
    await expect(page.getByRole('heading', { name: '목표' })).toBeVisible()
  })

  test('create weekly volume goal', async ({ page }) => {
    await page.goto('/goals')
    // Wait for TanStack Query to settle — networkidle means API responses are done
    await page.waitForLoadState('networkidle')

    const newGoalBtn = page.getByRole('button', { name: '새 목표 만들기' })
    const abandonBtn = page.getByRole('button', { name: '포기' })

    // Re-wait in case idle resolved before the goal query finished
    await newGoalBtn.or(abandonBtn).waitFor({ timeout: 10000 })

    // If a previous test left an active goal, abandon it first
    if (await abandonBtn.isVisible()) {
      page.on('dialog', (d) => d.accept())
      await abandonBtn.click()
      // Reload to clear query cache and get fresh state
      await page.reload()
      await newGoalBtn.or(abandonBtn).waitFor({ timeout: 10000 })
    }

    await newGoalBtn.click()
    await page.getByRole('button', { name: '주간 볼륨' }).click()
    await page.locator('[name="weekly_km_target"]').fill('20')
    await page.getByRole('button', { name: '저장' }).click()

    await expect(page.getByText('20.00km').first()).toBeVisible()
  })

  test('home dashboard shows ring after goal created', async ({ page }) => {
    await page.goto('/')
    await page
      .locator('.animate-pulse')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => null)
    const circles = await page.locator('svg circle').count()
    expect(circles).toBeGreaterThan(0)
  })

  test('abandon active goal → removes from active section', async ({ page }) => {
    await page.goto('/goals')
    await page.waitForLoadState('networkidle')

    page.on('dialog', (d) => d.accept())

    // Wait for the PATCH request to complete before checking UI
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/goals/') && r.url().includes('/status'), {
        timeout: 15000,
      }),
      page.getByRole('button', { name: '포기' }).click(),
    ])

    // Reload to ensure TanStack Query cache is reset and fresh data is fetched
    await page.reload()
    await page.waitForLoadState('networkidle')

    // After abandoning, the active goal card is gone and the create button appears
    await expect(page.getByRole('button', { name: '새 목표 만들기' })).toBeVisible({
      timeout: 10000,
    })
  })
})
