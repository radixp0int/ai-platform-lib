import { Avatar } from '../../../primitives/avatar'
import { Link } from '../../../primitives/link'
import type { ProfileCardProps } from '../types'

/**
 * Who is signed in, at the top of their settings: avatar, name, an optional
 * plan pill, the email, and a link out to wherever the account is managed.
 *
 * Read-only on purpose. Account details belong to the identity provider, and
 * a form here that could not save would be worse than plain text.
 */
export function ProfileCard({
  name,
  email,
  initials,
  plan,
  manageHref,
  manageLabel = 'Manage account',
}: ProfileCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-surface bg-tint/4 p-3.5 ring-1 ring-line">
      <Avatar variant="text" text={initials} size={42} tone="brand" aria-hidden />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-bold text-ink-strong">{name}</span>
          {plan && (
            <span className="inline-flex h-5 shrink-0 items-center rounded-[5px] bg-accent/10 px-1.5 text-[11px] font-bold text-accent-fg">
              {plan}
            </span>
          )}
        </div>
        <div className="mt-1 truncate text-[12.5px] text-ink-soft">{email}</div>
      </div>
      {manageHref && (
        <Link href={manageHref} className="shrink-0 text-[12.5px]">
          {manageLabel} ›
        </Link>
      )}
    </div>
  )
}
