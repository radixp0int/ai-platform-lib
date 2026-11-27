import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { Composer } from '../../chat/components/composer'
import { Button } from '../button'
import { Alert } from './alert'
import type { AlertTone } from './types'

const meta = {
  title: 'Primitives/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: {
    tone: 'info',
    variant: 'panel',
    title: 'References are still loading',
    children: 'You can continue reading while the source documents are prepared.',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['panel', 'bar'] },
    children: { control: 'text' },
    title: { control: 'text' },
    icon: { control: false },
    details: { control: false },
    action: { control: false },
    secondaryAction: { control: false },
    bordered: { table: { disable: true } },
  },
  decorators: [(Story) => <div className="max-w-[42rem]">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'A status message on a quiet panel. The tone lives in the tile around the glyph and in the action — a button in the tone\'s own colour — so the one thing to do next is the one thing in colour. Every tone pairs colour with a distinct glyph and a visible title. Lists and native `<details>` carry richer messages; `layout="inline"` makes a one-line page banner. `variant="bar"` squares it into a live-status strip — a 3px tone edge on the left, the glyph plain and inline, a hairline border and a faint shadow — for a notice docked to a page or composer frame; content cards keep the rounded `panel`. For a one-line status band inside a message flow, use `Notice`.',
      },
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <Alert tone="success" title="Workspace settings saved">
        Your changes are available to everyone on the team.
      </Alert>
      <Alert tone="warning" title="Review before publishing">
        Two answers contain sources that are more than a year old.
      </Alert>
      <Alert tone="error" title="The import could not be completed">
        Correct the source data and try again.
      </Alert>
      <Alert tone="info" title="References are still loading">
        You can continue reading while the source documents are prepared.
      </Alert>
    </div>
  ),
}

/** Each tone's action takes its colour: Retry in red, Review in amber. */
export const Actions: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <Alert
        tone="warning"
        title="Two answers cite sources older than a year"
        action={{ label: 'Review sources', onClick: fn() }}
        secondaryAction={{ label: 'Publish anyway', onClick: fn() }}
      >
        Readers see the source date, but may not check it.
      </Alert>
      <Alert
        tone="info"
        title="No tenants match these filters"
        action={{ label: 'Clear filters', onClick: fn() }}
      >
        Try a wider date range.
      </Alert>
      <Alert
        tone="success"
        title="Invitations sent"
        action={{ label: 'View members', onClick: fn() }}
      >
        42 people can sign in from today.
      </Alert>
    </div>
  ),
}

/** `layout="inline"`: a page-level banner on one line, wrapping when it runs out of room. */
export const InlineBanner: Story = {
  decorators: [(Story) => <div className="w-[56rem] max-w-full">{Story()}</div>],
  args: {
    tone: 'error',
    layout: 'inline',
    title: 'Invoice INV-2291 is 14 days overdue.',
    children: 'Seats lock on Oct 14, 2026 unless it is paid.',
    action: { label: 'Pay invoice', onClick: fn() },
    secondaryAction: { label: 'Contact billing', onClick: fn() },
  },
}

export const WithItems: Story = {
  args: {
    tone: 'error',
    title: 'Three fields need attention',
    children: undefined,
    secondaryAction: { label: 'Go to the first field', onClick: fn() },
    items: [
      'Workspace name is required.',
      'API endpoint must use HTTPS.',
      'At least one knowledge source must be selected.',
    ],
  },
}

export const ActionAndDetails: Story = {
  args: {
    tone: 'error',
    title: 'The API rejected this request',
    children: 'The service returned a validation error. Technical details are available below.',
    action: { label: 'Try again', onClick: fn() },
    detailsLabel: 'Show API response',
    details: (
      <pre className="overflow-x-auto rounded-control border border-line bg-code-block p-3 font-mono text-[11.5px] leading-relaxed text-ink">
        {JSON.stringify({ status: 422, code: 'invalid_source', requestId: 'req_7f91a2' }, null, 2)}
      </pre>
    ),
  },
}

export const NoIcon: Story = {
  args: { icon: false, title: 'A plain notice with no glyph' },
}

export const Dismissible: Story = {
  render: function DismissibleStory(args) {
    const [visible, setVisible] = useState(true)
    return visible ? (
      <Alert
        {...args}
        title="Citation shortcuts are available"
        onDismiss={() => setVisible(false)}
        dismissLabel="Dismiss citation shortcut notice"
      >
        Select any numbered citation to open its original source.
      </Alert>
    ) : (
      <Button size="sm" onClick={() => setVisible(true)}>
        Reset dismissed alert
      </Button>
    )
  },
}

export const Retry: Story = {
  args: {
    tone: 'error',
    title: 'The source could not be added',
    children: 'Check that the URL is public, then try again.',
    action: { label: 'Try again', onClick: fn() },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('alert')).toHaveTextContent('The source could not be added')
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
    await expect(args.action!.onClick).toHaveBeenCalledOnce()
  },
}

const toneSamples: { tone: AlertTone; title: string; body: string }[] = [
  {
    tone: 'warning',
    title: 'Acme can make mistakes.',
    body: 'Check the sources before you act on an answer.',
  },
  {
    tone: 'info',
    title: 'Live run',
    body: 'Step 3 of 5 is retrieving documents from the knowledge base.',
  },
  {
    tone: 'success',
    title: 'Run complete',
    body: 'All five steps finished and the summary is ready.',
  },
  {
    tone: 'error',
    title: 'The run stopped at step 4',
    body: 'The search service timed out. Retry to pick up where it left off.',
  },
]

function LooksGrid() {
  return (
    <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {(['panel', 'bar'] as const).map((variant) => (
        <div key={variant} className="flex min-w-0 flex-col gap-2.5">
          <p className="m-0 font-mono text-[11px] text-ink-soft">variant="{variant}"</p>
          {toneSamples.map(({ tone, title, body }) => (
            <Alert
              key={tone}
              variant={variant}
              tone={tone}
              title={title}
              onDismiss={fn()}
              secondaryAction={tone === 'error' ? { label: 'Retry', onClick: fn() } : undefined}
            >
              {body}
            </Alert>
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Every tone in both looks. `bar` is square with a 3px tone edge and a plain
 * glyph; the lead, copy, action and dismiss match the panel.
 */
export const Looks: Story = {
  decorators: [(Story) => <div className="w-[56rem] max-w-full">{Story()}</div>],
  globals: { mode: 'light' },
  render: () => <LooksGrid />,
}

/** The same grid in dark: edge and glyph take the dark tone values (warning is a lighter amber). */
export const LooksDark: Story = {
  decorators: [(Story) => <div className="w-[56rem] max-w-full">{Story()}</div>],
  globals: { mode: 'dark' },
  render: () => <LooksGrid />,
}

function DockedNotice() {
  const [visible, setVisible] = useState(true)
  return (
    <div className="flex flex-col pt-40">
      {visible && (
        <Alert
          variant="bar"
          tone="warning"
          title="Acme can make mistakes."
          secondaryAction={{ label: 'How answers are sourced', onClick: fn() }}
          onDismiss={() => setVisible(false)}
          dismissLabel="Dismiss accuracy notice"
          className="mb-2"
        >
          Check the sources before you act on an answer.
        </Alert>
      )}
      <Composer docked onSubmit={fn()} />
    </div>
  )
}

/** `variant="bar"` docked above the chat composer: the live notice on a square strip. */
export const DockedAboveComposer: Story = {
  globals: { mode: 'light' },
  render: () => <DockedNotice />,
}

export const DockedAboveComposerDark: Story = {
  globals: { mode: 'dark' },
  render: () => <DockedNotice />,
}
