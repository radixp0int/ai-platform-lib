import { expect, test } from '../../../../tests/story'

test.describe('WorkflowRunsTable', () => {
  test('says what each run came to in a word, with its progress', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-runs-table--default')
    await expect(root.getByText('Waiting on Dana W.')).toBeVisible()
    await expect(root.getByText('Declined')).toBeVisible()
    await expect(root.getByRole('img', { name: 'Stage 4 of 5 · Approve' })).toBeVisible()
    await expect(root.getByText('Stopped at stage 4 · Approve').first()).toBeVisible()
  })

  test('each row is a link to its run, and a run still going has no “took”', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-runs-table--default')
    const harbor = root.getByRole('link', { name: /Harbor Street Bakery/ })
    await expect(harbor).toHaveAttribute('href', '#harbor-street')
    await expect(harbor).toContainText('—')
    await expect(root.getByRole('link', { name: /Ridgeline Dental/ })).toContainText('2h 12m')
  })

  test('says how many of all the runs are shown', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-runs-table--default')
    await expect(root.getByText('Showing the latest 4 of 31 runs')).toBeVisible()
    await expect(root.getByRole('button', { name: 'See all 31 runs' })).toBeVisible()
  })

  test('rowTone edges the runs that need attention and leaves the rest plain', async ({
    story,
    page,
  }) => {
    const root = await story.open('workflows-components-workflow-runs-table--needs-attention')
    const edgeOf = (el: Element) =>
      getComputedStyle(el).boxShadow.match(/([a-z]+\([^)]*\)) 3px 0px 0px 0px inset/)?.[1] ?? null
    const failed = root.getByRole('link', { name: /Bluefin Logistics/ })
    const waiting = root.getByRole('link', { name: /Harbor Street Bakery/ })
    const plain = root.getByRole('link', { name: /Ridgeline Dental/ })
    await expect(failed).toHaveAttribute('data-tone', 'error')
    await expect(waiting).toHaveAttribute('data-tone', 'warning')
    await expect(plain).not.toHaveAttribute('data-tone')
    expect(await waiting.evaluate(edgeOf)).toBe('rgb(161, 98, 7)')
    expect(await failed.evaluate(edgeOf)).not.toBeNull()
    expect(await plain.evaluate(edgeOf)).toBeNull()
    // The edge takes no room: the name starts where a plain row's does.
    const nameX = async (row: typeof plain) => (await row.locator('span').first().boundingBox())!.x
    expect(await nameX(failed)).toBe(await nameX(plain))
    await page.mouse.move(0, 0)
  })

  test('without rowTone, no run has an edge', async ({ story }) => {
    const root = await story.open('workflows-components-workflow-runs-table--default')
    await expect(root.locator('[data-tone]')).toHaveCount(0)
  })
})
