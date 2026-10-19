import { expect, test } from '../../../../tests/story'

test.describe('Chat inside the app shell over a simulated network', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install()
  })

  test('the chat page answers over the wire', async ({ story, page }) => {
    const root = await story.open('chat-recipes-chat-inside-app-shell--simulated-network')
    const box = page.getByRole('textbox', { name: 'Message Acme' })
    await box.fill('How is the market doing?')
    await box.press('Enter')
    await page.clock.runFor(20_000)
    await expect(page.getByRole('button', { name: 'market_snapshot' })).toBeVisible()
    await expect(root).toContainText('There is no urgency to rebalance.')
  })

  test('on a slow connection the turn is still waiting after two seconds', async ({
    story,
    page,
  }) => {
    await story.open('chat-recipes-chat-inside-app-shell--slow-connection')
    const box = page.getByRole('textbox', { name: 'Message Acme' })
    await box.fill('hello')
    await box.press('Enter')
    await page.clock.runFor(2_000)
    await expect(page.getByRole('button', { name: 'Stop response' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Thought for/ })).toHaveCount(0)
  })
})
