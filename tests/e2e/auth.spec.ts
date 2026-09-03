import { expect, test } from '@playwright/test'
import { TEST_EMAIL, TEST_NAME, TEST_PASSWORD } from './shared'

test.describe('Auth', () => {
  test('signup → redirects to home dashboard', async ({ page }) => {
    const uniqueEmail = `e2e.signup.${Date.now()}@runssistant.io`
    await page.goto('/signup')

    await page.locator('[name="name"]').fill(TEST_NAME)
    await page.locator('[name="email"]').fill(uniqueEmail)
    await page.locator('[name="password"]').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: '회원가입' }).click()

    await page.waitForURL('/')
    await expect(page.getByText('AI 코치에게 오늘의 러닝을 추천 받으세요')).toBeVisible()
  })

  test('login with valid credentials → home', async ({ page }) => {
    await page.goto('/login')
    await page.locator('[name="email"]').fill(TEST_EMAIL)
    await page.locator('[name="password"]').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: '로그인' }).click()

    await page.waitForURL('/')
    await expect(page.locator('nav')).toBeVisible()
  })

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('[name="email"]').fill(TEST_EMAIL)
    await page.locator('[name="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: '로그인' }).click()

    await expect(page.getByText('로그인에 실패했습니다')).toBeVisible()
  })

  test('unauthenticated access to / redirects to login', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL('/login')
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible()
  })
})
