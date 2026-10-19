import { expect, test } from '../../../../tests/story'

test.describe('RunTopBar', () => {
  test("the run's title is the page heading", async ({ story, page }) => {
    await story.open('workflows-components-run-top-bar--top-bar-awaiting')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Commercial loan review')
  })

  test('it says how many approvals the run is waiting on', async ({ story }) => {
    const root = await story.open('workflows-components-run-top-bar--top-bar-awaiting')
    await expect(root.getByText('Waiting on 2 approvals')).toBeVisible()
  })

  test('it has no view toggle and no theme switch of its own', async ({ story, page }) => {
    await story.open('workflows-components-run-top-bar--top-bar-awaiting')
    await expect(page.getByRole('button', { name: 'Run log' })).toBeVisible()
    await expect(page.getByRole('group', { name: 'Canvas density' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Switch to (dark|light) mode/ })).toHaveCount(0)
  })

  test('paused, the pause control becomes Resume and is pressed', async ({ story, page }) => {
    await story.open('workflows-components-run-top-bar--top-bar-paused')
    await expect(page.getByRole('button', { name: 'Resume run' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('a finished run cannot be paused but can be restarted', async ({ story, page }) => {
    await story.open('workflows-components-run-top-bar--top-bar-finished')
    await expect(page.getByRole('button', { name: 'Pause run' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Restart run' })).toBeEnabled()
  })

  test('in a narrow column it sheds controls but never the details toggle', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-run-top-bar--top-bar-narrow')
    await expect(page.getByRole('button', { name: 'Hide step details' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Run log' })).toBeHidden()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
