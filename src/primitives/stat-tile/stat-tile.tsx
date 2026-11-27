import { SPARK_HEIGHT, SPARK_WIDTH, sparklinePaths } from './sparkline'
import type { StatTileChange, StatTileProps } from './types'

const looks = {
  bare: {
    tile: '',
    value: 'text-[28px] leading-tight font-normal text-ink-strong tabular-nums',
    label: 'mt-1 text-sm text-ink-soft',
  },
  large: {
    tile: 'flex min-w-0 flex-col gap-2 rounded-xl border border-line bg-panel-solid px-[18px] py-4',
    value:
      'text-[30px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap text-ink-strong tabular-nums',
    label: 'text-[12.5px] font-bold text-ink-soft',
  },
  small: {
    tile: 'flex min-w-0 flex-col gap-1.5 rounded-xl border border-line bg-panel-solid px-4 py-3.5',
    value:
      'text-[22px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap text-ink-strong tabular-nums',
    label: 'text-[12.5px] font-bold text-ink-soft',
  },
}

/**
 * A figure and what it counts. Bare by default, for a figure set inside
 * something else; with `size`, the card from the top of an Insights page, with
 * room for a unit, a change line, a sparkline and a footer link.
 */
export function StatTile({
  value,
  label,
  unit,
  change,
  sparkline,
  footer,
  size,
  className = '',
  valueClassName,
  labelClassName,
}: StatTileProps) {
  const look = looks[size ?? 'bare']
  const valueNode = (
    <span className={valueClassName ?? look.value}>
      {value}
      {unit != null && (
        <small className="ml-1 text-[15px] font-bold tracking-normal text-ink-soft">{unit}</small>
      )}
    </span>
  )
  const labelNode = <span className={labelClassName ?? look.label}>{label}</span>
  return (
    <div className={`${look.tile} ${className}`.trim() || undefined}>
      {size ? labelNode : valueNode}
      {size ? valueNode : labelNode}
      {change && <ChangeLine {...change} />}
      {sparkline && <Sparkline values={sparkline} />}
      {footer != null && <div className="mt-auto pt-1.5 text-xs">{footer}</div>}
    </div>
  )
}

const tones = { good: 'text-success-fg', bad: 'text-danger-fg', none: 'text-ink-soft' }

function ChangeLine({ text, direction, upIsGood = true }: StatTileChange) {
  const tone = !direction ? 'none' : (direction === 'up') === upIsGood ? 'good' : 'bad'
  return (
    <span className={`text-xs font-bold ${tones[tone]}`} data-tone={tone}>
      {direction && (
        <>
          <span aria-hidden="true">{direction === 'up' ? '↑' : '↓'} </span>
          <span className="sr-only">{direction === 'up' ? 'Up ' : 'Down '}</span>
        </>
      )}
      {text}
    </span>
  )
}

/** One hue: the accent line at 2px, the same colour at a tenth for the fill. */
function Sparkline({ values }: { values: readonly number[] }) {
  const paths = sparklinePaths(values)
  if (!paths) return null
  return (
    <svg
      className="mt-1 block h-9 w-full overflow-visible text-accent"
      viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      data-sparkline=""
    >
      <path d={paths.area} fill="currentColor" fillOpacity={0.1} stroke="none" />
      <path
        d={paths.line}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
