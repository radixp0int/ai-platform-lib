import { expect, test } from '../../../../tests/story'

test.describe('PolicyException', () => {
  test('it states the exception and what offsets it', async ({ story }) => {
    const root = await story.open('workflows-components-policy-exception--default')
    await expect(root).toContainText('Policy exception')
    await expect(root).toContainText('Guarantor credit score is 672. Policy asks for 680.')
    await expect(root).toContainText('24 months of cash reserves')
  })

  test('it is drawn as a caution, not as an error', async ({ story }) => {
    const root = await story.open('workflows-components-policy-exception--default')
    const colour = (text: string) =>
      root.getByText(text, { exact: true }).evaluate((node) => getComputedStyle(node).color)
    const label = await colour('Policy exception')
    const body = await colour('Guarantor credit score is 672. Policy asks for 680.')
    expect(label).not.toBe(body)
    expect(label).not.toMatch(/^rgb\((2[0-9]{2}), ([0-9]{1,2}), /) // not a red
  })

  test("the heading is the run's to word", async ({ story }) => {
    const root = await story.open('workflows-components-policy-exception--custom-label')
    await expect(root).toContainText('Access exception')
    await expect(root).not.toContainText('Policy exception')
  })

  test('long text wraps beside the flag instead of under it', async ({ story }) => {
    const root = await story.open('workflows-components-policy-exception--long-text')
    const flag = (await root.locator('svg').first().boundingBox())!
    const text = (await root.getByText(/^The guarantor score of 672/).boundingBox())!
    expect(text.x).toBeGreaterThan(flag.x + flag.width)
    expect(text.height).toBeGreaterThan(30)
  })
})
