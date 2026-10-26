import { expect, test } from '../../../../tests/story'

test.describe('WorkflowRunsTable', () => {
  test('says what each run came to in a word, with its progress', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-runs-table--default')
    await expect(root.getByText('Waiting on Dana W.')).toBeVisible()
    await expect(root.getByText('Declined')).toBeVisible()
    await expect(root.getByRole('img', { name: 'Stage 4 of 5 · Approve' })).toBeVisible()
    await expect(root.getByText('Stopped at stage 4 · Approve').first()).toBeVisible()
  })

  test('each row is a link to its run, and a run still going has no “took”', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-runs-table--default')
    const harbor = root.getByRole('link', { name: /Harbor Street Bakery/ })
    await expect(harbor).toHaveAttribute('href', '#harbor-street')
    await expect(harbor).toContainText('—')
    await expect(root.getByRole('link', { name: /Ridgeline Dental/ })).toContainText('2h 12m')
  })

  test('says how many of all the runs are shown', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-runs-table--default')
    await expect(root.getByText('Showing the latest 4 of 31 runs')).toBeVisible()
    await expect(root.getByRole('button', { name: 'See all 31 runs' })).toBeVisible()
  })
})
