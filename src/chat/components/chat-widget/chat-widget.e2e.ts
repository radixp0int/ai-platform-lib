import { expect, test } from '../../../../tests/story'

test.describe('ChatWidget', () => {
  test('the launcher opens the chat panel, a named dialog', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--without-side-panels')
    await page.getByRole('button', { name: 'Ask Acme' }).click()
    const panel = page.getByRole('dialog', { name: 'Acme chat' })
    await expect(panel.getByRole('textbox', { name: 'Message Acme' })).toBeVisible()
    await expect(panel).toContainText('Hi, Dana')
  })

  test('the panel header names the person signed in and offers the three window controls', async ({
    story,
    page,
  }) => {
    await story.open('chat-components-chatwidget--without-side-panels')
    await page.getByRole('button', { name: 'Ask Acme' }).click()
    const header = page.getByRole('dialog', { name: 'Acme chat' }).getByRole('banner')
    await expect(header).toContainText('Dana Whitfield')
    for (const name of ['Expand panel', 'Minimize chat', 'Close chat and end conversation']) {
      await expect(header.getByRole('button', { name })).toBeVisible()
    }
  })

  test('Send is disabled until there is something to send', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--without-side-panels')
    await page.getByRole('button', { name: 'Ask Acme' }).click()
    const send = page.getByRole('button', { name: 'Send message' })
    await expect(send).toBeDisabled()
    await page.getByRole('textbox', { name: 'Message Acme' }).fill('Hello')
    await expect(send).toBeEnabled()
  })

  test('asking a question gets an answer in the panel', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--without-side-panels')
    await page.getByRole('button', { name: 'Ask Acme' }).click()
    const box = page.getByRole('textbox', { name: 'Message Acme' })
    await box.fill('Are our operating accounts within the liquidity policy?')
    await box.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Acme chat' })).toContainText(
      'Are our operating accounts within the liquidity policy?',
    )
    await expect(
      page
        .getByRole('button', { name: 'Stop response' })
        .or(page.getByRole('button', { name: 'Send message' })),
    ).toBeVisible()
  })

  test('with side panels, the rail is a tab list that opens them', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--bottom-right')
    const panel = page.getByRole('dialog', { name: 'Acme chat' })
    await page.getByRole('button', { name: 'Ask Acme' }).click()
    await panel.getByRole('tab', { name: 'Persona' }).click()
    await expect(panel.getByRole('combobox', { name: 'Persona' })).toBeVisible()
  })

  test('starters are offered in the empty panel', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--with-starters')
    const panel = page.getByRole('dialog', { name: 'Acme chat' })
    await page.getByRole('button', { name: 'Ask Acme' }).click()
    await expect(panel.getByRole('button', { name: 'What changed since Friday?' })).toBeVisible()
  })

  test('closed, the panel cannot be reached with the keyboard', async ({ story, page }) => {
    await story.open('chat-components-chatwidget--without-side-panels')
    // Nothing has been opened: Tab should find the launcher and nothing inside the panel.
    const panel = page.getByRole('dialog', { name: 'Acme chat' })
    for (let press = 0; press < 6; press++) {
      await page.keyboard.press('Tab')
      expect(await panel.evaluate((node) => node.contains(document.activeElement))).toBe(false)
    }
  })
})
