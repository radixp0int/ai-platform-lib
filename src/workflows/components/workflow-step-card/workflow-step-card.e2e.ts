import { expect, test } from '../../../../tests/story'

test.describe('WorkflowStepCard', () => {
  test('says what the step does, and its kind in words', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-step-card--agent')
    await expect(root.getByRole('heading', { name: 'Draft credit memo', level: 3 })).toBeVisible()
    await expect(root.getByText('Agent', { exact: true })).toBeVisible()
    await expect(root.getByText('Writes the credit memo and a recommendation')).toBeVisible()
  })

  test('says where each input comes from, by the title of that step', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-step-card--agent')
    const inputs = root.getByRole('group', { name: 'Inputs' })
    await expect(inputs.getByText('From Spread financials').first()).toBeVisible()
    await expect(inputs.getByText('From kyc.verify')).toBeVisible()
  })

  test('the first step reads from the run’s own inputs', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-step-card--trigger')
    await expect(root.getByText('From the run’s inputs').first()).toBeVisible()
  })

  test('without a lookup an input names the step id', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-step-card--without-titles')
    await expect(root.getByText('From spread').first()).toBeVisible()
  })

  test('a step that only sometimes runs says so', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-step-card--sometimes')
    await expect(root.getByText('Sometimes', { exact: true })).toBeVisible()
  })

  test('an approval says who decides and how long they have', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-step-card--approval')
    await expect(root.getByText('Dana Whitfield, credit analyst')).toBeVisible()
    await expect(root.getByText('4 hours')).toBeVisible()
  })
})
