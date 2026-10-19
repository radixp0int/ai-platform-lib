import type { Page } from '@playwright/test'
import { expect, test } from '../../../tests/story'

// The endpoint behind these stories answers on a timer (600ms a page), so the
// clock is installed before the story loads and each test decides how much
// time passes. At 1280×800 one page of twelve cards does not fill the screen.
const list = (page: Page) => page.getByRole('list', { name: 'Conversations' })
const cards = (page: Page) => list(page).getByRole('link')
const searchBox = (page: Page) => page.getByRole('searchbox', { name: 'Search conversations' })
const period = (page: Page, name: string) =>
  page.getByRole('tablist', { name: 'Last updated' }).getByRole('tab', { name })
const titles = (page: Page) => cards(page).allInnerTexts()
/** Every card's "updated" moment, as the `<time>` records it. */
const updatedTimes = (page: Page) =>
  list(page)
    .locator('li:not([aria-hidden]) time')
    .evaluateAll((times) =>
      times
        .filter((_, index) => index % 2 === 0)
        .map((time) => Date.parse(time.getAttribute('datetime')!)),
    )
const summary = (page: Page) => page.getByRole('banner')
const scrollToEnd = (page: Page) =>
  page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))

/** Lets one request finish. */
const arrive = (page: Page) => page.clock.runFor(600)

/** Waits for the tail to ask for a page, then lets that page arrive. */
async function nextPage(page: Page) {
  await expect(page.getByRole('status')).toHaveText('Loading more conversations…')
  await arrive(page)
}

/**
 * The first page, then the second the tail asks for because the first does not
 * fill the screen. Each step is waited for: the tail asks a frame after the
 * cards are drawn, and time moved before then would move for nobody.
 */
async function fillScreen(page: Page) {
  await arrive(page)
  await expect(cards(page)).toHaveCount(12)
  await nextPage(page)
  await expect(cards(page)).toHaveCount(24)
}

test.describe('Chat history page', () => {
  test.beforeEach(async ({ page }) => {
    // Mid-afternoon on a fixed day, so "the last 7 days" is the same seven
    // days whenever the tests run.
    await page.clock.install({ time: new Date('2026-10-07T15:00:00') })
  })

  test('a card is a link with a title, when it was updated and when it was created', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat-history-page--history')
    await expect(page.getByRole('heading', { level: 1, name: 'Chat history' })).toBeVisible()
    await expect(summary(page)).toContainText('Loading your conversations…')
    await expect(cards(page)).toHaveCount(0)

    await arrive(page)
    const first = list(page).getByRole('listitem').first()
    await expect(
      first.getByRole('heading', {
        level: 2,
        name: 'Positive pay exceptions before the 2pm cutoff',
      }),
    ).toBeVisible()
    await expect(first.getByRole('link')).toHaveAttribute('href', '#/chat/chat-001')
    const [updated, created] = [first.locator('time').nth(0), first.locator('time').nth(1)]
    await expect(first.getByRole('term')).toHaveText(['Updated', 'Created'])
    await expect(updated).toHaveText('12 minutes ago')
    await expect(created).toHaveText(/^[A-Z][a-z]{2} \d{1,2}, \d{4}$/)
    await expect(updated).toHaveAttribute('datetime', /^\d{4}-\d\d-\d\dT/)
    await expect(created).toHaveAttribute('datetime', /^\d{4}-\d\d-\d\dT/)
  })

  test('a screen taller than one page is filled without a scroll', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--history')
    await arrive(page)
    await expect(cards(page)).toHaveCount(12)
    await expect(page.getByRole('status')).toHaveText('Loading more conversations…')

    await arrive(page)
    await expect(cards(page)).toHaveCount(24)
    await expect(summary(page)).toContainText('Showing 24 of 60 conversations')

    // Now the end is below the fold, and it waits to be scrolled to.
    await page.clock.runFor(3_000)
    await expect(cards(page)).toHaveCount(24)
  })

  test('scrolling loads page after page until every conversation is shown, once each', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat-history-page--history')
    await fillScreen(page)
    for (const count of [36, 48, 60]) {
      await expect(cards(page)).toHaveCount(count - 12)
      await scrollToEnd(page)
      await nextPage(page)
      await expect(cards(page)).toHaveCount(count)
    }

    await expect(summary(page)).toContainText('60 conversations, most recently updated first.')
    await expect(page.getByText('That is every conversation.')).toBeVisible()
    await expect(page.getByRole('button', { name: /Load more/ })).toHaveCount(0)

    const hrefs = await cards(page).evaluateAll((links) => links.map((a) => a.getAttribute('href')))
    expect(new Set(hrefs).size).toBe(60)
  })

  test('placeholders stand in for the cards that are on their way', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--slow-connection')
    await expect(list(page)).toHaveAttribute('aria-busy', 'true')
    await expect(list(page).locator('li[aria-hidden]')).toHaveCount(12)

    await page.clock.runFor(2_500)
    await expect(cards(page)).toHaveCount(12)
  })

  test('a page that fails keeps the cards already shown and retries the same page', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat-history-page--page-fails')
    await fillScreen(page)

    await scrollToEnd(page)
    await nextPage(page)
    await expect(page.getByRole('alert')).toHaveText('The next conversations could not be loaded.')
    await expect(cards(page)).toHaveCount(24)

    // Scrolling again does not hammer a failing endpoint.
    await page.evaluate(() => window.scrollTo(0, 0))
    await scrollToEnd(page)
    await page.clock.runFor(3_000)
    await expect(cards(page)).toHaveCount(24)

    await page.getByRole('button', { name: 'Try again' }).click()
    await arrive(page)
    await expect(cards(page)).toHaveCount(36)
    await expect(cards(page).nth(24)).toHaveAttribute('href', '#/chat/chat-025')
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('when nothing can be loaded the failure takes the place of the list', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat-history-page--unreachable')
    await arrive(page)
    const alert = page.getByRole('alert')
    await expect(alert).toContainText('Your conversations could not be loaded')
    await expect(list(page)).toHaveCount(0)

    await alert.getByRole('button', { name: 'Try again' }).click()
    await expect(list(page)).toHaveAttribute('aria-busy', 'true')
  })

  test('no conversations is its own state, with a way to start one', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--empty')
    await arrive(page)
    await expect(page.getByRole('heading', { name: 'Nothing here yet' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start a conversation' })).toBeVisible()
  })

  test('fewer conversations than one page ends at once', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--single-page')
    await arrive(page)
    await expect(cards(page)).toHaveCount(5)
    await expect(page.getByText('That is every conversation.')).toBeVisible()
    await expect(summary(page)).toContainText('5 conversations')
  })

  test('with loading on scroll off, only the button fetches', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--button-only')
    await arrive(page)
    await page.clock.runFor(3_000)
    await expect(cards(page)).toHaveCount(12)

    await page.getByRole('button', { name: 'Load more conversations' }).click()
    await arrive(page)
    await expect(cards(page)).toHaveCount(24)
  })

  test('one column on a phone, and it still loads on scroll', async ({ story, page }) => {
    await page.setViewportSize({ width: 390, height: 780 })
    await story.open('recipes-chat-history-page--history')
    await arrive(page)
    await expect(cards(page)).toHaveCount(12)
    const [a, b] = await Promise.all([
      cards(page).nth(0).boundingBox(),
      cards(page).nth(1).boundingBox(),
    ])
    expect(b!.y).toBeGreaterThan(a!.y)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)

    await scrollToEnd(page)
    await nextPage(page)
    await expect(cards(page)).toHaveCount(24)
  })
})

test.describe('Chat history page: search and the date filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-07T15:00:00') })
  })

  test('typing searches the whole history once the typing stops', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--history')
    await fillScreen(page)

    await searchBox(page).fill('wire')
    // Not yet: the request waits for a pause, so a word is one request.
    await page.clock.runFor(200)
    await expect(cards(page)).toHaveCount(24)

    await page.clock.runFor(100)
    await expect(summary(page)).toContainText('Searching your conversations…')
    await expect(list(page)).toHaveAttribute('aria-busy', 'true')

    await arrive(page)
    await expect(summary(page)).toContainText('4 matching conversations')
    // Two of the four were never loaded: the search ran on the server.
    expect(await titles(page)).toEqual([
      'Wire cutoff times by currency',
      'Setting up dual approval for wires',
      'Wire recall after a mistyped beneficiary',
      'SWIFT fees on incoming international wires',
    ])
    await expect(cards(page).first().locator('mark')).toHaveText('Wire')
    await expect(page.getByText('That is every match.')).toBeVisible()
    await expect(searchBox(page)).toBeFocused()
  })

  test('Enter sends the search without waiting', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--history')
    await arrive(page)
    await searchBox(page).fill('escrow')
    await searchBox(page).press('Enter')
    await expect(summary(page)).toContainText('Searching your conversations…')
    await arrive(page)
    await expect(cards(page)).toHaveCount(1)
    await expect(summary(page)).toContainText('1 matching conversation,')
  })

  test('an answer to an earlier search never replaces a later one', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--slow-connection')
    await searchBox(page).fill('wire')
    await page.clock.runFor(300)
    // "wire" is now in flight, 2.5s from arriving. Ask for something else.
    await page.clock.runFor(1_000)
    await searchBox(page).fill('ACH')
    await page.clock.runFor(300)
    await page.clock.runFor(1_600)
    await expect(cards(page)).toHaveCount(0)

    await page.clock.runFor(1_000)
    await expect(summary(page)).toContainText('4 matching conversations')
    for (const title of await titles(page)) expect(title).toContain('ACH')
  })

  test('the tabs narrow the history to the last 7 or 14 days', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--history')
    await arrive(page)
    await expect(period(page, 'Any time')).toHaveAttribute('aria-selected', 'true')

    await period(page, 'Last 7 days').click()
    await arrive(page)
    await expect(summary(page)).toContainText('of 44 matching conversations')

    await period(page, 'Last 14 days').click()
    await arrive(page)
    await expect(summary(page)).toContainText('of 50 matching conversations')

    await period(page, 'Any time').click()
    await arrive(page)
    await expect(summary(page)).toContainText('of 60 conversations')
  })

  test('the tabs work from the keyboard', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--history')
    await arrive(page)
    await period(page, 'Any time').focus()
    await page.keyboard.press('ArrowRight')
    await expect(period(page, 'Last 7 days')).toHaveAttribute('aria-selected', 'true')
    await arrive(page)
    await expect(summary(page)).toContainText('of 44 matching conversations')
  })

  test('a filtered list still loads page after page, to the last match', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat-history-page--history')
    await arrive(page)
    await period(page, 'Last 7 days').click()
    await fillScreen(page)
    for (const count of [36, 44]) {
      await expect(cards(page)).toHaveCount(count === 36 ? 24 : 36)
      await scrollToEnd(page)
      await nextPage(page)
      await expect(cards(page)).toHaveCount(count)
    }
    await expect(page.getByText('That is every match.')).toBeVisible()

    const weekAgo = new Date('2026-10-01T00:00:00').getTime()
    for (const updated of await updatedTimes(page)) expect(updated).toBeGreaterThanOrEqual(weekAgo)
  })

  test('a custom range is picked on a calendar and applied to the request', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat-history-page--history')
    await arrive(page)
    await expect(page.getByRole('button', { name: /Updated between/ })).toHaveCount(0)

    await period(page, 'Custom range').click()
    // No dates yet, so nothing is filtered yet.
    await arrive(page)
    await expect(summary(page)).toContainText('of 60 conversations')

    await page.getByRole('button', { name: /Updated between/ }).click()
    const calendar = page.getByRole('dialog')
    // Tomorrow cannot have been updated yet.
    await expect(calendar.getByRole('gridcell', { name: /October 8th, 2026/ })).toBeDisabled()
    await calendar.getByRole('gridcell', { name: /October 1st, 2026/ }).click()
    await calendar.getByRole('gridcell', { name: /October 3rd, 2026/ }).click()
    await calendar.getByRole('button', { name: 'Apply' }).click()

    await arrive(page)
    await expect(summary(page)).toContainText('5 matching conversations')
    const from = new Date('2026-10-01T00:00:00').getTime()
    const to = new Date('2026-10-04T00:00:00').getTime()
    const updated = await updatedTimes(page)
    expect(updated).toHaveLength(5)
    for (const moment of updated) {
      expect(moment).toBeGreaterThanOrEqual(from)
      expect(moment).toBeLessThan(to)
    }

    // The range is kept while a preset is tried, and is there on the way back.
    await period(page, 'Last 7 days').click()
    await arrive(page)
    await period(page, 'Custom range').click()
    await arrive(page)
    await expect(summary(page)).toContainText('5 matching conversations')
  })

  test('search and a date filter combine, and nothing matching says what was asked', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat-history-page--history')
    await arrive(page)
    await searchBox(page).fill('wire')
    await searchBox(page).press('Enter')
    await period(page, 'Last 7 days').click()
    await arrive(page)
    await expect(summary(page)).toContainText('3 matching conversations')

    await searchBox(page).fill('zebra')
    await searchBox(page).press('Enter')
    await arrive(page)
    await expect(page.getByRole('heading', { name: 'No conversations match' })).toBeVisible()
    await expect(
      page.getByText('Nothing with “zebra” in its title was updated in the last 7 days.'),
    ).toBeVisible()

    await page.getByRole('button', { name: 'Clear search and filters' }).click()
    await expect(searchBox(page)).toHaveValue('')
    await expect(period(page, 'Any time')).toHaveAttribute('aria-selected', 'true')
    await arrive(page)
    await expect(summary(page)).toContainText('of 60 conversations')
  })

  test('changing the filter from deep in the list returns to the top of it', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat-history-page--history')
    await fillScreen(page)
    await scrollToEnd(page)
    await nextPage(page)
    await expect(cards(page)).toHaveCount(36)
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(400)

    // The search and the tabs stay in reach while the list scrolls.
    await expect(searchBox(page)).toBeInViewport()
    await period(page, 'Last 14 days').click()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    await arrive(page)
    await expect(cards(page).first()).toBeInViewport()
  })

  test('a history with nothing in it offers nothing to search', async ({ story, page }) => {
    await story.open('recipes-chat-history-page--empty')
    await expect(searchBox(page)).toBeVisible()
    await arrive(page)
    await expect(page.getByRole('heading', { name: 'Nothing here yet' })).toBeVisible()
    await expect(searchBox(page)).toHaveCount(0)
  })

  test('on a phone the tabs scroll sideways instead of widening the page', async ({
    story,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 780 })
    await story.open('recipes-chat-history-page--history')
    await arrive(page)
    await period(page, 'Custom range').click()
    await expect(page.getByRole('button', { name: /Updated between/ })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })
})
