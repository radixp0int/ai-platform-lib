import { expect, test } from '../../../tests/story'

test.describe('Settings', () => {
  test('feature toggles are switches grouped under headings', async ({ story, page }) => {
    await story.open('components-settings--toggles')
    await expect(page.getByRole('heading', { name: 'Before you ask' })).toBeVisible()
    const toggle = page.getByRole('switch', { name: /^Tool calls/ })
    await expect(toggle).not.toBeChecked()
    await toggle.click()
    await expect(toggle).toBeChecked()
  })

  test('a locked toggle cannot be changed and says why', async ({ story, page }) => {
    await story.open('components-settings--toggles')
    const locked = page.getByRole('switch', { name: /^Audit trail/ })
    await expect(locked).toBeDisabled()
    await expect(locked).toHaveAccessibleName(/Required by your organisation/)
  })

  test('the palette picker is a radio group, one choice at a time', async ({ story, page }) => {
    await story.open('components-settings--palette')
    const group = page.getByRole('radiogroup', { name: 'Dark palette' })
    await group.getByRole('radio', { name: 'Graphite' }).click()
    await expect(group.getByRole('radio', { name: 'Graphite' })).toBeChecked()
    await expect(group.getByRole('radio', { name: 'Navy' })).not.toBeChecked()
    // The chosen palette's note sits under the cards.
    await expect(page.getByText('Near-neutral charcoal.', { exact: false })).toBeVisible()
  })

  test('the highlight picker offers six swatches, each named', async ({ story, page }) => {
    await story.open('components-settings--highlight')
    const group = page.getByRole('radiogroup', { name: 'Citation highlight' })
    await expect(group.getByRole('radio')).toHaveCount(6)
    await group.getByRole('radio', { name: 'Teal' }).click()
    await expect(group.getByRole('radio', { name: 'Teal' })).toBeChecked()
    // The preview line's mark takes the chosen colour.
    await expect(page.locator('[data-chat-highlight]')).toHaveAttribute(
      'data-chat-highlight',
      'teal',
    )
  })

  test('the theme control offers light, dark and match system', async ({ story, page }) => {
    await story.open('components-settings--theme-mode-story')
    const group = page.getByRole('group', { name: 'Theme' })
    await expect(group.getByRole('button', { name: 'Match system' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await group.getByRole('button', { name: 'Dark' }).click()
    await expect(group.getByRole('button', { name: 'Dark' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('the preview follows the switches beside it', async ({ story, page }) => {
    await story.open('components-settings--preview')
    const preview = page.getByRole('complementary', { name: 'Preview' })
    await expect(preview.getByText('sync_log.read')).toHaveCount(0)
    await page.getByRole('switch', { name: /^Tool calls/ }).click()
    await expect(preview.getByText('sync_log.read')).toBeVisible()
    await page.getByRole('switch', { name: /^Reasoning/ }).click()
    await expect(preview.getByText('Thought for 4s')).toHaveCount(0)
  })

  test('the dialog shell switches section and closes with Done', async ({ story, page }) => {
    await story.open('components-settings--dialog')
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('tab', { name: 'Features' }).click()
    await expect(dialog.getByRole('button', { name: 'Reset to defaults' })).toBeVisible()
    await dialog.getByRole('button', { name: 'Done' }).click()
    await expect(dialog).toBeHidden()
  })
})
