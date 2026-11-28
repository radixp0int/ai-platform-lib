// The Insights page's charts. One hue throughout: the accent, at full strength
// for the mark and a tenth of it for an area. Where a chart has more than one
// series the lines differ by dash, not colour, and a legend names them. Text
// stays in the ink tokens. Every chart has a hover read-out and a text name.

import { useState, type PointerEvent, type ReactNode } from 'react'

const W = 600

/** Five x labels at most, the first and last always among them. */
function xTicks(labels: readonly string[]) {
  const n = labels.length
  if (n <= 7) return labels.map((_, i) => i)
  return [0, Math.round((n - 1) / 4), Math.round((n - 1) / 2), Math.round(((n - 1) * 3) / 4), n - 1]
}

export type LineSeries = {
  name: string
  values: readonly number[]
  /** How the line is drawn, so series differ without a second hue. */
  dash?: 'solid' | 'dashed' | 'dotted'
}

const DASH = { solid: undefined, dashed: '7 4', dotted: '1.5 4' }

/** A short line in the series' dash, for a legend or a tooltip row. */
export function LineKey({ dash = 'solid' }: { dash?: LineSeries['dash'] }) {
  return (
    <svg width="18" height="8" aria-hidden="true" className="shrink-0 text-accent">
      <path
        d="M1,4 H17"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={DASH[dash]}
      />
    </svg>
  )
}

/**
 * A line chart over a run of labels: thin accent lines, a recessive grid, the
 * y ticks on the left and five x labels under it. Hovering shows a crosshair,
 * a marker on each line and the values. `area` shades under a single line.
 */
export function LineChart({
  label,
  series,
  labels,
  min,
  max,
  ticks,
  format,
  height = 180,
  area = false,
  endMarker = false,
}: {
  /** Names the chart for a screen reader, with its headline numbers. */
  label: string
  series: LineSeries[]
  labels: readonly string[]
  min: number
  max: number
  /** Gridlines and their labels. */
  ticks: readonly number[]
  format: (value: number) => string
  height?: number
  area?: boolean
  /** A marker on the last point of the first line. */
  endMarker?: boolean
}) {
  const [hover, setHover] = useState<number | null>(null)
  const n = labels.length
  const y = (v: number) => height - ((v - min) / (max - min)) * (height - 8)
  const x = (k: number) => (n === 1 ? W / 2 : (k / (n - 1)) * W)
  const path = (values: readonly number[]) =>
    values.map((v, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const pct = (px: number, of: number) => `${((px / of) * 100).toFixed(2)}%`
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const k = Math.round(((event.clientX - box.left) / box.width) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, k)))
  }
  const tipX = hover == null ? 0 : (x(hover) / W) * 100
  const tipTop = hover == null ? 0 : Math.min(...series.map((s) => y(s.values[hover])))

  return (
    <div className="flex flex-col gap-2" data-chart="line">
      <div className="relative" style={{ height }}>
        {ticks.map((t) => (
          <span
            key={t}
            aria-hidden="true"
            className="absolute left-0 w-[34px] -translate-y-1/2 text-right text-[11px] text-ink-soft tabular-nums"
            style={{ top: pct(y(t), height) }}
          >
            {format(t)}
          </span>
        ))}
        <div
          className="absolute inset-y-0 right-0 left-10"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <svg
            viewBox={`0 0 ${W} ${height}`}
            preserveAspectRatio="none"
            className="block h-full w-full overflow-visible text-accent"
            role="img"
            aria-label={label}
          >
            {ticks.map((t) => (
              <path
                key={t}
                d={`M0,${y(t).toFixed(1)} H${W}`}
                stroke="var(--line)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {area && series[0] && (
              <path
                d={`${path(series[0].values)} L${x(n - 1)},${height} L${x(0)},${height} Z`}
                fill="currentColor"
                fillOpacity={0.1}
              />
            )}
            {series.map((s) => (
              <path
                key={s.name}
                d={path(s.values)}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={DASH[s.dash ?? 'solid']}
                vectorEffect="non-scaling-stroke"
                data-series={s.name}
              />
            ))}
            {hover != null && (
              <path
                d={`M${x(hover).toFixed(1)},0 V${height}`}
                stroke="var(--ink-soft)"
                strokeWidth={1}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
          {endMarker && series[0] && hover == null && (
            <Marker left={(x(n - 1) / W) * 100} top={(y(series[0].values[n - 1]) / height) * 100} />
          )}
          {hover != null && (
            <>
              {series.map((s) => (
                <Marker key={s.name} left={tipX} top={(y(s.values[hover]) / height) * 100} />
              ))}
              <div
                role="status"
                className="pointer-events-none absolute z-10 min-w-36 rounded-control border border-line bg-panel-solid px-2.5 py-1.5 text-xs leading-relaxed whitespace-nowrap text-ink shadow-lg shadow-(color:--shadow-menu)"
                style={{
                  left: `${tipX}%`,
                  top: `${(tipTop / height) * 100}%`,
                  transform: `translate(${tipX < 14 ? '-10%' : tipX > 86 ? '-90%' : '-50%'}, calc(-100% - 12px))`,
                }}
              >
                <div className="font-bold text-ink-strong">{labels[hover]}</div>
                {series.map((s) => (
                  <div key={s.name} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-ink-soft">
                      {series.length > 1 && <LineKey dash={s.dash} />}
                      {s.name}
                    </span>
                    <b className="font-bold text-ink-strong tabular-nums">
                      {format(s.values[hover])}
                    </b>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="flex justify-between pl-10 text-[11px] text-ink-soft tabular-nums"
      >
        {xTicks(labels).map((k) => (
          <span key={k}>{labels[k]}</span>
        ))}
      </div>
    </div>
  )
}

function Marker({ left, top }: { left: number; top: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute size-2.5 -translate-1/2 rounded-full bg-accent ring-2 ring-panel-solid"
      style={{ left: `${left}%`, top: `${top}%` }}
    />
  )
}

export type BarRow = {
  name: string
  value: number
  /** Drawn in the neutral line colour: "Everything else", "Something else". */
  rest?: boolean
}

/**
 * Names, bars and values in rows: a ranking. With `onSelect` each row is a
 * toggle button, pressed for `selected`.
 */
export function BarList({
  label,
  rows,
  format = (n) => n.toLocaleString('en-US'),
  selected,
  onSelect,
  nameWidth = '150px',
}: {
  label: string
  rows: readonly BarRow[]
  format?: (value: number) => string
  selected?: string | null
  onSelect?: (name: string) => void
  nameWidth?: string
}) {
  const top = Math.max(1, ...rows.filter((r) => !r.rest).map((r) => r.value))
  const grid = { gridTemplateColumns: `${nameWidth} minmax(0,1fr) 56px` }
  const body = (row: BarRow) => (
    <>
      <span className="truncate text-ink">{row.name}</span>
      <span
        aria-hidden="true"
        className={`h-3.5 rounded-r-[4px] ${row.rest ? 'bg-line' : 'bg-accent'}`}
        style={{ width: `${Math.min(100, (row.value / top) * 100).toFixed(1)}%` }}
      />
      <span className="text-right font-bold text-ink-strong tabular-nums">{format(row.value)}</span>
    </>
  )
  return (
    <ul aria-label={label} className="flex flex-col" data-chart="bars">
      {rows.map((row) => (
        <li key={row.name}>
          {onSelect ? (
            <button
              type="button"
              aria-pressed={selected === row.name}
              onClick={() => onSelect(row.name)}
              className={`-mx-1.5 grid w-[calc(100%+12px)] items-center gap-3 rounded-control px-1.5 py-1.5 text-left text-[13px] transition hover:bg-tint/6 ${
                selected === row.name ? 'bg-tint/8 font-bold' : ''
              }`}
              style={grid}
            >
              {body(row)}
            </button>
          ) : (
            <div className="grid items-center gap-3 py-1.5 text-[13px]" style={grid}>
              {body(row)}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * One bar a day (or an hour), accent, rounded at the top. `part` draws a share
 * of each bar solid and the rest faint, for one type out of the total.
 */
export function ColumnChart({
  label,
  labels,
  values,
  part,
  height = 160,
  describe,
}: {
  label: string
  labels: readonly string[]
  values: readonly number[]
  part?: readonly number[]
  height?: number
  /** The tooltip for a column. */
  describe: (index: number) => ReactNode
}) {
  const [hover, setHover] = useState<number | null>(null)
  const peak = Math.max(2, Math.ceil(Math.max(1, ...values) / 2) * 2)
  const n = labels.length
  const gap = n > 20 ? 3 : n > 10 ? 6 : 12
  const every = n <= 7 ? 1 : Math.ceil(n / 5)
  return (
    <div className="flex flex-col gap-2" data-chart="columns">
      <div className="relative ml-[30px]" style={{ height }} role="img" aria-label={label}>
        {[0, peak / 2, peak].map((t) => (
          <span key={t} aria-hidden="true">
            <span
              className="absolute inset-x-0 h-px bg-line"
              style={{ bottom: (t / peak) * height }}
            />
            <span
              className="absolute -left-[30px] w-6 translate-y-1/2 text-right text-[11px] text-ink-soft tabular-nums"
              style={{ bottom: (t / peak) * height }}
            >
              {t}
            </span>
          </span>
        ))}
        <div className="absolute inset-0 flex items-end" style={{ gap }}>
          {values.map((v, j) => {
            const whole = (v / peak) * height
            const solid = part ? (part[j] / peak) * height : whole
            return (
              <div
                key={j}
                className="relative flex h-full flex-1 items-end justify-center"
                onPointerEnter={() => setHover(j)}
                onPointerLeave={() => setHover(null)}
                data-column={labels[j]}
              >
                <div
                  className="flex w-[72%] max-w-[60px] min-w-1 flex-col-reverse gap-[2px]"
                  style={{ height: whole }}
                >
                  {solid > 0 && (
                    <span
                      className={`block shrink-0 bg-accent ${solid >= whole ? 'rounded-t-[4px]' : ''}`}
                      style={{ height: solid }}
                    />
                  )}
                  {whole - solid > 0.5 && (
                    <span className="block min-h-0 flex-1 rounded-t-[4px] bg-accent/20" />
                  )}
                </div>
                {hover === j && (
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 min-w-36 -translate-x-1/2 rounded-control border border-line bg-panel-solid px-2.5 py-1.5 text-xs whitespace-nowrap text-ink shadow-lg shadow-(color:--shadow-menu)">
                    {describe(j)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div aria-hidden="true" className="ml-[30px] flex" style={{ gap }}>
        {labels.map((l, j) => (
          <span key={j} className="flex-1 text-center text-[11px] whitespace-nowrap text-ink-soft">
            {(j % every === 0 && n - 1 - j >= Math.ceil(every / 2)) || j === n - 1 ? l : ''}
          </span>
        ))}
      </div>
    </div>
  )
}
