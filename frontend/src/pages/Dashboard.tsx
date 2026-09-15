import { motion } from 'framer-motion'
import { ArrowRight, FileText, GitCompare, Loader2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FileUpload from '../components/FileUpload'
import { uploadDocument } from '../lib/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileAccepted = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const { document_id } = await uploadDocument(file)
      navigate(`/analysis/${document_id}`)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Upload failed. Please try again.'
      setUploadError(msg)
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl font-bold text-white mb-3">
            Analyze a Legal Document
          </h1>
          <p className="text-slate-400">
            Upload a PDF or DOCX file to get an instant AI-powered analysis.
            Your document is processed securely and never stored permanently without your consent.
          </p>
        </motion.div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <FileUpload
            onFileAccepted={handleFileAccepted}
            label="Upload Your Legal Document"
            sublabel="PDF or DOCX — rental agreements, employment contracts, T&Cs, NDAs, and more"
            isLoading={uploading}
            error={uploadError}
          />
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-3 mt-4 text-sm text-slate-400"
              aria-live="polite"
              aria-label="Uploading and processing your document"
            >
              <Loader2 size={16} className="animate-spin text-gold-400" aria-hidden="true" />
              Uploading and generating embeddings — this takes a few seconds...
            </motion.div>
          )}
        </motion.div>

        {/* Supported types */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          {[
            'Rental Agreements',
            'Employment Contracts',
            'Terms of Service',
            'NDAs',
            'Loan Agreements',
            'Partnership Deeds',
          ].map((type) => (
            <span
              key={type}
              className="px-3 py-1.5 rounded-full bg-surface-card border border-surface-border text-xs text-slate-400"
            >
              {type}
            </span>
          ))}
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <div className="card flex items-start gap-4">
            <div className="p-2.5 bg-gold-500/10 rounded-xl shrink-0">
              <FileText size={20} className="text-gold-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">Single Document Analysis</h3>
              <p className="text-xs text-slate-400 mb-3">
                Upload one document to get summaries, clause detection, Q&A chat, and checklist.
              </p>
              <label
                className="btn-primary text-xs py-2 px-4 cursor-pointer"
                aria-label="Upload a single document for analysis"
              >
                <Upload size={14} aria-hidden="true" />
                Upload Document
                <input type="file" className="sr-only" accept=".pdf,.docx" onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFileAccepted(f)
                }} aria-label="Select document file" />
              </label>
            </div>
          </div>

          <div className="card flex items-start gap-4">
            <div className="p-2.5 bg-purple-500/10 rounded-xl shrink-0">
              <GitCompare size={20} className="text-purple-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1 text-sm">Compare Two Documents</h3>
              <p className="text-xs text-slate-400 mb-3">
                Upload two versions of a contract to see what changed and which is more favorable.
              </p>
              <a
                href="/comparison"
                className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-2"
                aria-label="Go to document comparison page"
              >
                Compare Now
                <ArrowRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Privacy note */}
        <p className="text-center text-xs text-slate-500 mt-10">
          🔒 Your document is processed securely. We do not log personal information.
          Files are used only for analysis and are not shared with third parties.
        </p>
      </div>
    </div>
  )
}
