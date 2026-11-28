import type { Page } from '@playwright/test'
import { expect, test } from '../../../../tests/story'

const id = (name: string) => `recipes-workflows--${name}`
const table = (page: Page) => page.getByRole('table', { name: 'Workflows' })
const bodyRows = (page: Page) => table(page).locator('tbody > tr')
const row = (page: Page, name: string) => bodyRows(page).filter({ hasText: name }).first()
const more = (page: Page, name: string) =>
  page.getByRole('button', { name: `More actions for ${name}` })
const menu = (page: Page, name: string) => page.getByRole('menu', { name: `Actions for ${name}` })
const run = '/workflows/vendor-contract-review/runs/4821'
/** The page's toast: the last live region, after the status bars in opened rows. */
const toast = (page: Page) => page.getByRole('status').last()

test.describe('Recipes/Workflows, the band', () => {
  test('says how many need you, and Show summary opens figures that filter the grid', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await expect(page.getByRole('heading', { level: 1, name: 'Workflows' })).toBeVisible()
    const toggle = page.getByRole('button', { name: /summary$/ })
    await expect(toggle).toHaveText(/^3 need you · Show summary/)
    await toggle.click()
    await expect(toggle).toHaveText(/Hide summary/)
    await page.getByRole('button', { name: /^Failed/ }).click()
    await expect(bodyRows(page)).toHaveCount(1)
    await expect(row(page, 'Invoice processing')).toBeVisible()
  })

  test('Import a workflow, Templates and Start a workflow are in the band', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await page.getByRole('button', { name: 'Templates' }).click()
    await expect(toast(page)).toHaveText('The template gallery would open here')
    await expect(page.getByRole('button', { name: 'Import a workflow' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start a workflow' }).first()).toBeVisible()
  })
})

test.describe('Recipes/Workflows, the rows', () => {
  test('lists ten workflows, newest first, each with a stage bar that says where it is', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await expect(bodyRows(page)).toHaveCount(10)
    await expect(bodyRows(page).first()).toContainText('Docs link check')
    await expect(page.getByRole('img', { name: 'Stage 4 of 5 · Approve' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Not started · 9 stages' })).toBeVisible()
    // Twenty stages: one continuous bar with a mark, not twenty slivers.
    const long = page.getByRole('img', { name: 'Stage 11 of 20 · Verify links' })
    await expect(long.locator('[data-mark]')).toHaveCount(1)
  })

  test('the name goes to the workflow, the subject to its run, and +1 more live run to its runs', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    const vendor = row(page, 'Vendor contract review')
    await expect(
      vendor.getByRole('link', { name: 'Vendor contract review', exact: true }),
    ).toHaveAttribute('href', /\/workflows\/vendor-contract-review$/)
    await expect(vendor.getByRole('link', { name: 'Harbor Street Supply Co.' })).toHaveAttribute(
      'href',
      new RegExp(`${run}$`),
    )
    await expect(
      row(page, 'Incident triage').getByRole('link', { name: '+1 more live run' }),
    ).toHaveAttribute('href', /\/workflows\/incident-triage\?tab=runs$/)
    await expect(row(page, 'Support escalation')).toContainText('Waiting on Tomás R.')
  })

  test('Review is only on rows that need someone, and opens the step in Details', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await expect(page.getByRole('link', { name: /^Review / })).toHaveCount(4)
    await expect(page.getByRole('link', { name: 'Review Vendor contract review' })).toHaveAttribute(
      'href',
      new RegExp(`${run}\\?view=details&step=approve-review-memo$`),
    )
    await expect(page.getByRole('link', { name: 'Review Incident triage' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Review Support escalation' })).toHaveCount(0)
  })

  test('Open live run goes to the canvas, and is disabled where there is no live run', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    await expect(
      page.getByRole('link', { name: 'Open live run for Vendor contract review' }),
    ).toHaveAttribute('href', new RegExp(`${run}\\?view=canvas$`))
    const idle = page.getByRole('button', {
      name: 'Open live run for Supplier compliance refresh (no live run)',
    })
    await expect(idle).toHaveAttribute('aria-disabled', 'true')
    await expect(idle).toHaveAttribute('title', 'No live run')
    await expect(page.getByRole('link', { name: 'View workflow Incident triage' })).toBeVisible()
  })
})

test.describe('Recipes/Workflows, an opened row', () => {
  test('the chevron opens a row without a row click doing it, and several stay open', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    const toggle = page.getByRole('button', { name: 'Show more about Vendor contract review' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await row(page, 'Vendor contract review').locator('td').nth(4).click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('button', { name: 'Show more about Incident triage' }).click()
    await expect(page.getByText('Approve · 2 of 3 steps')).toBeVisible()
    await expect(page.getByText('Diagnose · 3 steps')).toBeVisible()
  })

  test('waiting on you: stages, steps, the orange bar, latest events and the way in', async ({
    story,
    page,
  }) => {
    await story.open(id('expanded'))
    const steps = page.getByRole('list', { name: 'Steps' }).first()
    await expect(page.getByText('Waiting on you', { exact: true })).toBeVisible()
    await expect(page.getByText('Due today 2:00 PM · 3h 40m left')).toBeVisible()
    await expect(page.getByText('Recommends approve with conditions')).toBeVisible()
    await expect(page.getByText('Started by You · v12')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Open run details' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Open run log' }).first()).toBeVisible()
    await expect(steps).toBeVisible()
  })

  test('failed in a long workflow: windowed stages and steps, Retry step and Assign to someone', async ({
    story,
    page,
  }) => {
    await story.open(id('expanded'))
    await expect(page.getByText('3 stages done')).toBeVisible()
    await expect(page.getByRole('link', { name: '+2 more' })).toBeVisible()
    await expect(page.getByText('Exceptions · 4 of 9 steps')).toBeVisible()
    await expect(page.getByRole('link', { name: '+2 done' })).toBeVisible()
    await expect(page.getByRole('link', { name: '+3 more' })).toBeVisible()
    await expect(page.getByRole('link', { name: /^Read the invoice.*failed$/ })).toHaveAttribute(
      'href',
      /\/workflows\/invoice-processing\/runs\/5512\?view=details&step=read-the-invoice$/,
    )
    await page.getByRole('button', { name: 'Retry step' }).click()
    await expect(toast(page)).toHaveText('Retrying Read the invoice')
    await expect(page.getByRole('button', { name: 'Assign to someone' })).toBeVisible()
  })

  test('twelve and twenty stages window around the current one', async ({ story, page }) => {
    await story.open(id('long-workflows'))
    await expect(page.getByText('6 stages done')).toBeVisible()
    await expect(page.getByText('9 stages done')).toBeVisible()
    await expect(page.getByRole('link', { name: '+8 more' })).toBeVisible()
    await expect(page.getByText('Verify links · 9 steps')).toBeVisible()
  })

  test('an idle row shows its last run, the next start and Start a run', async ({
    story,
    page,
  }) => {
    await story.open(id('idle-row'))
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('link', { name: 'Run 4799 · Done · Nov 24 · took 2h 55m' }),
    ).toBeVisible()
    await expect(page.getByText('Dec 1, 06:00, on its trigger')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start a run' })).toBeVisible()
  })
})

test.describe('Recipes/Workflows, the row menu', () => {
  test('a live run: five actions, a rule, then Cancel run… which asks first', async ({
    story,
    page,
  }) => {
    // Tall enough that the menu, which opens below the row, is on screen.
    await page.setViewportSize({ width: 1280, height: 1400 })
    await story.open(id('row-menu-open'))
    const items = menu(page, 'Invoice processing').getByRole('menuitem')
    await expect(items).toHaveText([
      'Open run details',
      'Start a run',
      'Edit workflow',
      'Pause run',
      'Copy run link',
      'Cancel run…',
    ])
    await expect(menu(page, 'Invoice processing').getByRole('separator')).toHaveCount(1)
    await items.last().click()
    const dialog = page.getByRole('dialog', { name: 'Cancel run 5512?' })
    await expect(dialog).toContainText('Steps still to come won’t run.')
    await dialog.getByRole('button', { name: 'Cancel run' }).click()
    await expect(toast(page)).toHaveText('Run 5512 canceled')
  })

  test('Pause run turns into Resume run', async ({ story, page }) => {
    await story.open(id('default'))
    await more(page, 'Incident triage').click()
    await menu(page, 'Incident triage').getByRole('menuitem', { name: 'Pause run' }).click()
    await expect(toast(page)).toHaveText('Run 7730 paused')
    await more(page, 'Incident triage').click()
    await expect(
      menu(page, 'Incident triage').getByRole('menuitem', { name: 'Resume run' }),
    ).toBeVisible()
  })

  test('an idle row: the items that need a live run are disabled and say why', async ({
    story,
    page,
  }) => {
    await story.open(id('idle-row'))
    const items = menu(page, 'Supplier compliance refresh').getByRole('menuitem')
    await expect(items.filter({ hasText: 'Open run details' })).toBeDisabled()
    await expect(items.filter({ hasText: 'Open run details' })).toContainText('No live run')
    await expect(items.filter({ hasText: 'Cancel run…' })).toBeDisabled()
    await expect(items.filter({ hasText: 'Start a run' })).toBeEnabled()
  })
})

test.describe('Recipes/Workflows, in the shell', () => {
  test('the Workflows panel lists All workflows, then each one under its status', async ({
    story,
    page,
  }) => {
    await story.open(id('default'))
    const panel = page.getByRole('complementary', { name: 'Workflows' })
    await expect(panel.getByRole('link', { name: /All workflows/ })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(panel).toContainText('10 workflows · 3 need you')
    for (const heading of ['Needs you', 'Waiting on someone', 'Running', 'Idle']) {
      await expect(panel.getByText(heading, { exact: true })).toBeVisible()
    }
    await expect(panel.getByRole('link', { name: /Invoice processing/ })).toContainText(
      'Failed: Read the invoice failed',
    )
  })

  test('the rail names the app Workflows', async ({ story, page }) => {
    await story.open(id('default'))
    const rail = page.getByRole('navigation', { name: 'Apps' })
    await expect(rail.locator('[aria-current="page"]')).toContainText('Workflows')
  })
})

test.describe('Recipes/Workflows, states', () => {
  test('loading keeps the frame and draws skeleton rows', async ({ story, page }) => {
    await story.open(id('loading'))
    await expect(page.getByText('Loading workflows…')).toBeVisible()
    await expect(page.getByRole('button', { name: /summary$/ })).toHaveCount(0)
  })

  test('unavailable says so and offers Try again', async ({ story, page }) => {
    await story.open(id('unavailable'))
    await expect(page.getByText('Couldn’t load workflows')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  })

  test('empty offers Start a workflow', async ({ story, page }) => {
    await story.open(id('empty'))
    await expect(page.getByText('No workflows yet')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start a workflow' })).toHaveCount(2)
  })
})
