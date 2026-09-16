import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  Square,
  Volume2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ComparisonResponse, DiffSection } from '../lib/api'
import { speakUtterance, stopSpeaking } from '../lib/speech'

interface ComparisonViewProps {
  result: ComparisonResponse
}

const changeConfig = {
  added: {
    label: 'Added',
    icon: <PlusCircle size={13} aria-hidden="true" />,
    className: 'diff-added',
    headerClass: 'text-emerald-400',
    show: 'doc2',
  },
  removed: {
    label: 'Removed',
    icon: <MinusCircle size={13} aria-hidden="true" />,
    className: 'diff-removed',
    headerClass: 'text-red-400',
    show: 'both',
  },
  modified: {
    label: 'Modified',
    icon: <RefreshCw size={13} aria-hidden="true" />,
    className: 'diff-modified',
    headerClass: 'text-amber-400',
    show: 'both',
  },
  unchanged: {
    label: 'Unchanged',
    icon: <CheckCircle2 size={13} aria-hidden="true" />,
    className: 'bg-white/5',
    headerClass: 'text-slate-400',
    show: 'doc1',
  },
}

interface DiffCardProps {
  section: DiffSection
  doc1Name: string
  doc2Name: string
  sectionIndex: number
  activeSpeakerId: string | null
  onToggleSpeech: (text: string, id: string, explicitLang?: 'hi-IN' | 'en-IN') => void
  lang: 'hi' | 'en'
}

function DiffCard({
  section,
  doc1Name,
  doc2Name,
  sectionIndex,
  activeSpeakerId,
  onToggleSpeech,
  lang,
}: DiffCardProps) {
  const config = changeConfig[section.change_type] || changeConfig.unchanged
  if (section.change_type === 'unchanged') return null // skip unchanged for cleaner view

  const sectionSpeakerId = `diff-section-${sectionIndex}`
  const isSectionSpeaking = activeSpeakerId === sectionSpeakerId
  const doc1Id = `diff-${sectionIndex}-doc1`
  const doc2Id = `diff-${sectionIndex}-doc2`
  const isDoc1Speaking = activeSpeakerId === doc1Id
  const isDoc2Speaking = activeSpeakerId === doc2Id

  const handleSpeakSection = () => {
    const isHindi = lang === 'hi'
    let text = ''
    if (section.change_type === 'modified') {
      text = isHindi
        ? `संशोधित खंड: ${doc1Name} में यह था: ${section.doc1_text}। जबकि ${doc2Name} में बदलकर यह हुआ है: ${section.doc2_text}।`
        : `Modified section: In ${doc1Name}: ${section.doc1_text}. In ${doc2Name}, it was revised to: ${section.doc2_text}.`
    } else if (section.change_type === 'added') {
      text = isHindi
        ? `नया जोड़ा गया खंड: ${doc2Name} में यह जोड़ा गया है: ${section.doc2_text}।`
        : `Added section: Added in ${doc2Name}: ${section.doc2_text}.`
    } else {
      text = isHindi
        ? `हटाया गया खंड: ${doc1Name} में था: ${section.doc1_text}। यह ${doc2Name} में मौजूद नहीं है।`
        : `Removed section: Removed from ${doc1Name}: ${section.doc1_text}. Not present in ${doc2Name}.`
    }
    onToggleSpeech(text, sectionSpeakerId, isHindi ? 'hi-IN' : 'en-IN')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl ${config.className} mb-3`}
      role="article"
      aria-label={`${config.label} section: ${section.section_title}`}
    >
      <div className={`flex flex-wrap items-center justify-between gap-2 mb-3 ${config.headerClass}`}>
        <div className="flex items-center gap-2">
          {config.icon}
          <span className="text-xs font-semibold uppercase tracking-wide">
            {lang === 'hi' && section.change_type === 'modified' ? 'संशोधित (Modified)' : config.label}
          </span>
          <span className="text-xs text-slate-500">{section.section_title}</span>
        </div>

        {/* Section-level TTS button */}
        {'speechSynthesis' in window && (
          <button
            type="button"
            onClick={handleSpeakSection}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              isSectionSpeaking
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20 animate-pulse'
                : 'bg-surface-border/70 text-gold-400 hover:bg-gold-500/20 hover:text-gold-300 border border-gold-500/30'
            }`}
            aria-label={isSectionSpeaking ? 'Stop readout' : 'Listen to this change'}
            title={isSectionSpeaking ? 'रोकें' : 'पूरा बदलाव बोलकर सुनें (Voice TTS)'}
          >
            {isSectionSpeaking ? <Square size={12} /> : <Volume2 size={12} />}
            <span>
              {isSectionSpeaking
                ? (lang === 'hi' ? 'रोकें' : 'Stop')
                : (lang === 'hi' ? 'पूरा बदलाव सुनें' : 'Listen Change')}
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Document 1 */}
        {section.doc1_text !== '[Not present in Document 1]' && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{doc1Name}</p>
              {'speechSynthesis' in window && (
                <button
                  type="button"
                  onClick={() => {
                    const text = lang === 'hi'
                      ? `${doc1Name} में: ${section.doc1_text}`
                      : `${doc1Name}: ${section.doc1_text}`
                    onToggleSpeech(text, doc1Id, lang === 'hi' ? 'hi-IN' : 'en-IN')
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    isDoc1Speaking
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-surface-border/70 text-slate-300 hover:bg-gold-500/20 hover:text-gold-400 hover:border-gold-500/40 border border-surface-border'
                  }`}
                  aria-label={isDoc1Speaking ? 'Stop readout' : `Listen to ${doc1Name}`}
                  title={isDoc1Speaking ? 'रोकें' : 'सुनें (Voice TTS)'}
                >
                  {isDoc1Speaking ? <Square size={11} /> : <Volume2 size={11} />}
                  <span>{isDoc1Speaking ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'बोलकर सुनें' : 'Listen')}</span>
                </button>
              )}
            </div>
            <div className="p-3 rounded-lg bg-black/20 text-xs text-slate-300 leading-relaxed">
              {section.doc1_text}
            </div>
          </div>
        )}

        {/* Document 2 */}
        {section.doc2_text !== '[Not present in Document 2]' && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{doc2Name}</p>
              {'speechSynthesis' in window && (
                <button
                  type="button"
                  onClick={() => {
                    const text = lang === 'hi'
                      ? `${doc2Name} में: ${section.doc2_text}`
                      : `${doc2Name}: ${section.doc2_text}`
                    onToggleSpeech(text, doc2Id, lang === 'hi' ? 'hi-IN' : 'en-IN')
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    isDoc2Speaking
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-surface-border/70 text-slate-300 hover:bg-gold-500/20 hover:text-gold-400 hover:border-gold-500/40 border border-surface-border'
                  }`}
                  aria-label={isDoc2Speaking ? 'Stop readout' : `Listen to ${doc2Name}`}
                  title={isDoc2Speaking ? 'रोकें' : 'सुनें (Voice TTS)'}
                >
                  {isDoc2Speaking ? <Square size={11} /> : <Volume2 size={11} />}
                  <span>{isDoc2Speaking ? (lang === 'hi' ? 'रोकें' : 'Stop') : (lang === 'hi' ? 'बोलकर सुनें' : 'Listen')}</span>
                </button>
              )}
            </div>
            <div className="p-3 rounded-lg bg-black/20 text-xs text-slate-300 leading-relaxed">
              {section.doc2_text}
            </div>
          </div>
        )}

        {/* Removed (only in doc1) */}
        {section.doc2_text === '[Not present in Document 2]' && (
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1.5">{doc2Name}</p>
            <div className="p-3 rounded-lg bg-red-500/5 text-xs text-red-400/60 italic leading-relaxed">
              Not present in {doc2Name}
            </div>
          </div>
        )}

        {section.doc1_text === '[Not present in Document 1]' && (
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1.5">{doc1Name}</p>
            <div className="p-3 rounded-lg bg-emerald-500/5 text-xs text-emerald-400/60 italic leading-relaxed">
              Not present in {doc1Name}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const favorableLabels: Record<string, { label: string; color: string }> = {
  doc1: { label: 'Document 1 appears more favorable', color: 'text-emerald-400' },
  doc2: { label: 'Document 2 appears more favorable', color: 'text-blue-400' },
  neither: { label: 'Neither document appears clearly more favorable', color: 'text-slate-400' },
  depends: { label: 'Depends on your specific situation and priorities', color: 'text-amber-400' },
}

/**
 * ComparisonView — Side-by-side document diff with bilingual AI summary and Voice TTS.
 * Shows only changed sections (added/removed/modified).
 * Voice Read-Aloud for low-literacy accessibility.
 */
export default function ComparisonView({ result }: ComparisonViewProps) {
  const [lang, setLang] = useState<'hi' | 'en'>('hi')
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null)

  const changedSections = result.diff_sections.filter((s) => s.change_type !== 'unchanged')
  const favorableInfo = favorableLabels[result.favorable_to_user] || favorableLabels.depends

  const summaryText = lang === 'hi' && result.ai_summary_hi ? result.ai_summary_hi : result.ai_summary
  const diffs = lang === 'hi' && result.key_differences_hi && result.key_differences_hi.length > 0
    ? result.key_differences_hi
    : result.key_differences
  const verdictText = lang === 'hi' && result.favorable_to_user_hi
    ? result.favorable_to_user_hi
    : favorableInfo.label

  const handleToggleSpeech = (text: string, id: string, explicitLang?: 'hi-IN' | 'en-IN') => {
    if (!('speechSynthesis' in window)) return

    if (activeSpeakerId === id) {
      stopSpeaking()
      setActiveSpeakerId(null)
      return
    }

    const targetLang = explicitLang || (lang === 'hi' ? 'hi-IN' : 'en-IN')

    speakUtterance(text, {
      lang: targetLang,
      onStart: () => setActiveSpeakerId(id),
      onEnd: () => setActiveSpeakerId(null),
      onError: () => setActiveSpeakerId(null),
    })
  }

  const handleSummarySpeech = () => {
    const textToSpeak = `${lang === 'hi' ? 'दस्तावेज़ तुलना का सारांश: ' : 'Document comparison summary: '} ${summaryText}. ${diffs.join('. ')}`
    handleToggleSpeech(textToSpeak, 'summary', lang === 'hi' ? 'hi-IN' : 'en-IN')
  }

  const handleLanguageChange = (newLang: 'hi' | 'en') => {
    stopSpeaking()
    setActiveSpeakerId(null)
    setLang(newLang)
  }

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  return (
    <section aria-label="Document Comparison Results" className="space-y-6">
      {/* AI Summary Card */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={18} className="text-gold-400" aria-hidden="true" />
            <h2 className="font-semibold text-white">
              {lang === 'hi' ? 'दस्तावेज़ तुलना सारांश (AI Summary)' : 'AI Comparison Summary'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Audio Readout Button */}
            {'speechSynthesis' in window && (
              <button
                onClick={handleSummarySpeech}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSpeakerId === 'summary'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 animate-pulse'
                    : 'bg-gold-500/15 text-gold-400 hover:bg-gold-500 hover:text-surface-bg border border-gold-500/30'
                }`}
                aria-label={activeSpeakerId === 'summary' ? 'Stop voice readout' : 'Listen to comparison aloud'}
                title={activeSpeakerId === 'summary' ? 'Stop voice readout' : 'Listen with Voice TTS'}
              >
                {activeSpeakerId === 'summary' ? <Square size={13} /> : <Volume2 size={13} />}
                <span>
                  {activeSpeakerId === 'summary'
                    ? (lang === 'hi' ? 'रोकें' : 'Stop')
                    : (lang === 'hi' ? 'बोलकर सुनें (Voice TTS)' : 'Listen Aloud')}
                </span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-surface-card border border-surface-border rounded-lg p-0.5">
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  lang === 'hi' ? 'bg-gold-500 text-surface-bg font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  lang === 'en' ? 'bg-gold-500 text-surface-bg font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed">{summaryText}</p>

        {/* Favorable verdict */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-surface border border-surface-border">
          <CheckCircle2 size={16} className={favorableInfo.color} aria-hidden="true" />
          <p className={`text-sm font-medium ${favorableInfo.color}`} aria-label={`Verdict: ${verdictText}`}>
            {verdictText}
          </p>
        </div>

        {/* Key differences */}
        {diffs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">
              {lang === 'hi' ? 'मुख्य बदलाव (Key Differences)' : 'Key Differences'}
            </h3>
            <ul className="space-y-2" aria-label="Key differences between documents">
              {diffs.map((diff, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-gold-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                  {diff}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div role="note" className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-xs text-amber-300">{result.disclaimer}</p>
        </div>
      </div>

      {/* Document name legend */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-sm bg-slate-500 inline-block" aria-hidden="true" />
          <strong className="text-slate-200">{result.doc1_name}</strong>
        </div>
        <ArrowLeftRight size={14} className="text-slate-500" aria-hidden="true" />
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-sm bg-slate-500 inline-block" aria-hidden="true" />
          <strong className="text-slate-200">{result.doc2_name}</strong>
        </div>
        <span className="ml-auto text-xs text-slate-500">
          {changedSections.length} changes found
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3" role="list" aria-label="Change type legend">
        {(['added', 'removed', 'modified'] as const).map((type) => {
          const cfg = changeConfig[type]
          return (
            <div key={type} role="listitem" className={`flex items-center gap-1.5 text-xs ${cfg.headerClass}`}>
              {cfg.icon}
              <span>{cfg.label}</span>
            </div>
          )
        })}
      </div>

      {/* Diff sections */}
      <div aria-label="Changed sections">
        {changedSections.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
            <p>No significant differences found between the documents.</p>
          </div>
        ) : (
          changedSections.map((section, i) => (
            <DiffCard
              key={i}
              section={section}
              doc1Name={result.doc1_name}
              doc2Name={result.doc2_name}
              sectionIndex={i}
              activeSpeakerId={activeSpeakerId}
              onToggleSpeech={handleToggleSpeech}
              lang={lang}
            />
          ))
        )}
      </div>
    </section>
  )
}
