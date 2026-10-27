import { expect, test } from '../../../../tests/story'

test.describe('TraceInspector', () => {
  test('an agent step shows its calls against the clock and its reasoning', async ({ story }) => {
    const root = await story.open('workflows-components-trace-inspector--agent-step')
    await expect(root.getByRole('heading', { name: 'Draft credit memo', level: 2 })).toBeVisible()
    await expect(root.getByText('Write the memo')).toBeVisible()
    await expect(root.getByText('docs.merge')).toBeVisible()
    await expect(root.getByText('Agent’s reasoning, summarized')).toBeVisible()
    await expect(root.getByText('31.0k in · 6.4k out')).toBeVisible()
  })

  test('a failed step says the run kept going', async ({ story }) => {
    const root = await story.open('workflows-components-trace-inspector--failed-tool')
    await expect(root.getByText('Failed, and the run kept going')).toBeVisible()
    await expect(root.getByText('Failed', { exact: true })).toBeVisible()
  })

  test('a step waiting on a person says who was asked and how long so far', async ({ story }) => {
    const root = await story.open('workflows-components-trace-inspector--waiting-on-a-person')
    await expect(root.getByText('Asked')).toBeVisible()
    await expect(root.getByText('Dana Whitfield', { exact: true })).toBeVisible()
    await expect(root.getByText('19m 32s so far')).toBeVisible()
  })

  test('a skipped step says so, and has nothing to measure', async ({ story }) => {
    const root = await story.open('workflows-components-trace-inspector--skipped')
    await expect(root.getByText('Skipped', { exact: true })).toBeVisible()
    await expect(root.getByText('—')).toBeVisible()
  })

  test('a step that has not started has nothing to measure', async ({ story }) => {
    const root = await story.open('workflows-components-trace-inspector--not-started')
    await expect(root.getByText('Not started', { exact: true })).toBeVisible()
    await expect(root.getByText('—')).toBeVisible()
  })

  test('the tabs switch the view, by click and by arrow key', async ({ story, page }) => {
    const root = await story.open('workflows-components-trace-inspector--agent-step')
    const trace = root.getByRole('tab', { name: 'Trace' })
    await expect(trace).toHaveAttribute('aria-selected', 'true')

    await root.getByRole('tab', { name: 'Input and output' }).click()
    await expect(root.getByRole('heading', { name: 'Input', level: 3 })).toBeVisible()
    await expect(root.getByRole('heading', { name: 'Output', level: 3 })).toBeVisible()
    await expect(root.getByText('dscr: 1.38×')).toBeVisible()

    await root.getByRole('tab', { name: 'Input and output' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(root.getByRole('tab', { name: 'Raw span' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(root.getByText('"span_id": "memo"')).toBeVisible()
  })
})
