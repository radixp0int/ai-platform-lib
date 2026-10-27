import { expect, test } from '../../../../tests/story'

test.describe('WorkflowStageList', () => {
  test('lists every stage numbered, with its steps and its usual time', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-stage-list--collapsed')
    await expect(root.getByRole('button', { name: /Gather/ })).toContainText(
      '01'.replace('01', '02'),
    )
    await expect(root.getByRole('button', { name: /Gather/ })).toContainText('credit_bureau.pull')
    await expect(root.getByRole('button', { name: /Approve/ })).toContainText('2h 50m')
    await expect(root.getByRole('button', { name: /Approve/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  test('a stage opens to say what it is for and show each step', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-stage-list--collapsed')
    await root.getByRole('button', { name: /Approve/ }).click()
    await expect(root.getByRole('button', { name: /Approve/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(root.getByText('A credit analyst reads the memo and decides.')).toBeVisible()
    await expect(
      root.getByRole('heading', { name: 'Senior officer review', level: 3 }),
    ).toBeVisible()
  })

  test('Expand all opens every stage and then offers to close them', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-stage-list--collapsed')
    await root.getByRole('button', { name: 'Expand all' }).click()
    await expect(root.locator('button[aria-expanded="true"]')).toHaveCount(5)
    await root.getByRole('button', { name: 'Collapse all' }).click()
    await expect(root.locator('button[aria-expanded="true"]')).toHaveCount(0)
  })

  test('can start with a stage open', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-stage-list--approval-open')
    await expect(root.getByRole('button', { name: /Approve/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
