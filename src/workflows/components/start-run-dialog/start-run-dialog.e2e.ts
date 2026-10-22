import type { Locator, Page } from '@playwright/test'
import { expect, test } from '../../../../tests/story'

async function choose(page: Page, within: Locator, label: string, option: string) {
  await within.getByRole('combobox', { name: label }).click()
  await page.getByRole('option', { name: option, exact: true }).click()
}

test.describe('StartRunDialog', () => {
  test('it will not start with a required field empty', async ({ story, page }) => {
    await story.open('workflows-components-start-run-dialog--default')
    const dialog = page.getByRole('dialog', { name: 'Start Commercial loan review' })
    await dialog.getByLabel('Term months').fill('')
    await dialog.getByRole('button', { name: 'Start run' }).click()
    await expect(dialog.getByText('Fill this in to start the run.')).toHaveCount(1)
    await expect(dialog).toContainText('1 required field left')
  })

  test('a filled form starts the run and offers the way to it', async ({ story, page }) => {
    await story.open('workflows-components-start-run-dialog--default')
    await page.getByRole('dialog').getByRole('button', { name: 'Start run' }).click()
    const done = page.getByRole('dialog', { name: 'Run started' })
    await expect(done).toBeVisible()
    await expect(done.getByRole('button', { name: 'Open live run' })).toBeVisible()
  })

  test('with several workflows, picking one swaps in its own form', async ({ story, page }) => {
    await story.open('workflows-components-start-run-dialog--pick-a-workflow')
    const dialog = page.getByRole('dialog', { name: 'Start a workflow' })
    await expect(dialog.getByLabel('Buyer')).toHaveValue('Meridian Health')
    await choose(page, dialog, 'Workflow', 'Employee onboarding')
    await expect(dialog.getByLabel('New hire')).toHaveValue('Priya Raman')
    await expect(dialog.getByLabel('Buyer')).toHaveCount(0)
    await choose(page, dialog, 'Workflow', 'Month-end close')
    await expect(dialog).toContainText('This workflow needs nothing to start.')
  })

  test('a refused start says why above the form', async ({ story, page }) => {
    await story.open('workflows-components-start-run-dialog--refused')
    await expect(page.getByRole('dialog')).toContainText('“analyst” is required')
  })
})
