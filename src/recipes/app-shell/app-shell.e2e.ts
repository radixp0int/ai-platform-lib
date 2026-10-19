import { expect, test } from '../../../tests/story'

test.describe('App shell — tenants page', () => {
  test('a tenant with many spaces shows two and a count, and hovering shows the rest', async ({
    story,
    page,
  }) => {
    await story.open('recipes-app-shell--tenants')
    // Every space — Chat, Workflows, Insights, Ingestion — so two fold into "+2".
    const spaces = page
      .getByRole('list', { name: 'Spaces' })
      .filter({ has: page.getByRole('button', { name: '2 more' }) })
      .first()
    await expect(spaces.getByRole('listitem')).toHaveCount(3) // two pills and the count
    await expect(spaces.getByRole('button', { name: '2 more' })).toHaveText('+2')

    await spaces.hover()
    const card = page.locator('[data-pill-list-card]')
    await expect(card).toBeVisible()
    await expect(card.getByText('Insights', { exact: true })).toBeVisible()
    await expect(card.getByText('Ingestion', { exact: true })).toBeVisible()
  })

  test('a tenant with one space has no count', async ({ story, page }) => {
    await story.open('recipes-app-shell--tenants')
    const lists = page.getByRole('list', { name: 'Spaces' })
    const single = lists.filter({ hasNot: page.getByRole('button') }).first()
    await expect(single.getByRole('listitem')).toHaveCount(1)
  })

  test('no column header is cut off, even with its sort arrows beside it', async ({
    story,
    page,
  }) => {
    await story.open('recipes-app-shell--tenants')
    // Actions is a visually hidden label, so it is not measured.
    const cut = await page.getByRole('columnheader').evaluateAll((ths) =>
      ths
        .filter((th) => th.textContent !== 'Actions')
        .filter((th) => {
          const label = th.querySelector('span')
          return th.scrollWidth > th.clientWidth || (label && label.scrollWidth > label.clientWidth)
        })
        .map((th) => th.textContent),
    )
    expect(cut).toEqual([])
  })
})
