import type { Decision } from '../../../engine/wireProtocol'
import type { DecisionButtonProps } from './types'
/* The three things a gate can be answered with. A gate offers a subset — an
   incident is yes or no, a credit memo can also be sent back — so each button is
   declared once here rather than written out three times at the call site.
   Weight lives per-decision: two Tailwind font utilities on one element resolve
   by stylesheet order, not by the order they appear in the string. */
const BUTTON_BASE = 'h-9 rounded-control text-[13px] transition disabled:opacity-50'

const DECISION_BUTTON: Record<Decision, { label: string; className: string }> = {
  declined: { label: 'Decline', className: 'px-2.5 font-semibold text-danger-fg hover:bg-tint/8' },
  changes: {
    label: 'Request changes',
    className: 'border border-line bg-panel-solid px-3.5 font-semibold text-ink hover:bg-tint/6',
  },
  approved: {
    label: 'Approve',
    className: 'bg-accent px-4.5 font-bold text-on-accent hover:bg-accent-hover',
  },
}

export function DecisionButton({ decision, busy, onDecide }: DecisionButtonProps) {
  const { label, className } = DECISION_BUTTON[decision]
  return (
    <button
      type="button"
      onClick={() => onDecide(decision)}
      disabled={busy}
      className={`${BUTTON_BASE} ${className}`}
    >
      {label}
    </button>
  )
}
