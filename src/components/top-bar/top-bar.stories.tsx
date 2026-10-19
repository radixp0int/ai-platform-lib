import type { Meta, StoryObj } from '@storybook/react-vite'
import { BellIcon, SearchIcon, SideMenuIcon } from '../../primitives/icons'
import { TopBar } from './top-bar'
import { TopBarButton } from './top-bar-button'
const meta = {
  title: 'Components/Top bar',
  component: TopBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    appName: 'Acme',
    homeHref: '#home',
    leading: (
      <TopBarButton aria-label="Toggle menu">
        <SideMenuIcon />
      </TopBarButton>
    ),
    trailing: (
      <div className="flex gap-1">
        <TopBarButton aria-label="Search">
          <SearchIcon />
        </TopBarButton>
        <TopBarButton aria-label="Notifications">
          <BellIcon />
        </TopBarButton>
      </div>
    ),
  },
} satisfies Meta<typeof TopBar>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}

/** With something in the middle slot: here, a row of tabs. */
export const WithTabs: Story = {
  args: {
    children: (
      <nav aria-label="Pinned pages" className="flex gap-0.5 self-stretch">
        <a
          href="#tasks"
          aria-current="page"
          className="flex items-center px-3.5 text-sm font-bold text-white shadow-[inset_0_-3px_0_#fff]"
        >
          Tasks
        </a>
        <a href="#runs" className="flex items-center px-3.5 text-sm font-bold text-brand-200">
          Runs
        </a>
      </nav>
    ),
  },
}

/** A focused flow: the toggle becomes a close button, the tabs become a title,
 *  and the right-hand cluster shrinks to what the flow needs. */
export const FocusedFlow: Story = {
  args: {
    leading: (
      <TopBarButton aria-label="Close and discard this source">
        <span aria-hidden className="text-xl leading-none">
          ×
        </span>
      </TopBarButton>
    ),
    children: (
      <span className="truncate px-2 text-sm font-semibold text-brand-100">
        Ingestion › Add a source
      </span>
    ),
    trailing: (
      <span className="flex h-11 items-center rounded-control border border-white/20 px-3.5 text-sm font-bold">
        Alderfinch Treasury
      </span>
    ),
  },
}

/** A control whose menu is open is drawn pressed. */
export const WithAnActiveControl: Story = {
  args: {
    leading: (
      <TopBarButton aria-label="Close menu" aria-expanded active>
        <SideMenuIcon />
      </TopBarButton>
    ),
  },
}
