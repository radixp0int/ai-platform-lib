import type { Page } from '@playwright/test'
import { expect, test } from '../../../tests/story'

// The host in these stories answers on a 600ms timer, so the clock is
// installed before the story loads and each test decides how much time passes.
const panel = (page: Page) => page.getByRole('region', { name: 'Rows' })
const rows = (page: Page) => panel(page).getByRole('listitem')
const scrollPanelTo = (page: Page, top: number | 'end') =>
  panel(page).evaluate((el, to) => el.scrollTo(0, to === 'end' ? el.scrollHeight : to), top)

test.describe('LoadMore', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install()
  })

  test('nothing is fetched while the end is far away', async ({ story, page }) => {
    await story.open('components-loadmore--loads-on-scroll')
    await expect(rows(page)).toHaveCount(20)
    await page.clock.runFor(2_000)
    await expect(rows(page)).toHaveCount(20)
    await expect(page.getByRole('button', { name: 'Load more' })).toBeAttached()
  })

  test('scrolling toward the end fetches the next page before the end is reached', async ({
    story,
    page,
  }) => {
    await story.open('components-loadmore--loads-on-scroll')
    await expect(rows(page)).toHaveCount(20)

    // A third of the way down: the last row is still well below the panel.
    await scrollPanelTo(page, 250)
    await expect(page.getByRole('status')).toHaveText('Loading more…')
    await expect(rows(page).last()).not.toBeInViewport()

    await page.clock.runFor(600)
    await expect(rows(page)).toHaveCount(40)
    await expect(page.getByRole('status')).toHaveText('')
  })

  test('it keeps going to the end of the list, then says so and stops', async ({ story, page }) => {
    await story.open('components-loadmore--loads-on-scroll')
    for (const count of [40, 60, 80, 95]) {
      await scrollPanelTo(page, 'end')
      await expect(page.getByRole('status')).toHaveText('Loading more…')
      await page.clock.runFor(600)
      await expect(rows(page)).toHaveCount(count)
    }
    await scrollPanelTo(page, 'end')
    await expect(panel(page)).toContainText('You have reached the end.')
    await expect(panel(page).getByRole('button')).toHaveCount(0)
  })

  test('with auto off only the button fetches, and it keeps focus while it does', async ({
    story,
    page,
  }) => {
    await story.open('components-loadmore--button-only')
    await scrollPanelTo(page, 'end')
    await page.clock.runFor(2_000)
    await expect(rows(page)).toHaveCount(20)

    await page.getByRole('button', { name: 'Load more' }).click()
    const busy = page.getByRole('button', { name: 'Loading more…' })
    await expect(busy).toBeFocused()
    await expect(busy).toHaveAttribute('aria-disabled', 'true')

    await page.clock.runFor(600)
    await expect(rows(page)).toHaveCount(40)
    await expect(page.getByRole('button', { name: 'Load more' })).toBeFocused()
  })

  test('a failure is not retried by scrolling, only by Try again', async ({ story, page }) => {
    await story.open('components-loadmore--fails-then-recovers')
    await scrollPanelTo(page, 'end')
    await page.clock.runFor(600)
    await expect(page.getByRole('alert')).toHaveText('Could not load more.')
    await expect(rows(page)).toHaveCount(20)

    await scrollPanelTo(page, 0)
    await scrollPanelTo(page, 'end')
    await page.clock.runFor(2_000)
    await expect(rows(page)).toHaveCount(20)

    await page.getByRole('button', { name: 'Try again' }).click()
    await page.clock.runFor(600)
    await expect(rows(page)).toHaveCount(40)
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('the states read correctly on their own', async ({ story, page }) => {
    await story.open('components-loadmore--failed-with-message')
    await expect(page.getByRole('alert')).toHaveText('The history service timed out.')
    await story.open('components-loadmore--end')
    await expect(page.locator('#storybook-root')).toContainText('You have reached the end.')
    await story.open('components-loadmore--custom-labels')
    await expect(page.getByRole('button', { name: 'Cargar más' })).toBeVisible()
  })
})
