import type { Meta, StoryObj } from '@storybook/react-vite'
import { COMMERCIAL_LOAN_SPEC } from '../../fixtures/commercialLoanSpec'
import type { WorkflowStepSpec } from '../workflow-spec'
import { WorkflowStepCard } from './workflow-step-card'

const all = COMMERCIAL_LOAN_SPEC.stages.flatMap((stage) => stage.columns.flat())
const step = (id: string): WorkflowStepSpec => all.find((s) => s.id === id)!
const titleOf = (id: string) => all.find((s) => s.id === id)?.title

const meta = {
  title: 'Workflows/Components/Workflow step card',
  component: WorkflowStepCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[24rem] max-w-full">
        <Story />
      </div>
    ),
  ],
  args: { step: step('memo'), titleOf },
  parameters: {
    docs: {
      description: {
        component:
          'One step as the workflow defines it: what it does, the typed fields it reads and hands on with where each input comes from, and what is particular to its kind. A definition, so there are no values and no status.',
      },
    },
  },
} satisfies Meta<typeof WorkflowStepCard>
export default meta
type Story = StoryObj<typeof meta>

/** An agent: it reads three earlier outputs and produces a memo and a recommendation. */
export const Agent: Story = {}

/** A system call, named in the mono face, with what happens if it fails. */
export const SystemCall: Story = { args: { step: step('bureau') } }

/** An approval: who decides, how long they have, and where a request for changes goes. */
export const Approval: Story = { args: { step: step('approve') } }

/** A step that only runs on some runs is dashed and says so. */
export const Sometimes: Story = { args: { step: step('senior') } }

/** The first step reads from the run's own inputs. */
export const Trigger: Story = { args: { step: step('trigger') } }

/** Without a lookup, an input names the step id it comes from. */
export const WithoutTitles: Story = { args: { titleOf: undefined } }
