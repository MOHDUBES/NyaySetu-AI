import { motion } from 'framer-motion'
import {
  AlertCircle,
  Briefcase,
  FileText,
  ListChecks,
  Loader2,
  MessageSquare,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ActionChecklist from '../components/ActionChecklist'
import ChatPanel from '../components/ChatPanel'
import ClauseHighlighter from '../components/ClauseHighlighter'
import DocumentViewer from '../components/DocumentViewer'
import LawyerBrief from '../components/LawyerBrief'
import {
  type ChecklistResponse,
  type ClausesResponse,
  type LawyerBriefResponse,
  type SummaryResponse,
  detectClauses,
  generateChecklist,
  generateLawyerBrief,
  summarizeDocument,
} from '../lib/api'

type Tab = 'summary' | 'clauses' | 'chat' | 'checklist' | 'brief'

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4" aria-live="polite" aria-label={message}>
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-surface-border" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-16 h-16 rounded-full border-2 border-t-gold-400"
          aria-hidden="true"
        />
      </div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4" role="alert">
      <div className="p-3 bg-red-500/10 rounded-full">
        <AlertCircle size={28} className="text-red-400" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="text-white font-medium mb-1">Something went wrong</p>
        <p className="text-slate-400 text-sm mb-4">{message}</p>
        <button onClick={onRetry} className="btn-secondary gap-2">
          <RefreshCw size={15} aria-hidden="true" />
          Try Again
        </button>
      </div>
    </div>
  )
}

export default function DocumentAnalysis() {
  const { documentId } = useParams<{ documentId: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('summary')
  const [globalLanguage, setGlobalLanguage] = useState<'en' | 'hi'>('hi')

  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [clauses, setClauses] = useState<ClausesResponse | null>(null)
  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null)
  const [brief, setBrief] = useState<LawyerBriefResponse | null>(null)

  const [summaryLoading, setSummaryLoading] = useState(false)
  const [clausesLoading, setClausesLoading] = useState(false)
  const [checklistLoading, setChecklistLoading] = useState(false)
  const [briefLoading, setBriefLoading] = useState(false)

  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [clausesError, setClausesError] = useState<string | null>(null)
  const [checklistError, setChecklistError] = useState<string | null>(null)
  const [briefError, setBriefError] = useState<string | null>(null)

  const docId = documentId!

  const loadSummary = async () => {
    setSummaryLoading(true); setSummaryError(null)
    try { setSummary(await summarizeDocument(docId)) }
    catch (e: any) { setSummaryError(e?.response?.data?.detail || 'Failed to generate summary.') }
    finally { setSummaryLoading(false) }
  }

  const loadClauses = async () => {
    setClausesLoading(true); setClausesError(null)
    try { setClauses(await detectClauses(docId)) }
    catch (e: any) { setClausesError(e?.response?.data?.detail || 'Failed to detect clauses.') }
    finally { setClausesLoading(false) }
  }

  const loadChecklist = async () => {
    setChecklistLoading(true); setChecklistError(null)
    try { setChecklist(await generateChecklist(docId)) }
    catch (e: any) { setChecklistError(e?.response?.data?.detail || 'Failed to generate checklist.') }
    finally { setChecklistLoading(false) }
  }

  const loadBrief = async () => {
    setBriefLoading(true); setBriefError(null)
    try { setBrief(await generateLawyerBrief(docId)) }
    catch (e: any) { setBriefError(e?.response?.data?.detail || 'Failed to generate brief.') }
    finally { setBriefLoading(false) }
  }

  // Auto-load summary on mount
  useEffect(() => { loadSummary() }, [docId])

  // Lazy-load other tabs on first visit
  useEffect(() => {
    if (activeTab === 'clauses' && !clauses && !clausesLoading) loadClauses()
    if (activeTab === 'checklist' && !checklist && !checklistLoading) loadChecklist()
    if (activeTab === 'brief' && !brief && !briefLoading) loadBrief()
  }, [activeTab])

  const docName = summary?.document_type || 'Document'

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'summary', label: globalLanguage === 'hi' ? 'सारांश (Summary)' : 'Summary', icon: <FileText size={15} /> },
    { id: 'clauses', label: globalLanguage === 'hi' ? 'शर्तें व जोखिम (Clauses)' : 'Clauses', icon: <Shield size={15} /> },
    { id: 'chat', label: globalLanguage === 'hi' ? 'बोलकर पूछें (Voice Q&A)' : 'Ask AI (Voice)', icon: <MessageSquare size={15} /> },
    { id: 'checklist', label: globalLanguage === 'hi' ? 'चेकलिस्ट (Checklist)' : 'Checklist', icon: <ListChecks size={15} /> },
    { id: 'brief', label: globalLanguage === 'hi' ? 'वकील ब्रीफ (Brief)' : 'Lawyer Brief', icon: <Briefcase size={15} /> },
  ]

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-white">
                {summaryLoading ? 'Analyzing Document...' : (summary?.document_type || 'Document Analysis')}
              </h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gold-500/10 text-gold-300 border border-gold-500/20">
                Voice & Hindi First
              </span>
            </div>
            {summary && (
              <p className="text-slate-400 text-sm mt-1">
                Document ID: <code className="text-gold-400 font-mono text-xs">{docId}</code>
              </p>
            )}
          </div>

          {/* Global Language Switcher */}
          <div
            className="flex items-center p-1 bg-surface-card rounded-xl border border-surface-border shadow-sm"
            role="group"
            aria-label="Platform Language"
          >
            <button
              type="button"
              onClick={() => setGlobalLanguage('hi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                globalLanguage === 'hi'
                  ? 'bg-gold-500 text-surface-bg font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-pressed={globalLanguage === 'hi'}
            >
              🇮🇳 हिन्दी / Hinglish
            </button>
            <button
              type="button"
              onClick={() => setGlobalLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                globalLanguage === 'en'
                  ? 'bg-gold-500 text-surface-bg font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              aria-pressed={globalLanguage === 'en'}
            >
              English
            </button>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <nav aria-label="Analysis sections" className="mb-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tab-panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap
                  transition-all duration-150 shrink-0
                  ${activeTab === tab.id
                    ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
                {/* Loading indicator on tab */}
                {(tab.id === 'summary' && summaryLoading) ||
                 (tab.id === 'clauses' && clausesLoading) ||
                 (tab.id === 'checklist' && checklistLoading) ||
                 (tab.id === 'brief' && briefLoading)
                  ? <Loader2 size={12} className="animate-spin" aria-label="Loading..." />
                  : null
                }
              </button>
            ))}
          </div>
        </nav>

        {/* Tab panels */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          id={`tab-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="card min-h-[400px]"
        >
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            summaryLoading ? <LoadingState message="Generating plain-language summary with Gemini AI..." />
            : summaryError ? <ErrorState message={summaryError} onRetry={loadSummary} />
            : summary ? (
              <DocumentViewer
                summary={summary}
                initialLanguage={globalLanguage}
                onLanguageChange={(l) => setGlobalLanguage(l)}
              />
            ) : null
          )}

          {/* Clauses Tab */}
          {activeTab === 'clauses' && (
            clausesLoading ? <LoadingState message="Detecting and categorizing clauses..." />
            : clausesError ? <ErrorState message={clausesError} onRetry={loadClauses} />
            : clauses ? (
              <ClauseHighlighter
                clauses={clauses.clauses}
                stats={{
                  total_risks: clauses.total_risks,
                  total_obligations: clauses.total_obligations,
                  total_deadlines: clauses.total_deadlines,
                  total_financial: clauses.total_financial,
                }}
                initialLanguage={globalLanguage}
              />
            ) : null
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <ChatPanel
              documentId={docId}
              documentName={docName}
              initialLanguage={globalLanguage}
            />
          )}

          {/* Checklist Tab */}
          {activeTab === 'checklist' && (
            checklistLoading ? <LoadingState message="Generating your personalized action checklist..." />
            : checklistError ? <ErrorState message={checklistError} onRetry={loadChecklist} />
            : checklist ? <ActionChecklist checklist={checklist} documentName={docName} />
            : null
          )}

          {/* Brief Tab */}
          {activeTab === 'brief' && (
            briefLoading ? <LoadingState message="Preparing your lawyer consultation brief..." />
            : briefError ? <ErrorState message={briefError} onRetry={loadBrief} />
            : brief ? <LawyerBrief brief={brief} documentName={docName} />
            : null
          )}
        </motion.div>
      </div>
    </div>
  )
}
