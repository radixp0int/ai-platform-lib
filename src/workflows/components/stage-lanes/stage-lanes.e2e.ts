import { expect, test } from '../../../../tests/story'

test.describe('StageLanes', () => {
  test('each stage has a header button in run order', async ({ story, page }) => {
    await story.open('workflows-components-stage-lanes--default')
    await expect(page.getByRole('application').getByRole('button')).toHaveText([
      /^Intake/,
      /^Gather/,
      /^Analyze/,
      /^Approve/,
      /^Decide & notify/,
    ])
  })

  test('picking a lane header selects that stage, and picking it again clears it', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-stage-lanes--default')
    const gather = page.getByRole('button', { name: /^Gather/ })
    await gather.click()
    await expect(gather).toHaveAttribute('aria-pressed', 'true')
    await gather.click()
    await expect(gather).toHaveAttribute('aria-pressed', 'false')
  })

  test('only one stage is selected at a time', async ({ story, page }) => {
    await story.open('workflows-components-stage-lanes--stage-selected')
    await page.getByRole('button', { name: /^Analyze/ }).click()
    await expect(page.getByRole('button', { pressed: true })).toHaveCount(1)
    await expect(page.getByRole('button', { name: /^Analyze/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('a lane body lets clicks through to the canvas; only its header is a target', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-stage-lanes--default')
    const header = page.getByRole('button', { name: /^Intake/ })
    const lane = header.locator('xpath=..')
    await expect(lane).toHaveCSS('pointer-events', 'none')
    await expect(header).toHaveCSS('pointer-events', 'auto')
  })
})
