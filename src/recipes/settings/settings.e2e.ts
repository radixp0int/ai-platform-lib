import { expect, test } from '../../../tests/story'

test.describe('Recipes/Settings', () => {
  test('the rail Settings item opens the dialog over the chat, on Profile and look', async ({
    story,
    page,
  }) => {
    await story.open('recipes-settings--default')
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'Profile and look' })).toBeVisible()
    // The chat page is behind it.
    await expect(
      page.getByRole('heading', { level: 1, name: /What should we work on/ }),
    ).toBeAttached()
  })

  test('the account menu opens it on Answer features, and the sections switch', async ({
    story,
    page,
  }) => {
    await story.open('recipes-settings--features')
    const dialog = page.getByRole('dialog', { name: 'Settings' })
    await expect(dialog.getByRole('heading', { name: 'Answer features' })).toBeVisible()
    await dialog.getByRole('tab', { name: /Profile and look/ }).click()
    await expect(dialog.getByRole('heading', { name: 'Profile and look' })).toBeVisible()
  })

  test('Done closes it and leaves the chat page', async ({ story, page }) => {
    await story.open('recipes-settings--default')
    await page
      .getByRole('dialog', { name: 'Settings' })
      .getByRole('button', { name: 'Done' })
      .click()
    await expect(page.getByRole('dialog', { name: 'Settings' })).toHaveCount(0)
    await expect(page.getByRole('textbox', { name: 'Message Acme' })).toBeVisible()
  })
})
