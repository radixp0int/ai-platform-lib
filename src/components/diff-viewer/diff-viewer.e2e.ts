import { expect, test } from '../../../tests/story'

test.describe('DiffViewer', () => {
  test('it counts what was added and removed', async ({ story }) => {
    const root = await story.open('components-diffviewer--split')
    await expect(root).toContainText(/Added\s*\+\d+/)
    await expect(root).toContainText(/Removed\s*−\d+/)
  })

  test('the layout switch moves between split and unified', async ({ story, page }) => {
    await story.open('components-diffviewer--split')
    const layout = page.getByRole('group', { name: 'Layout' })
    await expect(layout.getByRole('button', { name: 'split' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await layout.getByRole('button', { name: 'unified' }).click()
    await expect(layout.getByRole('button', { name: 'unified' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(layout.getByRole('button', { name: 'split' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('Next and Previous step through the changes', async ({ story, page }) => {
    const root = await story.open('components-diffviewer--json')
    await expect(root).toContainText(/Change 1 of \d+/)
    await page.getByRole('button', { name: 'Next change' }).click()
    await expect(root).toContainText(/Change 2 of \d+/)
    await page.getByRole('button', { name: 'Previous change' }).click()
    await expect(root).toContainText(/Change 1 of \d+/)
  })

  test('folded unchanged lines can be shown', async ({ story, page }) => {
    await story.open('components-diffviewer--hide-unchanged')
    const folds = page.getByRole('button', { name: /^Show \d+ unchanged lines$/ })
    const before = await folds.count()
    await folds.first().click()
    await expect(folds).toHaveCount(before - 1)
  })

  test('identical inputs have no changes to step through', async ({ story, page }) => {
    await story.open('components-diffviewer--identical')
    await expect(page.getByRole('button', { name: 'Next change' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Previous change' })).toBeDisabled()
  })

  test('an editable side is a textbox, and editing it enables Reset', async ({ story, page }) => {
    await story.open('components-diffviewer--editable')
    const reset = page.getByRole('button', { name: 'Reset text' })
    await expect(reset).toBeDisabled()
    const modified = page.getByRole('textbox', { name: 'Modified' })
    await modified.click()
    await page.keyboard.type('x')
    await expect(reset).toBeEnabled()
  })

  test('disabled disables every control', async ({ story, page }) => {
    await story.open('components-diffviewer--disabled')
    for (const button of await page.getByRole('button').all()) await expect(button).toBeDisabled()
  })

  test('without controls it is the diff alone', async ({ story, page }) => {
    await story.open('components-diffviewer--no-controls')
    await expect(page.getByRole('group', { name: 'Layout' })).toHaveCount(0)
  })
})
