import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FileUpload from '../components/FileUpload'

describe('FileUpload', () => {
  it('renders upload label and instructions', () => {
    render(<FileUpload onFileAccepted={vi.fn()} />)
    expect(screen.getByText('Upload Legal Document')).toBeInTheDocument()
    expect(screen.getByText(/PDF or DOCX/i)).toBeInTheDocument()
  })

  it('has correct ARIA role and label', () => {
    render(<FileUpload onFileAccepted={vi.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
    expect(button.getAttribute('aria-label')).toContain('Upload Legal Document')
  })

  it('shows loading state with spinner when isLoading=true', () => {
    render(<FileUpload onFileAccepted={vi.fn()} isLoading={true} />)
    expect(screen.getByText('Processing document...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows error message when error prop is provided', () => {
    const errorMsg = 'Invalid file type.'
    render(<FileUpload onFileAccepted={vi.fn()} error={errorMsg} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(errorMsg)).toBeInTheDocument()
  })

  it('accepts custom label and sublabel', () => {
    render(
      <FileUpload
        onFileAccepted={vi.fn()}
        label="Upload Contract"
        sublabel="PDF only"
      />
    )
    expect(screen.getByText('Upload Contract')).toBeInTheDocument()
    expect(screen.getByText(/PDF only/i)).toBeInTheDocument()
  })

  it('renders hidden file input with correct accept types', () => {
    render(<FileUpload onFileAccepted={vi.fn()} />)
    const input = screen.getByTestId('file-input')
    expect(input).toBeInTheDocument()
  })
})
