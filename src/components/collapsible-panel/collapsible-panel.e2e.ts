import { expect, test } from '../../../tests/story'

test.describe('CollapsiblePanel', () => {
  test('closing a panel gives its width back to the content beside it', async ({ story, page }) => {
    const root = await story.open('components-collapsiblepanel--both-open')
    const middle = root
      .getByText('The middle takes whatever the panels give back.')
      .locator('xpath=..')
    const before = (await middle.boundingBox())!.width
    await page.getByRole('button', { name: 'Hide left' }).click()
    await expect.poll(async () => (await middle.boundingBox())!.width).toBeGreaterThan(before + 200)
  })

  test('a closed panel leaves no gap behind', async ({ story, page }) => {
    const root = await story.open('components-collapsiblepanel--both-closed')
    const frame = (await root.locator('.bg-canvas').first().boundingBox())!
    const middle = (await root
      .getByText('The middle takes whatever the panels give back.')
      .locator('xpath=..')
      .boundingBox())!
    // 16px of padding each side and nothing else.
    expect(Math.round(frame.width - middle.width)).toBe(32)
    await expect(page.getByRole('button', { name: 'Show left' })).toBeVisible()
  })

  test('the content stays mounted while closed, so reopening is instant', async ({
    story,
    page,
  }) => {
    const root = await story.open('components-collapsiblepanel--single-panel')
    const toggle = page.getByRole('button', { name: 'Hide details' })
    await toggle.click()
    await expect(page.getByRole('button', { name: 'Show details' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await expect(root.getByText('Details', { exact: true })).toBeAttached()
  })
})
