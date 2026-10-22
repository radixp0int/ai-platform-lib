import { expect, test } from '../../../../tests/story'

test.describe('RunInputsForm', () => {
  test('it waits for an attempt before showing what is missing', async ({ story, page }) => {
    const root = await story.open('workflows-components-run-inputs-form--default')
    await expect(root).toContainText('5 required fields left')
    await expect(page.getByText('Fill this in to start the run.')).toHaveCount(0)

    await page.getByRole('button', { name: 'Start run' }).click()
    await expect(page.getByText('Fill this in to start the run.')).toHaveCount(5)
    await expect(page.getByLabel('Applicant')).toHaveAttribute('aria-invalid', 'true')
  })

  test('the count falls as required fields are filled, and optional ones do not count', async ({
    story,
    page,
  }) => {
    const root = await story.open('workflows-components-run-inputs-form--default')
    await page.getByLabel('Applicant').fill('Harbor Street Bakery LLC')
    await page.getByLabel('Amount').fill('$450,000')
    await expect(root).toContainText('3 required fields left')
    await page.getByLabel('Guarantors').fill('Maria Okonjo')
    await expect(root).toContainText('3 required fields left')
  })

  test('a filled form is ready to start', async ({ story }) => {
    const root = await story.open('workflows-components-run-inputs-form--prefilled')
    await expect(root).toContainText('Ready to start')
  })

  test('each type gets its own kind of field', async ({ story, page }) => {
    await story.open('workflows-components-run-inputs-form--every-type')
    await expect(page.getByRole('textbox', { name: 'Applicant' })).toBeVisible()
    await expect(page.getByLabel('Term months')).toHaveAttribute('inputmode', 'numeric')
    await expect(page.getByLabel('Amount')).toHaveAttribute('inputmode', 'decimal')
    await expect(page.getByRole('combobox', { name: 'Severity' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Reviewer' })).toHaveText('Choose a person')
    await expect(page.getByRole('switch', { name: 'Notify buyer' })).toBeVisible()
    await expect(page.getByLabel('Guarantors')).toHaveAttribute('placeholder', 'One per line')
  })

  test('a file input sends the chosen file’s name', async ({ story, page }) => {
    const root = await story.open('workflows-components-run-inputs-form--every-type')
    await expect(root).toContainText('No file chosen')
    await page.getByLabel('Application').setInputFiles({
      name: 'Harbor_Street_application.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    })
    await expect(root).toContainText('Harbor_Street_application.pdf')
  })

  test('a workflow with no inputs says so and can still start', async ({ story, page }) => {
    const root = await story.open('workflows-components-run-inputs-form--nothing-to-fill')
    await expect(root).toContainText('This workflow needs nothing to start.')
    await expect(page.getByRole('button', { name: 'Start run' })).toBeEnabled()
  })

  test('while starting, the button is held', async ({ story, page }) => {
    await story.open('workflows-components-run-inputs-form--busy')
    await expect(page.getByRole('button', { name: 'Starting…' })).toBeDisabled()
  })
})
