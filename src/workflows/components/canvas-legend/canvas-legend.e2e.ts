import { expect, test } from '../../../../tests/story'

test.describe('CanvasLegend', () => {
  test('it names every kind of step and every kind of line', async ({ story }) => {
    const root = await story.open('workflows-components-canvas-legend--default')
    for (const word of [
      'Agent',
      'Person',
      'System call',
      'Decision',
      'Done',
      'Waiting on this step',
      'Not reached yet',
      'Skipped branch',
    ]) {
      await expect(root.getByText(word, { exact: true })).toBeVisible()
    }
  })

  test('it sits in the bottom-left corner of the canvas', async ({ story }) => {
    const root = await story.open('workflows-components-canvas-legend--over-a-run')
    const canvas = (await root.locator('.react-flow').boundingBox())!
    const legend = (await root.getByText('Skipped branch').boundingBox())!
    expect(legend.x).toBeLessThan(canvas.x + canvas.width / 2)
    expect(legend.y).toBeGreaterThan(canvas.y + canvas.height / 2)
  })

  test('it leaves the bottom-right corner to the zoom cluster', async ({ story, page }) => {
    const root = await story.open('workflows-components-canvas-legend--beside-the-zoom-cluster')
    const legend = (await root.getByText('Skipped branch').boundingBox())!
    const zoom = (await page.getByRole('button', { name: 'Zoom in' }).boundingBox())!
    expect(zoom.x).toBeGreaterThan(legend.x + legend.width)
  })
})
