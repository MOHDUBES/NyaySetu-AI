import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, FileText, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onFileAccepted: (file: File) => void
  label?: string
  sublabel?: string
  isLoading?: boolean
  error?: string | null
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

/**
 * FileUpload — Accessible drag-and-drop file upload component.
 * Supports PDF and DOCX. Validates client-side before upload.
 * WCAG: keyboard operable, ARIA labels, error states announced.
 */
export default function FileUpload({
  onFileAccepted,
  label = 'Upload Legal Document',
  sublabel = 'PDF or DOCX up to 20 MB',
  isLoading = false,
  error = null,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setClientError(null)

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors[0]?.code === 'file-too-large') {
          setClientError('File is too large. Maximum size is 20 MB.')
        } else {
          setClientError('Invalid file type. Only PDF and DOCX files are accepted.')
        }
        return
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setSelectedFile(file)
        onFileAccepted(file)
      }
    },
    [onFileAccepted]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled: isLoading,
  })

  const displayError = error || clientError

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative rounded-2xl border-2 border-dashed p-8 text-center
          transition-all duration-200 cursor-pointer
          focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none
          ${isDragActive && !isDragReject
            ? 'border-gold-400 bg-gold-500/10'
            : isDragReject || displayError
              ? 'border-red-500/60 bg-red-500/5'
              : selectedFile
                ? 'border-emerald-500/60 bg-emerald-500/5'
                : 'border-surface-border bg-surface-card hover:border-gold-500/50 hover:bg-gold-500/5'
          }
          ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
        `}
        role="button"
        tabIndex={0}
        aria-label={`${label}. ${sublabel}. ${selectedFile ? `Selected: ${selectedFile.name}` : 'Click or drag and drop a file here'}`}
        aria-disabled={isLoading}
        aria-describedby={displayError ? 'upload-error' : undefined}
      >
        <input
          {...getInputProps()}
          aria-label="File input"
          data-testid="file-input"
        />

        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-2 border-gold-500 border-t-transparent"
              aria-label="Uploading file..."
            />
          ) : selectedFile ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-3 bg-emerald-500/20 rounded-full"
            >
              <CheckCircle2 size={28} className="text-emerald-400" aria-hidden="true" />
            </motion.div>
          ) : (
            <motion.div
              animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
              className="p-3 bg-gold-500/10 rounded-full"
            >
              <Upload size={28} className="text-gold-400" aria-hidden="true" />
            </motion.div>
          )}

          <div>
            <p className="font-semibold text-white mb-1">
              {isLoading
                ? 'Processing document...'
                : selectedFile
                  ? 'Document ready!'
                  : isDragActive
                    ? 'Drop it here!'
                    : label}
            </p>
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <FileText size={14} aria-hidden="true" />
                <span>{selectedFile.name}</span>
                <span>({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {isDragActive ? 'Release to upload' : `Drag & drop or click — ${sublabel}`}
              </p>
            )}
          </div>

          {selectedFile && !isLoading && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedFile(null)
                setClientError(null)
              }}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
              aria-label="Remove selected file"
            >
              <X size={12} /> Remove file
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          id="upload-error"
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30"
        >
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-300">{displayError}</p>
        </motion.div>
      )}
    </div>
  )
}
