import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { answerMarkdown, highlights, mermaidSource, sources } from '../../fixtures/chat'
import { Markdown } from './markdown'
import type { MarkdownProps } from './types'

const GFM = `### Everything GFM

A paragraph with **bold**, _emphasis_, \`inline code\` and a [link](https://example.com).

- Bullets
  - nest
- [x] and tasks
- [ ] carry state

> A quotation, for the policy language that must be quoted rather than paraphrased.

\`\`\`json
{ "available": 4820000, "currency": "USD" }
\`\`\`

| Account | Balance |
| :--- | ---: |
| Operating | $3.10M |
| Payroll | $1.72M |

A marker with no matching source passes through untouched: [sic].`

const meta = {
  title: 'Chat/Components/Markdown',
  component: Markdown,
  tags: ['autodocs'],
  args: {
    text: GFM,
    streaming: false,
    quoteRail: 'subtle',
    quoteFont: 'italic',
    quoteSpacing: 'snug',
    quoteTint: false,
  },
  argTypes: {
    quoteRail: {
      control: 'inline-radio',
      options: ['subtle', 'accent'],
      description: 'Blockquote rail: 2px `--rail`, or 3px `--rail-accent`.',
      table: { category: 'Blockquote' },
    },
    quoteFont: {
      control: 'inline-radio',
      options: ['italic', 'regular'],
      description: 'Blockquote text: italic soft ink, or upright full ink.',
      table: { category: 'Blockquote' },
    },
    quoteSpacing: {
      control: 'inline-radio',
      options: ['snug', 'roomy'],
      description: 'Blockquote padding: 16px left only, or 12px × 14px all round.',
      table: { category: 'Blockquote' },
    },
    quoteTint: {
      control: 'boolean',
      description: 'A light `--quote-tint` wash behind the blockquote.',
      table: { category: 'Blockquote' },
    },
  },
  decorators: [(Story) => <div className="max-w-3xl">{Story()}</div>],
  parameters: {
    docs: {
      description: {
        component:
          'The GFM renderer. `[n]` markers become `CitationChip`s only when `n` matches a real source id, so `[sic]` survives; a half-received trailing `[12` is hidden mid-stream so it never flickers as text. ` ```mermaid ` fences render as diagrams. Blockquotes take four independent options — `quoteRail`, `quoteFont`, `quoteSpacing` and `quoteTint` — whose defaults are the library quote.',
      },
    },
  },
} satisfies Meta<typeof Markdown>

export default meta
type Story = StoryObj<typeof meta>

export const Gfm: Story = { name: 'GFM' }

export const WithCitations: Story = {
  args: { text: answerMarkdown, sources, highlights, onCite: fn() },
}

/** The trailing `[1` is held back until the marker closes. */
export const StreamingPartialMarker: Story = {
  args: {
    text: 'The liquidity policy requires 30 days of forecast outflows [1',
    streaming: true,
    sources,
  },
}

/** Replays the answer token by token, the way a responder delivers it. */
export const StreamingReplay: Story = {
  render: function ReplayStory() {
    const words = answerMarkdown.split(/(?<=\s)/)
    const [n, setN] = useState(0)
    const done = n >= words.length
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="self-start rounded-control border border-line px-3 py-1 text-[12px] text-ink"
          onClick={() => {
            setN(0)
            const id = setInterval(
              () =>
                setN((i) => {
                  if (i + 1 >= words.length) clearInterval(id)
                  return i + 1
                }),
              35,
            )
          }}
        >
          {n === 0 || done ? 'Play stream' : 'Streaming…'}
        </button>
        <Markdown text={words.slice(0, n).join('')} streaming={!done} sources={sources} />
      </div>
    )
  },
}

export const Mermaid: Story = {
  args: { text: `Here is the approval flow:\n\n\`\`\`mermaid\n${mermaidSource}\n\`\`\`` },
}

const QUOTE = `The answer draws on two passages.

> Forecasts must cover at least 30 days of expected outflows, reviewed weekly by the owning team.

Everything else in the policy is guidance rather than a requirement.`

const LOOKS: { title: string; note: string; props: Partial<MarkdownProps> }[] = [
  { title: 'Library', note: 'The defaults', props: {} },
  {
    title: 'Draft',
    note: 'accent · regular · roomy',
    props: { quoteRail: 'accent', quoteFont: 'regular', quoteSpacing: 'roomy' },
  },
  {
    title: 'Draft + tint',
    note: 'accent · regular · roomy · tint',
    props: { quoteRail: 'accent', quoteFont: 'regular', quoteSpacing: 'roomy', quoteTint: true },
  },
]

function QuoteLooksGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {LOOKS.map(({ title, note, props }) => (
        <section
          key={title}
          aria-label={title}
          className="flex flex-col gap-3 rounded-surface border border-line bg-panel-solid p-4"
        >
          <header className="flex flex-col gap-0.5">
            <h3 className="text-[13px] font-semibold text-ink-strong">{title}</h3>
            <span className="text-xs text-ink-soft">{note}</span>
          </header>
          <div className="text-sm text-ink">
            <Markdown text={QUOTE} {...props} />
          </div>
        </section>
      ))}
    </div>
  )
}

/** The library quote beside the draft look from the design canvas, light mode. */
export const QuoteLooks: Story = {
  args: { text: QUOTE },
  globals: { mode: 'light' },
  render: () => <QuoteLooksGrid />,
}

/** The same comparison on a dark canvas. */
export const QuoteLooksDark: Story = {
  args: { text: QUOTE },
  globals: { mode: 'dark' },
  render: () => <QuoteLooksGrid />,
}
