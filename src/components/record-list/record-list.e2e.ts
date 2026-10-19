import { expect, test } from '../../../tests/story'

test.describe('RecordList', () => {
  test('the header and every row share one set of columns', async ({ story }) => {
    const root = await story.open('components-record-list--columns')
    const starts = async (text: string) =>
      (await root.getByText(text, { exact: true }).boundingBox())!.x
    // The "Current step" heading and a row's step start at the same x.
    expect(
      Math.abs((await starts('Current step')) - (await starts('Approve credit memo'))),
    ).toBeLessThan(1)
    expect(Math.abs((await starts('Started by')) - (await starts('Dana Whitfield')))).toBeLessThan(
      1,
    )
  })

  test("rows can be the caller's own buttons, with their own selection", async ({
    story,
    page,
  }) => {
    await story.open('components-record-list--selectable-rows')
    const first = page.getByRole('button', { name: /Commercial loan review/ })
    const second = page.getByRole('button', { name: /New hire/ })
    await expect(first).toHaveAttribute('aria-pressed', 'true')
    await second.click()
    await expect(second).toHaveAttribute('aria-pressed', 'true')
    await expect(first).toHaveAttribute('aria-pressed', 'false')
  })

  test('with nothing to list, the header stays and the empty message shows', async ({ story }) => {
    const root = await story.open('components-record-list--empty')
    await expect(root.getByText('Current step')).toBeVisible()
    await expect(root.getByText('No runs in Alderfinch Retail yet.')).toBeVisible()
  })
})
