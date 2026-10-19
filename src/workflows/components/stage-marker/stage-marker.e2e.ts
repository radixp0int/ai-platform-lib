import { expect, test } from '../../../../tests/story'

test.describe('StageMarker', () => {
  const marker = async (
    story: { open: (id: string) => Promise<import('@playwright/test').Locator> },
    id: string,
  ) =>
    (await story.open(`workflows-components-stage-marker--${id}`)).locator('[aria-hidden]').first()

  test('it is decoration: the stage name beside it carries the meaning', async ({ story }) => {
    for (const id of ['default', 'done', 'upcoming']) {
      const root = await story.open(`workflows-components-stage-marker--${id}`)
      expect(await root.ariaSnapshot()).toBe('')
    }
  })

  test('done is a check, and upcoming is an empty dashed ring', async ({ story }) => {
    await expect((await marker(story, 'done')).locator('svg')).toHaveCount(1)
    const upcoming = await marker(story, 'upcoming')
    await expect(upcoming.locator('svg')).toHaveCount(0)
    await expect(upcoming).toHaveCSS('border-top-style', 'dashed')
  })

  test('the three states are drawn differently', async ({ story }) => {
    const looks = []
    for (const id of ['default', 'done', 'upcoming']) {
      const node = await marker(story, id)
      looks.push(
        await node.evaluate((element) => {
          const style = getComputedStyle(element)
          return [style.backgroundColor, style.borderTopStyle, style.borderTopColor].join('|')
        }),
      )
    }
    expect(new Set(looks).size).toBe(3)
  })
})
