import { expect, test } from '../../../tests/story'

test.describe('SideMenu', () => {
  test('destinations are links in the main navigation, the current one marked', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--expanded')
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.locator('[aria-current="page"]')).toHaveText('Home')
    await expect(nav.getByRole('link', { name: /^Tasks/ })).toHaveAttribute(
      'href',
      '/t/alderfinch-treasury/tasks',
    )
  })

  test('an item with sub-sections expands and collapses in place', async ({ story, page }) => {
    await story.open('components-side-menu--expanded')
    await page.getByRole('button', { name: 'Expand Workflows' }).click()
    await expect(page.getByRole('link', { name: 'Live runs' })).toBeVisible()
    await page.getByRole('button', { name: 'Collapse Workflows' }).click()
    await expect(page.getByRole('link', { name: 'Live runs' })).toHaveCount(0)
  })

  test('with a section open, the sub-section carries the current mark', async ({ story, page }) => {
    await story.open('components-side-menu--section-open')
    await expect(page.locator('[aria-current="page"]')).toHaveText('Runs')
  })

  test('in the rail each icon keeps its name, and a badge is read with it', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--rail')
    await expect(page.getByRole('link', { name: 'Tasks, 2 waiting' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
  })

  test('in the rail, sub-sections open in a flyout beside the icon', async ({ story, page }) => {
    await story.open('components-side-menu--rail')
    const item = page.getByRole('button', { name: 'Workflows' })
    await item.click()
    const flyout = page.getByRole('dialog', { name: 'Workflows sections' })
    await expect(flyout.getByRole('link', { name: 'Live runs' })).toBeVisible()
    const [icon, panel] = [(await item.boundingBox())!, (await flyout.boundingBox())!]
    expect(panel.x).toBeGreaterThan(icon.x + icon.width)
    await page.keyboard.press('Escape')
    await expect(flyout).toBeHidden()
  })

  test('a tenant only lists the spaces it has', async ({ story, page }) => {
    await story.open('components-side-menu--chat-only')
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link')).toHaveText(['Home', 'Tasks', 'Chat'])
  })
})
