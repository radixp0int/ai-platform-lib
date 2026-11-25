import { expect, test } from '../../../../tests/story'

test.describe('Markdown', () => {
  test('it draws the usual structures as real elements', async ({ story, page }) => {
    await story.open('chat-components-markdown--gfm')
    await expect(page.getByRole('heading', { name: 'Everything GFM' })).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
    await expect(page.getByRole('blockquote')).toBeVisible()
    await expect(page.getByRole('link', { name: 'link' })).toHaveAttribute(
      'href',
      'https://example.com',
    )
  })

  test('task list boxes show state but cannot be changed', async ({ story, page }) => {
    await story.open('chat-components-markdown--gfm')
    for (const box of await page.getByRole('checkbox').all()) await expect(box).toBeDisabled()
  })

  test('a marker with no matching source is left as text', async ({ story, page }) => {
    const root = await story.open('chat-components-markdown--gfm')
    await expect(root).toContainText('[sic]')
    await expect(page.getByRole('button', { name: /^Open reference/ })).toHaveCount(0)
  })

  test('a mermaid fence becomes a diagram', async ({ story, page }) => {
    await story.open('chat-components-markdown--mermaid')
    await expect(page.getByRole('img', { name: 'Flowchart' }).first()).toBeVisible()
  })

  test('a half-streamed citation marker is not shown as broken syntax', async ({ story }) => {
    const root = await story.open('chat-components-markdown--streaming-partial-marker')
    await expect(root).not.toContainText('[')
  })

  test('a quote with no options is the library quote', async ({ story, page }) => {
    await story.open('chat-components-markdown--gfm')
    const quote = page.getByRole('blockquote')
    await expect(quote).toHaveCSS('border-left-width', '2px')
    await expect(quote).toHaveCSS('font-style', 'italic')
    await expect(quote).toHaveCSS('padding', '0px 0px 0px 16px')
    await expect(quote).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  })

  for (const mode of ['light', 'dark'] as const) {
    test(`the draft quote has its own rail, font and room (${mode})`, async ({ story, page }) => {
      const id = `chat-components-markdown--quote-looks${mode === 'dark' ? '-dark' : ''}`
      await story.open(id, { mode })
      const quote = (look: string) =>
        page.getByRole('region', { name: look, exact: true }).getByRole('blockquote')

      await expect(quote('Library')).toHaveCSS('border-left-width', '2px')
      await expect(quote('Library')).toHaveCSS('font-style', 'italic')

      const draft = quote('Draft')
      await expect(draft).toHaveCSS('border-left-width', '3px')
      await expect(draft).toHaveCSS('font-style', 'normal')
      await expect(draft).toHaveCSS('padding', '12px 14px')
      await expect(draft).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      // The accent rail is not the turn rail's colour.
      const rails = await Promise.all(
        [quote('Library'), draft].map((q) =>
          q.evaluate((el) => getComputedStyle(el).borderLeftColor),
        ),
      )
      expect(rails[0]).not.toEqual(rails[1])

      await expect(quote('Draft + tint')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    })
  }
})
