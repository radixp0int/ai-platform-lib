import { expect, test } from '../../../../tests/story'

test.describe('HowItGotHere', () => {
  test('the trail is an ordered list, one entry per thing that happened', async ({ story }) => {
    const root = await story.open('workflows-components-how-it-got-here--default')
    await expect(root.locator('ol > li')).toHaveCount(8)
    await expect(root.locator('ol > li').first()).toContainText('Application received')
  })

  test('each entry shows when it happened and how long it took', async ({ story }) => {
    const root = await story.open('workflows-components-how-it-got-here--default')
    await expect(root.locator('ol > li').nth(1)).toHaveText(/0:04\s*Intake agent\s*44s/)
  })

  test('times are in a fixed-width face so the column lines up', async ({ story }) => {
    const root = await story.open('workflows-components-how-it-got-here--long-trail')
    const starts = await root
      .locator('ol > li > span:first-child')
      .evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().width))
    expect(new Set(starts).size).toBe(1)
  })

  test('a single entry is still a list', async ({ story }) => {
    const root = await story.open('workflows-components-how-it-got-here--single-entry')
    await expect(root.locator('ol > li')).toHaveCount(1)
  })
})
