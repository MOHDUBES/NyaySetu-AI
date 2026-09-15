import { AlertTriangle } from 'lucide-react'

/**
 * DisclaimerBanner — Persistent legal disclaimer shown on every page.
 * Cannot be dismissed; always anchored to top of viewport.
 * WCAG AA: High-contrast amber text, descriptive aria-label.
 */
export default function DisclaimerBanner() {
  return (
    <div
      role="alert"
      aria-label="Legal disclaimer: This platform does not provide legal advice"
      className="disclaimer-banner sticky top-0 z-50"
    >
      <AlertTriangle size={14} aria-hidden="true" className="shrink-0" />
      <span>
        <strong>Not Legal Advice.</strong>{' '}
        NyaySetu AI provides informational assistance only. Always consult a licensed legal professional for decisions.
      </span>
    </div>
  )
}
