import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnswerPreview } from './answer-preview'

describe('AnswerPreview', () => {
  it('shows every part it is not told to hide', () => {
    render(<AnswerPreview show={{}} />)
    const preview = screen.getByRole('complementary', { name: 'Preview' })
    expect(preview).toHaveTextContent('Thought for 4s')
    expect(preview).toHaveTextContent('sync_log.read')
    expect(preview).toHaveTextContent('[1]')
    expect(screen.getByRole('group', { name: 'Sources' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Message actions' })).toBeInTheDocument()
    expect(preview).toHaveTextContent('Answered in 6.2s')
    expect(screen.getByRole('list', { name: 'Suggested follow-ups' })).toBeInTheDocument()
  })

  it('hides each part that is switched off, and keeps the answer', () => {
    render(
      <AnswerPreview
        show={{
          reasoning: false,
          tools: false,
          citations: false,
          actions: false,
          turnDetails: false,
          followups: false,
        }}
      />,
    )
    const preview = screen.getByRole('complementary', { name: 'Preview' })
    expect(preview).toHaveTextContent('Its 86 documents still answer questions.')
    expect(preview).not.toHaveTextContent('Thought for 4s')
    expect(preview).not.toHaveTextContent('sync_log.read')
    expect(preview).not.toHaveTextContent('[1]')
    expect(screen.queryByRole('group', { name: 'Sources' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Message actions' })).not.toBeInTheDocument()
    expect(preview).not.toHaveTextContent('Answered in')
    expect(screen.queryByRole('list', { name: 'Suggested follow-ups' })).not.toBeInTheDocument()
  })
})
