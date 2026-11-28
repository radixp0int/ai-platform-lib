import type { Page } from '@playwright/test'
import { expect, test } from '../../../tests/story'
import { findCutOff } from '../../../tests/layout'

const id = (name: string) => `recipes-tenants--${name}`
const table = (page: Page) => page.getByRole('table', { name: 'Tenants' })
const bodyRows = (page: Page) => table(page).locator('tbody tr')
const row = (page: Page, name: string) => bodyRows(page).filter({ hasText: name })
const details = (page: Page) => page.getByRole('button', { name: /details$/ })

test.describe('Recipes/Tenants, the band', () => {
  test('says how many need a look, and Details opens the four figures', async ({ story, page }) => {
    await story.open(id('default'))
    await expect(page.getByRole('heading', { level: 1, name: 'Tenants' })).toBeVisible()
    await expect(details(page)).toHaveText(/5 need a look · Show details/)
    await details(page).click()
    const strip = page.getByRole('group', { name: 'Tenants details' })
    await expect(strip).toBeVisible()
    await expect(strip.getByRole('button', { name: /^Active 9/ })).toBeVisible()
    await expect(strip.getByRole('button', { name: /^Waiting on an invite 3/ })).toContainText(
      'Oldest sent 23 days ago',
    )
    await expect(strip.getByRole('button', { name: /^Suspended 2/ })).toBeVisible()
    await expect(strip).toContainText('1,198 of 1,535')
  })

  test('a figure filters the grid to its tenants', async ({ story, page }) => {
    await story.open(id('details-open'))
    await page
      .getByRole('group', { name: 'Tenants details' })
      .getByRole('button', { name: /^Waiting on an invite/ })
      .click()
    await expect(bodyRows(page)).toHaveCount(3)
    await expect(page.getByTitle('status: Pending', { exact: true })).toBeVisible()
    await expect(page.getByText('3 of 14 tenants match · sorted by name, A to Z')).toBeVisible()
  })

  test('Import from CSV and Add a tenant are in the band', async ({ story, page }) => {
    await story.open(id('default'))
    await page.getByRole('button', { name: 'Import from CSV' }).click()
    await expect(page.getByRole('status')).toHaveText('Import from CSV would open here')
    await expect(page.getByRole('button', { name: 'Add a tenant' })).toBeVisible()
  })
})

test.describe('Recipes/Tenants, the grid', () => {
  test('shows plan and region, status, contact, seats and created', async ({ story, page }) => {
    await story.open(id('default'))
    await expect(bodyRows(page)).toHaveCount(8)
    const bayshore = row(page, 'Bayshore Foods')
    await expect(bayshore).toContainText('Enterprise · US East')
    await expect(bayshore).toContainText('Active')
    await expect(bayshore).toContainText('Marcus Webb')
    await expect(bayshore).toContainText('182 of 200 · nearly full')
    await expect(row(page, 'Crestview Builders')).not.toContainText('nearly full')
    await expect(row(page, 'Capstone Travel')).toContainText('Contract ended Oct 31')
  })

  test('sorts by name, then by created, newest first', async ({ story, page }) => {
    await story.open(id('default'))
    await expect(bodyRows(page).first()).toContainText('Bayshore Foods')
    await table(page).getByRole('button', { name: 'Tenant', exact: true }).click()
    await expect(bodyRows(page).first()).toContainText('Pinecrest Retail')
    await table(page).getByRole('button', { name: 'Created', exact: true }).click()
    await table(page).getByRole('button', { name: 'Created', exact: true }).click()
    await expect(page.getByRole('columnheader', { name: /Created/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
    await expect(page.getByText(/sorted by newest first/)).toBeVisible()
    await expect(bodyRows(page).first()).toContainText('Pinecrest Retail')
  })

  test('filters by status, plan, region, created and active seats', async ({ story, page }) => {
    await story.open(id('default'))
    await page.getByRole('button', { name: /^Filters/ }).click()
    const panel = page.getByRole('region', { name: 'Filters' })
    for (const name of ['Status', 'Plan', 'Region', 'Created']) {
      await expect(panel.getByText(name, { exact: true }).first()).toBeVisible()
    }
    await panel.getByRole('checkbox', { name: /^Enterprise/ }).check()
    await expect(bodyRows(page)).toHaveCount(5)
    await panel.getByRole('checkbox', { name: /^US West/ }).check()
    await expect(bodyRows(page)).toHaveCount(1)
    await expect(bodyRows(page).first()).toContainText('Ironwood Health')
    await panel.getByRole('button', { name: 'Reset' }).click()

    await panel.getByRole('switch', { name: /Has active seats/ }).click()
    await expect(page.getByText('9 of 14 tenants match', { exact: false })).toBeVisible()
    await panel.getByRole('switch', { name: /Has active seats/ }).click()

    await panel.getByRole('button', { name: /Last 30 days/ }).click()
    await expect(page.getByText('3 of 14 tenants match', { exact: false })).toBeVisible()
  })

  test('selecting rows shows the bulk bar; Suspend suspends them', async ({ story, page }) => {
    await story.open(id('default'))
    await page.getByRole('checkbox', { name: 'Select Bayshore Foods' }).check()
    await expect(page.getByText('1 selected')).toBeVisible()
    for (const name of ['Change plan', 'Email contacts']) {
      await expect(page.getByRole('button', { name, exact: true })).toBeVisible()
    }
    await page.getByRole('button', { name: 'Suspend', exact: true }).click()
    await expect(row(page, 'Bayshore Foods')).toContainText('Suspended')
    await expect(
      row(page, 'Bayshore Foods').getByRole('button', { name: 'Reactivate' }),
    ).toBeVisible()
    await expect(details(page)).toHaveText(/6 need a look/)
  })

  test('row actions: Resend invite, Reactivate and Open', async ({ story, page }) => {
    await story.open(id('default'))
    await row(page, 'Fairfield Studios').getByRole('button', { name: 'Resend invite' }).click()
    await expect(page.getByRole('status')).toHaveText('Invite resent to Nia Coleman')
    await expect(row(page, 'Fairfield Studios')).toContainText('Invite sent today')

    await row(page, 'Capstone Travel').getByRole('button', { name: 'Reactivate' }).click()
    await expect(row(page, 'Capstone Travel')).toContainText('Active')
    await expect(row(page, 'Capstone Travel').getByRole('button', { name: 'Open' })).toBeVisible()
    await expect(details(page)).toHaveText(/4 need a look/)
  })

  test('a search that finds nothing says so, and Clear all brings the rows back', async ({
    story,
    page,
  }) => {
    await story.open(id('no-match'))
    await expect(page.getByText('No tenants match')).toBeVisible()
    await page.getByRole('button', { name: 'Clear all filters' }).click()
    await expect(bodyRows(page)).toHaveCount(8)
  })

  test('with no tenants, the empty state offers Add a tenant', async ({ story, page }) => {
    await story.open(id('empty'))
    await expect(page.getByText('No tenants yet')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add a tenant' })).toHaveCount(2)
  })

  test('drops Created at 1024 and Primary contact at 834, cutting nothing off', async ({
    story,
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await story.open(id('default'))
    await expect(page.getByRole('columnheader', { name: /Created/ })).toBeHidden()
    await expect(page.getByRole('columnheader', { name: 'Primary contact' })).toBeVisible()
    expect(await findCutOff(page)).toEqual([])

    await page.setViewportSize({ width: 834, height: 1112 })
    await story.open(id('default'))
    await expect(page.getByRole('columnheader', { name: 'Primary contact' })).toBeHidden()
    expect(await findCutOff(page)).toEqual([])
  })
})
