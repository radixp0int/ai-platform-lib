import type { Page } from '@playwright/test'
import { expect, test } from '../../../tests/story'
import { findCutOff } from '../../../tests/layout'

const id = (name: string) => `recipes-tenants--${name}`
const table = (page: Page) => page.getByRole('table', { name: 'Tenants' })
const bodyRows = (page: Page) => table(page).locator('tbody tr')
const row = (page: Page, name: string) => bodyRows(page).filter({ hasText: name })
const details = (page: Page) => page.getByRole('button', { name: /details$/ })
const more = (page: Page, name: string) =>
  page.getByRole('button', { name: `More actions for ${name}` })
const menu = (page: Page, name: string) => page.getByRole('menu', { name: `Actions for ${name}` })

test.describe('Recipes/Tenants, the band', () => {
  test('the link just says Show details, and opens the four figures', async ({ story, page }) => {
    await story.open(id('default'))
    await expect(page.getByRole('heading', { level: 1, name: 'Tenants' })).toBeVisible()
    await expect(details(page)).toHaveText(/^Show details/)
    await details(page).click()
    await expect(details(page)).toHaveText(/^Hide details/)
    const strip = page.getByRole('group', { name: 'Tenants details' })
    await expect(strip).toContainText('Tenants15You are in Alderfinch Group')
    await expect(strip).toContainText('Seats in use2,080 of 2,655')
    await expect(strip).toContainText('78% of paid seats in use')
    await expect(strip).toContainText('Plans6 · 6 · 3Enterprise · Growth · Starter')
    await expect(strip).toContainText('New in the last 90 days')
    await expect(strip).toContainText('Most recent: Pinecrest Retail')
    // Nothing in it is a filter any more.
    await expect(strip.getByRole('button')).toHaveCount(0)
  })

  test('Import from CSV and Add a tenant are in the band', async ({ story, page }) => {
    await story.open(id('default'))
    await page.getByRole('button', { name: 'Import from CSV' }).click()
    await expect(page.getByRole('status')).toHaveText('Import from CSV would open here')
    await expect(page.getByRole('button', { name: 'Add a tenant' })).toBeVisible()
  })

  test('the Home panel describes tenants, not invites', async ({ story, page }) => {
    await story.open(id('default'))
    const panel = page.getByRole('complementary', { name: 'Home' })
    await expect(panel.getByRole('link', { name: /^Tenant Admin/ })).toContainText(
      '15 tenants · 1,204 people',
    )
    await expect(panel.getByRole('link', { name: /^Tenants/ })).toContainText(
      'Every organisation, and the one you are in',
    )
  })
})

test.describe('Recipes/Tenants, the grid', () => {
  test('one tenant is Active, the one you are in; the rest show a dash', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await expect(bodyRows(page)).toHaveCount(8)
    await expect(table(page).getByText('Active', { exact: true })).toHaveCount(1)
    await expect(row(page, 'Alderfinch Group')).toContainText('Active')
    await expect(row(page, 'Bayshore Foods')).toContainText('—')
    await expect(row(page, 'Bayshore Foods')).not.toContainText('Active')
    await expect(page.getByText(/Pending|Suspended|Resend invite|Reactivate/)).toHaveCount(0)
  })

  test('shows plan and region, contact, seats and created', async ({ story, page }) => {
    await story.open(id('default'))
    const bayshore = row(page, 'Bayshore Foods')
    await expect(bayshore).toContainText('Enterprise · US East')
    await expect(bayshore).toContainText('Marcus Webb')
    await expect(bayshore).toContainText('182 of 200 · nearly full')
    await expect(row(page, 'Crestview Builders')).not.toContainText('nearly full')
  })

  test('the actions column is headed Actions, right-aligned over the buttons', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    const header = table(page).getByRole('columnheader', { name: 'Actions' })
    const word = header.getByText('Actions')
    await expect(word).toBeVisible()
    await expect(header).toHaveCSS('text-align', 'right')
    // Still a column header for a screen reader: one of them, in the header row.
    await expect(header).toHaveCount(1)
    await expect(header).toHaveAttribute('scope', 'col')

    // It ends where the ⋯ button below it does.
    const wordBox = (await word.boundingBox())!
    const dotsBox = (await more(page, 'Alderfinch Group').boundingBox())!
    expect(Math.abs(wordBox.x + wordBox.width - (dotsBox.x + dotsBox.width))).toBeLessThanOrEqual(
      1.5,
    )
    // And it is over the buttons, not over the tenant name.
    const eye = (await page
      .getByRole('button', { name: 'View details for Alderfinch Group' })
      .boundingBox())!
    expect(wordBox.x).toBeGreaterThan(eye.x - 40)
  })

  test('sorts by name, then by created, newest first', async ({ story, page }) => {
    await story.open(id('default'))
    await expect(bodyRows(page).first()).toContainText('Alderfinch Group')
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

  test('pages through fifteen tenants, eight at a time', async ({ story, page }) => {
    await story.open(id('default'))
    await expect(page.getByText('1–8 of 15')).toBeVisible()
    await page.getByRole('button', { name: /^Next/ }).click()
    await expect(bodyRows(page)).toHaveCount(7)
  })

  test('filters by plan, region, created and active seats, with no Status filter', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await page.getByRole('button', { name: /^Filters/ }).click()
    const panel = page.getByRole('region', { name: 'Filters' })
    for (const name of ['Plan', 'Region', 'Created']) {
      await expect(panel.getByText(name, { exact: true }).first()).toBeVisible()
    }
    await expect(panel.getByText('Status', { exact: true })).toHaveCount(0)
    await panel.getByRole('checkbox', { name: /^Enterprise/ }).check()
    await expect(bodyRows(page)).toHaveCount(6)
    await panel.getByRole('checkbox', { name: /^US West/ }).check()
    await expect(bodyRows(page)).toHaveCount(1)
    await expect(bodyRows(page).first()).toContainText('Ironwood Health')
    await panel.getByRole('button', { name: 'Reset' }).click()

    await panel.getByRole('switch', { name: /Has active seats/ }).click()
    await expect(page.getByText('15 tenants · sorted by name, A to Z')).toBeVisible()
    await panel.getByRole('switch', { name: /Has active seats/ }).click()

    await panel.getByRole('button', { name: /Last 30 days/ }).click()
    await expect(page.getByText('3 of 15 tenants match', { exact: false })).toBeVisible()
  })

  test('selecting rows shows Change plan, Export and Delete', async ({ story, page }) => {
    await story.open(id('default'))
    await page.getByRole('checkbox', { name: 'Select Bayshore Foods' }).check()
    await page.getByRole('checkbox', { name: 'Select Capstone Travel' }).check()
    await expect(page.getByText('2 selected')).toBeVisible()
    // The bulk bar: the count, then its actions.
    const bar = page.locator('div', { has: page.getByText('2 selected', { exact: true }) }).last()
    await expect(bar.getByRole('button', { name: 'Change plan', exact: true })).toBeVisible()
    const download = page.waitForEvent('download')
    await bar.getByRole('button', { name: 'Export', exact: true }).click()
    expect((await download).suggestedFilename()).toBe('tenants.csv')
    await expect(page.getByRole('status')).toHaveText('Downloaded tenants.csv · 2 rows')
    await bar.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Deleting 2 tenants would ask you to confirm')
  })

  test('every row has View details, Edit and More actions', async ({ story, page }) => {
    await story.open(id('default'))
    await page.getByRole('button', { name: 'View details for Bayshore Foods' }).click()
    await expect(page.getByRole('status')).toHaveText('Details for Bayshore Foods would open here')
    await page.getByRole('button', { name: 'Edit for Bayshore Foods' }).click()
    await expect(page.getByRole('status')).toHaveText('Editing Bayshore Foods would open here')
    await expect(more(page, 'Bayshore Foods')).toBeVisible()
  })

  test('More actions: Switch, Copy tenant ID, Manage people, a rule, then Delete', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await more(page, 'Crestview Builders').click()
    await expect(more(page, 'Crestview Builders')).toHaveAttribute('aria-expanded', 'true')
    const list = menu(page, 'Crestview Builders')
    await expect(list.getByRole('menuitem')).toHaveText([
      'Switch to this tenant',
      'Copy tenant ID',
      'Manage people',
      'Delete tenant…',
    ])
    await expect(list.getByRole('separator')).toHaveCount(1)
    await expect(list.getByRole('menuitem', { name: 'Delete tenant…' })).toBeEnabled()

    await list.getByRole('menuitem', { name: 'Switch to this tenant' }).click()
    await expect(list).toBeHidden()
    await expect(page.getByRole('status')).toHaveText('You are in Crestview Builders now')
    await expect(row(page, 'Crestview Builders')).toContainText('Active')
    await expect(row(page, 'Alderfinch Group')).not.toContainText('Active')
  })

  test('on the tenant you are in, there is no Switch and Delete is disabled', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await more(page, 'Alderfinch Group').click()
    const list = menu(page, 'Alderfinch Group')
    await expect(list.getByRole('menuitem', { name: 'Switch to this tenant' })).toHaveCount(0)
    const remove = list.getByRole('menuitem', { name: /Delete tenant…/ })
    await expect(remove).toBeDisabled()
    await expect(remove).toContainText('You are in it')
    await list.getByRole('menuitem', { name: 'Copy tenant ID' }).click()
    await expect(page.getByRole('status')).toHaveText('Copied Alderfinch Group’s tenant ID, org_01')
  })

  test('the menu opens upward on the last rows of a page, downward above them', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    for (const [name, up] of [
      ['Ironwood Health', true],
      ['Bayshore Foods', false],
    ] as const) {
      await more(page, name).click()
      await expect(menu(page, name)).toBeVisible()
      const button = (await more(page, name).boundingBox())!
      const list = (await menu(page, name).boundingBox())!
      if (up) expect(list.y + list.height).toBeLessThan(button.y)
      else expect(list.y).toBeGreaterThan(button.y + button.height)
      await page.keyboard.press('Escape')
    }
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
