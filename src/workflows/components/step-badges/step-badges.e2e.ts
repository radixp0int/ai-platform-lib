import { expect, test } from '../../../../tests/story'

test.describe('StepBadges', () => {
  test('it says what kind of step this is and where it has got to', async ({ story }) => {
    const root = await story.open('workflows-components-step-badges--default')
    await expect(root.getByText('Approval', { exact: true })).toBeVisible()
    await expect(root.getByText('Needs approval', { exact: true })).toBeVisible()
  })

  test('only a step waiting on a person gets the orange badge', async ({ story }) => {
    const fill = async (id: string, text: string) => {
      const root = await story.open(`workflows-components-step-badges--${id}`)
      return root
        .getByText(text, { exact: true })
        .evaluate((node) => getComputedStyle(node).backgroundColor)
    }
    const waiting = await fill('default', 'Needs approval')
    const approved = await fill('approved', 'Approved')
    expect(waiting).not.toBe(approved)
    expect(approved).toBe('rgba(0, 0, 0, 0)')
  })

  test('each kind of step has its own name', async ({ story }) => {
    const root = await story.open('workflows-components-step-badges--every-kind')
    for (const kind of ['Trigger', 'Agent', 'System call', 'Decision', 'Approval']) {
      await expect(root.getByText(kind, { exact: true })).toBeVisible()
    }
  })

  test('the kind sits left and the status right', async ({ story }) => {
    const root = await story.open('workflows-components-step-badges--agent-running')
    const kind = (await root.getByText('Agent', { exact: true }).boundingBox())!
    const status = (await root.getByText('Running', { exact: true }).boundingBox())!
    expect(status.x).toBeGreaterThan(kind.x + kind.width)
  })
})
