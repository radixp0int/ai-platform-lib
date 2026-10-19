import { EmptyState } from '../../../primitives/empty-state'
import { Orb } from '../../../primitives/orb'
import { AmbientGlow } from '../../../primitives/ambient-glow'
import { Link } from '../../../primitives/link'

/** Shown instead of the skeleton when the run is never going to arrive. */
export function RunUnavailable({ message }: { message: string }) {
  return (
    <div className="relative flex h-dvh items-center justify-center overflow-hidden bg-canvas p-6">
      <AmbientGlow />
      <EmptyState className="glass flex max-w-md flex-col items-center gap-3 rounded-surface px-8 py-10 text-center">
        <Orb className="orb block size-10 rounded-full opacity-50" aria-hidden />
        <h1 className="text-base font-bold tracking-tight text-ink-strong">No run to show</h1>
        <p className="text-[13px] leading-[21px] text-pretty text-ink-soft">{message}</p>
        <Link
          variant="plain"
          href="/workflow-demo"
          className="mt-1 text-[13px] font-semibold text-accent-fg underline-offset-2 hover:underline"
        >
          Open the hard-coded run instead
        </Link>
      </EmptyState>
    </div>
  )
}
