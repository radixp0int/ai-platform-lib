import { expect, test } from '../../../../tests/story'

test.describe('RunLog', () => {
  test('it counts its lines and lists them oldest first', async ({ story, page }) => {
    const root = await story.open('workflows-components-run-log--log')
    await expect(root).toContainText('7 lines')
    await expect(page.getByRole('listitem').first()).toContainText('Application received')
    await expect(page.getByRole('listitem').last()).toContainText('Requested changes')
  })

  test('a line that names a step is a button, attributed to the step by its title', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-run-log--log')
    await expect(
      page.getByRole('button', { name: /^0:49 Credit bureau pull Business score 742/ }),
    ).toBeVisible()
  })

  test('a line that names no step on the canvas is plain text', async ({ story, page }) => {
    await story.open('workflows-components-run-log--unattributed-lines')
    await expect(page.getByRole('listitem')).toHaveCount(7)
    await expect(page.getByRole('listitem').getByRole('button')).toHaveCount(0)
  })

  test('when the cap has dropped lines, it says how many', async ({ story, page }) => {
    await story.open('workflows-components-run-log--log-trimmed')
    await expect(page.getByRole('listitem').first()).toHaveText('137 earlier lines trimmed')
  })

  test('before anything has happened it says so', async ({ story, page }) => {
    const root = await story.open('workflows-components-run-log--empty')
    await expect(root).toContainText('0 lines')
    await expect(page.getByRole('listitem')).toHaveText(['Nothing has happened in this run yet.'])
  })

  test('an error line is drawn in the danger colour', async ({ story, page }) => {
    await story.open('workflows-components-run-log--log')
    const colour = (text: string) =>
      page.getByText(text, { exact: true }).evaluate((node) => getComputedStyle(node).color)
    expect(await colour('Beneficial owner #3 did not match the registry')).not.toBe(
      await colour('Business score 742, no derogatories'),
    )
  })
})
