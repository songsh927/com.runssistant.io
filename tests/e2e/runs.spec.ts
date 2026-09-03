import { expect, test } from '@playwright/test'
import { AUTH_FILE } from './shared'

test.use({ storageState: AUTH_FILE })

test.describe('Run CRUD', () => {
  test.describe.configure({ mode: 'serial' })

  let runUrl = ''

  test('create a run → redirects to detail', async ({ page }) => {
    await page.goto('/runs/new')
    await expect(page.getByText('러닝 기록')).toBeVisible()

    await page.locator('[name="run_date"]').fill('2026-09-03')
    await page.getByRole('button', { name: '이지런' }).click()
    await page.locator('[name="distance_km"]').fill('5')
    await page.locator('[name="duration_input"]').fill('30:00')
    await page.getByRole('button', { name: '저장' }).click()

    await page.waitForURL(
      (url) => url.pathname.startsWith('/runs/') && url.pathname !== '/runs/new',
    )
    runUrl = page.url()
    await expect(page.getByText('이지런')).toBeVisible()
  })

  test('run list shows the created run', async ({ page }) => {
    await page.goto('/runs')
    await expect(page.getByText('이지런').first()).toBeVisible()
    await expect(page.getByText('5.00km').first()).toBeVisible()
  })

  test('run detail shows pace computed by server', async ({ page }) => {
    await page.goto(runUrl)
    await expect(page.getByText('이지런')).toBeVisible()
    await expect(page.getByText('5.00km')).toBeVisible()
    await expect(page.getByText(/6:00\/km/)).toBeVisible()
  })

  test('edit run → updates distance', async ({ page }) => {
    await page.goto(runUrl)
    await page.getByRole('button', { name: '수정' }).click()
    await page.locator('[name="distance_km"]').fill('6')
    await page.getByRole('button', { name: '저장' }).click()
    await expect(page.getByText('6.00km')).toBeVisible()
  })

  test('delete run → returns to list', async ({ page }) => {
    await page.goto(runUrl)
    page.on('dialog', (d) => d.accept())
    await page.getByRole('button', { name: '삭제' }).click()
    await page.waitForURL('/runs')
  })
})
