import { expect, test } from '../../../tests/story'

test.describe('SideMenu', () => {
  test('the rail lists the apps by their short names, the current one marked', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--default')
    const rail = page.getByRole('navigation', { name: 'Apps' })
    await expect(rail.locator('[aria-current="page"]')).toContainText('Flows')
    await expect(rail.getByRole('link', { name: 'Home' })).toHaveAttribute('href', /\/home$/)
    await expect(rail.getByRole('link', { name: 'Tasks, 2 waiting' })).toBeVisible()
  })

  test('pressing your own app’s icon folds its panel away, and again brings it back', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--default')
    const panel = page.getByRole('complementary', { name: 'Workflows' })
    await expect(panel).toBeVisible()
    await page.getByRole('link', { name: 'Workflows' }).click()
    await expect(panel).toHaveCount(0)
    await page.getByRole('link', { name: 'Workflows' }).click()
    await expect(panel).toBeVisible()
  })

  test('the panel’s collapse button folds it', async ({ story, page }) => {
    await story.open('components-side-menu--default')
    await page.getByRole('button', { name: 'Collapse panel' }).click()
    await expect(page.getByRole('complementary')).toHaveCount(0)
  })

  test('an app without a panel is the rail alone', async ({ story, page }) => {
    await story.open('components-side-menu--no-panel')
    await expect(page.getByRole('navigation', { name: 'Apps' })).toBeVisible()
    await expect(page.getByRole('complementary')).toHaveCount(0)
  })

  test('the panel’s edge is a separator the arrow keys move, and a double-click resets', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--default')
    const panel = page.getByRole('complementary', { name: 'Workflows' })
    const handle = page.getByRole('separator', { name: 'Resize the Workflows panel' })
    await expect(handle).toHaveAttribute('aria-valuenow', '260')
    await handle.focus()
    await page.keyboard.press('ArrowRight')
    await expect(handle).toHaveAttribute('aria-valuenow', '276')
    await page.keyboard.press('End')
    await expect(handle).toHaveAttribute('aria-valuenow', '420')
    await expect(panel).toHaveCSS('width', '420px')
    await handle.dblclick()
    await expect(handle).toHaveAttribute('aria-valuenow', '260')
  })

  test('dragging the edge changes the width', async ({ story, page }) => {
    await story.open('components-side-menu--default')
    const handle = page.getByRole('separator', { name: 'Resize the Workflows panel' })
    const box = (await handle.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + 200)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + 200, { steps: 4 })
    await page.mouse.up()
    await expect
      .poll(async () => Number(await handle.getAttribute('aria-valuenow')))
      .toBeGreaterThan(300)
  })

  test('the grid opens every app as a tile, and the search narrows them', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--default')
    await page.getByRole('button', { name: 'All apps' }).click()
    const panel = page.getByRole('complementary', { name: 'All apps' })
    await expect(panel.getByRole('link', { name: 'Insights' })).toBeVisible()
    await expect(panel.getByRole('link', { name: 'Ingestion' })).toBeVisible()
    await panel.getByRole('searchbox').fill('inge')
    await expect(panel.getByRole('link', { name: 'Insights' })).toHaveCount(0)
    await panel.getByRole('searchbox').fill('zzz')
    await expect(panel).toContainText('Nothing called “zzz”.')
  })

  test('with the panel folded, resting on the icon shows the short version, which can pin it', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--panel-folded')
    await page.getByRole('link', { name: 'Workflows' }).hover()
    const card = page.getByRole('group', { name: 'Workflows' })
    await expect(card).toContainText('Recently viewed')
    await card.getByRole('button', { name: 'Pin panel' }).click()
    await expect(page.getByRole('complementary', { name: 'Workflows' })).toBeVisible()
  })

  test('a page adds a section to the panel, and it stays the page’s own', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--with-page-section')
    const section = page.getByRole('region', { name: 'This page' })
    await expect(section).toContainText('Supplier onboarding checklist')
    await page.getByRole('button', { name: 'Collapse panel' }).click()
    await expect(section).toHaveCount(0)
  })

  test('a panel lists destinations with a second line, a status dot and indented children', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--home-panel')
    const rail = page.getByRole('navigation', { name: 'Apps' })
    // Tenants is listed only in the Home panel, so Home is the app you are in.
    await expect(rail.locator('[aria-current="page"]')).toContainText('Home')
    const panel = page.getByRole('complementary', { name: 'Home' })
    await expect(panel.getByRole('link', { name: /Ingestion/ })).toContainText(
      '13 of 14 sources syncing',
    )
    for (const status of ['warning', 'error', 'info', 'success', 'idle']) {
      await expect(panel.locator(`[data-status="${status}"]`)).toHaveCount(1)
    }
    const sub = panel.getByRole('group', { name: 'Tenant Admin' })
    await expect(sub.getByRole('link')).toHaveCount(3)
    await expect(sub).toHaveCSS('border-left-style', 'solid')
    await expect(sub.getByRole('link', { name: /^Tenants/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(panel.getByRole('link', { name: /^Tenant Admin/ })).not.toHaveAttribute(
      'aria-current',
    )
    // Each child sits on the rule: flush against it, square on the left and
    // rounded on the right, with the rule still drawn beside it.
    const tenants = sub.getByRole('link', { name: /^Tenants/ })
    await expect(tenants).toHaveCSS('border-top-left-radius', '0px')
    await expect(tenants).toHaveCSS('border-bottom-left-radius', '0px')
    await expect(tenants).not.toHaveCSS('border-top-right-radius', '0px')
    const ruleBox = (await sub.boundingBox())!
    expect((await tenants.boundingBox())!.x).toBe(ruleBox.x + 1)
    // The whole list fits the story's frame: the last child is not cut off.
    const last = (await sub.getByRole('link', { name: /^Usage and plans/ }).boundingBox())!
    const frame = (await panel.boundingBox())!
    expect(last.y + last.height).toBeLessThanOrEqual(frame.y + frame.height)
    // The children sit to the right of their parent.
    const parentBox = (await panel.getByRole('link', { name: /^Tenant Admin/ }).boundingBox())!
    const childBox = (await sub.getByRole('link', { name: /^Tenants/ }).boundingBox())!
    expect(childBox.x).toBeGreaterThan(parentBox.x + 12)
  })

  test('the status dots keep distinct colours in dark mode', async ({ story, page }) => {
    await story.open('components-side-menu--home-panel-dark', { mode: 'dark' })
    const panel = page.getByRole('complementary', { name: 'Home' })
    const colour = (status: string) =>
      panel
        .locator(`[data-status="${status}"]`)
        .evaluate((dot) => getComputedStyle(dot).backgroundColor)
    const colours = await Promise.all(['warning', 'error', 'info', 'success'].map(colour))
    expect(new Set(colours).size).toBe(4)
  })

  test.describe('below 1200px', () => {
    test.use({ viewport: { width: 1024, height: 800 } })

    test('the panel starts closed, and the rail icon slides it over the page', async ({
      story,
      page,
    }) => {
      await story.open('components-side-menu--tablet')
      const panel = page.getByRole('complementary', { name: 'Home' })
      const heading = page.getByRole('heading', { name: 'Tenants', level: 1 })
      const home = page.getByRole('link', { name: 'Home' })
      await expect(panel).toHaveCount(0)
      await expect(home).toHaveAttribute('aria-expanded', 'false')
      const before = (await heading.boundingBox())!.x
      await home.click()
      await expect(panel).toBeVisible()
      await expect(panel).toHaveAttribute('data-overlay', 'true')
      await expect(panel).toHaveCSS('position', 'absolute')
      await expect(home).toHaveAttribute('aria-expanded', 'true')
      // Over the page, not beside it: the page has not moved.
      expect((await heading.boundingBox())!.x).toBe(before)
      await home.click()
      await expect(panel).toHaveCount(0)
    })

    test('the collapse button and Escape shut it', async ({ story, page }) => {
      await story.open('components-side-menu--tablet')
      const panel = page.getByRole('complementary', { name: 'Home' })
      const home = page.getByRole('link', { name: 'Home' })
      await home.click()
      await panel.getByRole('button', { name: 'Collapse panel' }).click()
      await expect(panel).toHaveCount(0)
      await home.click()
      await panel.getByRole('link', { name: /^People and roles/ }).focus()
      await page.keyboard.press('Escape')
      await expect(panel).toHaveCount(0)
      await expect(home).toBeFocused()
    })
  })

  test('narrowing the window shuts the panel, and widening brings it back', async ({
    story,
    page,
  }) => {
    await story.open('components-side-menu--home-panel')
    const panel = page.getByRole('complementary', { name: 'Home' })
    await expect(panel).toBeVisible()
    await expect(panel).not.toHaveAttribute('data-overlay')
    await page.setViewportSize({ width: 1024, height: 800 })
    await expect(panel).toHaveCount(0)
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(panel).toBeVisible()
  })
})
