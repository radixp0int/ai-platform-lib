import { expect, test } from '../../../../tests/story'

test.describe('StepDetail', () => {
  test('the step title is the page heading, with a way back to the run', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-step-detail--default')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Approve credit memo')
    await expect(page.getByRole('button', { name: 'Commercial loan review' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close full view' })).toBeVisible()
  })

  test('an open gate shows the decision beside the evidence, and what approving starts', async ({
    story,
    page,
  }) => {
    const root = await story.open('workflows-components-step-detail--default')
    await expect(page.getByRole('button', { name: 'Approve' })).toBeVisible()
    await expect(root).toContainText('Your decision')
    await expect(root).toContainText('Next if approved')
    const evidence = (await root.getByText('Approve with conditions').boundingBox())!
    const answer = (await page.getByRole('button', { name: 'Approve' }).boundingBox())!
    expect(answer.x).toBeGreaterThan(evidence.x)
  })

  test('a yes-or-no gate offers only those two', async ({ story, page }) => {
    await story.open('workflows-components-step-detail--yes-or-no')
    await expect(page.getByRole('button', { name: 'Request changes' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Decline' })).toBeVisible()
  })

  test('while deciding, the form is held', async ({ story, page }) => {
    await story.open('workflows-components-step-detail--deciding')
    await expect(page.getByRole('button', { name: 'Approve' })).toBeDisabled()
  })

  test('once decided, there is nothing left to answer', async ({ story, page }) => {
    const root = await story.open('workflows-components-step-detail--decided')
    await expect(page.getByRole('button', { name: 'Approve' })).toHaveCount(0)
    await expect(root).not.toContainText('Next if approved')
    await expect(root).toContainText('Approved')
  })

  test("an agent's step has facts and no decision", async ({ story, page }) => {
    await story.open('workflows-components-step-detail--agent-step')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Risk scoring')
    await expect(page.getByRole('textbox')).toHaveCount(0)
    await expect(page.getByRole('term')).toHaveText(['Risk grade', 'Model', 'Took'])
  })
})
