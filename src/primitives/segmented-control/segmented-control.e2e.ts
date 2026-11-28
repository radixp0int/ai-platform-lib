import { expect, test } from '../../../tests/story'

test.describe('SegmentedControl', () => {
  test('it is a named group of toggle buttons with one pressed', async ({ story, page }) => {
    await story.open('primitives-segmented-control--default')
    const group = page.getByRole('group', { name: 'Canvas density' })
    await expect(group.getByRole('button', { name: 'Normal' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(group.getByRole('button', { name: 'Compact' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('pressing a segment moves the choice', async ({ story, page }) => {
    await story.open('primitives-segmented-control--interactive')
    await page.getByRole('button', { name: 'Compact' }).click()
    await expect(page.getByRole('button', { name: 'Compact' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.getByRole('button', { name: 'Normal' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  test('each segment is a tab stop, and Enter presses it', async ({ story, page }) => {
    await story.open('primitives-segmented-control--interactive')
    await page.getByRole('button', { name: 'Normal' }).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Compact' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('button', { name: 'Compact' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('a disabled option stays in place and cannot be pressed', async ({ story, page }) => {
    await story.open('primitives-segmented-control--with-disabled-option')
    await expect(page.getByRole('button', { name: 'Timeline' })).toBeDisabled()
    await expect(page.getByRole('group', { name: 'View' }).getByRole('button')).toHaveCount(3)
  })

  test('the inverse tone draws the chosen segment white on the band', async ({ story, page }) => {
    await story.open('primitives-segmented-control--inverse')
    const group = page.getByRole('group', { name: 'Date range' })
    await expect(group).toHaveAttribute('data-tone', 'inverse')
    const chosen = group.getByRole('button', { name: '14 days' })
    await expect(chosen).toHaveAttribute('aria-pressed', 'true')
    await expect(chosen).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    const other = group.getByRole('button', { name: '7 days' })
    await expect(other).not.toHaveCSS('background-color', 'rgb(255, 255, 255)')
  })
})
