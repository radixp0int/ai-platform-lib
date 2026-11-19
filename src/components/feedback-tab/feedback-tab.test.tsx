import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeedbackTab } from './feedback-tab'

describe('FeedbackTab', () => {
  it('calls onClick when pressed', async () => {
    const onClick = vi.fn()
    render(<FeedbackTab onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Feedback' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('names itself by the label and describes itself by the slide-out text', () => {
    render(<FeedbackTab label="Help us" title="Send feedback" description="Ideas welcome" />)
    const tab = screen.getByRole('button', { name: 'Help us' })
    expect(tab).toHaveAccessibleDescription('Send feedback Ideas welcome')
  })

  it('renders a link when given an href', () => {
    render(<FeedbackTab href="/report" />)
    const link = screen.getByRole('link', { name: 'Feedback' })
    expect(link).toHaveAttribute('href', '/report')
    expect(link).not.toHaveAttribute('target')
  })

  it('opens the link in a new tab when asked', () => {
    render(<FeedbackTab href="https://example.com/form" newTab />)
    const link = screen.getByRole('link', { name: 'Feedback' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('leaves out the second line when the description is empty', () => {
    render(<FeedbackTab description="" />)
    expect(screen.getByRole('button', { name: 'Feedback' })).toHaveAccessibleDescription(
      'Report a bug',
    )
  })
})
