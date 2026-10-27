import { expect, test } from '../../../tests/story'

test.describe('Breadcrumbs', () => {
  test('it is a named navigation landmark holding an ordered list', async ({ story, page }) => {
    await story.open('primitives-breadcrumbs--trail')
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    await expect(nav.locator('ol')).toHaveCount(1)
    await expect(nav.getByRole('link')).toHaveCount(3)
  })

  test('the current page is marked, and is not a link', async ({ story, page }) => {
    await story.open('primitives-breadcrumbs--trail')
    const current = page.locator('[aria-current="page"]')
    await expect(current).toHaveText('Crestview Health')
    await expect(page.getByRole('link', { name: 'Crestview Health' })).toHaveCount(0)
  })

  test('links every level but the page you are on', async ({ story }) => {
    const root = await story.open('primitives-breadcrumbs--three-levels')
    await expect(root.getByRole('link')).toHaveCount(2)
    await expect(root.getByRole('link', { name: 'Workflows' })).toHaveAttribute(
      'href',
      '/t/alderfinch-treasury/workflows',
    )
    await expect(root.getByText('Harbor Street Bakery · $450,000')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('a step with no link is plain text, and only the last is the current page', async ({
    story,
    page,
  }) => {
    await story.open('primitives-breadcrumbs--step-without-a-link')
    await expect(page.getByRole('link')).toHaveCount(0)
    await expect(page.locator('[aria-current="page"]')).toHaveText('Add a source')
    await expect(page.getByText('Ingestion', { exact: true })).not.toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('separators are hidden from assistive technology', async ({ story, page }) => {
    await story.open('primitives-breadcrumbs--two-levels')
    // Two crumbs and one separator: only the crumbs are exposed as list items.
    await expect(page.getByRole('navigation').getByRole('listitem')).toHaveCount(2)
  })

  test('a long trail wraps inside a narrow column', async ({ story, page }) => {
    await story.open('primitives-breadcrumbs--wrapping-in-a-narrow-column')
    const nav = page.getByRole('navigation', { name: 'Breadcrumb' })
    const overflow = await nav.evaluate((element) => element.scrollWidth - element.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('a long last item truncates at the width of the trail instead of overflowing', async ({
    story,
  }) => {
    const root = await story.open('primitives-breadcrumbs--long-last-item')
    const current = root.getByText(/Commercial loan review · Harbor Street/)
    const box = (await current.boundingBox())!
    const trail = (await root.getByRole('list').boundingBox())!
    expect(box.x + box.width).toBeLessThanOrEqual(trail.x + trail.width + 1)
    const clipped = await current.evaluate((node) => node.scrollWidth > node.clientWidth)
    expect(clipped).toBe(true)
  })

  test('a click goes to the host’s router when there is one', async ({ story, page }) => {
    await story.open('primitives-breadcrumbs--with-a-router')
    await page.getByRole('link', { name: 'Workflows' }).click()
    // The router prevents the default, so the document is still the story.
    await expect(page.getByRole('link', { name: 'Workflows' })).toBeVisible()
  })

  test('composed by hand it keeps the landmark, the current page and the hidden separators', async ({
    story,
    page,
  }) => {
    await story.open('primitives-breadcrumbs--composed-by-hand')
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
    await expect(page.locator('[aria-current="page"]')).toHaveText('Access and roles')
    await expect(page.getByRole('navigation').getByRole('listitem')).toHaveCount(3)
  })

  test('on a brand band the trail reads light on dark', async ({ story, page }) => {
    await story.open('primitives-breadcrumbs--on-a-brand-band')
    const colour = await page
      .locator('[aria-current="page"]')
      .evaluate((node) => getComputedStyle(node).color)
    expect(colour).toBe('rgb(255, 255, 255)')
  })
})
