import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import DocumentViewer from '../components/DocumentViewer'
import type { SummaryResponse } from '../lib/api'

const mockSummary: SummaryResponse = {
  document_id: 'doc-123',
  document_type: 'Residential Rental Agreement',
  overall_summary: 'This is a standard 11-month lease agreement between landlord and tenant.',
  overall_summary_hi: 'यह मकान मालिक और किराएदार के बीच 11 महीने का मानक रेंटल एग्रीमेंट है।',
  sections: [
    {
      title: 'Monthly Rent',
      content: 'The tenant agrees to pay monthly rent of INR 20,000.',
      plain_language: 'You must pay 20,000 rupees rent every month.',
      plain_language_hi: 'आपको हर महीने 20,000 रुपये किराया देना होगा।',
    },
  ],
  jargon_terms: {
    Indemnity: 'A promise to pay for any damage or loss caused.',
  },
  jargon_terms_hi: {
    Indemnity: 'किसी भी नुकसान की भरपाई करने का कानूनी वादा।',
  },
  disclaimer: 'This summary is for informational purposes only. Not legal advice.',
}

describe('DocumentViewer', () => {
  it('renders document type and initial summary', () => {
    render(<DocumentViewer summary={mockSummary} initialLanguage="en" />)

    expect(screen.getByText('Residential Rental Agreement')).toBeInTheDocument()
    expect(screen.getByText(/This is a standard 11-month lease/i)).toBeInTheDocument()
  })

  it('switches between English and Hindi when language toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<DocumentViewer summary={mockSummary} initialLanguage="en" />)

    // Initially English
    expect(screen.getByText(/This is a standard 11-month lease/i)).toBeInTheDocument()

    // Click Hindi toggle
    const hindiButton = screen.getByRole('button', { name: /हिन्दी/i })
    await user.click(hindiButton)

    // Should now show Hindi summary
    expect(
      screen.getByText(/यह मकान मालिक और किराएदार के बीच 11 महीने का मानक रेंटल एग्रीमेंट है।/i)
    ).toBeInTheDocument()
  })

  it('renders section breakdowns and allows expanding', async () => {
    const user = userEvent.setup()
    render(<DocumentViewer summary={mockSummary} initialLanguage="en" />)

    expect(screen.getByText('Monthly Rent')).toBeInTheDocument()

    // Click section header to expand
    const sectionBtn = screen.getByRole('button', { name: /Monthly Rent/i })
    await user.click(sectionBtn)

    expect(screen.getByText(/You must pay 20,000 rupees rent every month/i)).toBeInTheDocument()
  })

  it('renders jargon terms glossary and expands correctly', async () => {
    const user = userEvent.setup()
    render(<DocumentViewer summary={mockSummary} initialLanguage="en" />)

    const glossaryBtn = screen.getByRole('button', { name: /Legal Terms Glossary/i })
    expect(glossaryBtn).toBeInTheDocument()

    await user.click(glossaryBtn)
    expect(screen.getByText('Indemnity')).toBeInTheDocument()
    expect(screen.getByText(/A promise to pay for any damage/i)).toBeInTheDocument()
  })
})
