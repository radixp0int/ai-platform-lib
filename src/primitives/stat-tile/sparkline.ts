/** The sparkline's drawing box. The SVG stretches it to the tile's width. */
export const SPARK_WIDTH = 120
export const SPARK_HEIGHT = 36
/** Room above the highest point and below the lowest, so a 2px line is never cut. */
const TOP = 4
const BOTTOM = 32

const round = (n: number) => Math.round(n * 10) / 10

/**
 * The line and the closed area under it for a run of numbers, in a
 * 120×36 box. The lowest number sits near the bottom and the highest near the
 * top; a run where every number is the same draws a level line across the
 * middle. Numbers that are not finite are skipped. Returns null when fewer
 * than two numbers are left, since one point makes no line.
 */
export function sparklinePaths(values: readonly number[]): { line: string; area: string } | null {
  const points = values.filter(Number.isFinite)
  if (points.length < 2) return null
  const lo = Math.min(...points)
  const hi = Math.max(...points)
  const last = points.length - 1
  const xy = points.map((v, i) => {
    const t = hi === lo ? 0.5 : (v - lo) / (hi - lo)
    return [round((i / last) * SPARK_WIDTH), round(BOTTOM - t * (BOTTOM - TOP))] as const
  })
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')
  const area = `${line} L${SPARK_WIDTH},${SPARK_HEIGHT} L0,${SPARK_HEIGHT} Z`
  return { line, area }
}
