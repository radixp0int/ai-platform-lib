import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../../primitives/button'
import { PageBand } from './page-band'
import type { PageBandStat } from './types'

const stats: PageBandStat[] = [
  { label: 'Active', value: '9', note: 'Signed in this month', onSelect: fn() },
  {
    label: 'Waiting on an invite',
    value: '3',
    note: 'Oldest sent 23 days ago',
    onSelect: fn(),
  },
  {
    label: 'Suspended',
    value: '2',
    note: 'Nobody can sign in',
    onSelect: fn(),
  },
  {
    label: 'Seats in use',
    value: '1,198 of 1,535',
    note: '78% of paid seats in use',
  },
]

/** Stands in for the page's first card, to show how it lifts over the band. */
function Body() {
  return (
    <section
      aria-label="All tenants"
      className="flex min-h-64 flex-col gap-2 rounded-[14px] bg-panel-solid p-5 shadow-[0_0_0_1px_var(--line),0_18px_40px_-22px_var(--shadow-menu)]"
    >
      <h2 className="text-[15px] font-extrabold text-ink-strong">All tenants</h2>
      <p className="text-[12.5px] text-ink-soft">14 tenants · sorted by name, A to Z</p>
    </section>
  )
}

const meta = {
  title: 'Components/Page band',
  component: PageBand,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Tenants',
    description: 'Every organisation, its plan and its seats.',
    breadcrumbs: [
      { label: 'Overview', href: '#overview' },
      { label: 'Govern' },
      { label: 'Tenant Admin', href: '#tenant-admin' },
    ],
    details: { summary: '5 need a look', stats },
    actions: (
      <>
        <Button variant="inverse">Import from CSV</Button>
        <Button variant="inverse-solid">Add a tenant</Button>
      </>
    ),
    children: <Body />,
  },
} satisfies Meta<typeof PageBand>
export default meta
type Story = StoryObj<typeof meta>

/** The band as Finals 2.0 draws it: trail, title, a line with the Details link, actions on the right. */
export const Default: Story = {}

/** Details open: the strip of figures under the title. A figure with `onSelect` is a button. */
export const DetailsOpen: Story = {
  args: { details: { summary: '5 need a look', stats, defaultOpen: true } },
}

/** With nothing waiting on anyone, the link is just "Show details". */
export const NothingNeedsAnyone: Story = {
  args: { details: { stats } },
}

/** A plain band: a title and a line, no trail, no actions, no details. */
export const TitleOnly: Story = {
  args: {
    title: 'Chat history',
    description: '24 conversations · 2 pinned · most recent first',
    breadcrumbs: undefined,
    details: undefined,
    actions: <Button variant="inverse-solid">New chat</Button>,
  },
}

/** In dark mode the band is a dark panel; the white primary and the amber count read the same. */
export const Dark: Story = {
  args: { details: { summary: '5 need a look', stats, defaultOpen: true } },
  globals: { mode: 'dark' },
}
