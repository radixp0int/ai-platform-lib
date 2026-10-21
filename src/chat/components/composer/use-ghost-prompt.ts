import { useEffect, useMemo, useRef, useState } from 'react'
import { useMediaQuery } from '../../../hooks/useMediaQuery'

/** The pace of the assistant typing into the empty composer. */
export const GHOST_TIMING = {
  /** Before the first suggestion, so the page settles first. */
  start: 900,
  /** Per character typed. */
  type: 26,
  /** How long a finished suggestion stays to be read or taken. */
  hold: 3200,
  /** Per erase step, and how many characters each step takes back. */
  erase: 16,
  eraseStep: 3,
  /** The pause between one suggestion going and the next arriving. */
  gap: 350,
  /** With reduced motion: no typing, and each suggestion stays this long. */
  still: 6000,
} as const

export type UseGhostPromptOptions = {
  /** What to offer, in order. The cycle goes round them. */
  items: string[]
  /** Off while the reader has a draft, is dictating, or can't send. Turning
   *  it back on carries on with the next suggestion. */
  enabled: boolean
}

export type GhostPrompt = {
  /** What is typed so far — draw this as the placeholder. */
  text: string
  /** Which item it is, for highlighting the same suggestion elsewhere; -1 for none. */
  index: number
  /** The whole item is showing, so it can be taken. */
  full: boolean
  /** Characters are arriving — what the assistant's mark animates to. */
  speaking: boolean
  /** The item, if it can be taken now; null while it is still being typed. */
  accept: () => string | null
}

type View = { index: number; length: number; typing: boolean }

/**
 * The assistant suggesting a question by typing it into the empty composer:
 * type it, hold it, erase it, then the next. Headless — the composer draws the
 * text and decides which keys take it.
 */
export function useGhostPrompt({ items, enabled }: UseGhostPromptOptions): GhostPrompt {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  // A string key, so a caller passing a fresh array each render doesn't
  // restart the cycle; the list is rebuilt only when its contents change.
  const key = items.join('\n')
  const list = useMemo(() => (key ? key.split('\n') : []), [key])
  const [view, setView] = useState<View>({ index: -1, length: 0, typing: false })
  // The last item shown, so turning the cycle back on carries on from there.
  const lastRef = useRef(-1)

  useEffect(() => {
    if (!enabled || list.length === 0) return
    let timer: ReturnType<typeof setTimeout> | undefined
    let cancelled = false
    const later = (ms: number, next: () => void) => {
      timer = setTimeout(() => {
        if (!cancelled) next()
      }, ms)
    }
    let index = lastRef.current

    const show = () => {
      index = (index + 1) % list.length
      lastRef.current = index
      const item = list[index]
      if (reduced) {
        setView({ index, length: item.length, typing: false })
        later(GHOST_TIMING.still, show)
        return
      }
      let n = 0
      const type = () => {
        n += 1
        setView({ index, length: n, typing: n < item.length })
        if (n < item.length) later(GHOST_TIMING.type, type)
        else later(GHOST_TIMING.hold, erase)
      }
      const erase = () => {
        n = Math.max(0, n - GHOST_TIMING.eraseStep)
        setView({ index, length: n, typing: false })
        if (n > 0) later(GHOST_TIMING.erase, erase)
        else later(GHOST_TIMING.gap, show)
      }
      type()
    }

    later(GHOST_TIMING.start, show)
    return () => {
      cancelled = true
      clearTimeout(timer)
      // Nothing half-typed is left behind to reappear when it resumes.
      setView((v) => ({ ...v, length: 0, typing: false }))
    }
  }, [enabled, list, reduced])

  const item = view.index >= 0 ? (list[view.index] ?? '') : ''
  const text = enabled ? item.slice(0, view.length) : ''
  const full = text !== '' && text === item
  return {
    text,
    index: enabled && view.index < list.length ? view.index : -1,
    full,
    speaking: enabled && view.typing,
    accept: () => (full ? item : null),
  }
}
