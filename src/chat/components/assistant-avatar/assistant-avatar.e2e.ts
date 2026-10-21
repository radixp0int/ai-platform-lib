import { expect, test } from '../../../../tests/story'

test.describe('AssistantAvatar', () => {
  test('it is decorative, so assistive tech skips it', async ({ story }) => {
    const root = await story.open('chat-components-assistantavatar--idle')
    await expect(root.locator('[data-state="idle"]')).toHaveAttribute('aria-hidden', 'true')
  })

  test('it draws at the size it is given', async ({ story }) => {
    const root = await story.open('chat-components-assistantavatar--idle')
    const box = (await root.locator('[data-state]').boundingBox())!
    expect(box.width).toBe(48)
    expect(box.height).toBe(48)
  })

  test('talking moves, and idle stays still', async ({ story }) => {
    let root = await story.open('chat-components-assistantavatar--talking')
    const talking = await root
      .locator('[data-state="talking"]')
      .evaluate((node) => getComputedStyle(node).animationName)
    expect(talking).not.toBe('none')

    root = await story.open('chat-components-assistantavatar--idle')
    const idle = await root
      .locator('[data-state="idle"]')
      .evaluate((node) => getComputedStyle(node).animationName)
    expect(idle).toBe('none')
  })
})
