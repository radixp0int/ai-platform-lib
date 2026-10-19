import { expect, test } from '../../../../tests/story'

test.describe('NextIfApproved', () => {
  test('it lists what an approval sets running, with what each step does', async ({ story }) => {
    const root = await story.open('workflows-components-next-if-approved--default')
    await expect(root).toContainText('Next if approved')
    await expect(root).toContainText('Draft decision letter')
    await expect(root).toContainText('Emails the applicant')
  })

  test('the steps keep the order they run in', async ({ story }) => {
    const root = await story.open('workflows-components-next-if-approved--many-steps')
    const y = async (text: string) => (await root.getByText(text, { exact: true }).boundingBox())!.y
    expect(await y('Risk scoring')).toBeLessThan(await y('Policy check'))
    expect(await y('Policy check')).toBeLessThan(await y('portal.notify'))
  })

  test('one remaining step is still shown', async ({ story }) => {
    const root = await story.open('workflows-components-next-if-approved--single-step')
    await expect(root).toContainText('portal.notify')
    await expect(root).not.toContainText('Draft decision letter')
  })
})
