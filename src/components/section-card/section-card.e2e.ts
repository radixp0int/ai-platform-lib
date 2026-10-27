import { expect, test } from '../../../tests/story'

test.describe('SectionCard', () => {
  test('is a region named by its title', async ({ story, page }) => {
    await story.open('components-section-card--default')
    await expect(page.getByRole('region', { name: 'Inputs and outputs' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Inputs and outputs', level: 2 })).toBeVisible()
  })

  test('puts one action at the end of the header', async ({ story }) => {
    const root = await story.open('components-section-card--with-action')
    await expect(root.getByRole('button', { name: 'Try the start form' })).toBeVisible()
  })

  test('shows a footer strip only when it is given one', async ({ story }) => {
    const withFooter = await story.open('components-section-card--with-footer')
    await expect(withFooter.getByText('Dashed steps only run sometimes.')).toBeVisible()
    const without = await story.open('components-section-card--default')
    await expect(without.getByText('Dashed steps only run sometimes.')).toHaveCount(0)
  })

  test('full-bleed content reaches both edges of the card', async ({ story }) => {
    const root = await story.open('components-section-card--full-bleed')
    const card = (await root.getByRole('region').boundingBox())!
    const body = (await root.locator('[aria-hidden]').boundingBox())!
    expect(Math.abs(body.x - card.x)).toBeLessThanOrEqual(2)
    expect(Math.abs(body.x + body.width - (card.x + card.width))).toBeLessThanOrEqual(2)
  })
})
