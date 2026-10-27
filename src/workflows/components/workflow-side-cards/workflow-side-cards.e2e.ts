import { expect, test } from '../../../../tests/story'

test.describe('WorkflowSideCards', () => {
  test('Who decides names each approval and who answers it', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-side-cards--approvers')
    await expect(root.getByRole('heading', { name: 'Who decides' })).toBeVisible()
    await expect(root.getByText('Approve credit memo')).toBeVisible()
    await expect(root.getByText('Dana Whitfield, credit analyst')).toBeVisible()
    await expect(root.getByText('Only loans of $500,000 or more')).toBeVisible()
  })

  test('Connected systems lists each system', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-side-cards--systems')
    await expect(root.getByRole('heading', { name: 'Connected systems' })).toBeVisible()
    await expect(root.getByRole('listitem')).toHaveCount(5)
    await expect(root.getByText('credit_bureau.pull')).toBeVisible()
  })

  test('many systems wrap inside the card', async ({ story, page }) => {
    const root = await story.open('workflows-components-workflow-side-cards--many-systems')
    const card = root.getByRole('region', { name: 'Connected systems' })
    const cardBox = (await card.boundingBox())!
    for (const item of await root.getByRole('listitem').all()) {
      const box = (await item.boundingBox())!
      expect(box.x + box.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1)
    }
    expect(page).toBeTruthy()
  })

  test('Last 30 days gives the numbers and a line on what they mean', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-side-cards--stats')
    await expect(root.getByRole('heading', { name: 'Last 30 days' })).toBeVisible()
    await expect(root.getByText('29 of 31')).toBeVisible()
    await expect(root.getByText('The approval is most of the time.')).toBeVisible()
  })
})
