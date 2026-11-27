import { expect, test } from '../../../tests/story'

test.describe('StatTile', () => {
  test('it shows a figure and what the figure counts', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--default')
    await expect(root).toContainText('3')
    await expect(root).toContainText('Runs in progress')
  })

  test('the figure is set larger than its label', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--default')
    const size = (text: string) =>
      root
        .getByText(text, { exact: true })
        .evaluate((node) => parseFloat(getComputedStyle(node).fontSize))
    expect(await size('3')).toBeGreaterThan(await size('Runs in progress'))
  })

  test('figures use tabular numerals so a row of tiles lines up', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--row')
    for (const value of ['3', '2', '1']) {
      await expect(root.getByText(value, { exact: true })).toHaveCSS(
        'font-variant-numeric',
        'tabular-nums',
      )
    }
  })

  test('zero is shown, not hidden', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--zero')
    await expect(root.getByText('0', { exact: true })).toBeVisible()
  })
})

test.describe('StatTile as a card', () => {
  const changeLine = (root: import('@playwright/test').Locator, text: string) =>
    root.locator('[data-tone]').filter({ hasText: text })

  test('the label sits above the value, and the unit follows it', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--large')
    const label = await root.getByText('Groundedness', { exact: true }).boundingBox()
    const value = await root.getByText('92.4', { exact: false }).first().boundingBox()
    expect(label!.y).toBeLessThan(value!.y)
    await expect(root.getByText('%', { exact: true }).first()).toBeVisible()
  })

  test('a change is coloured by whether it is good news, not by its sign', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--changes')
    const color = (text: string) =>
      changeLine(root, text).evaluate((node) => getComputedStyle(node).color)
    const goodRise = await color('0.3 pts')
    const badFall = await color('0.4 pts')
    const badRise = await color('14%')
    const goodFall = await color('0.1 s')
    const flat = await color('No change')
    expect(badRise).toBe(badFall)
    expect(goodFall).toBe(goodRise)
    expect(badRise).not.toBe(goodRise)
    expect(flat).not.toBe(goodRise)
    expect(flat).not.toBe(badRise)
    await expect(changeLine(root, '14%')).toContainText('↑')
    await expect(changeLine(root, '0.1 s')).toContainText('↓')
  })

  test('the sparkline is a thin 2px line over a soft fill of the same hue', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--large')
    const sparks = root.locator('svg[data-sparkline]')
    await expect(sparks).toHaveCount(4)
    const marks = await sparks.first().evaluate((svg) => {
      const [area, line] = Array.from(svg.querySelectorAll('path')).map((path) =>
        getComputedStyle(path),
      )
      return {
        width: line.strokeWidth,
        stroke: line.stroke,
        fill: area.fill,
        opacity: area.fillOpacity,
      }
    })
    expect(marks.width).toBe('2px')
    expect(marks.fill).toBe(marks.stroke)
    expect(Number(marks.opacity)).toBeLessThan(0.2)
  })

  test('small tiles carry no sparkline', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--small')
    await expect(root.getByText('Active users', { exact: true })).toBeVisible()
    await expect(root.locator('svg[data-sparkline]')).toHaveCount(0)
  })

  test('the footer link points at the section behind the figure', async ({ story }) => {
    const root = await story.open('primitives-stat-tile--large')
    await expect(root.getByRole('link', { name: 'Evaluation scores ↓' })).toHaveAttribute(
      'href',
      '#evaluation-scores',
    )
  })

  test('in dark, the sparkline and the changes take their dark tones', async ({ story }) => {
    const read = async (id: string, globals?: { mode: 'dark' }) => {
      const root = await story.open(id, globals)
      return {
        stroke: await root
          .locator('svg[data-sparkline] path')
          .nth(1)
          .evaluate((node) => getComputedStyle(node).stroke),
        bad: await changeLine(root, '14%')
          .first()
          .evaluate((node) => getComputedStyle(node).color),
      }
    }
    const light = await read('primitives-stat-tile--large')
    const dark = await read('primitives-stat-tile--dark', { mode: 'dark' })
    expect(dark.stroke).not.toBe(light.stroke)
    expect(dark.bad).not.toBe(light.bad)
  })
})
