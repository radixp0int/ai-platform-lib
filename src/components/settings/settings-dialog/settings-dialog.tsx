import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '../../../primitives/button'
import { Modal } from '../../../primitives/modal'
import type { SettingsDialogProps } from '../types'

/**
 * Laid onto Modal's surface, whose children are its `<header>` (the dialog
 * title and the close button), one body `<div>` and its `<footer>`. The body
 * div is dissolved (`display: contents`) so the section list and the pane it
 * holds become cells of one grid with the header and footer:
 *
 *   ≥ 900px                         < 900px
 *   ┌─────────┬──────────────┐      ┌────────────────┐
 *   │ header  │ pane         │      │ header         │
 *   ├─────────┤              │      ├────────────────┤
 *   │ list    │              │      │ list, as tabs  │
 *   │         ├──────────────┤      ├────────────────┤
 *   │         │ footer       │      │ pane           │
 *   └─────────┴──────────────┘      ├────────────────┤
 *                                   │ footer         │
 *                                   └────────────────┘
 *
 * `!grid` and `!max-w-` because Modal's own `flex` and size class sit on the
 * same element, and two utilities for one property resolve by stylesheet
 * order, not by their order in the class string.
 */
const SURFACE = [
  '!grid !max-w-[980px] h-[min(640px,calc(100dvh-2rem))]',
  'grid-cols-1 grid-rows-[auto_auto_minmax(0,1fr)_auto]',
  'min-[900px]:grid-cols-[220px_minmax(0,1fr)] min-[900px]:grid-rows-[auto_minmax(0,1fr)_auto]',
  '[&>div]:contents',
  '[&>header]:col-start-1 [&>header]:row-start-1 [&>header]:bg-tint/4 [&>header]:pb-2',
  'min-[900px]:[&>header]:border-r min-[900px]:[&>header]:border-line',
  '[&>footer]:col-start-1 [&>footer]:row-start-4',
  'min-[900px]:[&>footer]:col-start-2 min-[900px]:[&>footer]:row-start-3',
].join(' ')

/**
 * One settings dialog with a list of sections on the left — a row of tabs
 * across the top below 900px — and the open section's pane beside it. The
 * footer resets the open section (when it says how), notes that changes are
 * already saved, and closes with Done.
 *
 * Built on Modal, so modality, Escape and returning focus to the trigger are
 * the platform's. Focus opens on the pane rather than the close button, so the
 * dialog does not open with a focus ring and a tooltip on the corner X.
 *
 * The sections are data: each brings its label, icon, one line of description,
 * its content and its reset. The dialog owns no setting.
 */
export function SettingsDialog({
  open,
  onOpenChange,
  sections,
  section,
  defaultSection,
  onSectionChange,
  title = 'Settings',
  footnote,
  status = 'Saved',
  doneLabel = 'Done',
}: SettingsDialogProps) {
  const [ownSection, setOwnSection] = useState(defaultSection ?? sections[0]?.id)
  const activeId = section ?? ownSection
  const active = sections.find((s) => s.id === activeId) ?? sections[0]
  const baseId = useId()
  const paneRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())

  const select = (id: string) => {
    if (section === undefined) setOwnSection(id)
    onSectionChange?.(id)
  }

  // A new section starts at its top, not at the previous one's scroll offset.
  useEffect(() => {
    paneRef.current?.scrollTo?.({ top: 0 })
  }, [active?.id])

  if (!active) return null

  const tabId = (id: string) => `${baseId}-tab-${id}`
  const panelId = `${baseId}-panel`

  // Arrow keys move along the list (either axis, since the list turns from a
  // column into a row at 900px), Home and End jump to its ends. Selection
  // follows focus: a section is cheap to show.
  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = sections.findIndex((s) => s.id === active.id)
    const last = sections.length - 1
    const next =
      event.key === 'ArrowDown' || event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : -1
    if (next < 0) return
    event.preventDefault()
    const id = sections[next].id
    select(id)
    tabRefs.current.get(id)?.focus()
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      initialFocusRef={paneRef}
      contentClassName={SURFACE}
      footer={
        <>
          {active.reset && (
            <Button variant="secondary" onClick={active.reset.onReset}>
              {active.reset.label}
            </Button>
          )}
          <span className="flex-1" />
          {status !== null && (
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
              <span aria-hidden className="size-1.5 rounded-full bg-success-fg" />
              {status}
            </span>
          )}
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            {doneLabel}
          </Button>
        </>
      }
    >
      <nav
        aria-label={`${title} sections`}
        className="col-start-1 row-start-2 flex flex-col border-b border-line bg-tint/4 px-3 pb-2.5 min-[900px]:row-span-2 min-[900px]:border-r min-[900px]:border-b-0 min-[900px]:px-2.5 min-[900px]:pb-4"
      >
        <div
          role="tablist"
          aria-orientation="vertical"
          onKeyDown={onListKeyDown}
          className="flex flex-wrap gap-1 min-[900px]:flex-col min-[900px]:gap-0.5"
        >
          {sections.map((s) => {
            const selected = s.id === active.id
            return (
              <button
                key={s.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(s.id, el)
                  else tabRefs.current.delete(s.id)
                }}
                id={tabId(s.id)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(s.id)}
                className={`flex h-9 items-center gap-2.5 rounded-control px-2.5 text-left text-[13.5px] font-semibold transition [&>svg]:size-4 [&>svg]:shrink-0 ${
                  selected
                    ? 'bg-panel-solid text-ink-strong shadow-sm ring-1 ring-line dark:bg-tint/10 dark:shadow-none dark:ring-0'
                    : 'text-ink hover:bg-accent/8'
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            )
          })}
        </div>
        {footnote && (
          <p className="mt-auto hidden px-2.5 pt-4 text-[11.5px] leading-snug text-ink-soft min-[900px]:block">
            {footnote}
          </p>
        )}
      </nav>

      <section
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(active.id)}
        className="col-start-1 row-start-3 flex min-h-0 flex-col min-[900px]:col-start-2 min-[900px]:row-span-2 min-[900px]:row-start-1"
      >
        <div className="border-b border-line px-6 pt-5 pb-4 min-[900px]:pr-14">
          <h3 className="text-lg font-extrabold tracking-tight text-ink-strong">{active.label}</h3>
          {active.description && (
            <p className="mt-0.5 text-[13px] text-ink-soft">{active.description}</p>
          )}
        </div>
        <div
          ref={paneRef}
          tabIndex={-1}
          className="@container min-h-0 flex-1 overflow-y-auto px-6 pt-5 pb-6 outline-none"
        >
          {active.content}
        </div>
      </section>
    </Modal>
  )
}
