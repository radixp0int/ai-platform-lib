import { expect, test } from '../../../../tests/story'

test.describe('TraceStageStrip', () => {
  test('says where each stage stands in words, not only colour', async ({ story }) => {
    const root = await story.open('workflows-components-trace-stage-strip--waiting-on-a-person')
    await expect(root.getByRole('button', { name: /^Approve/ })).toContainText('Needs a person')
    await expect(root.getByRole('button', { name: /^Gather/ })).toContainText('Done')
    await expect(root.getByRole('button', { name: /^Decide/ })).toContainText('Queued')
  })

  test('names a failed step in its stage', async ({ story }) => {
    const root = await story.open('workflows-components-trace-stage-strip--failed-step-in-a-stage')
    await expect(root.getByRole('button', { name: /^Gather/ })).toContainText('1 failed')
  })

  test('the chosen stage is the one pressed, and picking another moves it', async ({ story }) => {
    const root = await story.open('workflows-components-trace-stage-strip--waiting-on-a-person')
    await expect(root.getByRole('button', { name: /^Approve/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await root.getByRole('button', { name: /^Analyze/ }).click()
    await expect(root.getByRole('button', { name: /^Analyze/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(root.getByRole('button', { name: /^Approve/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('a stage shows how many steps it holds and how long they took', async ({ story }) => {
    const root = await story.open('workflows-components-trace-stage-strip--waiting-on-a-person')
    await expect(root.getByRole('button', { name: /^Gather/ })).toContainText('3 steps · 1m 12s')
    await expect(root.getByRole('button', { name: /^Intake/ })).toContainText('2 steps · 48.0s')
  })

  test('is reachable by keyboard', async ({ story, page }) => {
    const root = await story.open('workflows-components-trace-stage-strip--waiting-on-a-person')
    await root.getByRole('button', { name: /^Intake/ }).focus()
    await page.keyboard.press('Tab')
    await expect(root.getByRole('button', { name: /^Gather/ })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(root.getByRole('button', { name: /^Gather/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
