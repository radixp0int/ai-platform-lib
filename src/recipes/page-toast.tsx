import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * A short line in the corner saying what just happened: "Sync started for
 * Pricing sheets API", "Downloaded sources.csv · 14 rows". The recipes use it
 * for actions that would open a flow the demo does not have, so a click is
 * never met with silence. Returns the line to render and a function to show
 * one; a new message replaces the last.
 */
export function usePageToast(duration = 3200): [ReactNode, (message: string) => void] {
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const show = useCallback(
    (next: string) => {
      setMessage(next)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setMessage(''), duration)
    },
    [duration],
  )

  // The live region is always there, so a screen reader hears the first message too.
  const node = (
    <div
      role="status"
      className="pointer-events-none fixed right-6 bottom-6 z-40 max-w-[min(24rem,calc(100vw-3rem))]"
    >
      {message && (
        <p className="rounded-control border border-line bg-panel-solid px-3.5 py-2.5 text-[13px] font-bold text-ink-strong shadow-lg shadow-(color:--shadow-menu)">
          {message}
        </p>
      )}
    </div>
  )
  return [node, show]
}
