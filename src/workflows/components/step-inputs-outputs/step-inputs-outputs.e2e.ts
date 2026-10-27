import { expect, test } from '../../../../tests/story'

test.describe('StepInputsOutputs', () => {
  test('inputs show where they came from and what they carry', async ({ story, page }) => {
    await story.open('workflows-components-step-inputs-and-outputs--default')
    const inputs = page.getByRole('list', { name: 'Inputs' }).getByRole('listitem')
    await expect(inputs).toHaveCount(3)
    await expect(inputs.first()).toContainText('credit_memo')
    await expect(inputs.first()).toContainText('7 pages')
    await expect(inputs.first()).toContainText('From Draft credit memo')
  })

  test('a waiting step says so in place of its outputs', async ({ story, page }) => {
    await story.open('workflows-components-step-inputs-and-outputs--default')
    const outputs = page.getByRole('list', { name: 'Outputs' }).getByRole('listitem')
    await expect(outputs).toHaveCount(2)
    await expect(outputs.first()).toContainText('Waiting on this step')
  })

  test('a finished step shows what it produced', async ({ story, page }) => {
    await story.open('workflows-components-step-inputs-and-outputs--produced')
    const outputs = page.getByRole('list', { name: 'Outputs' })
    await expect(outputs).toContainText('Analyst approval')
    await expect(outputs).toContainText('1 exception')
  })

  test('a step the run has not reached waits on its sources', async ({ story, page }) => {
    await story.open('workflows-components-step-inputs-and-outputs--not-reached')
    await expect(page.getByRole('list', { name: 'Inputs' })).toContainText('Not ready yet')
    await expect(page.getByRole('list', { name: 'Outputs' })).toContainText('Not produced yet')
  })

  test('the trigger reads the run’s inputs', async ({ story, page }) => {
    await story.open('workflows-components-step-inputs-and-outputs--from-the-run')
    const inputs = page.getByRole('list', { name: 'Inputs' })
    await expect(inputs).toContainText('From the run’s inputs')
    await expect(inputs).toContainText('Harbor_Street_application.pdf')
  })
})
