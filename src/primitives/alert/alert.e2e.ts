import { expect, test } from '../../../tests/story'

test.describe('Alert', () => {
  test('only the danger tone interrupts: it is an alert, the rest are status', async ({
    story,
    page,
  }) => {
    await story.open('primitives-alert--tones')
    await expect(page.getByRole('alert')).toHaveCount(1)
    await expect(page.getByRole('alert')).toContainText('The import could not be completed')
    await expect(page.getByRole('status')).toHaveCount(3)
  })

  test('dismissing removes it', async ({ story, page }) => {
    await story.open('primitives-alert--dismissible')
    await page.getByRole('button', { name: 'Dismiss citation shortcut notice' }).click()
    await expect(page.getByText('Citation shortcuts are available')).toBeHidden()
  })

  test('a list of problems is a real list', async ({ story, page }) => {
    await story.open('primitives-alert--with-items')
    await expect(page.getByRole('alert').getByRole('listitem')).toHaveCount(3)
  })

  test('technical details stay folded until asked for', async ({ story, page }) => {
    await story.open('primitives-alert--action-and-details')
    const details = page.locator('details')
    await expect(details).not.toHaveAttribute('open', '')
    await page.getByText('Show API response').click()
    await expect(details).toHaveAttribute('open', '')
  })

  test('actions are buttons a keyboard can reach', async ({ story, page }) => {
    await story.open('primitives-alert--inline-banner')
    await page.getByRole('button', { name: 'Pay invoice' }).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Contact billing' })).toBeFocused()
  })
})

test.describe('Alert variant', () => {
  /** The bar's edge colour, read off the inset shadow's first layer. */
  const edgeOf = (el: Element) => {
    const shadow = getComputedStyle(el).boxShadow
    // Tailwind leads with empty ring layers; tone colours may compute to oklch.
    const match = shadow.match(/([a-z]+\([^)]*\)) 3px 0px 0px 0px inset/)
    return match ? match[1] : null
  }

  test('a panel by default: rounded, with the glyph in a tile', async ({ story, page }) => {
    await story.open('primitives-alert--playground')
    const alert = page.getByRole('status')
    await expect(alert).toHaveAttribute('data-variant', 'panel')
    await expect(alert).not.toHaveCSS('border-top-left-radius', '0px')
    expect(await alert.evaluate(edgeOf)).toBeNull()
  })

  test('a bar is square with a 3px tone edge and a plain glyph, in every tone', async ({
    story,
    page,
  }) => {
    await story.open('primitives-alert--looks')
    const bars = page.locator('[data-variant="bar"]')
    await expect(bars).toHaveCount(4)
    for (const bar of await bars.all()) {
      await expect(bar).toHaveCSS('border-top-left-radius', '0px')
      const glyph = bar.locator('> span[aria-hidden="true"]')
      await expect(glyph).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      const edge = await bar.evaluate(edgeOf)
      expect(edge, 'the edge is an inset shadow').not.toBeNull()
      // Edge and glyph share the tone colour.
      await expect(glyph).toHaveCSS('color', edge!)
    }
    // Warning is the caution amber.
    expect(await page.locator('[data-variant="bar"][data-tone="warning"]').evaluate(edgeOf)).toBe(
      'rgb(161, 98, 7)',
    )
    await expect(page.locator('[data-variant="panel"]')).toHaveCount(4)
  })

  test('in dark, the edge takes the dark tone value', async ({ story, page }) => {
    await story.open('primitives-alert--looks-dark')
    const warning = page.locator('[data-variant="bar"][data-tone="warning"]')
    const edge = await warning.evaluate(edgeOf)
    expect(edge).not.toBeNull()
    expect(edge).not.toBe('rgb(161, 98, 7)')
    await expect(warning.locator('> span[aria-hidden="true"]')).toHaveCSS('color', edge!)
  })

  test('docked above the composer, it sits on top and dismisses', async ({ story, page }) => {
    await story.open('primitives-alert--docked-above-composer')
    const notice = page.getByRole('status').filter({ hasText: 'Acme can make mistakes.' })
    const composer = page.getByRole('textbox').first()
    const noticeBox = (await notice.boundingBox())!
    const composerBox = (await composer.boundingBox())!
    expect(noticeBox.y + noticeBox.height).toBeLessThanOrEqual(composerBox.y)
    await page.getByRole('button', { name: 'Dismiss accuracy notice' }).click()
    await expect(notice).toBeHidden()
    await expect(composer).toBeVisible()
  })
})
