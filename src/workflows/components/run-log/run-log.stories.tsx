import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import type { LogEntry } from '../../engine'
import { RunLog } from '../run-log'

const LOG: LogEntry[] = [
  [0, 'info', 'trigger', 'Loan portal', 'Application received · 6 documents'],
  [4_000, 'info', 'intake', 'Intake agent', 'Classified application, reading documents'],
  [48_500, 'info', 'bureau', 'credit_bureau.pull', 'Business score 742, no derogatories'],
  [120_500, 'warn', 'spread', 'Spread financials', 'Revenue down 18% year over year'],
  [207_500, 'warn', 'policy', 'Policy check', '1 exception: guarantor score 672 under 680'],
  [212_000, 'error', 'kyc', 'kyc.verify', 'Beneficial owner #3 did not match the registry'],
  [260_000, 'human', 'approve', 'Dana W.', 'Requested changes: re-run KYC on owner #3'],
].map(([elapsedMs, level, stepId, source, text], i) => ({
  id: `run-4821-${i}`,
  at: Date.parse('2026-09-28T13:02:00Z') + (elapsedMs as number),
  elapsedMs: elapsedMs as number,
  level: level as LogEntry['level'],
  stepId: stepId as string,
  source: source as string,
  text: text as string,
}))

const STEP_TITLES = new Map([
  ['trigger', 'Application received'],
  ['intake', 'Intake'],
  ['bureau', 'Credit bureau pull'],
  ['spread', 'Spread financials'],
  ['policy', 'Policy check'],
  ['kyc', 'KYC verification'],
  ['approve', 'Credit approval'],
])

const meta = { title: 'Workflows/Components/Run log' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
/** Every level: info, warn, error, and a person's line standing out by weight. */
export const Log: Story = {
  render: () => (
    <div className="flex flex-col overflow-hidden rounded-surface border border-line bg-panel-solid">
      <RunLog
        entries={LOG}
        trimmed={0}
        open
        stepTitles={STEP_TITLES}
        onSelectStep={fn()}
        onClose={fn()}
      />
    </div>
  ),
}

/** The cap has dropped older lines, and the log admits to it. */
export const LogTrimmed: Story = {
  render: () => (
    <div className="flex flex-col overflow-hidden rounded-surface border border-line bg-panel-solid">
      <RunLog
        entries={LOG}
        trimmed={137}
        open
        stepTitles={STEP_TITLES}
        onSelectStep={fn()}
        onClose={fn()}
      />
    </div>
  ),
}

/** Before anything has happened the log says so, rather than showing a blank drawer. */
export const Empty: Story = {
  render: () => (
    <div className="flex flex-col overflow-hidden rounded-surface border border-line bg-panel-solid">
      <RunLog
        entries={[]}
        trimmed={0}
        open
        stepTitles={STEP_TITLES}
        onSelectStep={fn()}
        onClose={fn()}
      />
    </div>
  ),
}

/** Lines that name no step on the canvas are plain text, not buttons. */
export const UnattributedLines: Story = {
  render: () => (
    <div className="flex flex-col overflow-hidden rounded-surface border border-line bg-panel-solid">
      <RunLog
        entries={LOG}
        trimmed={0}
        open
        stepTitles={new Map()}
        onSelectStep={fn()}
        onClose={fn()}
      />
    </div>
  ),
}
