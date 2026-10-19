import { expect, test } from '../../../../tests/story'

test.describe('RunSidebar', () => {
  test('it says which run this is', async ({ story, page }) => {
    await story.open('workflows-components-run-sidebar--default')
    const panel = page.getByRole('complementary')
    await expect(panel).toContainText('Harbor Street Bakery LLC')
    await expect(panel).toContainText('Run 4821')
  })

  test('each stage is a button, and the one being looked at is pressed', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-run-sidebar--default')
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
    await story.open('workflows-components-run-sidebar--two-approvals')
    const panel = page.getByRole('complementary')
    await expect(panel).toContainText(/Needs you\s*2/)
    await expect(panel.getByRole('button', { name: /^Approve elevated access/ })).toBeVisible()
    await expect(panel.getByRole('button', { name: /^Confirm background check/ })).toBeVisible()
  })

  test('with nothing waiting the section stays and says so', async ({ story, page }) => {
    await story.open('workflows-components-run-sidebar--nothing-waiting')
    const panel = page.getByRole('complementary')
    await expect(panel).toContainText(/Needs you\s*0/)
    await expect(panel).toContainText('Nothing waiting on you in this run.')
  })

  test('with several workflows a picker appears, with a line about the chosen one', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-run-sidebar--with-variants')
    const picker = page.getByRole('combobox', { name: 'Workflow' })
    await expect(picker.getByRole('option')).toHaveCount(3)
    await expect(page.getByRole('complementary')).toContainText('One gate, three answers.')
  })

  test('with one workflow there is no picker', async ({ story, page }) => {
    await story.open('workflows-components-run-sidebar--default')
    await expect(page.getByRole('combobox')).toHaveCount(0)
  })
})
