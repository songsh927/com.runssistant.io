import { test } from '@playwright/test'
import { AUTH_FILE, TEST_EMAIL, TEST_NAME, TEST_PASSWORD } from './shared'

test('create and authenticate test user', async ({ page }) => {
  await page.goto('/signup')

  await page.locator('[name="name"]').fill(TEST_NAME)
  await page.locator('[name="email"]').fill(TEST_EMAIL)
  await page.locator('[name="password"]').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: '회원가입' }).click()

  // If account already exists, fall back to login
  try {
    await page.waitForURL('/', { timeout: 6000 })
  } catch {
    await page.goto('/login')
    await page.locator('[name="email"]').fill(TEST_EMAIL)
    await page.locator('[name="password"]').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: '로그인' }).click()
    await page.waitForURL('/')
  }

  await page.context().storageState({ path: AUTH_FILE })
})
