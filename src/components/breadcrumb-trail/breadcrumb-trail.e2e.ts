import { expect, test } from '../../../tests/story'

test.describe('BreadcrumbTrail', () => {
  test('links every level but the page you are on', async ({ story }) => {
    const root = await story.open('components-breadcrumb-trail--three-levels')
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

  test('is a navigation landmark named for what it is', async ({ story, page }) => {
    await story.open('components-breadcrumb-trail--two-levels')
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
  })

  test('a long last item truncates and the trail stays on one line', async ({ story }) => {
    const root = await story.open('components-breadcrumb-trail--long-last-item')
    const current = root.getByText(/Commercial loan review · Harbor Street/)
    const box = (await current.boundingBox())!
    const trail = (await root.getByRole('list').boundingBox())!
    expect(box.x + box.width).toBeLessThanOrEqual(trail.x + trail.width + 1)
    expect(trail.height).toBeLessThan(40)
  })
})
