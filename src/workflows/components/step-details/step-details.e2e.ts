import { expect, test } from '../../../../tests/story'

test.describe('StepDetails', () => {
  test('it leads with who the step is waiting on, and when it is due', async ({ story }) => {
    const root = await story.open('workflows-components-step-details--default')
    await expect(root).toContainText('Dana Whitfield')
    await expect(root).toContainText('Today 2:00 PM · 3h 40m left')
  })

  test('the facts are a description list', async ({ story, page }) => {
    await story.open('workflows-components-step-details--default')
    await expect(page.getByRole('term')).toHaveText(['Routed by', 'If approved'])
    await expect(page.getByRole('definition')).toHaveText(['Policy check', 'Draft decision letter'])
  })

  test('a step with no person shows the facts alone', async ({ story, page }) => {
    const root = await story.open('workflows-components-step-details--facts-only')
    await expect(page.getByRole('term')).toHaveText(['Business score', 'Derogatories', 'Took'])
    await expect(root).not.toContainText('Dana Whitfield')
  })

  test('a named person without a deadline has no empty due line', async ({ story }) => {
    const root = await story.open('workflows-components-step-details--assignee-without-due')
    await expect(root).toContainText('Dana Whitfield')
    await expect(root).not.toContainText('left')
  })
})
