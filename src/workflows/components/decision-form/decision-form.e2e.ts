import { expect, test } from '../../../../tests/story'

test.describe('DecisionForm', () => {
  test('a gate offers the answers it accepts, with decline set apart on the left', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-decision-form--default')
    const x = async (name: string) => (await page.getByRole('button', { name }).boundingBox())!.x
    expect(await x('Decline')).toBeLessThan(await x('Request changes'))
    expect(await x('Request changes')).toBeLessThan(await x('Approve'))
  })

  test('a yes-or-no gate has no middle answer', async ({ story, page }) => {
    await story.open('workflows-components-decision-form--approve-or-decline')
    await expect(page.getByRole('button')).toHaveText(['Decline', 'Approve'])
  })

  test('the note is optional and is labelled for the audit trail', async ({ story, page }) => {
    await story.open('workflows-components-decision-form--default')
    const note = page.getByRole('textbox', { name: 'Note for the audit trail' })
    await note.fill('Reserves cover the exception.')
    await expect(note).toHaveValue('Reserves cover the exception.')
    await expect(page.getByRole('button', { name: 'Approve' })).toBeEnabled()
  })

  test('while a decision is in flight, nothing can be pressed twice', async ({ story, page }) => {
    await story.open('workflows-components-decision-form--busy')
    await expect(page.getByRole('textbox', { name: 'Note for the audit trail' })).toBeDisabled()
    for (const button of await page.getByRole('button').all()) await expect(button).toBeDisabled()
  })
})
