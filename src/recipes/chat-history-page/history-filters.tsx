import { DateRangeField, type DateRange } from '../../primitives/date-field'
import { SearchField } from '../../primitives/search-field'
import { Tabs, TabsList, TabsTrigger } from '../../primitives/tabs'
import { PERIODS, type Period } from './historyPeriod'

export type HistoryFiltersProps = {
  /** What is in the search box, sent or not. */
  draft: string
  onDraftChange: (draft: string) => void
  /** Enter in the search box: send what is typed without waiting. */
  onSubmit: () => void
  period: Period
  onPeriodChange: (period: Period) => void
  /** The custom range, kept while a preset is selected so it is there on the way back. */
  custom: DateRange
  onCustomChange: (range: DateRange) => void
  /** Today as `YYYY-MM-DD`: the last day the calendar offers. */
  today: string
}

/**
 * Search on top, then when a conversation was last updated: three presets on
 * a segmented tab list, and a calendar that only appears for the fourth.
 * Stateless — the page owns every value, because every one is in its request.
 */
export function HistoryFilters({
  draft,
  onDraftChange,
  onSubmit,
  period,
  onPeriodChange,
  custom,
  onCustomChange,
  today,
}: HistoryFiltersProps) {
  return (
    <>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <SearchField
          label="Search conversations"
          type="search"
          placeholder="Search conversations by title"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          containerClassName="w-full"
        />
      </form>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Tabs
          value={period}
          onValueChange={(value) => onPeriodChange((value ?? 'any') as Period)}
          className="max-w-full"
        >
          {/* Scrolls sideways on a phone rather than widening the page. */}
          <TabsList
            variant="segmented"
            aria-label="Last updated"
            className="max-w-full overflow-x-auto"
          >
            {PERIODS.map((option) => (
              // The tabs filter one list; there is no panel each to point at.
              <TabsTrigger key={option.value} value={option.value} controls={false}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {period === 'custom' && (
          <DateRangeField
            label="Updated between"
            showLabel={false}
            placeholder="Choose the dates"
            className="w-80 max-w-full max-sm:w-full"
            value={custom}
            max={today}
            onChange={onCustomChange}
          />
        )}
      </div>
    </>
  )
}
