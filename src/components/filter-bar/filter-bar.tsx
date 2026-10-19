import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { withDefaults } from '../../lib/withDefaults'
import { Button } from '../../primitives/button'
import { CalendarIcon, FunnelIcon } from '../../primitives/icons'
import { FilterPanel } from '../filter-panel'
import { Omnibox, type OmniboxChip, type OmniboxGroup } from '../omnibox'
import {
  buildChips,
  buildQuickRows,
  buildSuggestionGroups,
  countActive,
  type SuggestionGroupSpec,
} from './filterModel'
import { QuickFilters } from './quick-filters'
import type { FilterBarLabels, FilterBarProps } from './types'

const LABELS: FilterBarLabels = {
  filters: 'Filters',
  searchEvery: 'Search every field',
  narrowToField: 'Narrow to a field',
  dates: 'Dates',
  values: 'Filters',
  placeholderSimple: 'Search, or type to narrow to a field…',
  placeholderAdvanced: 'Search, or pick a date or filter…',
  custom: 'Custom',
  only: 'Show only',
  switchToAdvanced: 'Switch to advanced',
  switchToSimple: 'Use simple filters',
  quickHint: 'Type to search or narrow to a field',
  searchFor: 'Search for',
  contains: (field) => `${field} contains`,
  removeFilter: (name) => `Remove ${name}`,
}

const kbd =
  'shrink-0 rounded border border-line bg-canvas px-1.5 py-0.5 text-[11px] font-bold text-ink-soft'

/**
 * The toolbar above a table, and the filters that go with it.
 *
 * Three things share one list of fields. The Filters button opens a panel that
 * draws them. The omnibox shows every one that is set as a chip, and suggests
 * the dates and values that match what you type. In the `advanced` style the
 * omnibox also offers quick picks while it is empty. Because all three read
 * the same `fields`, setting a filter anywhere is setting it everywhere.
 *
 * The panel floats over the table, or docks beside it when pinned. `open` and
 * `pinned` are separate on purpose: the pin survives closing the panel.
 *
 * Inert about data, like the rest of core. It holds only what is on screen —
 * the draft being typed, whether the panel is open and where. Every filter
 * value, term and the style itself belong to the host.
 */
export function FilterBar({
  label,
  fields,
  terms,
  onTermsChange,
  termFields = [],
  filterStyle = 'simple',
  onFilterStyleChange,
  onReset,
  showHeader = true,
  showPanel = true,
  defaultOpen = false,
  defaultPinned = false,
  onPinnedChange,
  title = 'Filters',
  children,
  labels: overrides,
  className = '',
}: FilterBarProps) {
  const labels = withDefaults<FilterBarLabels>(LABELS, overrides)
  const panelId = useId()
  const anchorRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState(defaultOpen)
  const [pinned, setPinned] = useState(defaultPinned)
  const [expandedDate, setExpandedDate] = useState<string | undefined>()
  const advanced = filterStyle === 'advanced'

  // With no header there is nothing to open or pin the panel with, so what is
  // left of it is a rail that is always docked and always open.
  const railOnly = showPanel && !showHeader
  const docked = railOnly || (showPanel && open && pinned)

  // Floating only: a docked panel is part of the page and must not vanish when
  // you click the table it is filtering.
  useEffect(() => {
    if (!showHeader || !showPanel || pinned || !open) return
    const onDown = (e: PointerEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [showHeader, showPanel, pinned, open])

  const today = useMemo(() => new Date(), [])
  const active = countActive(fields)
  const chipSpecs = buildChips({ fields, terms, termFields, onTermsChange, today })
  const chips: OmniboxChip[] = chipSpecs.map((chip) => ({
    id: chip.id,
    prefix: chip.prefix || undefined,
    label: (
      <>
        {chip.text}
        {chip.detail && <span className="ml-1 font-medium opacity-60">{chip.detail}</span>}
      </>
    ),
    removeLabel: labels.removeFilter(chip.name),
    title: chip.name,
    onRemove: chip.remove,
  }))

  const groupLabel: Record<SuggestionGroupSpec['id'], string> = {
    search: labels.searchEvery,
    terms: labels.narrowToField,
    dates: labels.dates,
    values: labels.values,
  }
  const glyphFor = (groupId: SuggestionGroupSpec['id'], glyph?: string) =>
    groupId === 'dates' ? (
      <CalendarIcon width={12} height={12} />
    ) : groupId === 'values' ? (
      <FunnelIcon width={12} height={12} />
    ) : (
      glyph
    )
  const groups: OmniboxGroup[] = buildSuggestionGroups({
    query: draft,
    fields,
    terms,
    termFields,
    onTermsChange,
    today,
    labels,
  }).map((group) => ({
    id: group.id,
    label: groupLabel[group.id],
    items: group.items.map((item) => ({
      id: item.id,
      icon: glyphFor(group.id, item.glyph),
      label: (
        <>
          {item.lead}
          <strong className="font-extrabold">{item.strong}</strong>
        </>
      ),
      hint: item.hint,
      onSelect: () => {
        item.run()
        setDraft('')
      },
    })),
  }))

  const openCustom = (fieldId: string, close: () => void) => {
    setExpandedDate(fieldId)
    setOpen(true)
    close()
  }

  // The style lives in the header's omnibox, so with no header there is nothing to switch.
  const styleSwitch = onFilterStyleChange && showHeader && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onFilterStyleChange(advanced ? 'simple' : 'advanced')}
    >
      {advanced ? labels.switchToSimple : labels.switchToAdvanced}
    </Button>
  )

  const panel = (
    <FilterPanel
      title={title}
      fields={fields}
      activeCount={active}
      onReset={onReset}
      pinned={railOnly || pinned}
      onPinnedChange={
        railOnly
          ? undefined
          : (next) => {
              setPinned(next)
              onPinnedChange?.(next)
            }
      }
      onClose={railOnly ? undefined : () => setOpen(false)}
      expandedDate={expandedDate}
      onExpandedDateChange={setExpandedDate}
      footer={styleSwitch}
      className={railOnly || pinned ? '' : 'shadow-[0_12px_32px_var(--shadow-raised)]'}
    />
  )

  // Nothing but the table: no header and no panel.
  if (!showHeader && !showPanel) {
    return <div className={['min-w-0', className].filter(Boolean).join(' ')}>{children}</div>
  }

  return (
    <div className={['flex min-w-0 flex-col gap-4', className].filter(Boolean).join(' ')}>
      {showHeader && (
        <div ref={anchorRef} className="relative flex flex-wrap items-start gap-2.5">
          {showPanel && (
            <Button
              variant={open ? 'primary' : 'secondary'}
              size="lg"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              icon={<FunnelIcon width={15} height={15} />}
            >
              {labels.filters}
              {active > 0 && (
                <span className="ml-1 inline-grid min-w-[18px] place-items-center rounded-control bg-on-brand-solid/20 px-1.5 text-[11px] font-extrabold tabular-nums">
                  {active}
                </span>
              )}
            </Button>
          )}

          <Omnibox
            label={label}
            className="min-w-[min(100%,16rem)] basis-64 grow"
            placeholder={advanced ? labels.placeholderAdvanced : labels.placeholderSimple}
            value={draft}
            onValueChange={setDraft}
            chips={chips}
            groups={groups}
            shortcut="k"
            suffix={<kbd className={kbd}>⌘K</kbd>}
            onRemoveLast={() => chipSpecs[chipSpecs.length - 1]?.remove()}
            onMenuChange={(shown) => {
              if (shown && !pinned) setOpen(false)
            }}
            quick={
              advanced
                ? ({ close }) => (
                    <QuickFilters
                      rows={buildQuickRows(fields, today)}
                      datesLabel={labels.dates}
                      valuesLabel={labels.values}
                      customLabel={labels.custom}
                      hint={labels.quickHint}
                      onlyLabel={labels.only}
                      onCustom={showPanel ? (fieldId) => openCustom(fieldId, close) : undefined}
                      switchLabel={onFilterStyleChange ? labels.switchToSimple : undefined}
                      onSwitch={() => onFilterStyleChange?.('simple')}
                    />
                  )
                : undefined
            }
          />

          {showPanel && open && !pinned && (
            <div
              id={panelId}
              role="region"
              aria-label={title}
              className="absolute top-[calc(100%+8px)] left-0 z-30 max-h-[min(44rem,calc(100dvh-8rem))] w-[19rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-surface"
            >
              {panel}
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-4 max-lg:flex-col max-lg:items-stretch">
        {docked && (
          <div
            id={panelId}
            role="region"
            aria-label={title}
            // Taller than the screen, the rail scrolls by itself and follows you down
            // the table, instead of stretching the page to its own height.
            className="sticky top-4 max-h-[calc(100dvh-2rem)] w-[17rem] shrink-0 overflow-y-auto rounded-surface max-lg:static max-lg:max-h-none max-lg:w-full max-lg:overflow-visible"
          >
            {panel}
          </div>
        )}
        <div className="min-w-0 grow">{children}</div>
      </div>
    </div>
  )
}
