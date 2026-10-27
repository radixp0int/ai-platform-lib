import type { Meta, StoryObj } from '@storybook/react-vite'
import { RunsHost, type RunsHostProps } from './filter-bar.example'

/** Today's date as the table writes it, so a story can start on a preset without a calendar in sight. */
const day = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const meta = {
  title: 'Components/FilterBar',
  component: RunsHost,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The toolbar above a table: a Filters button, the omnibox, and the panel the button opens. All three read one list of `fields`, so a filter set anywhere is set everywhere. The omnibox shows every set filter as a chip and suggests dates and values as you type. In the default `simple` style it also offers quick picks while it is empty and focused; `advanced` leaves it to typing. The panel floats over the table or docks beside it when pinned. The stories use a table of runs, wide on purpose.',
      },
    },
  },
  args: { filterStyle: 'simple' },
  argTypes: {
    filterStyle: { control: 'inline-radio', options: ['simple', 'advanced'] },
    initial: { control: false },
    initialTerms: { control: false },
  },
} satisfies Meta<RunsHostProps>

export default meta
type Story = StoryObj<typeof meta>

/** Everything adjustable: the style, whether the panel starts open, and whether it starts pinned. */
export const Playground: Story = {}

/** The default. Click the omnibox: a row of picks for every date, and for every filter small enough to be a row. */
export const Simple: Story = {
  args: { initial: { started: { from: day(-29), to: day(0) } } },
}

/** The panel floating over the table. Dates share one section, one row each. */
export const PanelFloating: Story = { args: { defaultOpen: true } }

/** The same panel docked beside the table. The pin survives closing and reopening it. */
export const PanelPinned: Story = { args: { defaultOpen: true, defaultPinned: true } }

/** For typing: the Filters button and an omnibox that suggests search, field narrowings, dates and values as you type. No quick picks. */
export const Advanced: Story = {
  args: {
    filterStyle: 'advanced',
    initial: { started: { from: day(-29), to: day(0) }, status: ['completed'] },
  },
}

/** A dozen filters at once. The chips wrap onto more lines and the field grows. */
export const ManyFilters: Story = {
  args: {
    defaultOpen: true,
    defaultPinned: true,
    initial: {
      status: ['waiting', 'failed'],
      flow: ['Loan review', 'Incident triage', 'KYC refresh'],
      priority: ['High'],
      team: ['Credit risk', 'Site reliability'],
      attention: true,
      started: { from: day(-89), to: day(0) },
      updated: { from: day(-89), to: day(0) },
    },
    initialTerms: [
      { id: 'a', field: null, value: 'a' },
      { id: 'b', field: 'by', value: 'a' },
    ],
  },
}

/** Twelve columns in a card that is narrower than the table. It scrolls sideways; the filters do not move. */
export const ManyColumns: Story = {
  args: { defaultOpen: true, defaultPinned: true },
}

/** Option labels and search terms far longer than their space. Each one gives way without losing its remove button. */
export const LongLabels: Story = {
  args: {
    defaultOpen: true,
    longLabels: true,
    initial: { flow: ['Loan review'], team: ['Credit risk', 'Treasury operations'] },
    initialTerms: [
      {
        id: 'long',
        field: null,
        value: 'a search term that goes on far longer than any field could hold on one line',
      },
    ],
  },
}

/** `showPanel={false}`: no Filters button and no panel. The omnibox is the only way to filter, and its quick picks drop "Custom", which opened the panel. */
export const NoPanel: Story = {
  args: {
    showPanel: false,
    initial: { started: { from: day(-29), to: day(0) } },
  },
}

/** `showHeader={false}`: no search box and no Filters button. The panel is left as a docked rail that is always open, with nothing to close or pin. */
export const NoHeader: Story = {
  args: { showHeader: false, initial: { status: ['completed'] } },
}

/** Both off: only the table. Filters the host holds still apply; nothing on screen shows them. */
export const TableOnly: Story = {
  args: { showHeader: false, showPanel: false, initial: { status: ['completed'] } },
}

/** Twelve columns sorted by type. Duration sorts as numbers, the four dates as dates, the rest as text, and Region has a key but sorting switched off. */
export const SortedColumns: Story = {}
