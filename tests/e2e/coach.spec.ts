import { expect, test } from '@playwright/test'
import { AUTH_FILE } from './shared'

test.use({ storageState: AUTH_FILE })

test.describe('Coach page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coach')
  })

  test('loads condition input form', async ({ page }) => {
    await expect(page.getByText('오늘 어떠세요?')).toBeVisible()
    await expect(page.getByText('운동 강도 (RPE)')).toBeVisible()
    await expect(page.getByRole('button', { name: /코칭 받기/ })).toBeVisible()
  })

  test('RPE slider is interactive', async ({ page }) => {
    const slider = page.locator('input[type="range"]')
    await expect(slider).toBeVisible()
    await slider.fill('7')
    await expect(page.getByText(/7\/10/)).toBeVisible()
  })

  test('notes textarea accepts input', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.fill('다리가 좀 피곤해요')
    await expect(textarea).toHaveValue('다리가 좀 피곤해요')
  })

  test('submit shows skeleton then result or error', async ({ page }) => {
    await page.locator('input[type="range"]').fill('5')
    await page.getByRole('button', { name: /코칭 받기/ }).click()

    await expect(page.getByRole('button', { name: /추천 받는 중/ })).toBeVisible()

    // Wait for request to complete (button returns to clickable state)
    await expect(page.getByRole('button', { name: /코칭 받기/ })).toBeVisible({ timeout: 60000 })

    const hasResult = (await page.getByText('워밍업').count()) > 0
    const hasError = (await page.getByText(/timed out|추천을 받지|실패|Request/).count()) > 0
    expect(hasResult || hasError).toBe(true)
  })

  test('recommendation: "이 루틴으로 뛰기" navigates to /runs/new', async ({ page }) => {
    await page.locator('input[type="range"]').fill('5')
    await page.getByRole('button', { name: /코칭 받기/ }).click()

    // Wait for request to complete (button returns to clickable state)
    await expect(page.getByRole('button', { name: /코칭 받기/ })).toBeVisible({ timeout: 60000 })

    const hasResult = (await page.getByText('워밍업').count()) > 0
    if (!hasResult) {
      test.skip(true, 'LLM not configured — skipping pre-fill test')
      return
    }

    const ctaButton = page.getByRole('button', { name: '이 루틴으로 뛰기' })
    if ((await ctaButton.count()) === 0) {
      test.skip(true, 'Coach returned rest day — no CTA shown')
      return
    }

    await ctaButton.click()
    await expect(page).toHaveURL('/runs/new')
    await expect(page.getByText('러닝 기록')).toBeVisible()
  })
})
