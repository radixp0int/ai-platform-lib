import { expect, test } from '../../../../tests/story'

test.describe('StepNode', () => {
  test('a waiting approval shows who it is with, the countdown and a way in', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-step-node--default')
    const node = page.getByRole('group').filter({ hasText: 'Approve credit memo' })
    await expect(node).toContainText('Dana Whitfield')
    await expect(node).toContainText('3h 40m')
    await expect(node).toContainText('Needs approval')
  })

  test('each kind of step says what it is', async ({ story, page }) => {
    await story.open('workflows-components-step-node--every-kind')
    const nodes = page.locator('.react-flow__node')
    await expect(nodes).toHaveCount(5)
    for (const kind of ['Trigger', 'Agent', 'System call', 'Decision', 'Approval']) {
      await expect(nodes.filter({ hasText: kind }).first()).toBeVisible()
    }
  })

  test('each status has its word', async ({ story, page }) => {
    await story.open('workflows-components-step-node--every-status')
    const nodes = page.locator('.react-flow__node')
    await expect(nodes).toHaveCount(8)
    for (const word of ['Queued', 'Running', 'Approved', 'Sent back', 'Failed', 'Skipped']) {
      await expect(nodes.filter({ hasText: word })).toHaveCount(1)
    }
  })

  test('zoomed out it drops its result line and keeps its title', async ({ story, page }) => {
    await story.open('workflows-components-step-node--simplified')
    const node = page.locator('.react-flow__node').filter({ hasText: 'Intake agent' })
    await expect(node).toBeVisible()
    await expect(node).not.toContainText('14 fields from 6 docs')
  })

  test('zoomed out further it is an icon and a marker, with no text at all', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-step-node--glyph-only')
    const nodes = page.locator('.react-flow__node')
    await expect(nodes).toHaveCount(5)
    await expect(nodes.first()).toHaveText('')
  })
})
