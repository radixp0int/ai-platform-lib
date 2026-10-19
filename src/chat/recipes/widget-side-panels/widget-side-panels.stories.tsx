import type { Meta, StoryObj } from '@storybook/react-vite'
import { DemoFacetFiltersPanel, DemoPersonaPanel } from '../widget-on-host-page/widget/sidePanels'
const meta = {
  title: 'Chat/Recipes/Widget side panels',
  decorators: [
    (Story) => (
      <div className="h-[680px] w-80 overflow-y-auto rounded-surface border border-line bg-panel-solid p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const Filters: Story = { render: () => <DemoFacetFiltersPanel onDone={() => {}} /> }
export const Persona: Story = { render: () => <DemoPersonaPanel /> }
