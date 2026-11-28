import { expect, test } from '../../../tests/story'

test.describe('App shell — the Finals 2.0 frame', () => {
  test('Home opens with its panel listing every area, Overview marked', async ({ story, page }) => {
    await story.open('recipes-app-shell--home')
    const panel = page.getByRole('complementary', { name: 'Home' })
    await expect(panel).toBeVisible()
    for (const name of ['Use', 'Build', 'Automate', 'Measure', 'Govern']) {
      await expect(panel.getByText(name, { exact: true })).toBeVisible()
    }
    await expect(panel.getByRole('link', { name: /^Overview/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('Ingestion is a page of Home: its row is marked and Home stays the app', async ({
    story,
    page,
  }) => {
    await story.open('recipes-app-shell--home')
    const panel = page.getByRole('complementary', { name: 'Home' })
    await panel.getByRole('link', { name: /^Ingestion/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Ingestion' })).toBeVisible()
    await expect(panel.getByRole('link', { name: /^Ingestion/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(panel.getByRole('link', { name: /^Overview/ })).not.toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('Chat stays an app of its own, with its own panel', async ({ story, page }) => {
    await story.open('recipes-app-shell--home')
    await page
      .getByRole('complementary', { name: 'Home' })
      .getByRole('link', { name: /^Chat Ask/ })
      .click()
    await expect(page.getByRole('complementary', { name: 'Chat' })).toBeVisible()
    await expect(page.getByRole('complementary', { name: 'Home' })).toHaveCount(0)
  })

  test('Tenants marks Tenant Admin > Tenants in the Home panel', async ({ story, page }) => {
    await story.open('recipes-app-shell--tenants')
    const panel = page.getByRole('complementary', { name: 'Home' })
    await expect(panel.getByRole('link', { name: /^Tenants/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('the tenant switcher sits beside the logo and there are no pinned tabs', async ({
    story,
    page,
  }) => {
    await story.open('recipes-app-shell--home')
    const bar = page.getByRole('banner').first()
    const logo = (await bar.getByRole('link', { name: /go to Home/ }).boundingBox())!
    const switcher = (await bar.getByRole('button', { name: /Alderfinch Treasury/ }).boundingBox())!
    expect(switcher.x).toBeGreaterThan(logo.x + logo.width)
    expect(switcher.x).toBeLessThan(logo.x + logo.width + 60)
    await expect(bar.getByRole('navigation', { name: /pinned/i })).toHaveCount(0)
  })
})
