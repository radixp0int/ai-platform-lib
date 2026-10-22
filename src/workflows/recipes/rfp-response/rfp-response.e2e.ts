import { expect, test } from '../../../../tests/story'

test.describe('RFP response run', () => {
  test('the review opens with what it was given, and what it has yet to decide', async ({
    story,
    page,
  }) => {
    await story.open('workflows-recipes-rfp-response--awaiting-review')
    const inputs = page.getByRole('list', { name: 'Inputs' })
    await expect(inputs).toContainText('142 drafts')
    await expect(inputs).toContainText('From Draft answers')
    await expect(inputs).toContainText('Security pack, 5 sections')
    await expect(page.getByRole('list', { name: 'Outputs' })).toContainText('Waiting on this step')
  })

  test('approving fills in the review’s output', async ({ story, page }) => {
    await story.open('workflows-recipes-rfp-response--awaiting-review')
    await page.getByRole('button', { name: 'Approve' }).click()
    await expect(page.getByRole('list', { name: 'Outputs' })).toContainText('Approved')
  })
})
