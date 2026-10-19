export { pageColumn, sectionTitle } from '../../../components/page-header'
// Class strings the platform pages share. They are the Mercury-direction
// treatment from /designs/platform-shell — light page titles, shared buttons,
// hairline cards — written once so the pages cannot drift apart. They are
// plain token utilities, so every palette and both modes come for free.

export const card =
  'rounded-xl border border-line bg-panel-solid shadow-sm shadow-(color:--shadow-soft)'

export const textLink =
  'inline-flex items-center gap-0.5 text-[13px] font-semibold text-accent-fg hover:underline'

export const columnHead = 'text-xs font-semibold text-ink-soft'
