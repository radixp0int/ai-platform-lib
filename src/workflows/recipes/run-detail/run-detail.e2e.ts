import type { Page } from '@playwright/test'
import { expect, test } from '../../../../tests/story'

/** A stage's tile. The step cards are buttons too, and some share a name with their stage. */
const stage = (page: Page, name: string) =>
  page.getByRole('group', { name: 'Stages' }).getByRole('button', { name: new RegExp(`^${name}`) })

test.describe('RunDetailPage', () => {
  test('opens on the stage and step the run is waiting at', async ({ story, page }) => {
    await story.open('workflows-recipes-run-detail--waiting-on-a-person')
    await expect(
      page.getByRole('heading', {
        name: 'Commercial loan review · Harbor Street Bakery · $450,000',
        level: 1,
      }),
    ).toBeVisible()
    await expect(page.getByText('Waiting on Dana Whitfield')).toBeVisible()
    await expect(stage(page, 'Approve')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('heading', { name: 'Approve credit memo', level: 2 })).toBeVisible()
  })

  test('picking a stage lists its steps and opens the one that matters', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-run-detail--a-failure-that-did-not-stop-the-run')
    await stage(page, 'Analyze').click()
    await expect(page.getByText('Analyze · 2 steps')).toBeVisible()
    await stage(page, 'Gather').click()
    // The failed step is the one a reader came for.
    await expect(page.getByRole('heading', { name: 'credit_bureau.pull', level: 2 })).toBeVisible()
    await expect(page.getByText('Failed, and the run kept going')).toBeVisible()
  })

  test('picking another step opens it on the trace tab, not the tab the last one was left on', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-run-detail--waiting-on-a-person')
    await stage(page, 'Analyze').click()
    await page.getByRole('tab', { name: 'Raw span' }).click()
    await expect(page.getByText('"span_id": "risk"')).toBeVisible()
    await page.getByRole('button', { name: /^Draft credit memo/ }).click()
    await expect(page.getByRole('heading', { name: 'Draft credit memo', level: 2 })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Trace' })).toHaveAttribute('aria-selected', 'true')
  })

  test('can be opened straight onto a step', async ({ story, page }) => {
    await story.open('workflows-recipes-run-detail--an-agent-at-work')
    await expect(page.getByRole('heading', { name: 'Draft credit memo', level: 2 })).toBeVisible()
    await expect(stage(page, 'Analyze')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('Write the memo')).toBeVisible()
  })

  test('inside the shell it keeps the workflows menu beside it', async ({ story, page }) => {
    await story.open('workflows-recipes-run-detail--inside-app-shell')
    await expect(page.getByRole('complementary', { name: 'Workflows' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Open live view' })).toHaveAttribute(
      'href',
      '/t/alderfinch-treasury/workflows/live',
    )
  })

  test('the trail goes back to the workflow and to the list of workflows', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-run-detail--inside-app-shell')
    const trail = page.getByRole('navigation', { name: 'Breadcrumb' })
    await trail.getByRole('link', { name: 'Commercial loan review' }).click()
    await expect(
      page.getByRole('heading', { name: 'Commercial loan review', level: 1 }),
    ).toBeVisible()
    await page
      .getByRole('navigation', { name: 'Breadcrumb' })
      .getByRole('link', { name: 'Workflows' })
      .click()
    await expect(page.getByRole('heading', { name: 'Workflows', level: 1 })).toBeVisible()
  })
})
