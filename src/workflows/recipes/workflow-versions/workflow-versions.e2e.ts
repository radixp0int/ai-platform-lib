import { expect, test } from '../../../../tests/story'

test.describe('WorkflowVersions', () => {
  test('marks the version in use and offers to compare the others with it', async ({ story }) => {
    const root = await story.open('workflows-recipes-workflow-versions--default')
    await expect(root.getByText('In use')).toBeVisible()
    await expect(
      root.getByRole('button', { name: 'Compare v11 with the version in use' }),
    ).toBeVisible()
    await expect(root.getByRole('button', { name: /Compare v12/ })).toHaveCount(0)
  })

  test('says what the next draft would be called, and offers to start one', async ({ story }) => {
    const root = await story.open('workflows-recipes-workflow-versions--default')
    await expect(root.getByText('Changes start as a draft of')).toContainText('v13')
    await expect(root.getByRole('button', { name: 'Start a draft' })).toBeVisible()
  })

  test('a workflow with one version has nothing to compare', async ({ story }) => {
    const root = await story.open('workflows-recipes-workflow-versions--first-version')
    await expect(root.getByRole('button', { name: /Compare/ })).toHaveCount(0)
  })
})
