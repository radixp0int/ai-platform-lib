import { expect, test } from '../../../tests/story'

test.describe('PageHeader', () => {
  test("the title is the page's one level-one heading", async ({ story, page }) => {
    await story.open('components-page-header--default')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Runs')
    await expect(page.getByRole('banner')).toContainText('Workflows in Alderfinch Treasury.')
  })

  test('without a description there is no empty paragraph', async ({ story, page }) => {
    const root = await story.open('components-page-header--title-only')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tasks')
    await expect(root.locator('p')).toHaveCount(0)
  })

  test('children ride beside the title', async ({ story, page }) => {
    const root = await story.open('components-page-header--with-status')
    const title = (await page.getByRole('heading', { level: 1 }).boundingBox())!
    const status = (await root.getByText('2 waiting').boundingBox())!
    expect(status.x).toBeGreaterThan(title.x + title.width)
  })

  test('an action sits beside the header, outside it', async ({ story, page }) => {
    await story.open('components-page-header--beside-an-action')
    const action = page.getByRole('button', { name: 'Add a source' })
    await expect(action).toBeVisible()
    await expect(page.getByRole('banner').getByRole('button')).toHaveCount(0)
  })
})
