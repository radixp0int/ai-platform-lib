import { expect, test } from '../../../tests/story'

test.describe('Recipes/Insights', () => {
  test('the range switch redraws the page for that window', async ({ story, page }) => {
    await story.open('recipes-insights--default')
    const range = page.getByRole('group', { name: 'Date range' })
    await expect(range.getByRole('button', { name: '14 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('group', { name: 'Overview, last 14 days' })).toBeVisible()

    await range.getByRole('button', { name: '7 days' }).click()
    await expect(range.getByRole('button', { name: '7 days' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('group', { name: 'Overview, last 7 days' })).toBeVisible()

    await range.getByRole('button', { name: 'Today' }).click()
    await expect(page.getByRole('heading', { name: 'Questions per hour' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Errors by hour' })).toBeVisible()
  })

  test('a custom range is picked in a popover and named on its segment', async ({
    story,
    page,
  }) => {
    await story.open('recipes-insights--default')
    await page.getByRole('button', { name: 'Custom range' }).click()
    const pop = page.getByRole('dialog', { name: 'Custom date range' })
    await expect(pop).toBeVisible()
    await pop.getByRole('button', { name: 'Apply' }).click()
    await expect(pop).toBeHidden()
    await expect(page.getByRole('button', { name: 'Nov 2 – Nov 15' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    // Nothing comes before Oct 26, and Nov 2 – 15 needs the 14 days before it.
    await expect(page.getByText('No earlier data to compare').first()).toBeVisible()
  })

  test('the jump links and tile footers scroll to their sections', async ({ story, page }) => {
    await story.open('recipes-insights--default')
    await page
      .getByRole('navigation', { name: 'Sections on this page' })
      .getByRole('button', { name: /User feedback/ })
      .click()
    await expect(page.getByRole('heading', { level: 2, name: 'User feedback' })).toBeInViewport()

    await page.getByRole('link', { name: /Errors in responses/ }).click()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Errors in responses' }),
    ).toBeInViewport()
  })

  test('a score can be hidden from the chart, but never the last one', async ({ story, page }) => {
    await story.open('recipes-insights--default')
    const legend = page.getByRole('group', { name: 'Show or hide a score' })
    const chart = page.locator('#insights-evaluation [data-chart="line"]')
    await expect(chart.locator('[data-series]')).toHaveCount(3)
    await legend.getByRole('button', { name: /Groundedness/ }).click()
    await expect(legend.getByRole('button', { name: /Groundedness/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await expect(chart.locator('[data-series]')).toHaveCount(2)
    await legend.getByRole('button', { name: /Answer relevance/ }).click()
    await legend.getByRole('button', { name: /Context precision/ }).click()
    await expect(chart.locator('[data-series]')).toHaveCount(1)
  })

  test('a reason filters the comments, and the chip clears it', async ({ story, page }) => {
    await story.open('recipes-insights--default')
    const reasons = page.getByRole('list', { name: 'Reasons picked with a thumbs down' })
    await reasons.getByRole('button', { name: /Too long or unclear/ }).click()
    const comments = page.getByRole('list', { name: 'Comments' })
    await expect(comments.getByRole('listitem')).toHaveCount(1)
    await expect(
      page
        .getByRole('group', { name: 'Show comments' })
        .getByRole('button', { name: 'Not helpful' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Clear the reason filter: Too long or unclear' }).click()
    await expect(comments.getByRole('listitem')).toHaveCount(5)
    await page
      .getByRole('group', { name: 'Show comments' })
      .getByRole('button', { name: 'All' })
      .click()
    await expect(comments.getByRole('listitem')).toHaveCount(8)
  })

  test('an error type opens its examples, and Escape closes them', async ({ story, page }) => {
    await story.open('recipes-insights--default')
    await page.getByRole('button', { name: /^Out-of-date source/ }).click()
    const drawer = page.getByRole('dialog', { name: 'Out-of-date source' })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText('What does the Pro plan cost per seat?')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
  })

  test('a suite opens onto its runs and failing cases', async ({ story, page }) => {
    await story.open('recipes-insights--default')
    const suites = page.getByRole('list', { name: 'Test suites' })
    const pricing = suites.getByRole('button', { name: /^Pricing and plans/ })
    await expect(pricing).toHaveAttribute('aria-expanded', 'true')
    await expect(suites.getByText('Below the 85% target')).toBeVisible()
    await suites.getByRole('button', { name: /^Policy manual/ }).click()
    await expect(pricing).toHaveAttribute('aria-expanded', 'false')
    await expect(suites.getByText('Can contractors claim the home-office allowance?')).toBeVisible()
  })

  test('the Today, Dark and Portrait stories render', async ({ story, page }) => {
    await story.open('recipes-insights--today')
    await expect(page.getByRole('heading', { name: 'Questions per hour' })).toBeVisible()
    await story.open('recipes-insights--dark', { mode: 'dark' })
    await expect(page.getByRole('heading', { level: 1, name: 'Insights' })).toBeVisible()
    await page.setViewportSize({ width: 834, height: 1194 })
    await story.open('recipes-insights--portrait', { mode: 'dark' })
    const wide = await page.evaluate(() => {
      const main = document.querySelector('#insights-evaluation')!
      return main.scrollWidth > main.clientWidth + 1
    })
    expect(wide).toBe(false)
  })
})
