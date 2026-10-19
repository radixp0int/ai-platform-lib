import {
  DEFAULT_TENANT_ID,
  SPACE_LABEL,
  describeSpaces,
  type SpaceId,
} from '../../../fixtures/platform/tenants'
import { Avatar } from '../../../primitives/avatar'
import { ButtonLink } from '../../../primitives/button'
import { EmptyState } from '../../../primitives/empty-state'
import { Link } from '../../../primitives/link'
import { usePlatform } from '../platform-context'
import { card, textLink } from './pageStyles'

/**
 * What a deep link shows when the tenant in the URL does not have the space
 * the link points at — a shared run opened in a chat-only tenant, say.
 *
 * It names the gap and offers the way through: a tenant the viewer belongs to
 * that does have the space, one click away. The menu never lists the space,
 * so this page is only ever reached by URL.
 */
export function SpaceUnavailablePage({ space }: { space: SpaceId }) {
  const { tenant, tenants, base } = usePlatform()
  const label = SPACE_LABEL[space]
  const others = tenants.filter((item) => item.id !== tenant.id && item.spaces.includes(space))
  const other = others.find((item) => item.id === DEFAULT_TENANT_ID) ?? others[0]

  return (
    <div className="grid min-h-full place-items-center px-6 py-10">
      <EmptyState className={`${card} flex w-full max-w-[35rem] flex-col p-8`}>
        <h1 className="text-2xl leading-tight font-bold tracking-tight text-ink-strong">
          {label} isn't part of {tenant.name}
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink">
          The link you followed opens {label}, and this tenant has{' '}
          {describeSpaces(tenant.spaces) || 'no spaces'} only.
          {other ? ` You do have ${label} in another tenant.` : ''}
        </p>

        {other && (
          <div className="mt-6 flex items-center gap-3 rounded-surface border border-line bg-canvas py-3 pr-3 pl-3.5">
            <Avatar
              variant="text"
              text={other.initials}
              shape="square"
              size={36}
              tone="brand"
              style={{ fontSize: 13 }}
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-control bg-brand-solid text-[13px] font-extrabold text-on-brand-solid"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-ink-strong">{other.name}</span>
              <span className="block truncate text-xs text-ink-soft">
                {describeSpaces(other.spaces)}
              </span>
            </span>
            <ButtonLink href={`/t/${other.id}/${space}`} variant="primary" size="lg">
              Switch and open
            </ButtonLink>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-4">
          <Link variant="plain" href={`${base}/home`} className={`${textLink} min-h-11 text-sm`}>
            Stay in {tenant.name}
          </Link>
          <span className="flex-1" />
          <span className="text-[13px] text-ink-soft">
            A tenant admin decides which spaces a tenant has.
          </span>
        </div>
      </EmptyState>
    </div>
  )
}
