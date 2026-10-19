import { PageHeader } from '../../../components/page-header'
import { ButtonLink } from '../../../primitives/button'
import { EmptyState } from '../../../primitives/empty-state'
import { IngestionIcon } from '../../../primitives/icons'
import { usePlatform } from '../platform-context'
import { pageColumn } from './pageStyles'

type PlaceholderPageProps = {
  title: string
  /** Offers the "Add a source" wizard — the one Ingestion screen that exists. */
  addSource?: boolean
}

/**
 * A space that is in the menu and the routes but has no screens designed yet.
 * It says so plainly rather than inventing a dashboard, so the navigation can
 * be walked end to end without anyone mistaking filler for a decision.
 */
export function PlaceholderPage({ title, addSource = false }: PlaceholderPageProps) {
  const { tenant, base } = usePlatform()
  return (
    <div className={`${pageColumn} max-w-[67.5rem] gap-4`}>
      <PageHeader
        title={<>{title}</>}
        className="flex flex-col gap-1"
        descriptionClassName="text-sm text-ink-soft"
        description={<>{tenant.name}</>}
      />
      <EmptyState className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-line px-6 py-8">
        <p className="max-w-prose text-[15px] leading-relaxed text-ink">
          This page has not been designed yet. It is here so the menu, the pinned tabs and the
          routes can be tried with every space a tenant can have.
        </p>
        {addSource && (
          <ButtonLink href={`${base}/ingestion/new`} variant="primary" size="lg">
            <IngestionIcon width={16} height={16} />
            Add a source
          </ButtonLink>
        )}
      </EmptyState>
    </div>
  )
}
