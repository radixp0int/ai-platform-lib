import { expect, test } from '../../../../tests/story'

test.describe('WorkflowsTablePage', () => {
  test('lists one page of ten workflows, each with its stage progress', async ({ story, page }) => {
    await story.open('workflows-recipes-workflows-table--default')
    await expect(page.getByRole('row')).toHaveCount(11)
    await expect(page.getByRole('img', { name: 'Stage 8 of 10 · Review' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Not started · 9 stages' })).toBeVisible()
  })

  test('opening a row shows the run as a blueprint, and who it is waiting on', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-workflows-table--default')
    await page.getByText('RFP response', { exact: true }).click()
    await expect(
      page.getByRole('img', { name: 'RFP response: Stage 8 of 10 · Review' }),
    ).toBeVisible()
    await expect(page.getByText('Kofi A. · due tomorrow')).toHaveCount(2)
    await expect(page.getByRole('link', { name: 'Open live view' })).toBeVisible()
  })

  test('a status picked from the search field becomes a chip and narrows the table', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-workflows-table--default')
    await page.getByRole('combobox', { name: 'Search and filter workflows' }).click()
    await page.getByRole('button', { name: /^Idle/ }).click()
    await expect(page.getByRole('row')).toHaveCount(2)
    await expect(page.getByText('KYC refresh')).toBeVisible()
    await expect(page.getByText('1–1 of 1')).toBeVisible()
  })

  test('a search that matches nothing says so', async ({ story, page }) => {
    await story.open('workflows-recipes-workflows-table--default')
    const field = page.getByRole('combobox', { name: 'Search and filter workflows' })
    await field.fill('zzz')
    await page.getByRole('option', { name: /Search for/ }).click()
    await expect(page.getByText('No workflows match')).toBeVisible()
  })
})
