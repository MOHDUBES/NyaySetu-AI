import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Volume2
} from 'lucide-react'
import { useState } from 'react'
import type { SummaryResponse } from '../lib/api'

interface DocumentViewerProps {
  summary: SummaryResponse
  initialLanguage?: 'en' | 'hi'
  onLanguageChange?: (lang: 'en' | 'hi') => void
}

/**
 * DocumentViewer — Scrollable document summary with:
 * - Bilingual support: English and natural Hindi/Hinglish toggle
 * - Plain-language overall summary
 * - Collapsible section-by-section explanations
 * - Jargon terms with inline definitions
 * - Text-to-speech for each section (accessibility) in Hindi/English
 * - ARIA roles for screen reader support
 */
export default function DocumentViewer({
  summary,
  initialLanguage = 'hi',
  onLanguageChange,
}: DocumentViewerProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>(
    summary.overall_summary_hi ? initialLanguage : 'en'
  )
  const [expandedSection, setExpandedSection] = useState<number | null>(null)
  const [jargonOpen, setJargonOpen] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  const handleLanguageToggle = (lang: 'en' | 'hi') => {
    setLanguage(lang)
    onLanguageChange?.(lang)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
    }
  }

  const speakText = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel()
        setSpeakingId(null)
        return
      }

      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      utt.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      utt.rate = 0.88
      utt.onend = () => setSpeakingId(null)
      utt.onerror = () => setSpeakingId(null)
      setSpeakingId(id)
      window.speechSynthesis.speak(utt)
    }
  }

  const currentSummary = language === 'hi' && summary.overall_summary_hi
    ? summary.overall_summary_hi
    : summary.overall_summary

  const currentJargon = language === 'hi' && summary.jargon_terms_hi && Object.keys(summary.jargon_terms_hi).length > 0
    ? summary.jargon_terms_hi
    : summary.jargon_terms

  const jargonEntries = Object.entries(currentJargon || {})

  return (
    <article aria-label="Document Analysis" className="space-y-6">
      {/* Top Controls: Document type & Language Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-gold-400" aria-hidden="true" />
          <span className="text-sm font-semibold text-gold-300">{summary.document_type}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
            Bilingual • द्विभाषी
          </span>
        </div>

        {/* Instant Language Toggle */}
        <div
          className="flex items-center p-1 bg-surface rounded-xl border border-surface-border"
          role="group"
          aria-label="Language selection"
        >
          <button
            type="button"
            onClick={() => handleLanguageToggle('hi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              language === 'hi'
                ? 'bg-gold-500 text-surface-bg font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-pressed={language === 'hi'}
          >
            🇮🇳 हिन्दी / Hinglish
          </button>
          <button
            type="button"
            onClick={() => handleLanguageToggle('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              language === 'en'
                ? 'bg-gold-500 text-surface-bg font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-pressed={language === 'en'}
          >
            English
          </button>
        </div>
      </div>

      {/* Overall summary */}
      <div
        className="card border-gold-500/20 bg-gold-500/5"
        role="region"
        aria-label="Document summary"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-white text-base flex items-center gap-2">
              {language === 'hi' ? 'दस्तावेज़ का सरल सारांश' : 'Plain-Language Summary'}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? 'कानूनी शब्दों को आम बोलचाल की भाषा में समझाया गया है'
                : 'Clear overview without confusing legal jargon'}
            </p>
          </div>
          {'speechSynthesis' in window && (
            <button
              onClick={() => speakText(currentSummary, 'overall')}
              className={`btn-ghost p-2 rounded-lg transition-colors ${
                speakingId === 'overall' ? 'text-gold-400 bg-gold-500/20 animate-pulse' : 'text-slate-400 hover:text-gold-400'
              }`}
              aria-label={speakingId === 'overall' ? 'Stop reading' : 'Read summary aloud'}
              title={speakingId === 'overall' ? 'Stop reading' : 'Read aloud with Text-to-Speech'}
            >
              <Volume2 size={18} />
            </button>
          )}
        </div>
        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
          {currentSummary}
        </p>
      </div>

      {/* Section-by-section explanations */}
      {summary.sections.length > 0 && (
        <div role="region" aria-label="Document sections">
          <h2 className="font-semibold text-white mb-3">Section Breakdown</h2>
          <div className="space-y-2">
            {summary.sections.map((section, i) => (
              <div
                key={i}
                className="rounded-xl border border-surface-border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left
                             hover:bg-white/5 transition-colors focus-visible:ring-2
                             focus-visible:ring-gold-400 focus-visible:ring-inset"
                  aria-expanded={expandedSection === i}
                  aria-controls={`section-content-${i}`}
                  id={`section-header-${i}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 w-6 shrink-0">{i + 1}</span>
                    <span className="text-sm font-medium text-slate-200">{section.title}</span>
                  </div>
                  {expandedSection === i
                    ? <ChevronDown size={16} className="text-gold-400 shrink-0" aria-hidden="true" />
                    : <ChevronRight size={16} className="text-slate-500 shrink-0" aria-hidden="true" />
                  }
                </button>

                <AnimatePresence>
                  {expandedSection === i && (
                    <motion.div
                      id={`section-content-${i}`}
                      role="region"
                      aria-labelledby={`section-header-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-surface-border">
                        {/* Plain language explanation */}
                        <div className="pt-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-medium text-gold-400 uppercase tracking-wide">
                              {language === 'hi' ? 'आसान शब्दों में इसका मतलब' : 'What this means'}
                            </p>
                            {'speechSynthesis' in window && (
                              <button
                                onClick={() =>
                                  speakText(
                                    language === 'hi' && section.plain_language_hi
                                      ? section.plain_language_hi
                                      : section.plain_language,
                                    `sec-${i}`
                                  )
                                }
                                className={`transition-colors p-1 rounded ${
                                  speakingId === `sec-${i}`
                                    ? 'text-gold-400 bg-gold-500/20 animate-pulse'
                                    : 'text-slate-500 hover:text-gold-400'
                                }`}
                                aria-label={`Read ${section.title} explanation aloud`}
                              >
                                <Volume2 size={14} />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed bg-gold-500/5 rounded-lg p-3 border border-gold-500/10">
                            {language === 'hi' && section.plain_language_hi
                              ? section.plain_language_hi
                              : section.plain_language}
                          </p>
                        </div>

                        {/* Original text excerpt */}
                        {section.content && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                              Original text
                            </p>
                            <p className="text-xs text-slate-400 italic leading-relaxed p-3 rounded-lg bg-surface">
                              &ldquo;{section.content.slice(0, 400)}{section.content.length > 400 ? '...' : ''}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jargon glossary */}
      {jargonEntries.length > 0 && (
        <div role="region" aria-label="Legal jargon glossary">
          <button
            onClick={() => setJargonOpen(!jargonOpen)}
            className="w-full flex items-center justify-between p-4 rounded-xl
                       bg-navy-800/50 border border-navy-600/30 hover:bg-navy-800/80
                       transition-colors focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-expanded={jargonOpen}
            aria-controls="jargon-glossary"
          >
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-base">📖</span>
              Legal Terms Glossary
              <span className="text-xs text-slate-500 font-normal">({jargonEntries.length} terms)</span>
            </span>
            {jargonOpen
              ? <ChevronDown size={16} className="text-gold-400" aria-hidden="true" />
              : <ChevronRight size={16} className="text-slate-400" aria-hidden="true" />
            }
          </button>

          <AnimatePresence>
            {jargonOpen && (
              <motion.div
                id="jargon-glossary"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <dl className="mt-2 space-y-2">
                  {jargonEntries.map(([term, definition]) => (
                    <div
                      key={term}
                      className="p-3 rounded-xl bg-surface-card border border-surface-border"
                    >
                      <dt className="text-sm font-semibold text-gold-300 mb-1">{term}</dt>
                      <dd className="text-sm text-slate-300 leading-relaxed">{definition}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </article>
  )
}
