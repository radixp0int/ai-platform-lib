import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { COMMERCIAL_LOAN_SPEC } from '../../fixtures/commercialLoanSpec'
import { WorkflowVersions } from './workflow-versions'

const spec = COMMERCIAL_LOAN_SPEC

const meta = {
  title: 'Workflows/Components/Workflow versions',
  component: WorkflowVersions,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    versions: spec.versions,
    nextVersion: spec.nextVersion,
    draftNote: spec.draftNote,
    onStartDraft: fn(),
    onCompare: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'A workflow’s versions, newest first, under the one thing you can do about them: start a draft. A draft never touches the version in use; the note says what publishing means for runs in progress.',
      },
    },
  },
} satisfies Meta<typeof WorkflowVersions>
export default meta
type Story = StoryObj<typeof meta>

/** The version in use is marked, and each older one can be compared with it. */
export const Default: Story = {}

/** A workflow with one version has nothing to compare. */
export const FirstVersion: Story = {
  args: { versions: spec.versions.slice(0, 1), nextVersion: 'v2' },
}

/** A long change description wraps beside its Compare button. */
export const LongChange: Story = {
  args: {
    versions: [
      spec.versions[0],
      {
        id: 'v11',
        change:
          'Spreads three years of returns, not two, and flags any year where depreciation add-backs move the coverage ratio by more than a tenth',
        meta: '3 Sep · Marcus Lee · 17 runs',
      },
    ],
  },
}
