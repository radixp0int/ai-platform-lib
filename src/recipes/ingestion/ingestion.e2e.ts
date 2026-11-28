import type { Page } from '@playwright/test'
import { expect, test } from '../../../tests/story'
import { findCutOff } from '../../../tests/layout'

const id = (name: string) => `recipes-ingestion--${name}`
const table = (page: Page) => page.getByRole('table', { name: 'Ingestion sources' })
const bodyRows = (page: Page) => table(page).locator('tbody tr')
const row = (page: Page, name: string) => bodyRows(page).filter({ hasText: name })
const details = (page: Page) => page.getByRole('button', { name: /details$/ })

test.describe('Recipes/Ingestion, the band', () => {
  test('says what is failing, and Details opens the four figures', async ({ story, page }) => {
    await story.open(id('default'))
    await expect(page.getByRole('heading', { level: 1, name: 'Ingestion' })).toBeVisible()
    await expect(details(page)).toHaveText(/1 failing · Show details/)
    const strip = page.getByRole('group', { name: 'Ingestion details' })
    await expect(strip).toBeHidden()

    await details(page).click()
    await expect(details(page)).toHaveAttribute('aria-expanded', 'true')
    await expect(details(page)).toHaveText(/Hide details/)
    for (const label of ['Documents', 'Sources syncing', 'Added this week', 'Last sync']) {
      await expect(strip.getByText(label, { exact: true })).toBeVisible()
    }
    await expect(strip).toContainText('1,171')
    await expect(strip).toContainText('13 of 14')
    await expect(strip).toContainText('1 failing: Pricing sheets API')
  })

  test('has the three page actions, Upload documents opening the wizard', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await expect(page.getByRole('button', { name: 'Schedule a sync' })).toBeVisible()
    await page.getByRole('button', { name: 'Connect an API' }).click()
    await expect(page.getByRole('status')).toHaveText('Connect an API would open here')
    await page.getByRole('button', { name: 'Upload documents' }).click()
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Add a source')
  })

  test('Details open starts with the strip showing', async ({ story, page }) => {
    await story.open(id('details-open'))
    await expect(page.getByRole('group', { name: 'Ingestion details' })).toBeVisible()
  })
})

test.describe('Recipes/Ingestion, the grid', () => {
  test('lists eight sources a page, newest sync first, with pages under them', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await expect(page.getByText('14 connected, 1 failing')).toBeVisible()
    await expect(bodyRows(page)).toHaveCount(8)
    await expect(page.getByRole('columnheader', { name: /Last sync/ })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
    await page.getByRole('button', { name: 'Next', exact: false }).last().click()
    await expect(bodyRows(page)).toHaveCount(6)
  })

  test('sorting by Source puts the list in A to Z order', async ({ story, page }) => {
    await story.open(id('default'))
    await table(page).getByRole('button', { name: 'Source', exact: true }).click()
    await expect(page.getByRole('columnheader', { name: /Source/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
    await expect(bodyRows(page).first()).toContainText('Data retention rules')
  })

  test('the Filters panel narrows by status and type, and its picks show as chips', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await page.getByRole('button', { name: /^Filters/ }).click()
    const panel = page.getByRole('region', { name: 'Filters' })
    await panel.getByRole('checkbox', { name: /^Failing/ }).check()
    await expect(bodyRows(page)).toHaveCount(1)
    await expect(bodyRows(page).first()).toContainText('Pricing sheets API')
    await expect(page.getByTitle('status: Failing', { exact: true })).toBeVisible()

    await panel.getByRole('checkbox', { name: /^Failing/ }).uncheck()
    await panel.getByRole('checkbox', { name: /^Website/ }).check()
    await expect(bodyRows(page)).toHaveCount(3)
  })

  test('a search that finds nothing says so, and Clear all brings the rows back', async ({
    story,
    page,
  }) => {
    await story.open(id('no-match'))
    await expect(page.getByText('No sources match')).toBeVisible()
    await page.getByRole('button', { name: 'Clear all filters' }).click()
    await expect(bodyRows(page)).toHaveCount(8)
  })

  test('selecting rows shows the bulk bar; Sync now starts them', async ({ story, page }) => {
    await story.open(id('default'))
    await page.getByRole('checkbox', { name: 'Select Pricing sheets API' }).check()
    await page.getByRole('checkbox', { name: 'Select Release notes' }).check()
    await expect(page.getByText('2 selected')).toBeVisible()
    await page.getByRole('button', { name: 'Sync now', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Sync started for 2 sources')
    await expect(row(page, 'Pricing sheets API')).toContainText('Syncing')
    await expect(details(page)).toHaveText(/^Show details/)

    await page.getByRole('checkbox', { name: 'Select all rows on this page' }).check()
    await expect(page.getByText('8 selected')).toBeVisible()
    await page.getByRole('button', { name: 'Clear', exact: true }).click()
    await expect(page.getByText('8 selected')).toHaveCount(0)
  })

  test('each row has Sync now, Edit and More', async ({ story, page }) => {
    await story.open(id('default'))
    await page.getByRole('button', { name: 'Sync Pricing sheets API now' }).click()
    await expect(page.getByRole('status')).toHaveText('Sync started for Pricing sheets API')
    await expect(row(page, 'Pricing sheets API')).toContainText('Syncing')
    await page.getByRole('button', { name: 'Edit Vendor contracts' }).click()
    await expect(page.getByRole('status')).toHaveText('Editing Vendor contracts would open here')
    await expect(page.getByRole('button', { name: 'More for Vendor contracts' })).toBeVisible()
  })

  test('Export offers CSV and JSON', async ({ story, page }) => {
    await story.open(id('default'))
    await page.getByRole('button', { name: /^Export/ }).click()
    await expect(page.getByRole('menuitem', { name: /CSV/ })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /JSON/ })).toBeVisible()
  })

  test('an empty tenant is offered Upload documents', async ({ story, page }) => {
    await story.open(id('empty'))
    await expect(page.getByText('Nothing in Ingestion yet')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Upload documents' })).toHaveCount(2)
  })

  test('nothing is cut off at 1024 or at 834', async ({ story, page }) => {
    for (const width of [1024, 834]) {
      await page.setViewportSize({ width, height: 900 })
      await story.open(id('default'))
      await expect(bodyRows(page)).toHaveCount(8)
      expect(await findCutOff(page)).toEqual([])
    }
  })
})
