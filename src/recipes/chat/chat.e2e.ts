import { expect, test } from '../../../tests/story'

test.describe('Recipes/Chat', () => {
  test('lands on the greeting band with the composer lifted over it, suggestions and pick-up', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat--default')
    const heading = page.getByRole('heading', { level: 1, name: /What should we work on, John\?/ })
    const box = page.getByRole('textbox', { name: 'Message Acme' })
    await expect(heading).toBeVisible()
    const band = (await page.locator('header').filter({ has: heading }).boundingBox())!
    const composer = (await box.boundingBox())!
    // Lifted: the composer starts above the band's bottom edge.
    expect(composer.y).toBeLessThan(band.y + band.height)
    await expect(page.getByRole('group', { name: 'Suggestions' }).getByRole('button')).toHaveCount(
      4,
    )
    const pickUp = page.getByRole('region', { name: 'Pick up where you left off' })
    await expect(pickUp.getByRole('link')).toHaveCount(3)
  })

  test('a suggestion starts the thread: band with its title, notice docked over the composer', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat--default')
    await page
      .getByRole('group', { name: 'Suggestions' })
      .getByRole('button', { name: 'Which sources failed to sync this week?' })
      .click()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Which sources failed to sync this week?' }),
    ).toBeVisible()
    const notice = page.getByText('Acme can make mistakes.', { exact: true })
    await expect(notice).toBeVisible()
    const box = page.getByRole('textbox', { name: 'Message Acme' })
    expect((await box.boundingBox())!.y).toBeGreaterThan((await notice.boundingBox())!.y)
    // The new chat is listed first under Today, and marked.
    const panel = page.getByRole('complementary', { name: 'Chat' })
    await expect(
      panel.getByRole('region', { name: 'Today' }).getByRole('button').first(),
    ).toHaveAccessibleName(/Which sources failed to sync this week\?/)
    // The answer arrives with its follow-ups on the rail.
    await expect(page.getByRole('list', { name: 'Suggested follow-ups' })).toBeVisible({
      timeout: 15_000,
    })
  })

  test('dismissing the notice brings back the disclaimer line', async ({ story, page }) => {
    await story.open('recipes-chat--conversation')
    await page.getByRole('button', { name: 'Dismiss this notice' }).click()
    await expect(page.getByText('Acme can make mistakes.', { exact: true })).toHaveCount(0)
    await expect(
      page.getByText('Acme can make mistakes. Check sources before you act on an answer.'),
    ).toBeVisible()
  })

  test('a past chat shows its thread, the draft as a quote, and follow-ups on the rail', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat--conversation')
    await expect(
      page.getByRole('heading', { level: 2, name: 'Failed syncs this week and who owns them' }),
    ).toBeVisible()
    const quote = page.locator('blockquote').filter({ hasText: 'Hi Dana' })
    await expect(quote).toHaveCSS('font-style', 'italic')
    await expect(page.getByRole('list', { name: 'Suggested follow-ups' })).toBeVisible()
    const panel = page.getByRole('complementary', { name: 'Chat' })
    await expect(
      panel.getByRole('link', { name: /Failed syncs this week and who owns them/ }),
    ).toHaveAttribute('aria-current', 'page')
  })

  test('the Chat panel: search, the days, History, and New chat in its heading', async ({
    story,
    page,
  }) => {
    await story.open('recipes-chat--conversation')
    const panel = page.getByRole('complementary', { name: 'Chat' })
    for (const name of ['Pinned', 'Today', 'Yesterday', 'Previous 7 days']) {
      await expect(panel.getByText(name, { exact: true })).toBeVisible()
    }
    await panel.getByRole('searchbox', { name: 'Search chats' }).fill('runbook')
    await expect(panel.getByRole('link', { name: /Incident runbook/ })).toBeVisible()
    await expect(panel.getByRole('link', { name: /Expense policy/ })).toHaveCount(0)
    await panel.getByRole('searchbox', { name: 'Search chats' }).fill('')

    await panel.getByRole('button', { name: 'New chat' }).click()
    await expect(
      page.getByRole('heading', { level: 1, name: /What should we work on/ }),
    ).toBeVisible()

    await panel.getByRole('link', { name: /^History/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Chat history' })).toBeVisible()
  })

  test('at 1024 the panel starts closed and slides over the page', async ({ story, page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await story.open('recipes-chat--tablet')
    await expect(page.getByRole('complementary', { name: 'Chat' })).toHaveCount(0)
    await page.getByRole('navigation', { name: 'Apps' }).getByRole('link', { name: 'Chat' }).click()
    await expect(page.getByRole('complementary', { name: 'Chat' })).toHaveAttribute(
      'data-overlay',
      'true',
    )
  })
})
