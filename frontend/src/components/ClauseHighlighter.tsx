import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Banknote,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Shield,
  Volume2,
} from 'lucide-react'
import { useState } from 'react'
import type { ClauseItem, ClauseType } from '../lib/api'

interface ClauseHighlighterProps {
  clauses: ClauseItem[]
  stats: {
    total_risks: number
    total_obligations: number
    total_deadlines: number
    total_financial: number
  }
  initialLanguage?: 'en' | 'hi'
}

const clauseConfig: Record<
  ClauseType,
  { label: string; icon: React.ReactNode; badgeClass: string; highlightClass: string; textClass: string }
> = {
  risk: {
    label: 'Risk / Red Flag',
    icon: <AlertTriangle size={14} aria-hidden="true" />,
    badgeClass: 'badge-risk',
    highlightClass: 'highlight-risk',
    textClass: 'text-red-300',
  },
  obligation: {
    label: 'Obligation',
    icon: <Shield size={14} aria-hidden="true" />,
    badgeClass: 'badge-obligation',
    highlightClass: 'highlight-obligation',
    textClass: 'text-blue-300',
  },
  deadline: {
    label: 'Deadline / Date',
    icon: <Calendar size={14} aria-hidden="true" />,
    badgeClass: 'badge-deadline',
    highlightClass: 'highlight-deadline',
    textClass: 'text-amber-300',
  },
  financial: {
    label: 'Financial Term',
    icon: <Banknote size={14} aria-hidden="true" />,
    badgeClass: 'badge-financial',
    highlightClass: 'highlight-financial',
    textClass: 'text-emerald-300',
  },
}

function ClauseCard({
  clause,
  index,
  language = 'en',
}: {
  clause: ClauseItem
  index: number
  language?: 'en' | 'hi'
}) {
  const [expanded, setExpanded] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const config = clauseConfig[clause.clause_type]

  const explanationText =
    language === 'hi' && clause.explanation_hi
      ? clause.explanation_hi
      : clause.explanation

  const speakClause = (e: React.MouseEvent) => {
    e.stopPropagation()
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel()
        setSpeaking(false)
        return
      }
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(explanationText)
      utt.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      utt.rate = 0.88
      utt.onend = () => setSpeaking(false)
      utt.onerror = () => setSpeaking(false)
      setSpeaking(true)
      window.speechSynthesis.speak(utt)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`p-4 rounded-xl ${config.highlightClass} mb-3`}
      role="article"
      aria-label={`${config.label}: ${clause.text.slice(0, 60)}...`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Badge — uses icon + text label, never color alone (WCAG) */}
          <span className={`${config.badgeClass} mb-2 inline-flex`} aria-label={`Clause type: ${config.label}`}>
            {config.icon}
            <span>{config.label}</span>
          </span>

          {/* Clause text */}
          <p className="text-sm text-slate-200 leading-relaxed mt-1 italic">
            &ldquo;{clause.text}&rdquo;
          </p>
        </div>
        <div className="flex items-center gap-1">
          {'speechSynthesis' in window && (
            <button
              onClick={speakClause}
              className={`p-1.5 rounded-lg transition-colors ${
                speaking ? 'text-gold-400 bg-gold-500/20 animate-pulse' : 'text-slate-400 hover:text-gold-400'
              }`}
              aria-label={speaking ? 'Stop speaking clause' : 'Listen to clause explanation'}
              title="Listen aloud"
            >
              <Volume2 size={15} />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 btn-ghost p-1.5 rounded-lg"
            aria-label={expanded ? 'Collapse explanation' : 'Expand explanation'}
            aria-expanded={expanded}
          >
            {expanded
              ? <ChevronUp size={16} className={config.textClass} />
              : <ChevronDown size={16} className={config.textClass} />
            }
          </button>
        </div>
      </div>

      {/* Explanation — collapsible */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-white/10 space-y-1.5"
          role="note"
          aria-label="Clause explanation"
        >
          <p className={`text-sm ${config.textClass} leading-relaxed`}>
            <strong>{language === 'hi' ? 'आसान शब्दों में इसका अर्थ:' : 'What this means:'}</strong>{' '}
            {explanationText}
          </p>
          {language === 'hi' && clause.explanation && clause.explanation_hi && (
            <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-white/5">
              <span className="text-slate-500 font-medium">English:</span> {clause.explanation}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

/**
 * ClauseHighlighter — Color-coded clause display with WCAG AA compliance.
 * Every clause type uses: color + icon + text label (never color alone).
 * Screen-reader friendly with ARIA roles and labels.
 */
export default function ClauseHighlighter({
  clauses,
  stats,
  initialLanguage = 'en',
}: ClauseHighlighterProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>(initialLanguage)
  const [activeFilter, setActiveFilter] = useState<ClauseType | 'all'>('all')

  const filtered = activeFilter === 'all'
    ? clauses
    : clauses.filter((c) => c.clause_type === activeFilter)

  const filterButtons: Array<{ type: ClauseType | 'all'; label: string; count: number }> = [
    { type: 'all', label: language === 'hi' ? 'सभी' : 'All', count: clauses.length },
    { type: 'risk', label: language === 'hi' ? 'जोखिम (Risks)' : 'Risks', count: stats.total_risks },
    { type: 'obligation', label: language === 'hi' ? 'दायित्व (Obligations)' : 'Obligations', count: stats.total_obligations },
    { type: 'deadline', label: language === 'hi' ? 'समय सीमा (Deadlines)' : 'Deadlines', count: stats.total_deadlines },
    { type: 'financial', label: language === 'hi' ? 'वित्तीय (Financial)' : 'Financial', count: stats.total_financial },
  ]

  return (
    <section aria-label="Clause Analysis" className="space-y-4">
      {/* Language toggle + Header */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-surface-border">
        <span className="text-xs text-slate-400">
          {language === 'hi'
            ? 'दस्तावेज़ की महत्वपूर्ण शर्तों और जोखिमों का विश्लेषण'
            : 'Color-coded clause & risk detection'}
        </span>
        <div className="flex items-center p-0.5 bg-surface rounded-lg border border-surface-border">
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 rounded text-xs transition-all ${
              language === 'hi' ? 'bg-gold-500 text-surface-bg font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            हिन्दी / Hinglish
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded text-xs transition-all ${
              language === 'en' ? 'bg-gold-500 text-surface-bg font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="list" aria-label="Clause counts by type">
        {[
          { type: 'risk' as ClauseType, count: stats.total_risks, label: language === 'hi' ? 'जोखिम' : 'Risks' },
          { type: 'obligation' as ClauseType, count: stats.total_obligations, label: language === 'hi' ? 'दायित्व' : 'Obligations' },
          { type: 'deadline' as ClauseType, count: stats.total_deadlines, label: language === 'hi' ? 'डेडलाइन' : 'Deadlines' },
          { type: 'financial' as ClauseType, count: stats.total_financial, label: language === 'hi' ? 'वित्तीय शर्तें' : 'Financial' },
        ].map(({ type, count, label }) => {
          const cfg = clauseConfig[type]
          return (
            <div
              key={type}
              role="listitem"
              className={`p-3 rounded-xl text-center ${cfg.highlightClass}`}
              aria-label={`${count} ${label} clauses found`}
            >
              <div className={`flex items-center justify-center gap-1.5 mb-1 ${cfg.textClass}`}>
                {cfg.icon}
                <span className="text-xs font-medium">{label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filter clauses by type">
        {filterButtons.map(({ type, label, count }) => (
          <button
            key={type}
            role="tab"
            aria-selected={activeFilter === type}
            aria-controls="clause-list"
            onClick={() => setActiveFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${activeFilter === type
                ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Clause list */}
      <div id="clause-list" role="tabpanel" aria-label={`${activeFilter === 'all' ? 'All' : activeFilter} clauses`}>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <FileCheck size={40} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
            <p>No {activeFilter} clauses found.</p>
          </div>
        ) : (
          filtered.map((clause, i) => (
            <ClauseCard key={clause.id} clause={clause} index={i} language={language} />
          ))
        )}
      </div>
    </section>
  )
}
