import { expect, test } from '../../../../tests/story'

test.describe('WorkflowHeader', () => {
  test('names the workflow and says what it is for', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-header--waiting-on-a-person')
    await expect(
      root.getByRole('heading', { name: 'Commercial loan review', level: 1 }),
    ).toBeVisible()
    await expect(root.getByText('Reviews a commercial loan application.')).toBeVisible()
  })

  test('offers to edit the workflow and to start a run', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-header--waiting-on-a-person')
    await expect(root.getByRole('button', { name: 'Edit workflow' })).toBeVisible()
    await expect(root.getByRole('button', { name: 'Start a run' })).toBeVisible()
  })

  test('the live-run banner is one link, and says what the run is waiting for', async ({
    story,
  }) => {
    const root = await story.open('workflows-components-workflow-header--waiting-on-a-person')
    const banner = root.getByRole('link', { name: /Live run · Harbor Street Bakery/ })
    await expect(banner).toContainText('waiting on Dana W., due in 3h 40m')
    await expect(banner).toContainText('Open live run')
  })

  test('with no run in progress there is no banner', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-header--no-live-run')
    await expect(root.getByRole('link')).toHaveCount(0)
  })

  test('the buttons stay on screen beside a long description', async ({ story, page }) => {
    const root = await story.open('workflows-components-workflow-header--long-description')
    const start = root.getByRole('button', { name: 'Start a run' })
    await expect(start).toBeVisible()
    const box = (await start.boundingBox())!
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  })
})
