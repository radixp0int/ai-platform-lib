import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sparklinePaths } from './sparkline'
import { StatTile } from './stat-tile'

const change = (container: HTMLElement) => container.querySelector('[data-tone]')

describe('StatTile', () => {
  it('shows the value before its label when bare', () => {
    const { container } = render(<StatTile value={3} label="Runs in progress" />)
    expect(container.textContent).toBe('3Runs in progress')
  })

  it('puts the label above the value as a card, with the unit after the value', () => {
    const { container } = render(
      <StatTile size="large" label="Groundedness" value="92.4" unit="%" />,
    )
    expect(container.textContent).toBe('Groundedness92.4%')
  })

  it.each([
    ['a rise that is good news', 'up', true, 'good'],
    ['a fall that is bad news', 'down', true, 'bad'],
    ['a rise in something that should fall', 'up', false, 'bad'],
    ['a fall in something that should fall', 'down', false, 'good'],
  ] as const)('colours %s by meaning, not sign', (_, direction, upIsGood, tone) => {
    const { container } = render(
      <StatTile value="1" label="x" change={{ direction, upIsGood, text: '14%' }} />,
    )
    expect(change(container)).toHaveAttribute('data-tone', tone)
  })

  it('treats a rise as good news unless told otherwise', () => {
    const { container } = render(
      <StatTile value="1" label="x" change={{ direction: 'up', text: '6%' }} />,
    )
    expect(change(container)).toHaveAttribute('data-tone', 'good')
  })

  it('draws the arrow for the eye and says the direction in words', () => {
    const { container } = render(
      <StatTile value="47" label="Errors" change={{ direction: 'up', text: '14%' }} />,
    )
    const line = change(container)!
    expect(line.querySelector('[aria-hidden="true"]')).toHaveTextContent('↑')
    expect(line.querySelector('.sr-only')).toHaveTextContent('Up')
    expect(line).toHaveTextContent('14%')
  })

  it('gives a line without a direction no arrow and no colour', () => {
    const { container } = render(
      <StatTile value="1" label="x" change={{ text: 'No change', upIsGood: false }} />,
    )
    expect(change(container)).toHaveAttribute('data-tone', 'none')
    expect(change(container)!.textContent).toBe('No change')
  })

  it('draws a sparkline hidden from assistive tech', () => {
    const { container } = render(<StatTile value="1" label="x" sparkline={[1, 3, 2]} />)
    const svg = container.querySelector('svg[data-sparkline]')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg!.querySelectorAll('path')).toHaveLength(2)
  })

  it('draws no sparkline from fewer than two numbers', () => {
    const { container } = render(<StatTile value="1" label="x" sparkline={[4]} />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders the footer', () => {
    render(<StatTile value="1" label="x" footer={<a href="#scores">Evaluation scores ↓</a>} />)
    expect(screen.getByRole('link', { name: 'Evaluation scores ↓' })).toHaveAttribute(
      'href',
      '#scores',
    )
  })
})

describe('sparklinePaths', () => {
  it('spans the box, lowest near the bottom and highest near the top', () => {
    expect(sparklinePaths([0, 10, 5])).toEqual({
      line: 'M0,32 L60,4 L120,18',
      area: 'M0,32 L60,4 L120,18 L120,36 L0,36 Z',
    })
  })

  it('draws a level line across the middle when every number is the same', () => {
    expect(sparklinePaths([7, 7])!.line).toBe('M0,18 L120,18')
  })

  it('skips numbers that are not finite', () => {
    expect(sparklinePaths([1, Number.NaN, 2])!.line).toBe('M0,32 L120,4')
  })

  it('returns null for fewer than two numbers', () => {
    expect(sparklinePaths([])).toBeNull()
    expect(sparklinePaths([1, Number.POSITIVE_INFINITY])).toBeNull()
  })
})
