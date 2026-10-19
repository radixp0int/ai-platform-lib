import { expect, test } from '../../../../tests/story'

test.describe('ZoomCluster', () => {
  test('it reads out the zoom and the tier it puts the nodes in', async ({ story }) => {
    const root = await story.open('workflows-components-zoom-cluster--default')
    await expect(root.getByText('100%')).toBeVisible()
    await expect(root.getByText('Detail', { exact: true })).toBeVisible()
  })

  test('zooming out moves through the tiers', async ({ story }) => {
    await expect(
      (await story.open('workflows-components-zoom-cluster--zoomed-out')).getByText('Simplified'),
    ).toBeVisible()
    await expect(
      (await story.open('workflows-components-zoom-cluster--at-the-floor')).getByText('Glyph'),
    ).toBeVisible()
  })

  test('Zoom in and Zoom out change the readout', async ({ story, page }) => {
    const root = await story.open('workflows-components-zoom-cluster--zoomed-out')
    const readout = async () => parseInt(await root.getByText(/^\d+%$/).innerText())
    const before = await readout()
    await page.getByRole('button', { name: 'Zoom in' }).click()
    await expect.poll(readout).toBeGreaterThan(before)
    await page.getByRole('button', { name: 'Zoom out' }).click()
    await page.getByRole('button', { name: 'Zoom out' }).click()
    await expect.poll(readout).toBeLessThan(before)
  })

  test('it stops at the zoom floor', async ({ story, page }) => {
    const root = await story.open('workflows-components-zoom-cluster--at-the-floor')
    const readout = async () => parseInt(await root.getByText(/^\d+%$/).innerText())
    for (let press = 0; press < 4; press++)
      await page.getByRole('button', { name: 'Zoom out' }).click()
    await expect.poll(readout).toBe(30)
  })

  test('each control is a named button in the bottom-right corner', async ({ story, page }) => {
    const root = await story.open('workflows-components-zoom-cluster--over-a-run')
    const canvas = (await root.locator('.react-flow').boundingBox())!
    for (const name of ['Zoom in', 'Zoom out', 'Fit the run on screen']) {
      const box = (await page.getByRole('button', { name }).boundingBox())!
      expect(box.x).toBeGreaterThan(canvas.x + canvas.width / 2)
      expect(box.y).toBeGreaterThan(canvas.y + canvas.height / 2)
    }
  })
})
