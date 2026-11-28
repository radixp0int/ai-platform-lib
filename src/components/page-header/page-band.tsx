import { useId, useState } from 'react'
import { Breadcrumbs } from '../../primitives/breadcrumbs'
import type { PageBandProps, PageBandStat } from './types'

const column = 'mx-auto w-full max-w-[1180px] px-8 max-md:px-4'

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`ml-1 inline-block align-[-1px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function Stat({ stat, first }: { stat: PageBandStat; first: boolean }) {
  const body = (
    <>
      <span className="text-xs font-semibold text-brand-200">{stat.label}</span>
      <span className="text-[26px] leading-none font-semibold tracking-tight text-white">
        {stat.value}
      </span>
      {stat.note && <span className="text-xs text-brand-100">{stat.note}</span>}
    </>
  )
  const box = `flex min-w-0 flex-col gap-1.5 text-left ${
    first ? '' : 'border-l border-white/14 max-md:border-l-0'
  } px-6 first:pl-0 max-md:px-0`
  return stat.onSelect ? (
    <button
      type="button"
      onClick={stat.onSelect}
      className={`${box} cursor-pointer rounded-sm [&:hover>span:nth-child(2)]:underline [&:hover>span:nth-child(2)]:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white`}
    >
      {body}
    </button>
  ) : (
    <div className={box}>{body}</div>
  )
}

/**
 * The navy title band at the top of a page: an optional trail, the title, a
 * line about the page, the page's actions on the right, and an optional
 * "Show details" link that opens a strip of figures. The page body passed as
 * children lifts over the bottom of the band, so the first card overlaps it.
 */
export function PageBand({
  title,
  description,
  breadcrumbs,
  actions,
  details,
  align = 'start',
  footer,
  children,
  className = '',
  ...rest
}: PageBandProps) {
  const centred = align === 'center'
  const trail = breadcrumbs && breadcrumbs.length > 0 && (
    <Breadcrumbs tone="inverse" items={breadcrumbs} />
  )
  const stripId = useId()
  const [ownOpen, setOwnOpen] = useState(details?.defaultOpen ?? false)
  const open = details?.open ?? ownOpen
  const toggle = () => {
    const next = !open
    if (details?.open === undefined) setOwnOpen(next)
    details?.onOpenChange?.(next)
  }

  // The band stays dark in both modes, so "on brand" is white inside it even
  // where dark mode turns --on-brand-solid into a deep ink. That keeps
  // Button's `inverse` legible here.
  return (
    <div className={`flex flex-col ${className}`}>
      <header
        className="bg-brand-900 pt-6 pb-16 text-white [--on-brand-solid:#ffffff] dark:border-b dark:border-line dark:bg-panel-solid"
        {...rest}
      >
        <div className={column}>
          {centred && trail}
          <div
            className={
              centred
                ? 'flex flex-col items-center gap-3.5 pt-6 text-center'
                : 'flex flex-wrap items-end justify-between gap-x-6 gap-y-3.5'
            }
          >
            <div className={`flex min-w-0 flex-col gap-1.5 ${centred ? 'items-center' : ''}`}>
              {!centred && trail}
              <h1
                className={`leading-tight font-light tracking-tight ${centred ? 'text-[34px] text-balance max-md:text-[28px]' : 'text-[28px]'}`}
              >
                {title}
              </h1>
              {(description || details) && (
                <p className="text-[13.5px] text-brand-100">
                  {description}
                  {description && details && ' '}
                  {details && (
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={stripId}
                      onClick={toggle}
                      className="cursor-pointer whitespace-nowrap underline decoration-brand-100/40 underline-offset-3 hover:text-white hover:decoration-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
                    >
                      {details.summary && (
                        <>
                          <b className="font-extrabold text-on-brand-attention">
                            {details.summary}
                          </b>
                          {' · '}
                        </>
                      )}
                      {open
                        ? (details.hideLabel ?? 'Hide details')
                        : (details.showLabel ?? 'Show details')}
                      <Chevron open={open} />
                    </button>
                  )}
                </p>
              )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
          </div>
          {details && (
            <div
              id={stripId}
              hidden={!open}
              role="group"
              aria-label={typeof title === 'string' ? `${title} details` : 'Details'}
              className="mt-5 grid grid-cols-4 border-t border-white/14 pt-5 max-md:grid-cols-2 max-md:gap-4"
            >
              {details.stats.map((stat, i) => (
                <Stat key={i} stat={stat} first={i === 0} />
              ))}
            </div>
          )}
          {footer && (
            <div
              data-page-band-footer=""
              className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-t border-white/14 pt-[18px]"
            >
              {footer}
            </div>
          )}
        </div>
      </header>
      {children && <div className={`relative -mt-11 pb-12 ${column}`}>{children}</div>}
    </div>
  )
}
