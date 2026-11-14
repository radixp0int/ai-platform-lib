import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { withDefaults } from '../../lib/withDefaults'
import { Button } from '../../primitives/button'
import { CalendarIcon, FunnelIcon, XIcon } from '../../primitives/icons'
import {
  BulkBar,
  clampSelection,
  DataTableView,
  MIN_BODY_HEIGHT,
  selectionLabel,
} from '../data-table'
import { FilterPanel } from '../filter-panel'
import { Omnibox, type OmniboxChip, type OmniboxGroup } from '../omnibox'
import { ExportMenu } from './export-menu'
import {
  buildChips,
  buildQuickRows,
  buildSuggestionGroups,
  countActive,
  findMatches as findInRows,
  type SuggestionGroupSpec,
} from './filterModel'
import { QuickFilters } from './quick-filters'
import { DEFAULT_GRID_LABELS } from './labels'
import type { DataGridLabels, DataGridProps } from './types'

const kbd =
  'shrink-0 rounded border border-line bg-canvas px-1.5 py-0.5 text-[11px] font-bold text-ink-soft'

/**
 * A table with its search, filters, selection and export, as one component.
 *
 * **The search box** does both kinds of filtering. Focused while empty, it
 * offers quick picks: a row for each date and each small filter. Typing swaps
 * them for what was typed: values from the data ("Bayshore Financial" in Name),
 * the filters and dates that match, then search every field or narrow to one.
 * Whatever is chosen becomes a chip; click the box again for the quick picks.
 *
 * **The panel** draws the same `fields`. It floats under the toolbar, or, when
 * pinned, docks as the grid's first column. Docked, it shares the table's frame
 * and its height: the table decides how tall the grid is, and the panel's
 * fields scroll inside. Below `lg` it sits above the table instead.
 *
 * **Selection** is the table's, with `maxSelections` for a limit, and the bulk
 * bar spans the grid. **Export** sits right of the search box.
 *
 * Inert about data, like everything in the library: it holds only what is on
 * screen (the text being typed, whether the panel is open and where). Rows,
 * filters, terms, sort and selection are the host's.
 */
export function DataGrid<T>({
  searchLabel,
  fields = [],
  terms = [],
  onTermsChange,
  termFields = [],
  findMatches,
  onReset,
  showSearch = true,
  showPanel = true,
  defaultOpen = false,
  defaultPinned = false,
  onPinnedChange,
  panelTitle = 'Filters',
  exportFormats,
  onExport,
  totalCount,
  toolbarEnd,
  bulkActions,
  labels: overrides,
  className = '',
  ...table
}: DataGridProps<T>) {
  const t = withDefaults<DataGridLabels>(DEFAULT_GRID_LABELS, overrides)
  const panelId = useId()
  const anchorRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState(defaultOpen)
  const [pinned, setPinned] = useState(defaultPinned)
  const [expandedDate, setExpandedDate] = useState<string | undefined>()

  const hasPanel = showPanel && fields.length > 0
  // With no search box there is nothing to open or pin the panel with, so what is
  // left of it is a rail that is always docked and always open.
  const railOnly = hasPanel && !showSearch
  const docked = railOnly || (hasPanel && open && pinned)
  const floating = hasPanel && showSearch && open && !pinned

  // Floating only: a docked panel is part of the page and must not vanish when
  // you click the table it is filtering.
  useEffect(() => {
    if (!floating) return
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
  }, [floating])

  const setTerms = onTermsChange ?? (() => {})
  const today = useMemo(() => new Date(), [])
  const active = countActive(fields)
  const chipSpecs = buildChips({ fields, terms, termFields, onTermsChange: setTerms, today })
  const chips: OmniboxChip[] = chipSpecs.map((chip) => ({
    id: chip.id,
    prefix: chip.prefix || undefined,
    label: (
      <>
        {chip.text}
        {chip.detail && <span className="ml-1 font-medium opacity-60">{chip.detail}</span>}
      </>
    ),
    removeLabel: t.removeFilter(chip.name),
    title: chip.name,
    onRemove: chip.remove,
  }))

  const matches =
    !onTermsChange || findMatches === false || !draft.trim()
      ? []
      : findMatches
        ? findMatches(draft)
        : findInRows(draft, table.rows, termFields)

  const groupLabel: Record<SuggestionGroupSpec['id'], string> = {
    matches: t.matches,
    search: t.searchEvery,
    terms: t.narrowToField,
    dates: t.dates,
    values: t.values,
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
    onTermsChange: setTerms,
    today,
    matches,
    labels: t,
  })
    // Without a host for terms, typing can still set the panel's fields, and nothing else.
    .filter((g) => onTermsChange || g.id === 'dates' || g.id === 'values')
    .map((group) => ({
      id: group.id,
      label: groupLabel[group.id],
      items: group.items.map((item) => ({
        id: item.id,
        icon: glyphFor(group.id, item.glyph),
        label: (
          <>
            {item.lead}
            <strong className="font-extrabold text-ink-strong">{item.strong}</strong>
            {item.tail}
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

  const clearAll = () => {
    if (terms.length) setTerms([])
    onReset?.()
  }

  // Selection, and what the bulk bar and export say about it.
  const selectable = Boolean(table.onSelectionChange)
  const selected = clampSelection(table.selectedIds ?? [], table.maxSelections)
  const busy = Boolean(table.loading || table.error)
  const matching = totalCount ?? table.rows.length

  const filtering = active > 0 || terms.length > 0
  const floor = table.minBodyHeight ?? MIN_BODY_HEIGHT
  const noMatch =
    filtering && !table.loading && !table.error && table.rows.length === 0 ? (
      <div
        className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
        style={floor === 'none' ? undefined : { minHeight: floor }}
      >
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-[12px] bg-chip text-chip-fg"
        >
          <FunnelIcon width={20} height={20} />
        </span>
        <span className="text-[15.5px] font-extrabold text-ink-strong">{t.noMatchTitle}</span>
        <span className="max-w-[46ch] text-[13.5px] leading-relaxed text-ink-soft">
          {t.noMatchBody}
        </span>
        <ul className="flex max-w-[44rem] flex-wrap justify-center gap-1.5">
          {chipSpecs.map((chip) => (
            <li
              key={chip.id}
              title={chip.name}
              className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-control bg-chip py-0.5 pr-1 pl-2 text-[12.5px] font-bold text-chip-fg"
            >
              {chip.prefix && (
                <span className="shrink-0 font-semibold opacity-65">{chip.prefix}</span>
              )}
              <span className="min-w-0 truncate">{chip.text}</span>
              <button
                type="button"
                onClick={chip.remove}
                aria-label={t.removeFilter(chip.name)}
                className="inline-grid size-[18px] shrink-0 place-items-center rounded transition hover:bg-chip-hover"
              >
                <XIcon width={10} height={10} />
              </button>
            </li>
          ))}
        </ul>
        <Button size="sm" onClick={clearAll} className="mt-1">
          {t.clearAll}
        </Button>
      </div>
    ) : undefined

  const panel = hasPanel && (
    <FilterPanel
      title={panelTitle}
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
      layout={docked ? 'fill' : 'card'}
      className={docked ? '' : 'shadow-[0_12px_32px_var(--shadow-raised)]'}
    />
  )

  const canExport = Boolean(onExport && exportFormats && exportFormats.length > 0)

  return (
    <div className={['flex min-w-0 flex-col gap-3', className].filter(Boolean).join(' ')}>
      {showSearch && (
        <div ref={anchorRef} className="relative flex flex-wrap items-start gap-2.5">
          {hasPanel && (
            <Button
              variant={open ? 'primary' : 'secondary'}
              size="lg"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              icon={<FunnelIcon width={15} height={15} />}
            >
              {t.filters}
              {active > 0 && (
                <span className="ml-1 inline-grid min-w-[18px] place-items-center rounded-control bg-on-brand-solid/20 px-1.5 text-[11px] font-extrabold tabular-nums">
                  {active}
                </span>
              )}
            </Button>
          )}

          <Omnibox
            label={searchLabel}
            className="min-w-[min(100%,16rem)] basis-64 grow"
            placeholder={chips.length ? t.placeholderMore : t.placeholder}
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
            quick={({ close }) => (
              <QuickFilters
                rows={buildQuickRows(fields, today)}
                datesLabel={t.dates}
                valuesLabel={t.values}
                customLabel={t.custom}
                hint={t.quickHint}
                onlyLabel={t.only}
                onCustom={hasPanel ? (fieldId) => openCustom(fieldId, close) : undefined}
              />
            )}
          />

          {canExport && (
            <ExportMenu
              formats={exportFormats!}
              selectedCount={selectable ? selected.length : 0}
              totalCount={matching}
              disabled={busy || (matching === 0 && selected.length === 0)}
              onExport={onExport!}
              labels={t}
            />
          )}

          {toolbarEnd}

          {floating && (
            <div
              id={panelId}
              role="region"
              aria-label={panelTitle}
              className="absolute top-[calc(100%+8px)] left-0 z-30 max-h-[min(44rem,calc(100dvh-8rem))] w-[19rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-surface"
            >
              {panel}
            </div>
          )}
        </div>
      )}

      {selectable && selected.length > 0 && (
        <BulkBar
          countLabel={selectionLabel(
            t,
            selected,
            table.rows,
            table.rowId,
            table.rowLabel,
            table.maxSelections,
          )}
          clearLabel={t.clearSelection}
          onClear={() => table.onSelectionChange?.([])}
        >
          {bulkActions}
        </BulkBar>
      )}

      <div
        className={[
          'grid min-w-0 overflow-hidden rounded-surface border border-line bg-panel-solid',
          docked ? 'lg:grid-cols-[17rem_minmax(0,1fr)]' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {docked && (
          <div
            id={panelId}
            role="region"
            aria-label={panelTitle}
            // At `lg` and up the panel is the grid's first column. Its content is taken out of
            // the flow, so it adds no height: the table decides how tall the row is, and the
            // panel fills it and scrolls. Below `lg` it sits above the table at its own height.
            className="relative min-w-0 border-line max-lg:max-h-[28rem] max-lg:overflow-y-auto max-lg:border-b lg:border-r"
          >
            <div className="lg:absolute lg:inset-0">{panel}</div>
          </div>
        )}
        <div className="flex min-w-0 flex-col">
          <DataTableView {...table} noMatch={noMatch} labels={t} />
        </div>
      </div>
    </div>
  )
}
