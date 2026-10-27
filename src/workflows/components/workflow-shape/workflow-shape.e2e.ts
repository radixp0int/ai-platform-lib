import { expect, test } from '../../../../tests/story'

test.describe('WorkflowShape', () => {
  test('is one picture with a name that says its size', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-shape--commercial-loan-review')
    await expect(
      root.getByRole('img', { name: 'Commercial loan review: 5 stages, 12 steps' }),
    ).toBeVisible()
  })

  test('numbers each lane and names it', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-shape--commercial-loan-review')
    await expect(root.getByText('01', { exact: true })).toBeVisible()
    await expect(root.getByText('Decide & notify')).toBeVisible()
    await expect(root.getByText('05', { exact: true })).toBeVisible()
  })

  test('says what a dashed step means', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-shape--commercial-loan-review')
    await expect(root.getByText('Dashed steps only run sometimes.')).toBeVisible()
    await expect(root.getByText('Runs only sometimes')).toBeVisible()
  })

  test('scrolls sideways when narrow rather than squeezing the lanes', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-shape--narrow')
    const picture = root.getByRole('img')
    const box = (await picture.boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(880)
  })
})
