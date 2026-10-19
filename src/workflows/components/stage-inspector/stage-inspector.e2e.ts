import { expect, test } from '../../../../tests/story'

test.describe('StageInspector', () => {
  test('it names the stage and says where it has got to', async ({ story, page }) => {
    await story.open('workflows-components-stage-inspector--default')
    const panel = page.getByRole('complementary')
    await expect(panel.getByRole('heading', { name: 'Approve' })).toBeVisible()
    await expect(panel).toContainText('In progress')
  })

  test('it rolls the steps up into one line', async ({ story, page }) => {
    await story.open('workflows-components-stage-inspector--default')
    await expect(page.getByRole('complementary')).toContainText(
      '1 waiting on a person · 1 done · 1 skipped',
    )
  })

  test('each step is a button, and the one open in the panel is marked', async ({
    story,
    page,
  }) => {
    await story.open('workflows-components-stage-inspector--default')
    await expect(page.getByRole('button', { name: /^Approve credit memo/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(page.getByRole('button', { name: 'Policy check' })).not.toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  test('with no step picked, none is marked', async ({ story, page }) => {
    await story.open('workflows-components-stage-inspector--no-step-selected')
    await expect(page.locator('[aria-current="true"]')).toHaveCount(0)
  })

  test('a finished stage and an upcoming one each say so', async ({ story, page }) => {
    await story.open('workflows-components-stage-inspector--finished-stage')
    await expect(page.getByRole('complementary')).toContainText('Finished')
    await expect(page.getByRole('complementary')).toContainText('3 done')
    await story.open('workflows-components-stage-inspector--upcoming-stage')
    await expect(page.getByRole('complementary')).toContainText('Not started yet')
  })
})
