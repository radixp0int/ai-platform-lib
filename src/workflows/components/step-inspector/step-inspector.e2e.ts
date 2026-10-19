import { expect, test } from '../../../../tests/story'

test.describe('StepInspector', () => {
  test('it names the selected step and offers the full view from its header', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-step-inspector--busy')
    const panel = page.getByRole('complementary')
    await expect(panel.getByRole('heading', { name: 'Approve credit memo' })).toBeVisible()
    await expect(panel.getByRole('button', { name: 'Open full view' })).toBeVisible()
    await expect(panel.getByRole('button', { name: 'Hide step details' })).toBeVisible()
  })

  test('the blocks appear in reading order: details, recommendation, exception, trail', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-step-inspector--busy')
    const panel = page.getByRole('complementary')
    const y = async (text: string) =>
      (await panel.getByText(text, { exact: true }).boundingBox())!.y
    expect(await y('Details')).toBeLessThan(await y('Agent recommendation'))
    expect(await y('Agent recommendation')).toBeLessThan(await y('Policy exception'))
    expect(await y('Policy exception')).toBeLessThan(await y('How it got here'))
  })

  test('while a decision is in flight the form is held', async ({ story, page }) => {
    await story.open('workflows-components-step-inspector--busy')
    await expect(page.getByRole('textbox', { name: 'Note for the audit trail' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Approve' })).toBeDisabled()
  })
})
