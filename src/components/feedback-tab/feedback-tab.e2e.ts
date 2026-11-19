import { expect, test } from '../../../tests/story'

test.describe('FeedbackTab', () => {
  test('is named by its label and described by what it does', async ({ story, page }) => {
    await story.open('components-feedbacktab--playground')
    const tab = page.getByRole('button', { name: 'Feedback' })
    await expect(tab).toBeVisible()
    await expect(tab).toHaveAccessibleDescription('Report a bug Tell us what went wrong')
  })

  test('closed, only the 30px strip shows and the label is not cut off', async ({
    story,
    page,
  }) => {
    await story.open('components-feedbacktab--playground')
    const tab = page.getByRole('button', { name: 'Feedback' })
    const box = await tab.boundingBox()
    expect(box?.width).toBe(30)
    const label = await tab.getByText('Feedback', { exact: true }).boundingBox()
    expect(label!.x).toBeGreaterThanOrEqual(box!.x)
    expect(label!.x + label!.width).toBeLessThanOrEqual(box!.x + box!.width)
  })

  test('hover slides it out to show the title', async ({ story, page }) => {
    await story.open('components-feedbacktab--playground')
    const tab = page.getByRole('button', { name: 'Feedback' })
    await tab.hover()
    await expect.poll(async () => (await tab.boundingBox())?.width).toBeGreaterThan(150)
  })

  test('keyboard focus slides it out too', async ({ story, page }) => {
    await story.open('components-feedbacktab--playground')
    const tab = page.getByRole('button', { name: 'Feedback' })
    await page.keyboard.press('Tab')
    await expect(tab).toBeFocused()
    await expect.poll(async () => (await tab.boundingBox())?.width).toBeGreaterThan(150)
  })

  test('with an href it is a link that opens in a new tab', async ({ story, page }) => {
    await story.open('components-feedbacktab--as-link')
    const link = page.getByRole('link', { name: 'Feedback' })
    await expect(link).toHaveAttribute('href', 'https://example.com/report-a-bug')
    await expect(link).toHaveAttribute('target', '_blank')
  })
})
