import { expect, test } from '../../../tests/story'

test.describe('Panel', () => {
  test('it is a complementary region with its title and a close button named for it', async ({
    story,
    page,
  }) => {
    await story.open('components-panel--playground')
    const panel = page.getByRole('complementary')
    await expect(panel).toContainText('Step details')
    await expect(panel.getByRole('button', { name: 'Hide step details' })).toBeVisible()
  })

  test('header actions come before the close button', async ({ story, page }) => {
    await story.open('components-panel--with-actions')
    const expand = (await page.getByRole('button', { name: 'Open full view' }).boundingBox())!
    const close = (await page.getByRole('button', { name: 'Hide step details' }).boundingBox())!
    expect(expand.x).toBeLessThan(close.x)
  })

  test('the body scrolls while the header and a pinned footer stay put', async ({
    story,
    page,
  }) => {
    await story.open('components-panel--with-pinned-footer')
    const approve = page.getByRole('button', { name: 'Approve' })
    const before = (await approve.boundingBox())!.y
    await page
      .locator('.overflow-y-auto')
      .first()
      .evaluate((node) => node.scrollTo({ top: 400 }))
    expect((await approve.boundingBox())!.y).toBe(before)
    await expect(page.getByRole('button', { name: 'Hide step details' })).toBeInViewport()
  })
})
