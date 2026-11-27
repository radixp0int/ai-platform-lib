import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useThemeMode } from './theme-mode'
import type { StorageLike } from './safeStorage'

function memory(
  initial: Record<string, string> = {},
): StorageLike & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value
    },
  }
}

const KEY = 'theme-test'

afterEach(() => {
  document.documentElement.classList.remove('dark', 'light')
})

describe('useThemeMode', () => {
  it('reads light and dark from storage, and anything else as system', () => {
    expect(
      renderHook(() => useThemeMode({ storageKey: KEY, storage: memory({ [KEY]: 'dark' }) })).result
        .current.mode,
    ).toBe('dark')
    expect(
      renderHook(() => useThemeMode({ storageKey: KEY, storage: memory({ [KEY]: '' }) })).result
        .current.mode,
    ).toBe('system')
    expect(
      renderHook(() => useThemeMode({ storageKey: KEY, storage: memory({ [KEY]: 'sepia' }) }))
        .result.current.mode,
    ).toBe('system')
  })

  it('does not touch <html> on mount', () => {
    document.documentElement.classList.add('light')
    renderHook(() => useThemeMode({ storageKey: KEY, storage: memory({ [KEY]: 'dark' }) }))
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('applies and stores a change, writing an empty value for system', () => {
    const storage = memory()
    const { result } = renderHook(() => useThemeMode({ storageKey: KEY, storage }))

    act(() => result.current.setMode('dark'))
    expect(result.current.dark).toBe(true)
    expect(storage.data[KEY]).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // The test setup's matchMedia never matches, so system resolves to light.
    act(() => result.current.setMode('system'))
    expect(result.current.mode).toBe('system')
    expect(result.current.dark).toBe(false)
    expect(storage.data[KEY]).toBe('')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('leaves <html> alone when the host applies the class', () => {
    const { result } = renderHook(() => useThemeMode({ storageKey: null, applyToDocument: false }))
    act(() => result.current.setMode('dark'))
    expect(result.current.dark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
