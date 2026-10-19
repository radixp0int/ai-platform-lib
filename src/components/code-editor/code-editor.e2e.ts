import { expect, test } from '../../../tests/story'

test.describe('CodeEditor', () => {
  test('it is a textbox named by its file, and takes typing', async ({ story, page }) => {
    await story.open('components-codeeditor--display-options')
    const editor = page.getByRole('textbox', { name: 'system-prompt.txt' })
    await editor.click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('Answer briefly.')
    await expect(editor).toHaveValue('Answer briefly.')
  })

  test('Tab indents instead of leaving, and Escape then Tab leaves', async ({ story, page }) => {
    await story.open('components-codeeditor--display-options')
    const editor = page.getByRole('textbox', { name: 'system-prompt.txt' })
    await editor.click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.press('Delete')
    await page.keyboard.press('Tab')
    await expect(editor).toBeFocused()
    await expect(editor).toHaveValue(/^\s+$/)
    await page.keyboard.press('Escape')
    await page.keyboard.press('Tab')
    await expect(editor).not.toBeFocused()
  })

  test('a syntax error marks the editor invalid and is reported in words', async ({
    story,
    page,
  }) => {
    const root = await story.open('components-codeeditor--invalid')
    await expect(page.getByRole('textbox', { name: 'broken.json' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await expect(root).not.toContainText('No problems')
  })

  test('read only and disabled are different things', async ({ story, page }) => {
    await story.open('components-codeeditor--read-only')
    const readOnly = page.getByRole('textbox', { name: 'persona.json, read only' })
    await expect(readOnly).toBeEnabled()
    await expect(readOnly).toHaveAttribute('readonly', '')
    await story.open('components-codeeditor--disabled')
    await expect(page.getByRole('textbox', { name: 'persona.json' })).toBeDisabled()
  })

  test('find opens a search bar and Escape closes it', async ({ story, page }) => {
    await story.open('components-codeeditor--playground')
    await page.getByRole('button', { name: 'Find in editor' }).click()
    const find = page.getByRole('searchbox', { name: 'Find' })
    await expect(find).toBeFocused()
    await find.fill('persona')
    await expect(page.getByRole('button', { name: 'Next match' })).toBeEnabled()
    await page.keyboard.press('Escape')
    await expect(find).toBeHidden()
  })

  test('the options menu toggles line wrapping', async ({ story, page }) => {
    await story.open('components-codeeditor--playground')
    await page.getByRole('button', { name: 'Editor options' }).click()
    const options = page.getByRole('dialog', { name: 'Editor options' })
    const first = options.getByRole('switch').first()
    const before = await first.isChecked()
    await first.click()
    expect(await first.isChecked()).toBe(!before)
  })

  test('a wizard can gate its Next button on the editor being valid', async ({ story, page }) => {
    await story.open('components-codeeditor--wizard-gate')
    const editor = page.getByRole('textbox', { name: 'Wizard configuration' })
    await expect(editor).toHaveAttribute('aria-invalid', 'true')
    await editor.click()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.type('{ "enabled": true }')
    await expect(editor).not.toHaveAttribute('aria-invalid', 'true')
  })
})
