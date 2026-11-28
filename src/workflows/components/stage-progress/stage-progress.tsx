import type { StageProgressProps } from './types'
// How far through its stages a run has got, as one segment per stage.
//
// Segments share the width equally, so the bar is the same size for a run of
// five stages as for one of ten — which is what lets a column of them line up in
// a table. Finished and current stages are filled; a stage not reached yet is an
// outline, so the two are told apart by shape as well as by colour.
//
// Past twelve stages it is one continuous bar with a mark at the current
// position, since segments that thin no longer read as stages.
//
// With `names`, each segment carries its stage's name under it, for a bar that
// has the room: the band over a run. The `inverse` tone is for a navy band.

/** Past this many stages the bar is drawn as one continuous fill. */
const CONTINUOUS_OVER = 12

const FILL = {
  default: {
    done: 'bg-accent',
    running: 'bg-brand-solid',
    waiting: 'bg-notify',
    failed: 'bg-danger-solid',
    upcoming: 'border border-ink-soft/60 bg-panel-solid',
  },
  inverse: {
    done: 'bg-brand-300',
    running: 'bg-white',
    waiting: 'bg-notify',
    failed: 'bg-danger-solid',
    upcoming: 'bg-white/18',
  },
}

export function StageProgress({
  segments,
  label,
  current = 'running',
  names,
  tone = 'default',
  className = '',
}: StageProgressProps) {
  const fill = (status: (typeof segments)[number]) =>
    FILL[tone][status === 'current' ? current : status]

  if (names) {
    return (
      <span
        role="img"
        aria-label={label}
        className={`grid auto-cols-fr grid-flow-col gap-1.5 ${className}`}
      >
        {segments.map((status, index) => (
          <span key={index} className="flex min-w-0 flex-col gap-1.5">
            <span className={`h-1.5 rounded-[3px] ${fill(status)}`} />
            <span
              className={`truncate text-[11.5px] font-bold ${
                tone === 'inverse'
                  ? status === 'current'
                    ? 'text-white'
                    : 'text-brand-200'
                  : status === 'current'
                    ? 'text-ink-strong'
                    : 'text-ink-soft'
              }`}
            >
              {names[index]}
            </span>
          </span>
        ))}
      </span>
    )
  }

  // Past twelve, segments get too thin to read: one bar filled to the share of
  // stages done, with a mark where the run is, coloured for why it stopped.
  if (segments.length > CONTINUOUS_OVER) {
    const done = segments.filter((status) => status === 'done').length
    const at = `${(done / segments.length) * 100}%`
    return (
      <span
        role="img"
        aria-label={label}
        className={`relative flex h-2 overflow-hidden rounded-[3px] ${
          tone === 'inverse' ? 'bg-white/18' : 'bg-ink-soft/18'
        } ${className}`}
      >
        <span className={`h-full ${FILL[tone].done}`} style={{ width: at }} />
        {segments.includes('current') && (
          <span
            data-mark
            className={`absolute inset-y-0 w-[3px] ${FILL[tone][current]}`}
            style={{ left: at }}
          />
        )}
      </span>
    )
  }

  return (
    <span role="img" aria-label={label} className={`flex h-2 gap-[3px] ${className}`}>
      {segments.map((status, index) => (
        <span
          // Segments have no identity beyond their place in the run.
          key={index}
          className={`h-full min-w-0 flex-1 rounded-[3px] ${fill(status)}`}
        />
      ))}
    </span>
  )
}
