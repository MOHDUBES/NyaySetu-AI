import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Download,
  HelpCircle,
  ListChecks,
  Loader2
} from 'lucide-react'
import type { ChecklistItem, ChecklistResponse } from '../lib/api'

interface ActionChecklistProps {
  checklist: ChecklistResponse
  documentName?: string
}

const priorityColor: Record<string, string> = {
  high: 'text-red-400 border-red-500/30 bg-red-500/10',
  medium: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  low: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
}

const priorityLabel: Record<string, string> = {
  high: '⚡ High',
  medium: '● Medium',
  low: '○ Low',
}

function ChecklistSection({
  title,
  icon,
  items,
  ariaLabel,
}: {
  title: string
  icon: React.ReactNode
  items: ChecklistItem[]
  ariaLabel: string
}) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
        {icon}
        {title}
        <span className="ml-auto text-xs text-slate-500 font-normal">{items.length} items</span>
      </h3>
      <ul className="space-y-2" aria-label={ariaLabel}>
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-surface hover:bg-white/5 transition-colors group"
          >
            <div className="mt-0.5 shrink-0">
              <CheckCircle2
                size={16}
                className="text-slate-600 group-hover:text-gold-400 transition-colors"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200">{item.text}</p>
            </div>
            <span
              className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${priorityColor[item.priority] || priorityColor.medium}`}
              aria-label={`Priority: ${item.priority}`}
            >
              {priorityLabel[item.priority] || '● Medium'}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

/**
 * ActionChecklist — Downloadable PDF checklist from document analysis.
 * Groups items by category with priority labels.
 */
export default function ActionChecklist({ checklist, documentName = 'Document' }: ActionChecklistProps) {
  const downloadAsPdf = () => {
    const doc = new jsPDF()
    const margin = 15
    let y = margin

    // Header
    doc.setFontSize(18)
    doc.setTextColor(26, 35, 126)
    doc.text('NyaySetu AI — Action Checklist', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Document: ${documentName}`, margin, y)
    y += 5
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, margin, y)
    y += 5
    doc.text('⚠️ This checklist is informational only. Not legal advice.', margin, y)
    y += 10

    const printSection = (title: string, items: ChecklistItem[]) => {
      if (items.length === 0) return
      doc.setFontSize(13)
      doc.setTextColor(0, 0, 0)
      doc.text(title, margin, y)
      y += 7

      items.forEach((item) => {
        doc.setFontSize(10)
        doc.setTextColor(50, 50, 50)
        const lines = doc.splitTextToSize(`☐  ${item.text} [${item.priority.toUpperCase()}]`, 180)
        lines.forEach((line: string) => {
          if (y > 270) { doc.addPage(); y = margin }
          doc.text(line, margin + 3, y)
          y += 6
        })
      })
      y += 5
    }

    printSection('✅ Things to Verify', checklist.items_to_verify)
    printSection('❓ Questions to Ask Your Lawyer', checklist.questions_for_lawyer)
    printSection('📅 Deadlines to Track', checklist.deadlines_to_track)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('NyaySetu AI — Not legal advice. Consult a licensed professional.', margin, 285)

    doc.save(`NyaySetu-Checklist-${documentName.replace(/\s+/g, '-')}.pdf`)
  }

  const totalItems =
    checklist.items_to_verify.length +
    checklist.questions_for_lawyer.length +
    checklist.deadlines_to_track.length

  return (
    <section aria-label="Action Checklist" className="space-y-6">
      {/* Header with download */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={20} className="text-gold-400" aria-hidden="true" />
          <h2 className="font-semibold text-white">Action Checklist</h2>
          <span className="text-xs text-slate-500">({totalItems} items)</span>
        </div>
        <button
          onClick={downloadAsPdf}
          className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
          aria-label="Download checklist as PDF"
        >
          <Download size={14} aria-hidden="true" />
          Download PDF
        </button>
      </div>

      <ChecklistSection
        title="Things to Verify"
        icon={<CheckCircle2 size={16} className="text-emerald-400" />}
        items={checklist.items_to_verify}
        ariaLabel="Items to verify before signing"
      />

      <ChecklistSection
        title="Questions to Ask Your Lawyer"
        icon={<HelpCircle size={16} className="text-blue-400" />}
        items={checklist.questions_for_lawyer}
        ariaLabel="Questions to ask a legal professional"
      />

      <ChecklistSection
        title="Deadlines to Track"
        icon={<Calendar size={16} className="text-amber-400" />}
        items={checklist.deadlines_to_track}
        ariaLabel="Important deadlines to note"
      />

      {/* Disclaimer */}
      <div
        className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30"
        role="note"
        aria-label="Legal disclaimer"
      >
        <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-amber-300">{checklist.disclaimer}</p>
      </div>
    </section>
  )
}
