import { expect, test } from '../../../../tests/story'

test.describe('WorkflowDetailPage', () => {
  test('names the workflow, who owns it, and what starts a run', async ({ story, page }) => {
    await story.open('workflows-recipes-workflow-detail--overview')
    await expect(
      page.getByRole('heading', { name: 'Commercial loan review', level: 1 }),
    ).toBeVisible()
    await expect(page.getByText('Dana Whitfield', { exact: true }).first()).toBeVisible()
    await expect(
      page.getByText('a completed application is posted from the loan portal'),
    ).toBeVisible()
    await expect(page.getByText('5 stages · 12 steps')).toBeVisible()
  })

  test('a banner opens the run in progress, and says who it is waiting on', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-workflow-detail--overview')
    const banner = page.getByRole('link', { name: /Live run · Harbor Street Bakery/ })
    await expect(banner).toContainText('waiting on Dana W.')
    await expect(banner).toHaveAttribute('href', '#live')
  })

  test('has no banner when nothing is running', async ({ story, page }) => {
    await story.open('workflows-recipes-workflow-detail--no-live-run')
    await expect(page.getByRole('link', { name: /Live run/ })).toHaveCount(0)
  })

  test('the Overview shows the shape, what a run needs, and what each stage does', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-workflow-detail--overview')
    await expect(
      page.getByRole('img', { name: 'Commercial loan review: 5 stages, 12 steps' }),
    ).toBeVisible()
    await expect(page.getByRole('list', { name: 'Inputs' })).toBeVisible()
    await expect(page.getByRole('list', { name: 'Outputs' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'What each stage does' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Who decides' })).toBeVisible()
  })

  test('tabs switch between Overview, Runs and Versions', async ({ story, page }) => {
    await story.open('workflows-recipes-workflow-detail--overview')
    await page.getByRole('tab', { name: /^Runs/ }).click()
    await expect(page.getByText('Ridgeline Dental · $220,000')).toBeVisible()
    await page.getByRole('tab', { name: /^Versions/ }).click()
    await expect(page.getByText('Changes start as a draft of')).toBeVisible()
    await page.getByRole('tab', { name: 'Overview' }).click()
    await expect(page.getByRole('heading', { name: 'Shape' })).toBeVisible()
  })

  test('"Start a run" opens the start form, filled in', async ({ story, page }) => {
    await story.open('workflows-recipes-workflow-detail--overview')
    await page.getByRole('button', { name: 'Start a run' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByLabel('applicant')).toHaveValue('Harbor Street Bakery LLC')
  })

  test('walks from the list to the workflow to a run’s trace, inside the shell', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-runs-list--in-app-shell')
    // The menu's Recently viewed lists it too, so open the row in the table.
    await page.getByRole('table').getByText('Commercial loan review', { exact: true }).click()
    await page.getByRole('link', { name: 'Workflow details' }).click()
    await expect(
      page.getByRole('heading', { name: 'Commercial loan review', level: 1 }),
    ).toBeVisible()
    await page.getByRole('tab', { name: /^Runs/ }).click()
    // Only the run in progress has a trace; the finished runs are plain rows.
    await expect(page.getByRole('link', { name: /Ridgeline Dental/ })).toHaveCount(0)
    await page
      .getByRole('link', { name: /Harbor Street Bakery/ })
      .last()
      .click()
    await expect(
      page.getByRole('heading', {
        name: 'Commercial loan review · Harbor Street Bakery · $450,000',
        level: 1,
      }),
    ).toBeVisible()
  })
})
