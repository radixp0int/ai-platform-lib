import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { fn } from 'storybook/test'
import { INITIAL_TENANTS, describeSpaces } from '../../fixtures/platform/tenants'
import { TenantSwitcher } from './tenant-switcher'
const tenants = INITIAL_TENANTS.map((t) => ({ ...t, description: describeSpaces(t.spaces) }))
const meta = {
  title: 'Components/Tenant switcher',
  component: TenantSwitcher,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex h-15 items-center bg-brand-900 px-3 dark:bg-panel-solid">
        <Story />
      </div>
    ),
  ],
  args: { tenants: tenants.slice(0, 2), currentId: tenants[0].id, onSelect: fn() },
} satisfies Meta<typeof TenantSwitcher>
export default meta
type Story = StoryObj<typeof meta>
export const TwoTenants: Story = {}
export const PlatformAdmin: Story = {
  args: { onViewAll: fn(), onEditTenant: fn() },
  render: function Admin(args) {
    const [count, setCount] = useState(3)
    const [id, setId] = useState(tenants[0].id)
    return (
      <TenantSwitcher
        {...args}
        tenants={tenants.slice(0, count)}
        currentId={id}
        onSelect={setId}
        remaining={tenants.length - count}
        pageSize={5}
        onLoadMore={() => setCount((n) => Math.min(tenants.length, n + 5))}
      />
    )
  },
}
export const ReadOnly: Story = { args: { readOnly: true } }
