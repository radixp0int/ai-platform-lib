import { expect, test } from '../../../../tests/story'

test.describe('RunsListPage', () => {
  test('lists one page of ten workflows, each with its stage progress', async ({ story, page }) => {
    await story.open('workflows-recipes-runs-list--runs')
    await expect(page.getByRole('row')).toHaveCount(11)
    await expect(page.getByRole('img', { name: 'Stage 7 of 10 · Approve' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Not started · 9 stages' })).toBeVisible()
  })

  test('opening a row shows the run as a blueprint, and who it is waiting on', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-runs-list--runs')
    await page.getByText('Commercial loan origination', { exact: true }).click()
    await expect(
      page.getByRole('img', { name: 'Commercial loan origination: Stage 7 of 10 · Approve' }),
    ).toBeVisible()
    await expect(page.getByText('Marcus L. · due tomorrow')).toHaveCount(2)
    await expect(page.getByRole('link', { name: 'Open live view' })).toBeVisible()
  })

  test('a status picked from the search field becomes a chip and narrows the table', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-runs-list--runs')
    await page.getByRole('combobox', { name: 'Search and filter workflows' }).click()
    await page.getByRole('button', { name: /^Idle/ }).click()
    await expect(page.getByRole('row')).toHaveCount(2)
    await expect(page.getByText('KYC refresh')).toBeVisible()
    await expect(page.getByText('1–1 of 1')).toBeVisible()
  })

  test('a search that matches nothing says so', async ({ story, page }) => {
    await story.open('workflows-recipes-runs-list--runs')
    const field = page.getByRole('combobox', { name: 'Search and filter workflows' })
    await field.fill('zzz')
    await page.getByRole('option', { name: /Search for/ }).click()
    await expect(page.getByText('No workflows match')).toBeVisible()
  })

  test('“Start a workflow” asks which, then what it needs', async ({ story, page }) => {
    await story.open('workflows-recipes-runs-list--start-a-workflow')
    await page.getByRole('button', { name: 'Start a workflow' }).click()
    const dialog = page.getByRole('dialog', { name: 'Start a workflow' })
    await dialog.getByRole('combobox', { name: 'Workflow' }).click()
    await page.getByRole('option', { name: 'Commercial loan review', exact: true }).click()
    await expect(dialog.getByLabel('Term months')).toBeVisible()
    await dialog.getByRole('button', { name: 'Start run' }).click()
    await expect(page.getByRole('dialog', { name: 'Run started' })).toBeVisible()
  })

  test('inside the shell it sits beside the Workflows menu, and a row still opens the live page', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-runs-list--in-app-shell')
    await expect(page.getByRole('complementary', { name: 'Workflows' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Workflows', level: 1 })).toBeVisible()
    await page.getByText('Commercial loan origination', { exact: true }).click()
    await expect(page.getByRole('link', { name: 'Open live view' })).toHaveAttribute(
      'href',
      '/t/alderfinch-treasury/workflows/live',
    )
  })
})
