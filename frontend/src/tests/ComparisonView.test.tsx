import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ComparisonView from '../components/ComparisonView'
import type { ComparisonResponse } from '../lib/api'

const mockComparisonResult: ComparisonResponse = {
  doc1_name: 'Original_Agreement.pdf',
  doc2_name: 'Revised_Agreement.pdf',
  ai_summary: 'The revised agreement reduces notice period from 60 to 30 days and removes penalty clause.',
  ai_summary_hi: 'संशोधित समझौते में नोटिस अवधि को 60 से घटाकर 30 दिन कर दिया गया है।',
  favorable_to_user: 'doc2',
  favorable_to_user_hi: 'यह संशोधन आपके लिए अधिक लाभकारी और सुरक्षित है।',
  key_differences: [
    'Notice period reduced to 30 days',
    'Penalty fee removed',
  ],
  key_differences_hi: [
    'नोटिस अवधि घटाकर 30 दिन की गई',
    'जुर्माना हटा दिया गया',
  ],
  diff_sections: [
    {
      section_title: 'Clause 4: Termination Notice',
      doc1_text: 'Party must give 60 days written notice.',
      doc2_text: 'Party must give 30 days written notice.',
      change_type: 'modified',
      ai_note: 'Notice period shortened to 30 days.',
    },
    {
      section_title: 'Clause 8: Late Payment Penalty',
      doc1_text: 'A fee of 15% applies to late invoices.',
      doc2_text: '[Not present in Document 2]',
      change_type: 'removed',
      ai_note: 'Penalty clause removed.',
    },
  ],
  disclaimer: 'Informational assistance only. Not legal advice.',
}

describe('ComparisonView Component', () => {
  const mockSpeak = vi.fn()
  const mockCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        getVoices: vi.fn(() => []),
        speak: mockSpeak,
        cancel: mockCancel,
        onvoiceschanged: null,
      },
    })
  })

  it('renders comparison header with both document names', () => {
    render(<ComparisonView result={mockComparisonResult} />)
    expect(screen.getAllByText('Original_Agreement.pdf').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Revised_Agreement.pdf').length).toBeGreaterThanOrEqual(1)
  })

  it('renders favorable outcome verdict badge in Hindi by default', () => {
    render(<ComparisonView result={mockComparisonResult} />)
    expect(
      screen.getByText('यह संशोधन आपके लिए अधिक लाभकारी और सुरक्षित है।')
    ).toBeInTheDocument()
  })

  it('renders diff sections with title and change type', () => {
    render(<ComparisonView result={mockComparisonResult} />)
    expect(screen.getByText('Clause 4: Termination Notice')).toBeInTheDocument()
    expect(screen.getByText('Clause 8: Late Payment Penalty')).toBeInTheDocument()
    expect(screen.getByText('2 changes found')).toBeInTheDocument()
  })

  it('switches between Hindi and English language summaries when language buttons are clicked', () => {
    render(<ComparisonView result={mockComparisonResult} />)

    // Hindi text is rendered by default
    expect(
      screen.getByText('संशोधित समझौते में नोटिस अवधि को 60 से घटाकर 30 दिन कर दिया गया है।')
    ).toBeInTheDocument()

    // Switch to English
    const englishBtn = screen.getByRole('button', { name: 'English' })
    fireEvent.click(englishBtn)

    // English summary is rendered
    expect(
      screen.getByText('The revised agreement reduces notice period from 60 to 30 days and removes penalty clause.')
    ).toBeInTheDocument()

    // Switch back to Hindi
    const hindiBtn = screen.getByRole('button', { name: 'हिन्दी' })
    fireEvent.click(hindiBtn)

    expect(
      screen.getByText('संशोधित समझौते में नोटिस अवधि को 60 से घटाकर 30 दिन कर दिया गया है।')
    ).toBeInTheDocument()
  })

  it('triggers speech read-aloud when Listen button is clicked', () => {
    render(<ComparisonView result={mockComparisonResult} />)

    const listenBtn = screen.getByRole('button', { name: /listen to comparison aloud/i })
    expect(listenBtn).toBeInTheDocument()
    fireEvent.click(listenBtn)

    expect(mockCancel).toHaveBeenCalled()
  })

  it('renders change type legend with Added, Removed, and Modified', () => {
    render(<ComparisonView result={mockComparisonResult} />)

    const legend = screen.getByRole('list', { name: /change type legend/i })
    expect(legend).toBeInTheDocument()
    expect(screen.getAllByText('Added').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Removed').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Modified').length).toBeGreaterThanOrEqual(1)
  })
})
