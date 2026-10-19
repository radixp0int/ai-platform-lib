import { expect, test } from '../../../../tests/story'

test.describe('KindIcon', () => {
  const kinds = ['default', 'person', 'tool', 'decision', 'trigger', 'unassigned']

  for (const kind of kinds) {
    test(`${kind}: is drawn, and is decoration`, async ({ story }) => {
      const root = await story.open(`workflows-components-kind-icon--${kind}`)
      await expect(root.locator('[aria-hidden]').first()).toBeVisible()
      // The step's own text says who does the work; the icon adds nothing to read.
      expect(await root.ariaSnapshot()).toBe('')
    })
  }

  test('an agent is the orb, and a system call is not', async ({ story }) => {
    const agent = await story.open('workflows-components-kind-icon--default')
    await expect(agent.locator('.orb')).toHaveCount(1)
    const tool = await story.open('workflows-components-kind-icon--tool')
    await expect(tool.locator('.orb')).toHaveCount(0)
    await expect(tool.locator('svg')).toHaveCount(1)
  })

  test('a step routed to a role, not a person, is drawn with a dashed outline', async ({
    story,
  }) => {
    const root = await story.open('workflows-components-kind-icon--unassigned')
    await expect(root.locator('[aria-hidden]').first()).toHaveCSS('border-top-style', 'dashed')
  })
})
