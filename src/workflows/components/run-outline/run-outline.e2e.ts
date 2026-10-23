import { expect, test } from '../../../../tests/story'

test.describe('RunOutline', () => {
  test('it says which run this is', async ({ story, page }) => {
    await story.open('workflows-components-run-outline--default')
    const outline = page.getByRole('region', { name: 'This run' })
    await expect(outline).toContainText('Harbor Street Bakery LLC')
    await expect(outline).toContainText('Run 4821')
  })

  test('each stage is a button, and the one being looked at is pressed', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-run-outline--default')
    await expect(page.getByRole('button', { name: /^Decide & notify/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('button', { name: /^Intake/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('"Needs you" counts what is waiting and lists each one', async ({ story, page }) => {
    await story.open('workflows-components-run-outline--two-approvals')
    const outline = page.getByRole('region', { name: 'This run' })
    await expect(outline).toContainText(/Needs you\s*2/)
    await expect(outline.getByRole('button', { name: /^Approve elevated access/ })).toBeVisible()
    await expect(outline.getByRole('button', { name: /^Confirm background check/ })).toBeVisible()
  })

  test('with nothing waiting the section stays and says so', async ({ story, page }) => {
    await story.open('workflows-components-run-outline--nothing-waiting')
    const outline = page.getByRole('region', { name: 'This run' })
    await expect(outline).toContainText(/Needs you\s*0/)
    await expect(outline).toContainText('Nothing waiting on you in this run.')
  })

  test('with several workflows a picker appears, with a line about the chosen one', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-run-outline--with-variants')
    const picker = page.getByRole('combobox', { name: 'Workflow' })
    await expect(picker).toHaveText('Commercial loan review')
    await picker.click()
    await expect(page.getByRole('option')).toHaveCount(3)
    await expect(page.getByRole('region', { name: 'This run' })).toContainText(
      'One gate, three answers.',
    )
  })

  test('with one workflow there is no picker', async ({ story, page }) => {
    await story.open('workflows-components-run-outline--default')
    await expect(page.getByRole('combobox')).toHaveCount(0)
  })
})

test.describe('RunOutlineRail', () => {
  test('each stage keeps its name, and the one being looked at is pressed', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-run-outline-rail--default')
    await expect(page.getByRole('button', { name: /^Decide & notify\./ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('button', { name: /^Intake\./ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('a badge counts what is waiting, and is read with its name', async ({ story, page }) => {
    await story.open('workflows-components-run-outline-rail--two-approvals')
    await expect(page.getByRole('button', { name: 'Needs you: 2 waiting' })).toContainText('2')
  })

  test('with nothing waiting there is no badge', async ({ story, page }) => {
    await story.open('workflows-components-run-outline-rail--nothing-waiting')
    await expect(page.getByRole('button', { name: /Needs you/ })).toHaveCount(0)
  })
})
