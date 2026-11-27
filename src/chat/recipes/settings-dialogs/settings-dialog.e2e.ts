import { expect, test } from '../../../../tests/story'

test.describe('Settings dialog', () => {
  test('opens on Profile and look, with the list beside the pane', async ({ story, page }) => {
    await story.open('chat-recipes-settings-dialog--profile-and-look')
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Profile and look' })).toBeVisible()
    await expect(dialog.getByRole('link', { name: /Manage account/ })).toBeVisible()
    await expect(dialog.getByRole('group', { name: 'Theme' })).toBeVisible()
    await expect(dialog.getByRole('radiogroup', { name: 'Dark palette' })).toBeVisible()
    await expect(dialog.getByRole('radiogroup', { name: 'Citation highlight' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Reset appearance' })).toBeVisible()
    await expect(dialog.getByText('Saved', { exact: true })).toBeVisible()

    // Wide: the list is a column to the left of the pane.
    const tab = await dialog.getByRole('tab', { name: 'Answer features' }).boundingBox()
    const heading = await dialog.getByRole('heading', { name: 'Profile and look' }).boundingBox()
    expect(tab!.x).toBeLessThan(heading!.x)
  })

  test('the close button does not open with a focus ring', async ({ story, page }) => {
    await story.open('chat-recipes-settings-dialog--profile-and-look')
    const close = page.getByRole('button', { name: 'Close dialog' })
    await expect(close).toBeVisible()
    await expect(close).not.toBeFocused()
  })

  test('the palette note and highlight preview follow the choice', async ({ story, page }) => {
    await story.open('chat-recipes-settings-dialog--profile-and-look')
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await dialog.getByRole('radio', { name: 'Deep' }).click()
    await expect(dialog.getByText('Deeper and cooler, with pure white headings.')).toBeVisible()
    await dialog.getByRole('radio', { name: 'Violet' }).click()
    await expect(dialog.locator('[data-chat-highlight]')).toHaveAttribute(
      'data-chat-highlight',
      'violet',
    )
    await dialog.getByRole('button', { name: 'Reset appearance' }).click()
    await expect(dialog.getByRole('radio', { name: 'Navy' })).toBeChecked()
    await expect(dialog.getByRole('radio', { name: 'Orange' })).toBeChecked()
  })

  test('choosing Dark puts the page in dark mode', async ({ story, page }) => {
    await story.open('chat-recipes-settings-dialog--profile-and-look')
    await page.getByRole('group', { name: 'Theme' }).getByRole('button', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    await page.getByRole('group', { name: 'Theme' }).getByRole('button', { name: 'Light' }).click()
    await expect(page.locator('html')).toHaveClass(/\blight\b/)
  })

  test('the preview answer follows the feature switches', async ({ story, page }) => {
    await story.open('chat-recipes-settings-dialog--answer-features')
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    const preview = dialog.getByRole('complementary', { name: 'Preview' })
    await expect(preview.getByText('Thought for 4s')).toBeVisible()
    await expect(preview.getByRole('list', { name: 'Suggested follow-ups' })).toBeVisible()

    await dialog.getByRole('switch', { name: /^Reasoning/ }).click()
    await expect(preview.getByText('Thought for 4s')).toHaveCount(0)
    await dialog.getByRole('switch', { name: /^Sources and citations/ }).click()
    await expect(preview.getByRole('group', { name: 'Sources' })).toHaveCount(0)
    await dialog.getByRole('switch', { name: /^Follow-up suggestions/ }).click()
    await expect(preview.getByRole('list', { name: 'Suggested follow-ups' })).toHaveCount(0)

    await dialog.getByRole('button', { name: 'Reset to defaults' }).click()
    await expect(preview.getByText('Thought for 4s')).toBeVisible()
    await expect(preview.getByRole('group', { name: 'Sources' })).toBeVisible()
  })

  test('switching section swaps the pane and the reset', async ({ story, page }) => {
    await story.open('chat-recipes-settings-dialog--profile-and-look')
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await dialog.getByRole('tab', { name: 'Answer features' }).click()
    await expect(dialog.getByRole('heading', { name: 'Answer features' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Reset to defaults' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Reset appearance' })).toHaveCount(0)
  })

  test('Done closes the dialog', async ({ story, page }) => {
    await story.open('chat-recipes-settings-dialog--profile-and-look')
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await dialog.getByRole('button', { name: 'Done' }).click()
    await expect(dialog).toBeHidden()
    await page.getByRole('button', { name: 'Open settings' }).click()
    await expect(dialog).toBeVisible()
  })

  test('below 900px the list becomes a row of tabs above the pane', async ({ story, page }) => {
    await page.setViewportSize({ width: 834, height: 1112 })
    await story.open('chat-recipes-settings-dialog--answer-features')
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    const look = await dialog.getByRole('tab', { name: 'Profile and look' }).boundingBox()
    const features = await dialog.getByRole('tab', { name: 'Answer features' }).boundingBox()
    const heading = await dialog.getByRole('heading', { name: 'Answer features' }).boundingBox()
    expect(Math.abs(look!.y - features!.y)).toBeLessThan(2)
    expect(features!.x).toBeGreaterThan(look!.x)
    expect(heading!.y).toBeGreaterThan(features!.y + features!.height)
    await expect(dialog.getByText('Saved on this device.', { exact: false })).toBeHidden()
  })

  test('dark mode renders without errors', async ({ story, page }) => {
    await story.open('chat-recipes-settings-dialog--dark', { mode: 'dark' })
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible()
  })
})
