import { expect, test } from '../../../tests/story'

test.describe('PinnedPages', () => {
  test('pinned pages are links in a named navigation, with the current one marked', async ({
    story,
    page,
  }) => {
    await story.open('components-pinned-pages--three-pinned')
    const nav = page.getByRole('navigation', { name: 'Pinned pages' })
    await expect(nav.getByRole('link')).toHaveCount(3)
    await expect(nav.locator('[aria-current="page"]')).toHaveText(/Chat/)
  })

  test('the manager pins the current page when there is room', async ({ story, page }) => {
    await story.open('components-pinned-pages--room-for-one-more')
    await page.getByRole('button', { name: 'Manage pinned pages, 2 of 3 pinned' }).click()
    await page
      .getByRole('dialog', { name: 'Pinned pages' })
      .getByRole('button', { name: /^Pin / })
      .click()
    await expect(
      page.getByRole('navigation', { name: 'Pinned pages' }).getByRole('link'),
    ).toHaveCount(3)
  })

  test('a fourth pin is refused, and the manager says why', async ({ story, page }) => {
    await story.open('components-pinned-pages--full')
    await page.getByRole('button', { name: 'Manage pinned pages, 3 of 3 pinned' }).click()
    const manager = page.getByRole('dialog', { name: 'Pinned pages' })
    await expect(manager.getByRole('button', { name: /^Pin / })).toBeDisabled()
    await expect(manager).toContainText('You can pin 3 pages')
  })

  test('unpinning removes the tab', async ({ story, page }) => {
    await story.open('components-pinned-pages--three-pinned')
    await page.getByRole('button', { name: /pinned/i }).click()
    await page.getByRole('button', { name: 'Unpin Tasks' }).click()
    const nav = page.getByRole('navigation', { name: 'Pinned pages' })
    await expect(nav.getByRole('link')).toHaveCount(2)
    await expect(nav.getByRole('link', { name: 'Tasks' })).toHaveCount(0)
  })

  test('with nothing pinned the manager invites the first pin', async ({ story, page }) => {
    await story.open('components-pinned-pages--empty')
    await page.getByRole('button', { name: 'Manage pinned pages, 0 of 3 pinned' }).click()
    await expect(page.getByRole('dialog', { name: 'Pinned pages' })).toContainText(
      'Nothing pinned yet',
    )
  })
})
