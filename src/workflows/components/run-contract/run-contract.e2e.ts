import { expect, test } from '../../../../tests/story'

test.describe('RunContract', () => {
  test('each input says whether a run can start without it', async ({ story, page }) => {
    await story.open('workflows-components-run-contract--default')
    const inputs = page.getByRole('list', { name: 'Inputs' }).getByRole('listitem')
    await expect(inputs).toHaveCount(6)
    await expect(inputs.first()).toContainText('application')
    await expect(inputs.first()).toContainText('Required')
    await expect(inputs.nth(4)).toContainText('guarantors')
    await expect(inputs.nth(4)).toContainText('Optional')
  })

  test('each output says where it goes', async ({ story, page }) => {
    await story.open('workflows-components-run-contract--default')
    const outputs = page.getByRole('list', { name: 'Outputs' }).getByRole('listitem')
    await expect(outputs).toHaveCount(4)
    await expect(outputs.last()).toContainText('→ Applicant')
  })

  test('wide, inputs and outputs sit side by side; narrow, they stack', async ({ story, page }) => {
    const top = async () =>
      [
        (await page.getByRole('list', { name: 'Inputs' }).boundingBox())!.y,
        (await page.getByRole('list', { name: 'Outputs' }).boundingBox())!.y,
      ] as const
    await story.open('workflows-components-run-contract--default')
    const [inWide, outWide] = await top()
    expect(outWide).toBe(inWide)
    await story.open('workflows-components-run-contract--narrow')
    const [inNarrow, outNarrow] = await top()
    expect(outNarrow).toBeGreaterThan(inNarrow)
  })
})
