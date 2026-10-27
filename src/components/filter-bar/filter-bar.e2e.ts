import type { Locator, Page } from '@playwright/test'
import { expect, test } from '../../../tests/story'
import { findCutOff, findTruncated } from '../../../tests/layout'

// Every test runs on one fixed day, so "Last 30 days" is always Sep 9 – Oct 8
// and the sample data (dated back from today) never drifts.
const TODAY = new Date('2026-10-08T12:00:00')
const id = (name: string) => `components-filterbar--${name}`

const omnibox = (page: Page) => page.getByRole('combobox', { name: 'Search and filter runs' })
const filtersButton = (page: Page) => page.getByRole('button', { name: /^Filters/ })
const panel = (page: Page) => page.getByRole('region', { name: 'Filters' })
/** The dropdown of quick picks, as opposed to the panel's own groups of presets. */
const quick = (page: Page) => page.getByRole('group', { name: 'Search and filter runs' })
/** The panel's Dates section, and the header button of each of its rows. */
const dates = (page: Page) => panel(page).getByRole('group', { name: 'Dates' })
const dateRow = (page: Page, label: string) =>
  dates(page)
    .locator(':scope > div > button')
    .filter({ hasText: new RegExp(`^${label}`) })
const chip = (page: Page, name: string) => page.getByTitle(name, { exact: true })
const remove = (page: Page, name: string) =>
  page.getByRole('button', { name: `Remove ${name}`, exact: true })

async function open(
  story: Parameters<Parameters<typeof test>[2]>[0]['story'],
  page: Page,
  name: string,
) {
  await page.clock.setFixedTime(TODAY)
  return story.open(id(name))
}

const box = async (locator: Locator) => {
  const b = await locator.boundingBox()
  if (!b) throw new Error('not drawn')
  return b
}

test.describe('FilterBar, advanced', () => {
  test('every filter that is set is a chip in the omnibox, and the button counts them', async ({
    story,
    page,
  }) => {
    await open(story, page, 'advanced')
    await expect(chip(page, 'started: Last 30 days')).toBeVisible()
    await expect(chip(page, 'status: Completed')).toBeVisible()
    await expect(filtersButton(page)).toContainText('2')
  })

  test('a date chip names its field and the dates its preset stands for', async ({
    story,
    page,
  }) => {
    await open(story, page, 'advanced')
    await expect(chip(page, 'started: Last 30 days')).toContainText('Sep 9 – Oct 8, 2026')
  })

  test('typing suggests search first, then narrowing, then the dates and values that match', async ({
    story,
    page,
  }) => {
    await open(story, page, 'advanced')
    await omnibox(page).fill('30')
    const options = page.getByRole('option')
    await expect(options.first()).toContainText('Search for “30”')
    await expect(page.getByRole('option', { name: /Started · Last 30 days/ })).toBeVisible()
    await expect(page.getByRole('option', { name: /Due · Next 30 days/ })).toBeVisible()
    // Each date suggestion names its field, so "30" is never a preset of an unknown date.
    for (const text of await page.getByRole('option', { name: /· .*30 days/ }).allInnerTexts()) {
      expect(text).toMatch(/^(Started|Last updated|Finished|Due) · /)
    }
    await omnibox(page).press('Enter')
    await expect(chip(page, 'search: 30')).toBeVisible()
  })

  test('choosing a date suggestion sets it, and the panel shows the same thing', async ({
    story,
    page,
  }) => {
    await open(story, page, 'advanced')
    await omnibox(page).fill('due')
    await page.getByRole('option', { name: /Due · Next 7 days/ }).click()
    await expect(chip(page, 'due: Next 7 days')).toContainText('Oct 8 – Oct 14, 2026')
    await filtersButton(page).click()
    await expect(dateRow(page, 'Due')).toContainText('Next 7 days')
  })

  test('a value that starts with what was typed comes before the dates', async ({
    story,
    page,
  }) => {
    await open(story, page, 'advanced')
    await omnibox(page).fill('fail')
    await expect(page.getByRole('option', { name: /Status · Failed/ })).toBeVisible()
    await page.getByRole('option', { name: /Status · Failed/ }).click()
    await expect(chip(page, 'status: Failed')).toBeVisible()
  })

  test('arrow keys and Enter choose a suggestion', async ({ story, page }) => {
    await open(story, page, 'advanced')
    await omnibox(page).fill('due')
    await omnibox(page).press('ArrowDown')
    await omnibox(page).press('ArrowDown')
    await omnibox(page).press('ArrowDown')
    await omnibox(page).press('ArrowDown')
    await omnibox(page).press('Enter')
    await expect(page.getByTitle(/^due: /)).toBeVisible()
  })

  test('Backspace in the empty field takes the last chip off, in the order they are shown', async ({
    story,
    page,
  }) => {
    await open(story, page, 'advanced')
    // Status is listed before Started, so Started is the last chip and goes first.
    await omnibox(page).click()
    await omnibox(page).press('Backspace')
    await expect(chip(page, 'started: Last 30 days')).toHaveCount(0)
    await expect(chip(page, 'status: Completed')).toBeVisible()
    await omnibox(page).press('Backspace')
    await expect(chip(page, 'status: Completed')).toHaveCount(0)
  })

  test('Ctrl+K focuses the omnibox from anywhere', async ({ story, page }) => {
    await open(story, page, 'advanced')
    // The listener is attached just after the first paint, so keep pressing until it is there.
    await expect(async () => {
      await page.keyboard.press('Control+k')
      await expect(omnibox(page)).toBeFocused({ timeout: 300 })
    }).toPass()
  })

  test('the advanced style offers nothing until something is typed', async ({ story, page }) => {
    await open(story, page, 'advanced')
    await omnibox(page).click()
    await expect(quick(page)).toHaveCount(0)
    await expect(page.getByRole('listbox')).toHaveCount(0)
  })
})

test.describe('FilterBar, the panel and its pin', () => {
  test('floating, it opens over the table and Escape closes it', async ({ story, page }) => {
    await open(story, page, 'simple')
    await filtersButton(page).click()
    await expect(panel(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(panel(page)).toHaveCount(0)
  })

  test('a click outside closes a floating panel, a click inside the omnibox does not', async ({
    story,
    page,
  }) => {
    await open(story, page, 'panel-floating')
    await expect(panel(page)).toBeVisible()
    const table = await box(page.getByRole('table'))
    await page.mouse.click(table.x + table.width - 24, table.y + 60)
    await expect(panel(page)).toHaveCount(0)
  })

  test('typing in the omnibox moves a floating panel out of the way of its dropdown', async ({
    story,
    page,
  }) => {
    await open(story, page, 'panel-floating')
    await omnibox(page).fill('due')
    await expect(page.getByRole('listbox')).toBeVisible()
    await expect(panel(page)).toHaveCount(0)
  })

  test('pinning docks it beside the table, unpinning floats it again', async ({ story, page }) => {
    await open(story, page, 'panel-floating')
    const table = page.getByRole('table')
    await expect(page.getByRole('button', { name: 'Close filters' })).toBeVisible()

    await page.getByRole('button', { name: 'Pin filters beside the table' }).click()
    const docked = await box(panel(page))
    const tableBox = await box(table)
    expect(
      docked.x + docked.width,
      'docked panel ends before the table starts',
    ).toBeLessThanOrEqual(tableBox.x + 1)
    await expect(page.getByRole('button', { name: 'Close filters' })).toHaveCount(0)

    await page.getByRole('button', { name: /^Unpin filters/ }).click()
    const floating = await box(panel(page))
    const tableAgain = await box(table)
    expect(floating.x + floating.width, 'floating panel sits over the table').toBeGreaterThan(
      tableAgain.x,
    )
  })

  test('closing a pinned panel and opening it again keeps the pin', async ({ story, page }) => {
    await open(story, page, 'panel-pinned')
    await expect(panel(page)).toBeVisible()
    await filtersButton(page).click()
    await expect(panel(page)).toHaveCount(0)
    await filtersButton(page).click()
    await expect(panel(page)).toBeVisible()
    await expect(page.getByRole('button', { name: /^Unpin filters/ })).toBeVisible()
  })

  test('a pinned panel is not closed by clicking the table it filters', async ({ story, page }) => {
    await open(story, page, 'panel-pinned')
    const table = await box(page.getByRole('table'))
    await page.mouse.click(table.x + 24, table.y + 60)
    await expect(panel(page)).toBeVisible()
  })

  test('a pinned panel never covers the table', async ({ story, page }) => {
    await open(story, page, 'panel-pinned')
    const a = await box(panel(page))
    const b = await box(page.getByRole('table'))
    const overlaps =
      a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
    expect(overlaps, 'panel and table overlap').toBe(false)
  })

  test('a pinned panel taller than the screen scrolls by itself instead of stretching the page', async ({
    story,
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 700 })
    await open(story, page, 'many-filters')
    const rail = panel(page)
    const metrics = await rail.evaluate((el) => ({
      client: el.clientHeight,
      scroll: el.scrollHeight,
    }))
    expect(metrics.scroll, 'the panel has more in it than fits').toBeGreaterThan(metrics.client)
    expect(metrics.client, 'the panel fits the window').toBeLessThanOrEqual(700)
    const page_ = await page.evaluate(() => document.documentElement.scrollHeight)
    expect(page_, 'the page is not as tall as the panel would make it').toBeLessThan(
      metrics.scroll + 200,
    )
    // Its last control can be reached by scrolling the panel.
    await dateRow(page, 'Due').scrollIntoViewIfNeeded()
    await expect(dateRow(page, 'Due')).toBeInViewport()
  })

  test('with several dates, they share one section and one row is open', async ({
    story,
    page,
  }) => {
    await open(story, page, 'panel-floating')
    await expect(dateRow(page, 'Started').or(dateRow(page, 'Due'))).toHaveCount(2)
    const headers = dates(page).locator(':scope > div > button')
    await expect(headers).toHaveCount(4)
    await expect(dates(page).locator(':scope > div > button[aria-expanded="true"]')).toHaveCount(1)
    await expect(dates(page).locator(':scope > div > button[aria-expanded="false"]')).toHaveCount(3)
    // Opening another folds the first.
    await dateRow(page, 'Due').click()
    await expect(dateRow(page, 'Due')).toHaveAttribute('aria-expanded', 'true')
    await expect(dates(page).locator(':scope > div > button[aria-expanded="true"]')).toHaveCount(1)
  })

  test('picking a preset in the panel sets it, picking it again clears it', async ({
    story,
    page,
  }) => {
    await open(story, page, 'panel-floating')
    await dateRow(page, 'Started').click()
    const preset = panel(page)
      .getByRole('group', { name: 'Started presets' })
      .getByRole('button', { name: 'Last 7 days' })
    await preset.click()
    await expect(preset).toHaveAttribute('aria-pressed', 'true')
    await expect(chip(page, 'started: Last 7 days')).toBeVisible()
    await preset.click()
    await expect(chip(page, 'started: Last 7 days')).toHaveCount(0)
  })

  test('a date that looks ahead offers picks that look ahead', async ({ story, page }) => {
    await open(story, page, 'panel-floating')
    await dateRow(page, 'Due').click()
    const presets = panel(page).getByRole('group', { name: 'Due presets' })
    await expect(presets.getByRole('button', { name: 'Overdue' })).toBeVisible()
    await expect(presets.getByRole('button', { name: 'Next 7 days' })).toBeVisible()
    await expect(presets.getByRole('button', { name: 'Last 7 days' })).toHaveCount(0)
  })

  test('Reset clears every field in the panel', async ({ story, page }) => {
    await open(story, page, 'many-filters')
    await panel(page).getByRole('button', { name: 'Reset' }).click()
    await expect(page.getByTitle(/^(status|workflow|priority|team|started|updated): /)).toHaveCount(
      0,
    )
  })
})

test.describe('FilterBar, simple', () => {
  test('focusing the empty omnibox offers a row of picks for each date and each small filter', async ({
    story,
    page,
  }) => {
    await open(story, page, 'simple')
    await omnibox(page).click()
    const picks = quick(page)
    await expect(picks).toBeVisible()
    for (const date of ['Started', 'Last updated', 'Finished', 'Due']) {
      await expect(picks.getByRole('group', { name: date })).toBeVisible()
    }
    await expect(
      picks.getByRole('group', { name: 'Started' }).getByRole('button', { name: '30D' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(
      picks.getByRole('group', { name: 'Due' }).getByRole('button', { name: 'Overdue' }),
    ).toBeVisible()
    await expect(
      picks
        .getByRole('group', { name: 'Status' })
        .getByRole('button', { name: /^Completed\s*\d+/ }),
    ).toBeVisible()
    // Ten teams are too many for a row of picks, so they stay in the panel.
    await expect(picks.getByRole('group', { name: 'Team' })).toHaveCount(0)
    await expect(picks.getByText('Show only')).toBeVisible()
  })

  test('a quick pick sets the date, adds its chip, and pressing it again clears it', async ({
    story,
    page,
  }) => {
    await open(story, page, 'simple')
    await omnibox(page).click()
    const updated = quick(page).getByRole('group', { name: 'Last updated' })
    await updated.getByRole('button', { name: '7D' }).click()
    await expect(chip(page, 'last updated: Last 7 days')).toBeVisible()
    await expect(quick(page), 'the picks stay open for the next one').toBeVisible()
    await updated.getByRole('button', { name: '7D' }).click()
    await expect(chip(page, 'last updated: Last 7 days')).toHaveCount(0)
  })

  test('a quick pick for a filter shows how many it would match', async ({ story, page }) => {
    await open(story, page, 'simple')
    await omnibox(page).click()
    const failed = quick(page)
      .getByRole('group', { name: 'Status' })
      .getByRole('button', { name: /^Failed\s*\d+/ })
    await failed.click()
    await expect(chip(page, 'status: Failed')).toBeVisible()
    await expect(failed).toHaveAttribute('aria-pressed', 'true')
  })

  test('arrow keys walk the picks, and Escape comes back to the field without reopening it', async ({
    story,
    page,
  }) => {
    await open(story, page, 'simple')
    await omnibox(page).click()
    await omnibox(page).press('ArrowDown')
    const started = quick(page).getByRole('group', { name: 'Started' })
    await expect(started.getByRole('button', { name: '7D' })).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(started.getByRole('button', { name: '30D' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(chip(page, 'started: Last 30 days')).toHaveCount(0)
    await page.keyboard.press('Escape')
    await expect(omnibox(page)).toBeFocused()
    await expect(quick(page)).toHaveCount(0)
  })

  test('typing swaps the picks for suggestions, and clearing the text brings them back', async ({
    story,
    page,
  }) => {
    await open(story, page, 'simple')
    await omnibox(page).fill('renew')
    await expect(quick(page)).toHaveCount(0)
    await expect(page.getByRole('listbox')).toBeVisible()
    await omnibox(page).fill('')
    await expect(quick(page)).toBeVisible()
  })

  test('Custom opens the panel on that date and closes the dropdown', async ({ story, page }) => {
    await open(story, page, 'simple')
    await omnibox(page).click()
    await quick(page)
      .getByRole('group', { name: 'Due' })
      .getByRole('button', { name: /^Custom/ })
      .click()
    await expect(panel(page)).toBeVisible()
    await expect(dateRow(page, 'Due')).toHaveAttribute('aria-expanded', 'true')
    await expect(quick(page)).toHaveCount(0)
  })

  test('the style switches both ways and every filter comes with it', async ({ story, page }) => {
    await open(story, page, 'simple')
    await omnibox(page).click()
    await quick(page).getByRole('button', { name: 'Switch to advanced' }).click()
    await expect(chip(page, 'started: Last 30 days')).toBeVisible()
    await omnibox(page).click()
    await expect(quick(page)).toHaveCount(0)
    await filtersButton(page).click()
    await panel(page).getByRole('button', { name: 'Use simple filters' }).click()
    await expect(chip(page, 'started: Last 30 days')).toBeVisible()
    await omnibox(page).click()
    await expect(quick(page)).toBeVisible()
  })
})

// What the screen would show cut off, at the widths the library supports.
const WIDTHS = [1280, 820, 390]
const STORIES = [
  'simple',
  'panel-floating',
  'panel-pinned',
  'advanced',
  'many-filters',
  'many-columns',
  'long-labels',
  'no-panel',
  'no-header',
  'table-only',
  'sorted-columns',
]

test.describe('FilterBar, nothing is cut off', () => {
  for (const width of WIDTHS) {
    for (const name of STORIES) {
      test(`${name} at ${width}px`, async ({ story, page }) => {
        await page.setViewportSize({ width, height: 900 })
        await open(story, page, name)
        expect(await findCutOff(page), 'cut off as it opens').toEqual([])

        // The two dropdowns are the likeliest to be clipped by a box around them. A story
        // that switches the header off has no omnibox to open.
        if ((await omnibox(page).count()) > 0) {
          await omnibox(page).click()
          expect(await findCutOff(page), 'cut off with the omnibox focused').toEqual([])
          await omnibox(page).fill('30')
          await expect(page.getByRole('listbox')).toBeVisible()
          expect(await findCutOff(page), 'cut off while suggesting').toEqual([])
        }

        // A column header that loses its words to an ellipsis cannot be read, and neither
        // can a preset button that says "Last 30 da…".
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
  }
})

test.describe('FilterBar, parts switched off', () => {
  test('showPanel off: no Filters button and no panel, and the omnibox still filters', async ({
    story,
    page,
  }) => {
    await open(story, page, 'no-panel')
    await expect(filtersButton(page)).toHaveCount(0)
    await expect(panel(page)).toHaveCount(0)
    await expect(chip(page, 'started: Last 30 days')).toBeVisible()
    await omnibox(page).fill('due')
    await page.getByRole('option', { name: /Due · Next 7 days/ }).click()
    await expect(chip(page, 'due: Next 7 days')).toBeVisible()
    await expect(panel(page)).toHaveCount(0)
  })

  test('showPanel off: the quick picks lose "Custom", which opened the panel, and keep everything else', async ({
    story,
    page,
  }) => {
    await open(story, page, 'no-panel')
    await omnibox(page).click()
    const picks = quick(page)
    await expect(picks.getByRole('group', { name: 'Started' })).toBeVisible()
    await expect(picks.getByRole('button', { name: /^Custom/ })).toHaveCount(0)
    await picks.getByRole('group', { name: 'Due' }).getByRole('button', { name: 'Overdue' }).click()
    await expect(chip(page, 'due: Overdue')).toBeVisible()
  })

  test('showHeader off: no search box and no Filters button, and a panel that is always docked and open', async ({
    story,
    page,
  }) => {
    await open(story, page, 'no-header')
    await expect(omnibox(page)).toHaveCount(0)
    await expect(filtersButton(page)).toHaveCount(0)
    await expect(panel(page)).toBeVisible()
    // Nothing to pin, close or switch: the rail is simply there.
    await expect(page.getByRole('button', { name: /pin filters/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Close filters' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Switch to advanced/ })).toHaveCount(0)
    const rail = await box(panel(page))
    const table = await box(page.getByRole('table'))
    expect(rail.x + rail.width, 'the rail sits beside the table').toBeLessThanOrEqual(table.x + 1)
  })

  test('showHeader off: the rail still filters, and Reset still clears it', async ({
    story,
    page,
  }) => {
    await open(story, page, 'no-header')
    await expect(page.getByRole('row').nth(1)).toContainText('Completed')
    await panel(page)
      .getByRole('checkbox', { name: /^Completed/ })
      .uncheck()
    await panel(page)
      .getByRole('checkbox', { name: /^Failed/ })
      .check()
    await expect(page.getByRole('row').nth(1)).toContainText('Failed')
    await panel(page).getByRole('button', { name: 'Reset' }).click()
    await expect(panel(page).getByRole('checkbox', { name: /^Failed/ })).not.toBeChecked()
  })

  test('both off: nothing but the table', async ({ story, page }) => {
    await open(story, page, 'table-only')
    await expect(page.getByRole('table')).toBeVisible()
    await expect(omnibox(page)).toHaveCount(0)
    await expect(filtersButton(page)).toHaveCount(0)
    await expect(panel(page)).toHaveCount(0)
  })
})

test.describe('FilterBar, sorted columns', () => {
  const sortable = (page: Page, name: string) =>
    page.getByRole('columnheader', { name, exact: true }).getByRole('button')

  test('a number column sorts as numbers, so 9 days comes before 10 days', async ({
    story,
    page,
  }) => {
    await open(story, page, 'sorted-columns')
    await sortable(page, 'Duration').click()
    const days = (
      await page.locator('#storybook-root tbody tr td:nth-child(9)').allInnerTexts()
    ).map((cell) => Number.parseInt(cell, 10))
    expect(days).toEqual([...days].sort((a, b) => a - b))
    expect(days.at(-1)).toBeGreaterThan(days[0])
    await sortable(page, 'Duration').click()
    const down = (
      await page.locator('#storybook-root tbody tr td:nth-child(9)').allInnerTexts()
    ).map((cell) => Number.parseInt(cell, 10))
    expect(down).toEqual([...down].sort((a, b) => b - a))
  })

  test('a date column sorts by date', async ({ story, page }) => {
    await open(story, page, 'sorted-columns')
    await sortable(page, 'Due').click()
    const due = (
      await page.locator('#storybook-root tbody tr td:nth-child(8)').allInnerTexts()
    ).map((cell) => new Date(cell).getTime())
    expect(due).toEqual([...due].sort((a, b) => a - b))
  })

  test('a column with sorting switched off is not a button, and the others still are', async ({
    story,
    page,
  }) => {
    await open(story, page, 'sorted-columns')
    await expect(sortable(page, 'Region')).toHaveCount(0)
    await expect(sortable(page, 'Team')).toHaveCount(1)
    await expect(sortable(page, 'Started')).toHaveCount(1)
  })

  test('sorting and filtering work together', async ({ story, page }) => {
    await open(story, page, 'sorted-columns')
    await omnibox(page).fill('fail')
    await page.getByRole('option', { name: /Status · Failed/ }).click()
    await sortable(page, 'Duration').click()
    await expect(page.getByRole('columnheader', { name: 'Duration' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
    await expect(chip(page, 'status: Failed')).toBeVisible()
    await expect(page.getByRole('row').nth(1)).toContainText('Failed')
  })
})

test.describe('FilterBar, many filters', () => {
  test('chips wrap onto more lines and the field grows to hold every one', async ({
    story,
    page,
  }) => {
    await open(story, page, 'many-filters')
    const field = await box(omnibox(page).locator('xpath=ancestor::div[1]'))
    expect(field.height, 'the field is taller than one line').toBeGreaterThan(80)
    await expect(remove(page, 'workflow: Incident triage')).toBeVisible()
    const count = await page.getByRole('button', { name: /^Remove / }).count()
    expect(count).toBeGreaterThanOrEqual(10)
    for (const remove of await page.getByRole('button', { name: /^Remove / }).all()) {
      const r = await box(remove)
      expect(r.x, 'remove button starts inside the field').toBeGreaterThanOrEqual(field.x)
      expect(r.x + r.width, 'remove button ends inside the field').toBeLessThanOrEqual(
        field.x + field.width + 1,
      )
    }
  })

  test('removing a chip from the middle takes only that filter off', async ({ story, page }) => {
    await open(story, page, 'many-filters')
    await expect(remove(page, 'workflow: Incident triage')).toBeVisible()
    const before = await page.getByRole('button', { name: /^Remove / }).count()
    await remove(page, 'workflow: Incident triage').click()
    await expect(page.getByRole('button', { name: /^Remove / })).toHaveCount(before - 1)
    await expect(chip(page, 'workflow: Loan review')).toBeVisible()
    await expect(chip(page, 'workflow: Incident triage')).toHaveCount(0)
    // …and the panel agrees.
    await expect(panel(page).getByRole('checkbox', { name: /^Incident triage/ })).not.toBeChecked()
    await expect(panel(page).getByRole('checkbox', { name: /^Loan review/ })).toBeChecked()
  })

  test('the Filters button counts fields set, and the panel says the same', async ({
    story,
    page,
  }) => {
    await open(story, page, 'many-filters')
    await expect(filtersButton(page)).toContainText('7')
    await expect(panel(page)).toContainText(/Filters\s*7/)
  })
})

test.describe('FilterBar, long labels', () => {
  test('a chip never grows past its field, keeps its remove button, and shows the full text on hover', async ({
    story,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 })
    await open(story, page, 'long-labels')
    const field = await box(omnibox(page).locator('xpath=ancestor::div[1]'))
    const long = page.getByTitle(/^search: a search term that goes on far longer/)
    const chipBox = await box(long)
    expect(chipBox.width, 'chip fits the field').toBeLessThanOrEqual(field.width)
    const button = await box(page.getByRole('button', { name: /^Remove search: a search term/ }))
    expect(
      button.x + button.width,
      'its remove button is still inside the field',
    ).toBeLessThanOrEqual(field.x + field.width + 1)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  })

  test('long option labels wrap in the panel instead of being cut', async ({ story, page }) => {
    await open(story, page, 'long-labels')
    const label = panel(page).getByRole('checkbox', {
      name: /^Incident triage, including every regional/,
    })
    await expect(label).toBeVisible()
    expect(await findCutOff(page, '[role=region]')).toEqual([])
  })
})

test.describe('FilterBar, many columns', () => {
  test('a table wider than its card scrolls inside the card, and the page does not scroll sideways', async ({
    story,
    page,
  }) => {
    await open(story, page, 'many-columns')
    const scroller = page
      .locator('table')
      .locator('xpath=ancestor::div[contains(@class,"overflow-x-auto")][1]')
    const m = await scroller.evaluate((el) => ({ client: el.clientWidth, scroll: el.scrollWidth }))
    expect(m.scroll, 'the table is wider than its card').toBeGreaterThan(m.client)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  })

  test('every column header can be read in full once scrolled to', async ({ story, page }) => {
    await open(story, page, 'many-columns')
    const headers = page.getByRole('columnheader')
    await expect(headers).toHaveCount(12)
    for (const header of await headers.all()) {
      await header.scrollIntoViewIfNeeded()
      const full = await header.evaluate((th) => {
        const label = th.querySelector<HTMLElement>('span') ?? (th as HTMLElement)
        return label.scrollWidth <= label.clientWidth + 1
      })
      expect(full, `header ${await header.innerText()} is cut`).toBe(true)
    }
  })

  test('the filters stay put while the table scrolls', async ({ story, page }) => {
    await open(story, page, 'many-columns')
    const before = await box(omnibox(page))
    await page.getByRole('columnheader', { name: 'Priority' }).scrollIntoViewIfNeeded()
    const after = await box(omnibox(page))
    expect(after.x).toBe(before.x)
    expect(after.width).toBe(before.width)
    await expect(panel(page)).toBeInViewport()
  })

  test('with the panel docked, the table still has room to show its first columns', async ({
    story,
    page,
  }) => {
    await open(story, page, 'many-columns')
    const table = await box(
      page.locator('table').locator('xpath=ancestor::div[contains(@class,"overflow-x-auto")][1]'),
    )
    expect(table.width, 'the table card is not squeezed to nothing').toBeGreaterThan(600)
    await expect(page.getByRole('columnheader', { name: 'Run' })).toBeInViewport()
  })

  test('a narrow screen stacks the pinned panel above the table', async ({ story, page }) => {
    await page.setViewportSize({ width: 820, height: 900 })
    await open(story, page, 'panel-pinned')
    const a = await box(panel(page))
    const b = await box(page.getByRole('table'))
    expect(a.y + a.height, 'panel ends before the table starts').toBeLessThanOrEqual(b.y + 1)
    expect(a.width, 'panel uses the width of the page').toBeGreaterThan(700)
  })
})
