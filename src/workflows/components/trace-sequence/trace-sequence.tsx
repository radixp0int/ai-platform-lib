import { formatDuration, formatOffset } from '../run-trace'
import type { TraceSequenceProps } from './types'
// The calls inside one step, in order: when each began, whether it was the
// model or a tool, what it was for, and a bar that shows how much of the step it
// took. It answers "where did the time go?" without opening each call.

const KIND = {
  model: { word: 'Model', tag: 'bg-chip text-chip-fg', bar: 'bg-brand-solid' },
  tool: { word: 'Tool', tag: 'bg-ink-soft/12 text-ink', bar: 'bg-ink-soft' },
}

export function TraceSequence({ calls, duration, className = '' }: TraceSequenceProps) {
  return (
    <ol className={`m-0 flex list-none flex-col p-0 ${className}`}>
      {calls.map((call) => {
        const kind = KIND[call.kind]
        return (
          <li
            key={call.id}
            className="grid min-h-10 py-1.5 grid-cols-[3.25rem_3.5rem_minmax(0,1fr)_3.5rem] items-center gap-x-2 sm:gap-x-2.5 border-t border-line text-xs first:border-t-0 sm:grid-cols-[3.25rem_4rem_minmax(8rem,14rem)_minmax(0,1fr)_3.5rem]"
          >
            <span className="text-ink-soft tabular-nums">{formatOffset(call.startedAt)}</span>
            <span className="flex">
              <span
                className={`rounded-check px-1.5 py-0.5 text-[11px] leading-4 font-bold uppercase ${kind.tag}`}
              >
                {kind.word}
              </span>
            </span>
            <span
              className={`text-[13px] break-words text-ink-strong sm:truncate ${
                call.kind === 'tool' ? 'font-mono' : ''
              }`}
            >
              {call.label}
            </span>
            <span
              aria-hidden
              className="relative hidden h-2.5 rounded-check bg-ink-soft/12 sm:block"
            >
              <span
                className={`absolute inset-y-0 min-w-[3px] rounded-check ${kind.bar}`}
                style={{
                  left: `${(call.startedAt / duration) * 100}%`,
                  width: `${(call.duration / duration) * 100}%`,
                }}
              />
            </span>
            <span className="text-right text-ink-soft tabular-nums">
              {formatDuration(call.duration)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
