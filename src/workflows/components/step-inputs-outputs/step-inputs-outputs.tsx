import { SectionLabel } from '../../../primitives/section-label'
import type { IoCell } from '../../engine/io'
import { IoTypePill } from '../io-type-pill'
import type { StepInputsOutputsProps } from './types'
// What a step reads and what it produces, with this run's values. Shared by the
// 400px StepInspector and the full-width StepDetail, like StepDetails.
//
// A value the run has not reached yet is still a row, with its pending note in
// place of the value: the shape of a step's inputs is worth knowing before they
// arrive, and a row that appeared only once ready would shift the panel under
// the reader as the run moves.

function IoList({ label, cells }: { label: string; cells: IoCell[] }) {
  if (cells.length === 0) return null
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>{label}</SectionLabel>
      <ul aria-label={label} className="rounded-surface border border-line px-3.5">
        {cells.map((cell) => (
          <li
            key={cell.name}
            className="flex flex-col gap-0.5 border-b border-line py-2.5 last:border-b-0"
          >
            <span className="flex min-w-0 items-start gap-1.5">
              <span className="truncate font-mono text-[12.5px] leading-5 font-medium text-ink-strong">
                {cell.name}
              </span>
              <IoTypePill type={cell.type} />
              <span
                className={`min-w-0 flex-1 pl-2 text-right text-[13px] leading-5 text-pretty ${
                  cell.ready ? 'font-semibold text-ink-strong' : 'text-ink-soft italic'
                }`}
              >
                {cell.value}
              </span>
            </span>
            {cell.source && (
              <span className="text-xs leading-4 text-ink-soft">From {cell.source}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StepInputsOutputs({ io }: StepInputsOutputsProps) {
  if (io.inputs.length === 0 && io.outputs.length === 0) return null
  return (
    <div className="flex flex-col gap-5">
      <IoList label="Inputs" cells={io.inputs} />
      <IoList label="Outputs" cells={io.outputs} />
    </div>
  )
}
