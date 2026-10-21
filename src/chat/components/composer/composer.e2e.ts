import { expect, test } from '../../../../tests/story'

test.describe('Composer', () => {
  test('Send is disabled until something is typed', async ({ story, page }) => {
    await story.open('chat-components-composer--docked')
    const send = page.getByRole('button', { name: 'Send message' })
    await expect(send).toBeDisabled()
    await page.getByRole('textbox', { name: 'Message Acme' }).fill('Hello')
    await expect(send).toBeEnabled()
  })

  test('Enter sends and clears; Shift+Enter makes a new line', async ({ story, page }) => {
    await story.open('chat-components-composer--docked')
    const box = page.getByRole('textbox', { name: 'Message Acme' })
    await box.fill('First line')
    await box.press('Shift+Enter')
    await page.keyboard.type('second line')
    await expect(box).toHaveValue('First line\nsecond line')
    await box.press('Enter')
    await expect(box).toHaveValue('')
  })

  test('the box grows with what is typed', async ({ story, page }) => {
    await story.open('chat-components-composer--docked')
    const box = page.getByRole('textbox', { name: 'Message Acme' })
    const before = (await box.boundingBox())!.height
    await box.fill('one\ntwo\nthree\nfour')
    await expect.poll(async () => (await box.boundingBox())!.height).toBeGreaterThan(before)
  })

  test('while an answer streams, Send becomes Stop', async ({ story, page }) => {
    await story.open('chat-components-composer--streaming')
    await expect(page.getByRole('button', { name: 'Stop response' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send message' })).toHaveCount(0)
  })

  test("the suggestions button opens today's questions", async ({ story, page }) => {
    await story.open('chat-components-composer--with-suggestions')
    const button = page.getByRole('button', { name: /^Suggested questions/ })
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('What changed in our cash position since Friday?')).toBeVisible()
  })

  test('disabled, typing is refused', async ({ story, page }) => {
    await story.open('chat-components-composer--disabled')
    await expect(page.getByRole('button', { name: 'Send message' })).toBeDisabled()
  })

  test('the assistant types a suggested question into the empty box', async ({ story, page }) => {
    await story.open('chat-components-composer--ghost-prompt')
    const ghost = page.locator('[data-ghost-prompt]')
    await expect(ghost).toHaveText('What changed in our cash position since Friday?')
    await expect(page.getByText('Tab to use', { exact: true })).toBeVisible()
  })

  test('Tab puts the whole question in the draft', async ({ story, page }) => {
    await story.open('chat-components-composer--ghost-prompt')
    const box = page.getByRole('textbox', { name: 'Message Acme' })
    await expect(box).toHaveAccessibleDescription(
      'Suggestion: What changed in our cash position since Friday?. Press Tab to use it.',
    )
    await box.focus()
    await box.press('Tab')
    await expect(box).toHaveValue('What changed in our cash position since Friday?')
    await expect(box).toBeFocused()
    await expect(page.locator('[data-ghost-prompt]')).toHaveCount(0)
  })

  test('typing hides the suggestion', async ({ story, page }) => {
    await story.open('chat-components-composer--ghost-prompt')
    await expect(page.locator('[data-ghost-prompt]')).toBeVisible()
    await page.getByRole('textbox', { name: 'Message Acme' }).fill('W')
    await expect(page.locator('[data-ghost-prompt]')).toHaveCount(0)
  })

  test('with reduced motion the question appears whole, without typing', async ({
    story,
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await story.open('chat-components-composer--ghost-prompt')
    const ghost = page.locator('[data-ghost-prompt]')
    // Visible at all only once whole: there is no partly typed moment to catch.
    await expect(ghost).toBeVisible()
    await expect(ghost).toHaveText('What changed in our cash position since Friday?')
  })
})
