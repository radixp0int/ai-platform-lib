import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GHOST_TIMING as T, useGhostPrompt, type UseGhostPromptOptions } from './use-ghost-prompt'

const ITEMS = ['Which invoices are due?', 'Show wires sent today']

function setup(options: Partial<UseGhostPromptOptions> = {}) {
  return renderHook((props: UseGhostPromptOptions) => useGhostPrompt(props), {
    initialProps: { items: ITEMS, enabled: true, ...options },
  })
}

/** Advance the clock, letting React apply each update as it lands. */
function wait(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

/** Time from the first character to the last: the first lands with no wait. */
const typed = (text: string) => T.type * (text.length - 1)

describe('useGhostPrompt', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('waits for the page to settle, then types the first item', () => {
    const { result } = setup()
    expect(result.current.text).toBe('')
    wait(T.start)
    expect(result.current.text).toBe('W')
    expect(result.current.speaking).toBe(true)
    expect(result.current.index).toBe(0)
    wait(typed(ITEMS[0]))
    expect(result.current.text).toBe(ITEMS[0])
    expect(result.current.full).toBe(true)
    expect(result.current.speaking).toBe(false)
  })

  it('holds the item, erases it, and moves on to the next', () => {
    const { result } = setup()
    wait(T.start + typed(ITEMS[0]))
    wait(T.hold - 10)
    expect(result.current.text).toBe(ITEMS[0])
    wait(10 + T.erase * Math.ceil(ITEMS[0].length / T.eraseStep))
    expect(result.current.text).toBe('')
    wait(T.gap)
    expect(result.current.index).toBe(1)
    expect(result.current.text).toBe('S')
  })

  it('goes back to the first item after the last', () => {
    const { result } = setup({ items: ['Hi'] })
    // Typed by the second character, erased in one step, then the gap.
    wait(T.start + T.type + T.hold + T.gap)
    expect(result.current.index).toBe(0)
    expect(result.current.text).toBe('H')
  })

  it('can only be taken once the whole item is showing', () => {
    const { result } = setup()
    wait(T.start + T.type * 3)
    expect(result.current.accept()).toBeNull()
    wait(typed(ITEMS[0]))
    expect(result.current.accept()).toBe(ITEMS[0])
  })

  it('pauses while disabled, and carries on with the next item', () => {
    const { result, rerender } = setup()
    wait(T.start + typed(ITEMS[0]))
    rerender({ items: ITEMS, enabled: false })
    expect(result.current.text).toBe('')
    expect(result.current.index).toBe(-1)
    wait(60_000)
    expect(result.current.text).toBe('')

    rerender({ items: ITEMS, enabled: true })
    expect(result.current.text).toBe('')
    wait(T.start)
    expect(result.current.index).toBe(1)
    expect(result.current.text).toBe('S')
  })

  it('a new array with the same items does not restart the cycle', () => {
    const { result, rerender } = setup()
    wait(T.start + T.type * 5)
    rerender({ items: [...ITEMS], enabled: true })
    expect(result.current.text).toBe(ITEMS[0].slice(0, 6))
  })

  it('with reduced motion it shows each item whole, without typing', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const { result } = setup()
    wait(T.start)
    expect(result.current.text).toBe(ITEMS[0])
    expect(result.current.speaking).toBe(false)
    wait(T.still)
    expect(result.current.text).toBe(ITEMS[1])
    vi.unstubAllGlobals()
  })

  it('with nothing to offer it stays empty', () => {
    const { result } = setup({ items: [] })
    wait(10_000)
    expect(result.current.text).toBe('')
    expect(result.current.index).toBe(-1)
  })
})
