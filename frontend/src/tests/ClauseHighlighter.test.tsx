import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ClauseHighlighter from '../components/ClauseHighlighter'
import type { ClauseItem } from '../lib/api'

const mockClauses: ClauseItem[] = [
  {
    id: '1',
    text: 'The Tenant shall pay rent on the 1st of each month.',
    clause_type: 'obligation',
    explanation: 'This means you must pay on time.',
    start_char: 0,
    end_char: 50,
  },
  {
    id: '2',
    text: 'Late payment will incur a 5% daily penalty.',
    clause_type: 'risk',
    explanation: 'This could result in significant financial loss.',
    start_char: 51,
    end_char: 100,
  },
  {
    id: '3',
    text: 'Agreement expires December 31, 2025.',
    clause_type: 'deadline',
    explanation: 'Note this expiry date.',
    start_char: 101,
    end_char: 140,
  },
  {
    id: '4',
    text: 'Security deposit of INR 45,000 required.',
    clause_type: 'financial',
    explanation: 'You must pay this upfront.',
    start_char: 141,
    end_char: 180,
  },
]

const mockStats = {
  total_risks: 1,
  total_obligations: 1,
  total_deadlines: 1,
  total_financial: 1,
}

describe('ClauseHighlighter', () => {
  it('renders clause stat cards', () => {
    render(<ClauseHighlighter clauses={mockClauses} stats={mockStats} />)
    expect(screen.getByLabelText('1 Risks clauses found')).toBeInTheDocument()
    expect(screen.getByLabelText('1 Obligations clauses found')).toBeInTheDocument()
    expect(screen.getByLabelText('1 Deadlines clauses found')).toBeInTheDocument()
    expect(screen.getByLabelText('1 Financial clauses found')).toBeInTheDocument()
  })

  it('renders all clauses by default', () => {
    render(<ClauseHighlighter clauses={mockClauses} stats={mockStats} />)
    // All 4 clause texts should appear
    expect(screen.getByText(/shall pay rent/i)).toBeInTheDocument()
    expect(screen.getByText(/5% daily penalty/i)).toBeInTheDocument()
  })

  it('renders type badges with text labels (not color only)', () => {
    render(<ClauseHighlighter clauses={mockClauses} stats={mockStats} />)
    // WCAG: badges must have text labels
    expect(screen.getByText('Risk / Red Flag')).toBeInTheDocument()
    expect(screen.getByText('Obligation')).toBeInTheDocument()
    expect(screen.getByText('Deadline / Date')).toBeInTheDocument()
    expect(screen.getByText('Financial Term')).toBeInTheDocument()
  })

  it('shows filter tabs for all clause types', () => {
    render(<ClauseHighlighter clauses={mockClauses} stats={mockStats} />)
    expect(screen.getByRole('tab', { name: /All/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Risks/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Obligations/ })).toBeInTheDocument()
  })

  it('filters clauses when tab is clicked', async () => {
    const user = userEvent.setup()
    render(<ClauseHighlighter clauses={mockClauses} stats={mockStats} />)

    const riskTab = screen.getByRole('tab', { name: /Risks \(1\)/ })
    await user.click(riskTab)

    // Should show risk clause
    expect(screen.getByText(/5% daily penalty/i)).toBeInTheDocument()
    // Should NOT show obligation clause
    expect(screen.queryByText(/shall pay rent/i)).not.toBeInTheDocument()
  })

  it('renders empty state when no clauses', () => {
    render(<ClauseHighlighter clauses={[]} stats={{ total_risks: 0, total_obligations: 0, total_deadlines: 0, total_financial: 0 }} />)
    expect(screen.getByText(/No all clauses found/i)).toBeInTheDocument()
  })
})
