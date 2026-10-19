import { expect, test } from '../../../../tests/story'

test.describe('StatusMark', () => {
  test('a status name has a default word', async ({ story }) => {
    await expect(await story.open('workflows-components-status-mark--running')).toHaveText(
      'Running',
    )
    await expect(await story.open('workflows-components-status-mark--failed')).toHaveText('Failed')
  })

  test("a waiting step shows the run's own countdown, not a stock word", async ({ story }) => {
    await expect(await story.open('workflows-components-status-mark--default')).toHaveText('3h 40m')
  })

  test('below the detail tier it is a bare marker with no words', async ({ story }) => {
    const root = await story.open('workflows-components-status-mark--glyph')
    await expect(root).toHaveText('')
    await expect(root.locator('svg, span[aria-hidden]').first()).toBeVisible()
  })

  test('done is a check mark', async ({ story }) => {
    const root = await story.open('workflows-components-status-mark--done')
    await expect(root.locator('svg')).toHaveCount(1)
  })
})
