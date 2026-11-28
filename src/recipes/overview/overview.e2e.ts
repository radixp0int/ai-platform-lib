import { expect, test } from '../../../tests/story'

test.describe('Recipes/Overview', () => {
  test('a section tab narrows the page to that section, and Overview comes back', async ({
    story,
    page,
  }) => {
    await story.open('recipes-overview--default')
    const tabs = page.getByRole('tablist', { name: 'Sections' })
    await expect(tabs.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await tabs.getByRole('tab', { name: /^Ingestion/ }).click()
    await expect(tabs.getByRole('tab', { name: /^Ingestion/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByText('Showing Ingestion only.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Open Ingestion ›' })).toBeVisible()
    await expect(page.getByText('Pricing sheets API stopped syncing')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Upload documents' })).toBeVisible()

    await page.getByRole('button', { name: 'Overview', exact: true }).click()
    await expect(tabs.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page.getByRole('heading', { name: 'Answer quality' })).toBeVisible()
  })

  test('each tab says how many things wait in it', async ({ story, page }) => {
    await story.open('recipes-overview--default')
    const tabs = page.getByRole('tablist', { name: 'Sections' })
    await expect(tabs.getByRole('tab', { name: 'Ingestion, 1 waiting' })).toBeVisible()
    await expect(tabs.getByRole('tab', { name: 'Admin, 1 waiting' })).toBeVisible()
    await expect(tabs.getByRole('tab', { name: 'Insights', exact: true })).toBeVisible()
  })

  test('number keys open a section, but not while typing in the search', async ({
    story,
    page,
  }) => {
    await story.open('recipes-overview--default')
    const tabs = page.getByRole('tablist', { name: 'Sections' })
    await page.getByRole('heading', { name: 'Where to, John?' }).click()
    await page.keyboard.press('4')
    await expect(tabs.getByRole('tab', { name: /^Workflows/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await page.getByRole('combobox', { name: 'Ask Acme, or jump to a section' }).fill('7')
    await expect(tabs.getByRole('tab', { name: /^Workflows/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('the search asks Acme or jumps to an action', async ({ story, page }) => {
    await story.open('recipes-overview--default')
    const box = page.getByRole('combobox', { name: 'Ask Acme, or jump to a section' })
    await box.fill('upload')
    await expect(page.getByRole('option', { name: /Ask Acme: “upload”/ })).toBeVisible()
    await page.getByRole('option', { name: /Upload documents/ }).click()
    await expect(page.getByRole('button', { name: 'Close and discard this source' })).toBeVisible()
  })

  test('Hide numbers masks the figures and says it is on', async ({ story, page }) => {
    await story.open('recipes-overview--default')
    const sections = page.getByRole('region', { name: 'Sections' })
    await expect(sections.getByText('1,171')).toBeVisible()
    const toggle = page.getByRole('button', { name: 'Hide numbers' })
    await toggle.click()
    await expect(page.getByRole('button', { name: 'Show numbers' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(sections.getByText('1,171')).toHaveCount(0)
    await expect(sections.getByText('•••').first()).toBeVisible()
  })

  test('the recent list filters by kind', async ({ story, page }) => {
    await story.open('recipes-overview--default')
    const recent = page.getByRole('region', { name: 'Pick up where you left off' })
    await recent.getByRole('button', { name: 'Conversations' }).click()
    await expect(recent.getByRole('link')).toHaveCount(2)
    await expect(recent.getByText('Holiday schedule for the Lisbon office')).toBeVisible()
    await recent.getByRole('button', { name: 'Drafts' }).click()
    await expect(recent.getByText('Holiday schedule for the Lisbon office')).toHaveCount(0)
  })

  test('a Chat-only tenant gets only the sections it has', async ({ story, page }) => {
    await story.open('recipes-overview--chat-only-tenant')
    const tabs = page.getByRole('tablist', { name: 'Sections' })
    await expect(tabs.getByRole('tab')).toHaveCount(4)
    await expect(page.getByText('3 sections, grouped by what they are for.')).toBeVisible()
    await expect(page.getByText(/doesn’t have Insights/)).toBeVisible()
  })

  test('the Dark and Portrait stories render', async ({ story, page }) => {
    await story.open('recipes-overview--dark', { mode: 'dark' })
    await expect(page.getByRole('heading', { name: 'Where to, John?' })).toBeVisible()
    await page.setViewportSize({ width: 834, height: 1194 })
    await story.open('recipes-overview--portrait', { mode: 'dark' })
    const tabs = page.getByRole('tablist', { name: 'Sections' })
    const box = (await tabs.boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(834)
  })
})
