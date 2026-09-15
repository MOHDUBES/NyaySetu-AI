import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeftRight, GitCompare, Loader2, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import ComparisonView from '../components/ComparisonView'
import FileUpload from '../components/FileUpload'
import { type ComparisonResponse, compareDocuments } from '../lib/api'

export default function Comparison() {
  const [file1, setFile1] = useState<File | null>(null)
  const [file2, setFile2] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ComparisonResponse | null>(null)

  const canCompare = file1 && file2 && !loading

  const handleCompare = async () => {
    if (!file1 || !file2) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await compareDocuments(file1, file2)
      setResult(data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Comparison failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile1(null)
    setFile2(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex p-3 bg-purple-500/10 rounded-2xl mb-4">
            <GitCompare size={28} className="text-purple-400" aria-hidden="true" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-3">
            Document Comparison
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Upload two versions of a contract or two different agreements. Get a side-by-side diff
            with AI analysis of what changed and which version is more favorable.
          </p>
        </motion.div>

        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Upload grid */}
            <div
              className="grid sm:grid-cols-2 gap-6 mb-8"
              aria-label="Upload two documents for comparison"
            >
              <div>
                <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">1</span>
                  First Document
                </h2>
                <FileUpload
                  onFileAccepted={setFile1}
                  label="Upload Document 1"
                  sublabel="PDF or DOCX"
                  error={null}
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold">2</span>
                  Second Document
                </h2>
                <FileUpload
                  onFileAccepted={setFile2}
                  label="Upload Document 2"
                  sublabel="PDF or DOCX"
                  error={null}
                />
              </div>
            </div>

            {/* Arrow divider */}
            <div className="flex justify-center mb-6" aria-hidden="true">
              <ArrowLeftRight size={24} className="text-slate-500" />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6"
              >
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}

            {/* Compare button */}
            <div className="text-center">
              <button
                onClick={handleCompare}
                disabled={!canCompare}
                className="btn-primary px-10 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Compare the two uploaded documents"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                    Comparing Documents...
                  </>
                ) : (
                  <>
                    <GitCompare size={18} aria-hidden="true" />
                    Compare Documents
                  </>
                )}
              </button>
              {!file1 || !file2 ? (
                <p className="text-xs text-slate-500 mt-3">Upload both documents to compare</p>
              ) : null}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-white">Comparison Results</h2>
              <button
                onClick={handleReset}
                className="btn-ghost gap-2"
                aria-label="Start a new comparison"
              >
                <RefreshCw size={14} aria-hidden="true" />
                New Comparison
              </button>
            </div>
            <ComparisonView result={result} />
          </motion.div>
        )}
      </div>
    </div>
  )
}
