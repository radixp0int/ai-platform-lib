import { expect, test } from '../../../tests/story'
import { findCutOff, findTruncated } from '../../../tests/layout'

const ID = 'recipes-tenants-page--tenants-page'

const omnibox = (page: import('@playwright/test').Page) =>
  page.getByRole('combobox', { name: 'Search and filter tenants' })

test.describe('Tenants page', () => {
  for (const width of [1280, 1024, 820, 390]) {
    test(`with the panel docked, nothing is cut off at ${width}px`, async ({ story, page }) => {
      await page.setViewportSize({ width, height: 900 })
      await story.open(ID)
      await expect(page.getByRole('region', { name: 'Filters' })).toBeVisible()
      expect(await findCutOff(page)).toEqual([])
      // A column header that loses its words to an ellipsis cannot be read.
      const truncated = await findTruncated(page)
      expect(
        truncated.filter((line) => line.startsWith('header')),
        'column headers',
      ).toEqual([])
      expect(
        truncated.filter((line) => line.startsWith('panel')),
        'text in the panel',
      ).toEqual([])
    })
  }

  test('typing offers dates and values, and the choice shows as a chip and in the panel', async ({
    story,
    page,
  }) => {
    await story.open(ID)
    await omnibox(page).fill('renew')
    await page.getByRole('option', { name: /Renewal · Next 30 days/ }).click()
    await expect(page.getByTitle('renewal: Next 30 days')).toBeVisible()
    await expect(
      page
        .getByRole('region', { name: 'Filters' })
        .getByRole('button', { name: /^Renewal\s*Next 30 days/ }),
    ).toBeVisible()
  })

  test('the pin survives closing the panel, and unpinning floats it over the table', async ({
    story,
    page,
  }) => {
    await story.open(ID)
    const panel = page.getByRole('region', { name: 'Filters' })
    await page.getByRole('button', { name: /^Filters/ }).click()
    await expect(panel).toHaveCount(0)
    await page.getByRole('button', { name: /^Filters/ }).click()
    await expect(page.getByRole('button', { name: /^Unpin filters/ })).toBeVisible()
    await page.getByRole('button', { name: /^Unpin filters/ }).click()
    await expect(page.getByRole('button', { name: 'Close filters' })).toBeVisible()
  })

  test('simple offers quick dates in the omnibox, and the switch to advanced keeps every filter', async ({
    story,
    page,
  }) => {
    await story.open(ID)
    await omnibox(page).fill('bank')
    await omnibox(page).press('Enter')
    await omnibox(page).click()
    const picks = page.getByRole('group', { name: 'Search and filter tenants' })
    await picks.getByRole('group', { name: 'Created' }).getByRole('button', { name: '90D' }).click()
    await expect(page.getByTitle('created: Last 90 days')).toBeVisible()
    await omnibox(page).click()
    await picks.getByRole('button', { name: 'Switch to advanced' }).click()
    await expect(page.getByTitle('search: bank')).toBeVisible()
    await expect(page.getByTitle('created: Last 90 days')).toBeVisible()
    await omnibox(page).click()
    await expect(picks).toHaveCount(0)
  })

  test('a search with nothing behind it says so and offers to clear', async ({ story, page }) => {
    await story.open(ID)
    await omnibox(page).fill('zzzz')
    await omnibox(page).press('Enter')
    await expect(page.getByText('No tenants match')).toBeVisible()
    // The empty, focused omnibox offers its quick picks again; put them away.
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Clear all filters' }).click()
    await expect(page.getByText('No tenants match')).toHaveCount(0)
  })

  test('sorting by Created goes by date, oldest first and then newest first', async ({
    story,
    page,
  }) => {
    await story.open(ID)
    const header = page.getByRole('columnheader', { name: 'Created' })
    await header.getByRole('button').click()
    await expect(header).toHaveAttribute('aria-sort', 'ascending')
    await expect(page.locator('#storybook-root tbody tr [data-row-title]').first()).toHaveText(
      'Redstone Bancorp',
    )
    await header.getByRole('button').click()
    await expect(page.locator('#storybook-root tbody tr [data-row-title]').first()).toHaveText(
      'Crestview Bank',
    )
  })
})
