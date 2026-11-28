import { expect, test } from '../../../tests/story'

test.describe('Recipes/Chat history', () => {
  test('the band has New chat, and the list sits beside the preview', async ({ story, page }) => {
    await story.open('recipes-chat-history--default')
    await expect(page.getByRole('heading', { level: 1, name: 'Chat history' })).toBeVisible()
    await expect(page.getByText(/24 conversations · 2 pinned · most recent first/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'New chat' }).first()).toBeVisible()
    const preview = page.getByRole('region', { name: 'Conversation preview' })
    await expect(
      preview.getByRole('heading', { name: 'Failed syncs this week and who owns them' }),
    ).toBeVisible()
    const list = (await page.getByRole('region', { name: 'Chat list' }).boundingBox())!
    expect((await preview.boundingBox())!.x).toBeGreaterThan(list.x + list.width - 1)
  })

  test('picking a chat previews it; search, when and labels narrow the list', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat-history--default')
    await page.getByRole('button', { name: /Data retention rules by region/ }).click()
    const preview = page.getByRole('region', { name: 'Conversation preview' })
    await expect(
      preview.getByRole('heading', { name: 'Data retention rules by region' }),
    ).toBeVisible()

    await page.getByRole('searchbox', { name: 'Search conversations' }).fill('pricing')
    await expect(page.getByRole('button', { name: /Comparing two pricing sheets/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Partner discount tiers/ })).toHaveCount(0)
    await page.getByRole('searchbox', { name: 'Search conversations' }).fill('')

    const when = page.getByRole('group', { name: 'When' })
    await when.getByRole('button', { name: 'Today' }).click()
    const list = page.getByRole('region', { name: 'Chat list' })
    await expect(list.getByRole('region', { name: 'Yesterday' })).toHaveCount(0)
    await expect(list.getByRole('region', { name: 'Today' })).toBeVisible()
    await when.getByRole('button', { name: 'Any time' }).click()

    await page
      .getByRole('group', { name: 'Show' })
      .getByRole('button', { name: /Shared with me/ })
      .click()
    await expect(page.getByRole('button', { name: /Shared by Priya/ }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Expense policy/ })).toHaveCount(0)
  })

  test('the custom range popover checks its dates, then applies', async ({ story, page }) => {
    await story.open('recipes-chat-history--default')
    await page
      .getByRole('group', { name: 'When' })
      .getByRole('button', { name: 'Custom range' })
      .click()
    const popover = page.getByRole('dialog', { name: 'Custom date range' })
    await expect(popover).toBeVisible()
    await popover.getByRole('button', { name: 'Cancel' }).click()
    await expect(popover).toHaveCount(0)
    await page
      .getByRole('group', { name: 'When' })
      .getByRole('button', { name: 'Custom range' })
      .click()
    await page
      .getByRole('dialog', { name: 'Custom date range' })
      .getByRole('button', { name: 'Apply' })
      .click()
    await expect(page.getByRole('dialog', { name: 'Custom date range' })).toHaveCount(0)
    await expect(page.getByText(/^\d+ of 24 conversations/)).toBeVisible()
    await expect(
      page.getByRole('group', { name: 'When' }).getByRole('button', { pressed: true }),
    ).toHaveText(/–/)
  })

  test('pin, rename, and delete with undo', async ({ story, page }) => {
    await story.open('recipes-chat-history--default')
    await page.getByRole('button', { name: /Expense policy: travel limits/ }).click()
    const preview = page.getByRole('region', { name: 'Conversation preview' })

    await preview.getByRole('button', { name: 'Pin', exact: true }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Pinned to the top' })).toBeVisible()
    await expect(
      page
        .getByRole('region', { name: 'Chat list' })
        .getByRole('region', { name: 'Pinned' })
        .getByRole('button', { name: /Expense policy/ }),
    ).toBeVisible()

    await preview.getByRole('button', { name: 'Rename' }).click()
    await preview.getByRole('textbox', { name: 'Chat title' }).fill('Travel limits, 2026')
    await preview.getByRole('button', { name: 'Save' }).click()
    await expect(preview.getByRole('heading', { name: 'Travel limits, 2026' })).toBeVisible()

    await preview.getByRole('button', { name: 'Delete', exact: true }).click()
    await page
      .getByRole('alertdialog', { name: 'Confirm delete' })
      .getByRole('button', { name: 'Delete chat' })
      .click()
    await expect(page.getByRole('button', { name: /Travel limits, 2026/ })).toHaveCount(0)
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(page.getByRole('button', { name: /Travel limits, 2026/ })).toBeVisible()
  })

  test('a follow-up starts a new chat with that question', async ({ story, page }) => {
    await story.open('recipes-chat-history--default')
    await page
      .getByRole('list', { name: 'Suggested follow-ups' })
      .getByRole('button')
      .first()
      .click()
    await expect(
      page.getByRole('heading', { level: 2, name: /Check the sync log tomorrow/ }),
    ).toBeVisible()
  })

  test('loading shows skeletons and holds the filters', async ({ story, page }) => {
    await story.open('recipes-chat-history--loading')
    await expect(page.getByRole('status', { name: 'Loading your chats' })).toBeVisible()
    await expect(page.getByText('Loading your chats…')).toBeVisible()
  })

  test('an error offers Retry, which loads the list', async ({ story, page }) => {
    await story.open('recipes-chat-history--load-error')
    const alert = page.getByRole('alert').filter({ hasText: 'Couldn’t load your history' })
    await expect(alert).toBeVisible()
    await alert.getByRole('button', { name: 'Retry' }).click()
    await expect(page.getByRole('region', { name: 'Conversation preview' })).toBeVisible()
  })

  test('empty, it offers to start a chat and suggests questions', async ({ story, page }) => {
    await story.open('recipes-chat-history--empty')
    await expect(page.getByRole('heading', { name: 'No chats yet' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start a chat' })).toBeVisible()
    await expect(page.getByRole('list', { name: 'Suggestions' }).getByRole('link')).toHaveCount(3)
    await expect(page.getByRole('searchbox', { name: 'Search conversations' })).toHaveCount(0)
  })

  test('below 900px the list and the preview take turns', async ({ story, page }) => {
    await page.setViewportSize({ width: 834, height: 1112 })
    await story.open('recipes-chat-history--portrait', { mode: 'dark' })
    await expect(page.getByRole('region', { name: 'Conversation preview' })).toHaveCount(0)
    await page.getByRole('button', { name: /Procurement FAQ gaps/ }).click()
    const preview = page.getByRole('region', { name: 'Conversation preview' })
    await expect(preview.getByRole('heading', { name: 'Procurement FAQ gaps' })).toBeVisible()
    await preview.getByRole('button', { name: 'All chats' }).click()
    await expect(page.getByRole('button', { name: /Procurement FAQ gaps/ })).toBeVisible()
  })
})
