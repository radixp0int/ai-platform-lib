import { expect, test } from '../../../tests/story'
import type { Page } from '@playwright/test'

const open = async (page: Page) => {
  await page.getByRole('button', { name: /^Switch tenant/ }).click()
  const list = page.getByRole('dialog', { name: 'Switch tenant' })
  await expect(list).toBeVisible()
  return list
}

test.describe('TenantSwitcher', () => {
  test('the button says which tenant is current', async ({ story, page }) => {
    await story.open('components-tenant-switcher--two-tenants')
    await expect(
      page.getByRole('button', { name: 'Switch tenant. Current tenant: Alderfinch Treasury' }),
    ).toBeVisible()
  })

  test('a member of two tenants gets a plain list: no paging, no admin links', async ({
    story,
    page,
  }) => {
    await story.open('components-tenant-switcher--two-tenants')
    const list = await open(page)
    await expect(list.getByRole('listitem')).toHaveCount(2)
    await expect(list.getByRole('button', { name: /^Load/ })).toHaveCount(0)
    await expect(list.getByRole('button', { name: 'View all tenants' })).toHaveCount(0)
  })

  test('the search narrows the list, and says when nothing matches', async ({ story, page }) => {
    await story.open('components-tenant-switcher--two-tenants')
    const list = await open(page)
    await list.getByRole('textbox', { name: 'Find a tenant' }).fill('retail')
    await expect(list.getByRole('listitem')).toHaveText([/Alderfinch Retail/])
    await list.getByRole('textbox', { name: 'Find a tenant' }).fill('zzz')
    await expect(list).toContainText('No loaded tenant matches “zzz”.')
  })

  test('choosing a tenant switches to it and closes the list', async ({ story, page }) => {
    await story.open('components-tenant-switcher--platform-admin')
    const list = await open(page)
    await list
      .getByRole('button', { name: /Alderfinch Retail/ })
      .first()
      .click()
    await expect(list).toBeHidden()
    await expect(
      page.getByRole('button', { name: 'Switch tenant. Current tenant: Alderfinch Retail' }),
    ).toBeVisible()
  })

  test('a platform admin can load more, and the button names how many', async ({ story, page }) => {
    await story.open('components-tenant-switcher--platform-admin')
    const list = await open(page)
    await expect(list.getByRole('listitem')).toHaveCount(3)
    await list.getByRole('button', { name: 'Load 5 more' }).click()
    await expect(list.getByRole('listitem')).toHaveCount(8)
  })

  test('each tenant but the current one offers an edit control', async ({ story, page }) => {
    await story.open('components-tenant-switcher--platform-admin')
    const list = await open(page)
    await expect(list.getByRole('button', { name: 'Edit Alderfinch Retail' })).toBeAttached()
    await expect(list.getByRole('button', { name: 'Edit Alderfinch Treasury' })).toHaveCount(0)
    await expect(list.getByText('Current tenant')).toBeAttached()
  })

  test('read-only, it is a label and not a control', async ({ story, page }) => {
    const root = await story.open('components-tenant-switcher--read-only')
    await expect(root).toContainText('Alderfinch Treasury')
    await expect(page.getByRole('button')).toHaveCount(0)
  })
})
