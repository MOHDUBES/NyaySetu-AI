import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import {
  AlertCircle,
  Banknote,
  Briefcase,
  Calendar,
  Download,
  FileText,
  HelpCircle,
  Scale,
  ShieldAlert,
} from 'lucide-react'
import { useState } from 'react'
import type { LawyerBriefResponse } from '../lib/api'

interface LawyerBriefProps {
  brief: LawyerBriefResponse
  documentName?: string
  initialLanguage?: 'en' | 'hi'
}

function BriefSection({
  icon,
  title,
  items,
  emptyText,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
  emptyText?: string
}) {
  if (items.length === 0 && !emptyText) return null
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
        {icon}
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 italic">{emptyText}</p>
      ) : (
        <ul className="space-y-2" aria-label={title}>
          {items.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-surface-border"
            >
              <span className="text-gold-400 mt-0.5 text-sm font-bold shrink-0">{i + 1}.</span>
              <p className="text-sm text-slate-200 leading-relaxed">{item}</p>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * LawyerBrief — Structured brief to prepare the user for a legal consultation.
 * Downloadable as PDF in chosen language.
 */
export default function LawyerBrief({
  brief,
  documentName = 'Document',
  initialLanguage = 'hi',
}: LawyerBriefProps) {
  const [language, setLanguage] = useState<'en' | 'hi'>(initialLanguage)
  const downloadAsPdf = () => {
    const doc = new jsPDF()
    const margin = 15
    let y = margin

    // Header
    doc.setFontSize(18)
    doc.setTextColor(26, 35, 126)
    doc.text('NyaySetu AI — Lawyer Consultation Brief', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Document: ${documentName}`, margin, y); y += 5
    doc.text(`Document Type: ${brief.document_type}`, margin, y); y += 5
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, margin, y); y += 5
    doc.text('⚠️ This brief is for preparation purposes only. Not legal advice.', margin, y); y += 10

    // Executive Summary
    doc.setFontSize(12); doc.setTextColor(0, 0, 0)
    doc.text('Executive Summary', margin, y); y += 7
    doc.setFontSize(10); doc.setTextColor(60, 60, 60)
    const summaryLines = doc.splitTextToSize(brief.executive_summary, 180)
    summaryLines.forEach((line: string) => { doc.text(line, margin, y); y += 6 })
    y += 5

    const printSection = (title: string, items: string[]) => {
      if (items.length === 0) return
      if (y > 240) { doc.addPage(); y = margin }
      doc.setFontSize(12); doc.setTextColor(0, 0, 0)
      doc.text(title, margin, y); y += 7
      doc.setFontSize(10); doc.setTextColor(60, 60, 60)
      items.forEach((item, i) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${item}`, 175)
        lines.forEach((line: string) => {
          if (y > 270) { doc.addPage(); y = margin }
          doc.text(line, margin + 3, y); y += 6
        })
      })
      y += 5
    }

    printSection('Key Concerns', brief.key_concerns)
    printSection('Questions to Ask Your Lawyer', brief.questions_to_ask)
    printSection('Important Dates & Deadlines', brief.important_dates)
    printSection('Financial Obligations', brief.financial_obligations)

    doc.setFontSize(8); doc.setTextColor(150, 150, 150)
    doc.text('NyaySetu AI — Not legal advice. Consult a licensed professional.', margin, 285)

    doc.save(`NyaySetu-Brief-${documentName.replace(/\s+/g, '-')}.pdf`)
  }

  const currentSummary =
    language === 'hi' && brief.executive_summary_hi
      ? brief.executive_summary_hi
      : brief.executive_summary

  const currentConcerns =
    language === 'hi' && brief.key_concerns_hi && brief.key_concerns_hi.length > 0
      ? brief.key_concerns_hi
      : brief.key_concerns

  const currentQuestions =
    language === 'hi' && brief.questions_to_ask_hi && brief.questions_to_ask_hi.length > 0
      ? brief.questions_to_ask_hi
      : brief.questions_to_ask

  return (
    <section aria-label="Lawyer Consultation Brief" className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Briefcase size={20} className="text-gold-400" aria-hidden="true" />
          <h2 className="font-semibold text-white">
            {language === 'hi' ? 'वकील परामर्श तैयारी प्रपत्र' : 'Prepare for Your Lawyer'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <div className="flex items-center p-0.5 bg-surface rounded-lg border border-surface-border">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                language === 'hi'
                  ? 'bg-gold-500 text-surface-bg font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                language === 'en'
                  ? 'bg-gold-500 text-surface-bg font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          <button
            onClick={downloadAsPdf}
            className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
            aria-label="Download consultation brief as PDF"
          >
            <Download size={14} aria-hidden="true" />
            {language === 'hi' ? 'PDF डाउनलोड करें' : 'Download Brief'}
          </button>
        </div>
      </div>

      {/* Document Type + Executive Summary */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-gold-400" aria-hidden="true" />
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            {language === 'hi' ? 'दस्तावेज़ प्रकार' : 'Document Type'}
          </span>
        </div>
        <p className="text-white font-semibold">{brief.document_type}</p>

        <div className="pt-3 border-t border-surface-border">
          <div className="flex items-center gap-2 mb-2">
            <Scale size={16} className="text-gold-400" aria-hidden="true" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              {language === 'hi' ? 'कार्यकारी सारांश' : 'Executive Summary'}
            </span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line" aria-label="Executive summary">
            {currentSummary}
          </p>
        </div>
      </div>

      {/* Sections */}
      <BriefSection
        icon={<ShieldAlert size={16} className="text-red-400" />}
        title={language === 'hi' ? 'पहचाने गए मुख्य मुद्दे व चिंताएं' : 'Key Concerns Found'}
        items={currentConcerns}
        emptyText="No major concerns detected."
      />

      <BriefSection
        icon={<HelpCircle size={16} className="text-blue-400" />}
        title={language === 'hi' ? 'वकील से पूछने योग्य आवश्यक सवाल' : 'Questions to Ask Your Lawyer'}
        items={currentQuestions}
        emptyText="No specific questions generated."
      />

      <BriefSection
        icon={<Calendar size={16} className="text-amber-400" />}
        title={language === 'hi' ? 'महत्वपूर्ण तिथियां व डेडलाइन' : 'Important Dates & Deadlines'}
        items={brief.important_dates}
        emptyText="No specific dates found."
      />

      <BriefSection
        icon={<Banknote size={16} className="text-emerald-400" />}
        title={language === 'hi' ? 'वित्तीय देनदारियां व शुल्क' : 'Financial Obligations'}
        items={brief.financial_obligations}
        emptyText="No financial obligations found."
      />

      {/* Disclaimer */}
      <div
        role="note"
        aria-label="Legal disclaimer"
        className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
      >
        <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-amber-300">{brief.disclaimer}</p>
      </div>
    </section>
  )
}
