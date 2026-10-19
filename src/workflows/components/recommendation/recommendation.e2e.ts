import { expect, test } from '../../../../tests/story'

test.describe('Recommendation', () => {
  test('it leads with the verdict and says who it is from', async ({ story }) => {
    const root = await story.open('workflows-components-recommendation--default')
    await expect(root.getByText('Approve with conditions')).toBeVisible()
    await expect(root).toContainText('Draft credit memo')
  })

  test('the figures behind the verdict sit in one row', async ({ story }) => {
    const root = await story.open('workflows-components-recommendation--default')
    const tops = await Promise.all(
      ['Loan', 'Risk grade', 'DSCR'].map(
        async (label) => (await root.getByText(label, { exact: true }).boundingBox())!.y,
      ),
    )
    expect(new Set(tops).size).toBe(1)
  })

  test('the verdict is the most prominent text in the card', async ({ story }) => {
    const root = await story.open('workflows-components-recommendation--decline')
    const size = (text: string | RegExp) =>
      root
        .getByText(text)
        .first()
        .evaluate((node) => parseFloat(getComputedStyle(node).fontSize))
    expect(await size(/^Decline:/)).toBeGreaterThan(await size('DSCR'))
    expect(await size(/^Decline:/)).toBeGreaterThan(await size(/Risk scoring agent/))
  })

  test("the heading is the run's to word", async ({ story }) => {
    const root = await story.open('workflows-components-recommendation--custom-label')
    await expect(root).toContainText('Triage recommendation')
    await expect(root).not.toContainText('Agent recommendation')
  })
})
