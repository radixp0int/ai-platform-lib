// A step's inputs and outputs written as one line each way, so a fixture's I/O
// reads as prose the way workflowSummaries.ts reads its flows:
//
//   inputs   'credit_memo:file<memo; amount:money<run; spread:object<spread.table'
//   outputs  'route:choice=Analyst approval; exceptions:list=1 exception'
//
// An input is `name:type<source`. The source is a step id, and the output it reads
// has the input's name unless written `step.output`; `run` reads the run input of
// that name. An output is `name:type`, then `=value` for what the step produces
// when it finishes.
import type { IoType, StepIO } from '../engine/wireProtocol'

const parts = (line: string) =>
  line
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)

const nameType = (text: string): [string, IoType] => {
  const [name, type] = text.split(':')
  return [name.trim(), type.trim() as IoType]
}

export function io(inputs: string, outputs = ''): StepIO {
  return {
    inputs: parts(inputs).map((p) => {
      const [head, source] = p.split('<')
      const [name, type] = nameType(head)
      if (source === 'run') return { name, type, from: { run: name } }
      const [step, output = name] = source.split('.')
      return { name, type, from: { step, output } }
    }),
    outputs: parts(outputs).map((p) => {
      const at = p.indexOf('=')
      const [name, type] = nameType(at < 0 ? p : p.slice(0, at))
      return at < 0 ? { name, type } : { name, type, value: p.slice(at + 1).trim() }
    }),
  }
}

/** The people a `person` input can name in the fixtures. */
export const PEOPLE = [
  'Kofi Adeyemi',
  'Priya Nair',
  'Owen Blake',
  'Dana Whitfield',
  'Marcus Lee',
  'Rachel Okafor',
  'Sam Raines',
  'Ana Duarte',
]
