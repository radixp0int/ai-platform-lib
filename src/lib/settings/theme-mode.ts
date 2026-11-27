import { useCallback, useEffect, useRef, useState } from 'react'
import { readString, resolveStorage, write, type StorageLike } from './safeStorage'

/** Light, dark, or whatever the operating system prefers. */
export type ThemeMode = 'light' | 'dark' | 'system'

export const THEME_MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Match system' },
]

export type UseThemeModeOptions = {
  /**
   * Where the choice persists. The value written is `light`, `dark`, or an
   * empty string for `system` — the shape brand/head.html reads before first
   * paint, where an empty value means "no choice, ask the media query".
   * Pass the same key the head script uses (`THEME_MODE_KEY`), or null to
   * keep the choice for this session only.
   */
  storageKey: string | null
  storage?: StorageLike
  /** Default true. False leaves the `dark` / `light` classes to the host. */
  applyToDocument?: boolean
}

export type ThemeModeValue = {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  /** The mode as it resolves now: `system` follows the media query. */
  dark: boolean
}

const QUERY = '(prefers-color-scheme: dark)'

function systemDark(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY).matches
    : false
}

/**
 * The colour mode as a three-way choice, persisted, and applied as the
 * `dark` / `light` class on `<html>`.
 *
 * It does not apply anything on mount: the head script already put the stored
 * mode on `<html>` before first paint, and re-applying it from an effect would
 * also overrule a host that set the class itself (Storybook's mode toolbar).
 * It applies when the choice changes, and while the choice is `system`, when
 * the operating system switches.
 */
export function useThemeMode({
  storageKey,
  storage,
  applyToDocument = true,
}: UseThemeModeOptions): ThemeModeValue {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const raw = readString(resolveStorage(storage), storageKey)
    return raw === 'dark' || raw === 'light' ? raw : 'system'
  })
  const [prefersDark, setPrefersDark] = useState(systemDark)

  useEffect(() => {
    if (mode !== 'system' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(QUERY)
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [mode])

  const dark = mode === 'system' ? prefersDark : mode === 'dark'

  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (applyToDocument) {
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.classList.toggle('light', !dark)
    }
  }, [dark, applyToDocument])

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next)
      if (next === 'system') setPrefersDark(systemDark())
      write(resolveStorage(storage), storageKey, next === 'system' ? '' : next)
    },
    [storage, storageKey],
  )

  return { mode, setMode, dark }
}
