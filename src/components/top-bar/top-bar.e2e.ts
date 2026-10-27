import { expect, test } from '../../../tests/story'

test.describe('TopBar', () => {
  test('it is the page banner, and the logo is a link home', async ({ story, page }) => {
    await story.open('components-top-bar--default')
    const bar = page.getByRole('banner')
    await expect(bar.getByRole('link', { name: 'Acme, go to Home' })).toHaveAttribute(
      'href',
      '#home',
    )
  })

  test('the three slots sit left, middle and right', async ({ story, page }) => {
    await story.open('components-top-bar--with-tabs')
    const x = async (name: string | RegExp, role: 'button' | 'link' | 'navigation' = 'button') =>
      (await page.getByRole(role, { name }).boundingBox())!.x
    const toggle = await x('Toggle menu')
    const logo = await x(/go to Home/, 'link')
    const tabs = await x('Pinned pages', 'navigation')
    const search = await x('Search')
    expect(toggle).toBeLessThan(logo)
    expect(logo).toBeLessThan(tabs)
    expect(tabs).toBeLessThan(search)
    expect(search).toBeGreaterThan(1280 - 140)
  })

  test('every control in the bar is a 44 pixel target', async ({ story, page }) => {
    await story.open('components-top-bar--default')
    for (const name of ['Toggle menu', 'Search', 'Notifications']) {
      const box = (await page.getByRole('button', { name }).boundingBox())!
      expect([box.width, box.height]).toEqual([44, 44])
    }
  })

  test('a focused flow swaps the slots without the bar changing', async ({ story, page }) => {
    await story.open('components-top-bar--focused-flow')
    const bar = page.getByRole('banner')
    await expect(bar.getByRole('button', { name: 'Close and discard this source' })).toBeVisible()
    await expect(bar).toContainText('Add a source')
    // The title is a trail, so it is a landmark and its last step is the current page.
    await expect(bar.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Ingestion')
    await expect(bar.locator('[aria-current="page"]')).toHaveText('Add a source')
    expect((await bar.boundingBox())!.height).toBe(60)
  })

  test('in dark mode the bar drops to the panel colour', async ({ story, page }) => {
    const colour = () =>
      page.getByRole('banner').evaluate((node) => getComputedStyle(node).backgroundColor)
    await story.open('components-top-bar--default')
    const light = await colour()
    await story.open('components-top-bar--default', { mode: 'dark' })
    expect(await colour()).not.toBe(light)
  })
})
