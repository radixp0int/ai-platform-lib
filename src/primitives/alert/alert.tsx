import type { ReactNode } from 'react'
import {
  ChevronRightIcon,
  CircleCheckIcon,
  CircleInfoIcon,
  CircleXIcon,
  TriangleAlertIcon,
  XIcon,
} from '../icons'
import { IconButton } from '../icon-button'
import { useUiSize } from '../../lib/uiSize'
import type { AlertProps, AlertTone } from './types'

// Each tone: the icon tile (panel), the accent colour the bar's edge and
// glyph take, the list bullets, the solid action and the text link. The
// surface itself stays neutral whatever the tone.
const tones: Record<
  AlertTone,
  { tile: string; accent: string; dot: string; solid: string; link: string; glyph: ReactNode }
> = {
  info: {
    tile: 'bg-brand-fg/10 text-brand-fg ring-brand-fg/25',
    accent: '[--alert-accent:var(--brand-fg)]',
    dot: 'bg-brand-fg',
    solid: 'bg-brand-solid text-on-brand-solid hover:bg-brand-fg-hover',
    link: 'text-brand-fg hover:text-brand-fg-hover',
    glyph: <CircleInfoIcon width={17} height={17} />,
  },
  success: {
    tile: 'bg-success-surface text-success-fg ring-success-line',
    accent: '[--alert-accent:var(--success-fg)]',
    dot: 'bg-success',
    solid: 'bg-success text-panel-solid hover:brightness-110',
    link: 'text-success-fg',
    glyph: <CircleCheckIcon width={17} height={17} />,
  },
  warning: {
    tile: 'bg-caution-surface text-caution ring-caution-line',
    accent: '[--alert-accent:var(--caution)]',
    dot: 'bg-caution',
    solid: 'bg-caution text-panel-solid hover:brightness-110',
    link: 'text-caution',
    glyph: <TriangleAlertIcon width={17} height={17} />,
  },
  error: {
    tile: 'bg-danger/10 text-danger-fg ring-danger/25',
    accent: '[--alert-accent:var(--danger-fg)]',
    dot: 'bg-danger-solid',
    solid: 'bg-danger-solid text-panel-solid hover:bg-danger-solid-hover',
    link: 'text-danger-fg',
    glyph: <CircleXIcon width={17} height={17} />,
  },
}

/**
 * A status message on a quiet panel. The tone lives in two places only: the
 * tile around the glyph, and the action — a button in the tone's own colour —
 * so the one thing to do next is the one thing in colour. Tone is never the
 * only signal: each state has its own glyph and callers provide a visible
 * title. Lists and native `<details>` carry validation summaries and
 * diagnostic payloads. For a one-line status band in a message flow, use
 * `Notice`.
 *
 * `variant="bar"` squares it off into a live-status strip: a 3px tone edge on
 * the left, the glyph plain and inline in the tone colour, a hairline border
 * and a faint shadow. Copy, actions and dismiss are the same in both.
 */
export function Alert({
  tone = 'info',
  variant = 'panel',
  title,
  bordered: _bordered,
  layout = 'stack',
  children,
  items,
  action,
  secondaryAction,
  onDismiss,
  dismissLabel = 'Dismiss alert',
  icon,
  details,
  detailsLabel = 'Show details',
  className = '',
  role = tone === 'error' ? 'alert' : 'status',
  ...rest
}: AlertProps) {
  const compact = useUiSize() === 'compact'
  const treatment = tones[tone]
  const inline = layout === 'inline'
  const bar = variant === 'bar'
  const titleSize = compact ? 'text-[13px]' : 'text-[14px]'
  const text = compact ? 'text-[12.5px]' : 'text-[13.5px]'

  // The × centres on the title line: the tile's padded title in a panel, the
  // bare first line in a bar. Inline, only once it wraps.
  const dismissOffset = {
    stack: bar ? '-my-1.5' : '-mt-0.5',
    inline: `@max-[28rem]:self-start ${bar ? '@max-[28rem]:-my-1.5' : '@max-[28rem]:-mt-0.5'}`,
  }[layout]

  const actions = (action || secondaryAction) && (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${inline ? 'ml-auto' : 'mt-2.5'}`}>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          aria-label={action.ariaLabel}
          disabled={action.disabled}
          className={`inline-flex h-7.5 items-center rounded-control px-3 text-[12.5px] font-extrabold whitespace-nowrap transition disabled:pointer-events-none disabled:opacity-40 ${treatment.solid}`}
        >
          {action.label}
        </button>
      )}
      {secondaryAction && (
        <button
          type="button"
          onClick={secondaryAction.onClick}
          aria-label={secondaryAction.ariaLabel}
          disabled={secondaryAction.disabled}
          className={`text-[12.5px] font-extrabold whitespace-nowrap underline-offset-3 hover:underline disabled:pointer-events-none disabled:opacity-40 ${treatment.link}`}
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  )

  return (
    <div
      role={role}
      data-tone={tone}
      data-variant={variant}
      className={[
        'flex min-w-0 border border-line bg-panel-solid',
        // The bar's edge is an inset shadow, so it takes no layout.
        bar
          ? `gap-2.5 ${treatment.accent} shadow-[inset_3px_0_0_var(--alert-accent),0_1px_2px_var(--shadow-soft)]`
          : 'gap-3 rounded-surface shadow-sm shadow-(color:--shadow-soft)',
        inline ? '@container items-center' : 'items-start',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {icon !== false && (
        <span
          aria-hidden="true"
          className={`inline-grid shrink-0 place-items-center ${
            bar
              ? // One title line tall, so the plain glyph centres on the bold lead.
                `h-[1lh] leading-snug text-(color:--alert-accent) ${titleSize}`
              : `rounded-control ring-1 ring-inset ${treatment.tile} ${compact ? 'size-7' : 'size-8'}`
          } ${inline ? '@max-[28rem]:self-start' : ''}`}
        >
          {icon ?? treatment.glyph}
        </span>
      )}

      <div
        className={`min-w-0 flex-1 ${inline ? 'flex flex-wrap items-center gap-x-2.5 gap-y-1.5' : ''}`}
      >
        <p
          className={`m-0 leading-snug font-extrabold [overflow-wrap:anywhere] text-ink-strong ${titleSize} ${bar ? '' : inline ? '@max-[28rem]:pt-1.5' : 'pt-1.5'}`}
        >
          {title}
        </p>
        {children && (
          <div className={`leading-relaxed text-ink-soft ${text} ${inline ? '' : 'mt-0.5'}`}>
            {children}
          </div>
        )}
        {items && items.length > 0 && (
          <ul
            className={`m-0 mt-1.5 flex list-none flex-col gap-1 p-0 leading-relaxed text-ink ${text}`}
          >
            {items.map((item, index) => (
              <li key={index} className="relative pl-4">
                <span
                  aria-hidden="true"
                  className={`absolute top-[0.62em] left-0.5 size-1.5 rounded-full ${treatment.dot}`}
                />
                {item}
              </li>
            ))}
          </ul>
        )}
        {details && (
          <details className="group mt-2">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-[12.5px] font-extrabold text-brand-fg hover:text-brand-fg-hover [&::-webkit-details-marker]:hidden">
              <ChevronRightIcon
                width={13}
                height={13}
                className="transition-transform group-open:rotate-90"
              />
              {detailsLabel}
            </summary>
            <div className="mt-2 min-w-0">{details}</div>
          </details>
        )}
        {actions}
      </div>

      {onDismiss && (
        <IconButton
          onClick={onDismiss}
          aria-label={dismissLabel}
          title={dismissLabel}
          size="sm"
          className={`-mr-1.5 shrink-0 ${dismissOffset}`}
        >
          <XIcon width={13} height={13} />
        </IconButton>
      )}
    </div>
  )
}
