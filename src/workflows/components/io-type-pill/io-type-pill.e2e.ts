import { expect, test } from '../../../../tests/story'

test.describe('IoTypePill', () => {
  test('it names the type in the mono face', async ({ story, page }) => {
    await story.open('workflows-components-io-type-pill--default')
    const pill = page.getByText('file', { exact: true })
    await expect(pill).toBeVisible()
    expect(await pill.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/mono/i)
  })

  test('every type has one', async ({ story }) => {
    const root = await story.open('workflows-components-io-type-pill--every-type')
    await expect(root.locator('span')).toHaveCount(10)
  })
})
