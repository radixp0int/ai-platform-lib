import { DecisionButton } from './decision-button'
import type { DecisionFormProps } from './types'
// The pieces a step is made of, shared by the two things that draw one: the
// 400px StepInspector and the full-width StepDetail behind its expand button.
//
// They exist as one copy for the same reason Panel does — the two views
// cannot be allowed to drift, and the decision form least of all, since that is
// the part that actually does something. What differs between the views is
// arrangement, not these blocks: the panel stacks them in one narrow column,
// the page lays them out in two.
import { useState } from 'react'
import type { Decision } from '../../engine/wireProtocol'

/** Answers that move the run forward, in the order they are offered. */
const AFFIRMATIVE = ['changes', 'approved'] as const

/**
 * The note and the answers. The note belongs to the decision in front of you,
 * so callers mount this with `key={step.id}`: the remount clears it, which is
 * one less effect than watching the id and resetting.
 *
 * `id` namespaces the textarea's label, because the panel and the expanded view
 * can both be in the document at once.
 */
export function DecisionForm({ id, decisions, busy, onDecide }: DecisionFormProps) {
  const [note, setNote] = useState('')
  const decide = (decision: Decision) => onDecide(decision, note.trim() || undefined)

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className="sr-only">
        Note for the audit trail
      </label>
      <textarea
        id={id}
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={busy}
        placeholder="Add a note for the audit trail (optional)"
        className="w-full resize-none rounded-control border border-line bg-panel-solid px-3 py-2.5 text-[13px] text-ink-strong outline-none placeholder:text-ink-soft focus-visible:border-accent disabled:opacity-60"
      />
      <div className="flex items-center gap-2.5">
        {/* Decline sits left, the affirmative answers right, with a spacer
            between — so no button has to know which siblings exist. */}
        {decisions.includes('declined') && (
          <DecisionButton decision="declined" busy={busy} onDecide={decide} />
        )}
        <span className="flex-1" />
        {AFFIRMATIVE.filter((d) => decisions.includes(d)).map((d) => (
          <DecisionButton key={d} decision={d} busy={busy} onDecide={decide} />
        ))}
      </div>
    </div>
  )
}
