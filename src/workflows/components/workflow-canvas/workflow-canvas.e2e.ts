import { expect, test } from '../../../../tests/story'

test.describe('WorkflowCanvas', () => {
  test('the normal view draws one node per step, with lanes behind them', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-workflow-canvas--default')
    await expect(page.locator('.react-flow__node')).toHaveCount(12)
    await expect(page.getByRole('button', { name: /^Gather/ })).toBeVisible()
  })

  test('a folded stage is one node, and unfolds on click', async ({ story, page }) => {
    await story.open('workflows-components-workflow-canvas--folded')
    // Intake (2 steps) and Gather (3) are folded: 12 - 5 steps, plus one node each.
    await expect(page.locator('.react-flow__node')).toHaveCount(9)
    await expect(page.locator('.react-flow__node-fold')).toHaveCount(2)

    // The canvas only renders what is on screen and re-frames after a fold, so
    // from here the lane headers are the stable thing to read: they are always
    // drawn, and each one says which way its stage can go.
    await page.getByRole('button', { name: 'Show the Gather stage, 3 steps' }).click()
    await expect(page.getByRole('button', { name: 'Fold the Gather stage' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Show the Gather stage', exact: true }),
    ).toHaveCount(0)

    await page.getByRole('button', { name: 'Fold the Gather stage' }).click()
    await expect(
      page.getByRole('button', { name: 'Show the Gather stage', exact: true }),
    ).toBeVisible()
  })

  test('clicking a step selects it, and clicking the empty canvas clears it', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-workflow-canvas--nothing-selected')
    const node = page.locator('.react-flow__node').filter({ hasText: 'Risk scoring' })
    await node.click()
    await expect(node).toHaveClass(/selected/)
    await page.locator('.react-flow__pane').click({ position: { x: 5, y: 5 } })
    await expect(node).not.toHaveClass(/selected/)
  })

  test('picking a lane header selects the stage', async ({ story, page }) => {
    await story.open('workflows-components-workflow-canvas--nothing-selected')
    const lane = page.getByRole('button', { name: /^Analyze/ })
    await lane.click()
    await expect(lane).toHaveAttribute('aria-pressed', 'true')
  })

  test('the zoom buttons change the zoom, and the readout follows', async ({ story, page }) => {
    const root = await story.open('workflows-components-workflow-canvas--default')
    const readout = () => root.getByText(/^\d+%$/).innerText()
    const before = parseInt(await readout())
    await page.getByRole('button', { name: 'Zoom out' }).click()
    await expect.poll(async () => parseInt(await readout())).toBeLessThan(before)
    await page.getByRole('button', { name: 'Zoom out' }).click()
    const zoomedOut = parseInt(await readout())
    await page.getByRole('button', { name: 'Fit the run on screen' }).click()
    await expect.poll(async () => parseInt(await readout())).toBeGreaterThan(zoomedOut)
  })

  test('the legend and the zoom cluster are both on the canvas', async ({ story, page }) => {
    const root = await story.open('workflows-components-workflow-canvas--default')
    await expect(root.getByText('Skipped branch')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Zoom in' })).toBeVisible()
  })
})
