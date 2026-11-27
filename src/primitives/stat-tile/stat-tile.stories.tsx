import type { Meta, StoryObj } from '@storybook/react-vite'
import { Link } from '../link'
import { StatTile } from './stat-tile'
const meta = {
  title: 'Primitives/Stat tile',
  component: StatTile,
  tags: ['autodocs'],
} satisfies Meta<typeof StatTile>
export default meta
type Story = StoryObj<typeof meta>
const tile = 'flex flex-col rounded-xl border border-line bg-panel-solid px-5 py-4'
export const Default: Story = {
  args: {
    value: 3,
    label: 'Runs in progress',
    className: 'flex flex-col rounded-xl border border-line bg-panel-solid px-5 py-4',
  },
}

/** Three across, as at the top of a list page. */
export const Row: Story = {
  args: { value: 3, label: 'Runs in progress' },
  render: () => (
    <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
      <StatTile className={tile} value={3} label="Runs in progress" />
      <StatTile className={tile} value={2} label="Waiting on an approval" />
      <StatTile className={tile} value={1} label="Running without a person" />
    </div>
  ),
}

/** The count that matters most on a page, set larger and beside its label. */
export const Headline: Story = {
  args: {
    value: 2,
    label: 'approvals across Workflows',
    className: 'flex items-baseline gap-2.5',
    valueClassName: 'text-[40px] leading-none font-normal text-ink-strong tabular-nums',
    labelClassName: 'text-sm text-ink-soft',
  },
}

/** Zero is a number worth showing: it says the list was checked and is empty. */
export const Zero: Story = { args: { value: 0, label: 'Waiting on an approval', className: tile } }

/** Small, for a figure inside a card rather than a tile of its own. */
export const Compact: Story = {
  args: {
    value: '1.4s',
    label: 'Median response',
    className: 'flex flex-col-reverse',
    valueClassName: 'text-sm font-bold text-ink-strong tabular-nums',
    labelClassName: 'text-[11px] text-ink-soft',
  },
}

// Fourteen days, oldest first.
const questions = [
  1180, 1240, 1210, 1302, 1288, 1350, 1190, 1225, 1310, 1342, 1398, 1375, 1420, 1466,
]
const groundedness = [
  91.6, 91.9, 92.1, 91.8, 92.0, 92.3, 92.2, 91.9, 92.1, 92.4, 92.2, 92.5, 92.3, 92.4,
]
const helpful = [86.1, 86.4, 86.0, 86.3, 86.2, 86.5, 86.2, 86.3, 86.4, 86.1, 86.3, 86.2, 86.4, 86.3]
const errors = [31, 28, 33, 30, 35, 34, 38, 36, 40, 37, 42, 41, 44, 47]

const grid4 = 'grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1'
const grid6 = 'grid grid-cols-6 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-1'

function LargeTiles() {
  return (
    <section className={grid4} aria-label="Overview">
      <StatTile
        size="large"
        label="Questions asked"
        value="18,204"
        change={{ direction: 'up', text: '6%' }}
        sparkline={questions}
      />
      <StatTile
        size="large"
        label="Groundedness"
        value="92.4"
        unit="%"
        change={{ direction: 'up', text: '0.3 pts' }}
        sparkline={groundedness}
        footer={<Link href="#evaluation-scores">Evaluation scores ↓</Link>}
      />
      <StatTile
        size="large"
        label="Rated helpful"
        value="86.3"
        unit="%"
        change={{ text: 'No change' }}
        sparkline={helpful}
        footer={<Link href="#user-feedback">User feedback ↓</Link>}
      />
      <StatTile
        size="large"
        label="Responses with errors"
        value="47"
        change={{ direction: 'up', text: '14%', upIsGood: false }}
        sparkline={errors}
        footer={<Link href="#errors">Errors in responses ↓</Link>}
      />
    </section>
  )
}

function SmallTiles() {
  return (
    <section className={grid6} aria-label="More numbers">
      <StatTile
        size="small"
        label="Active users"
        value="371"
        unit="of 500"
        change={{ direction: 'up', text: '24 people' }}
      />
      <StatTile
        size="small"
        label="Conversations"
        value="6,940"
        change={{ direction: 'up', text: '4%' }}
      />
      <StatTile
        size="small"
        label="Questions per person"
        value="49"
        change={{ text: '371 people' }}
      />
      <StatTile
        size="small"
        label="Median response"
        value="1.4"
        unit="s"
        change={{ direction: 'down', text: '0.1 s', upIsGood: false }}
      />
      <StatTile
        size="small"
        label="Flagged questions"
        value="112"
        change={{ direction: 'up', text: '9%', upIsGood: false }}
      />
      <StatTile size="small" label="Sent to a person" value="83" change={{ text: '0.5%' }} />
    </section>
  )
}

/**
 * The headline row of an Insights page: label, value with its unit, the change
 * since the last period, the last 14 days as a sparkline, and a link down to
 * the section behind the figure.
 */
export const Large: Story = {
  args: { value: '92.4', label: 'Groundedness' },
  render: () => <LargeTiles />,
}

/** The denser row under it: label, value and the change line, no sparkline. */
export const Small: Story = {
  args: { value: '371', label: 'Active users' },
  render: () => <SmallTiles />,
}

/**
 * The change line is coloured by whether the move is good news, not by its
 * sign. Errors and wait times are better going down, so their tiles say
 * `upIsGood: false`.
 */
export const Changes: Story = {
  args: { value: '92.4', label: 'Groundedness' },
  render: () => (
    <div className={grid4}>
      <StatTile
        size="small"
        label="Groundedness"
        value="92.4"
        unit="%"
        change={{ direction: 'up', text: '0.3 pts' }}
      />
      <StatTile
        size="small"
        label="Rated helpful"
        value="85.9"
        unit="%"
        change={{ direction: 'down', text: '0.4 pts' }}
      />
      <StatTile
        size="small"
        label="Responses with errors"
        value="47"
        change={{ direction: 'up', text: '14%', upIsGood: false }}
      />
      <StatTile
        size="small"
        label="Median response"
        value="1.4"
        unit="s"
        change={{ direction: 'down', text: '0.1 s', upIsGood: false }}
      />
      <StatTile size="small" label="Conversations" value="6,940" change={{ text: 'No change' }} />
    </div>
  ),
}

/** A large tile without a sparkline or a footer: the card just ends sooner. */
export const LargeWithoutSparkline: Story = {
  args: {
    size: 'large',
    label: 'Groundedness',
    value: '92.4',
    unit: '%',
    change: { direction: 'up', text: '0.3 pts' },
    className: 'max-w-72',
  },
}

/** One large tile with everything, to try the props in the controls. */
export const Playground: Story = {
  args: {
    size: 'large',
    label: 'Responses with errors',
    value: '47',
    change: { direction: 'up', text: '14%', upIsGood: false },
    sparkline: errors,
    footer: <Link href="#errors">Errors in responses ↓</Link>,
    className: 'max-w-72',
  },
}

/** Both rows in dark mode: the sparkline takes the dark accent, the changes their dark tones. */
export const Dark: Story = {
  args: { value: '92.4', label: 'Groundedness' },
  globals: { mode: 'dark' },
  render: () => (
    <div className="flex flex-col gap-4">
      <LargeTiles />
      <SmallTiles />
    </div>
  ),
}
