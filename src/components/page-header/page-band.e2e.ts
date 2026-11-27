import { expect, test } from '../../../tests/story'

test.describe('PageBand', () => {
  test('the Details link opens the strip, and a figure filters', async ({ story, page }) => {
    await story.open('components-page-band--default')
    const link = page.getByRole('button', { name: /5 need a look/ })
    await expect(link).toHaveText(/Show details/)
    await expect(link).toHaveAttribute('aria-expanded', 'false')
    await link.click()
    await expect(link).toHaveAttribute('aria-expanded', 'true')
    await expect(link).toHaveText(/Hide details/)
    const strip = page.getByRole('group', { name: 'Tenants details' })
    await expect(strip).toBeVisible()
    await expect(strip.getByRole('button')).toHaveCount(3)
    await link.press('Enter')
    await expect(strip).toBeHidden()
  })

  test('the actions sit on the right of the title, on one row', async ({ story, page }) => {
    await story.open('components-page-band--default')
    const title = (await page.getByRole('heading', { level: 1 }).boundingBox())!
    const add = (await page.getByRole('button', { name: 'Add a tenant' }).boundingBox())!
    expect(add.x).toBeGreaterThan(title.x + title.width)
  })

  test('the first card lifts over the bottom of the band', async ({ story, page }) => {
    await story.open('components-page-band--default')
    const band = (await page.locator('header').first().boundingBox())!
    const card = (await page.getByRole('region', { name: 'All tenants' }).boundingBox())!
    expect(card.y).toBeLessThan(band.y + band.height)
    expect(card.y).toBeGreaterThan(band.y + band.height - 60)
  })

  test('both actions stay legible on the dark band', async ({ story, page }) => {
    await story.open('components-page-band--dark', { mode: 'dark' })
    const bg = await page
      .getByRole('button', { name: 'Add a tenant' })
      .evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bg).toBe('rgb(255, 255, 255)')
    const ink = await page
      .getByRole('button', { name: 'Import from CSV' })
      .evaluate((el) => getComputedStyle(el).color)
    expect(ink).toBe('rgb(255, 255, 255)')
  })

  test('on a narrow screen the actions wrap and the strip folds to two columns', async ({
    story,
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 900 })
    await story.open('components-page-band--details-open')
    const title = (await page.getByRole('heading', { level: 1 }).boundingBox())!
    const add = (await page.getByRole('button', { name: 'Add a tenant' }).boundingBox())!
    expect(add.y).toBeGreaterThan(title.y + title.height)
    const figures = page.getByRole('group', { name: 'Tenants details' }).locator(':scope > *')
    const first = (await figures.nth(0).boundingBox())!
    const third = (await figures.nth(2).boundingBox())!
    expect(third.y).toBeGreaterThan(first.y)
  })

  test('renders without errors', async ({ story }) => {
    for (const id of ['default', 'details-open', 'nothing-needs-anyone', 'title-only', 'dark']) {
      await story.open(`components-page-band--${id}`)
    }
    expect(story.errors).toEqual([])
  })
})
