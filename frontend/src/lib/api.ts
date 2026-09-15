import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // 2 min — LLM calls can be slow
  headers: { 'Content-Type': 'application/json' },
})

// ── Types ─────────────────────────────────────────────────────────────────────
export type ClauseType = 'obligation' | 'risk' | 'deadline' | 'financial'

export interface ClauseItem {
  id: string
  text: string
  clause_type: ClauseType
  explanation: string
  explanation_hi?: string
  start_char: number
  end_char: number
}

export interface DocumentSection {
  title: string
  content: string
  plain_language: string
  plain_language_hi?: string
}

export interface SummaryResponse {
  document_id: string
  overall_summary: string
  overall_summary_hi?: string
  document_type: string
  sections: DocumentSection[]
  jargon_terms: Record<string, string>
  jargon_terms_hi?: Record<string, string>
  disclaimer: string
}

export interface ClausesResponse {
  document_id: string
  clauses: ClauseItem[]
  total_risks: number
  total_obligations: number
  total_deadlines: number
  total_financial: number
  disclaimer: string
}

export interface ChecklistItem {
  category: string
  text: string
  priority: 'high' | 'medium' | 'low'
}

export interface ChecklistResponse {
  document_id: string
  items_to_verify: ChecklistItem[]
  questions_for_lawyer: ChecklistItem[]
  deadlines_to_track: ChecklistItem[]
  disclaimer: string
}

export interface LawyerBriefResponse {
  document_id: string
  document_type: string
  executive_summary: string
  executive_summary_hi?: string
  key_concerns: string[]
  key_concerns_hi?: string[]
  questions_to_ask: string[]
  questions_to_ask_hi?: string[]
  important_dates: string[]
  financial_obligations: string[]
  disclaimer: string
}

export interface ChatResponse {
  answer: string
  answer_hi?: string
  sources: string[]
  is_out_of_scope: boolean
  disclaimer: string
}

export interface DiffSection {
  section_title: string
  doc1_text: string
  doc2_text: string
  change_type: 'added' | 'removed' | 'modified' | 'unchanged'
  ai_note?: string
}

export interface ComparisonResponse {
  doc1_name: string
  doc2_name: string
  diff_sections: DiffSection[]
  ai_summary: string
  favorable_to_user: string
  key_differences: string[]
  disclaimer: string
}

// ── API Functions ─────────────────────────────────────────────────────────────
export async function uploadDocument(file: File): Promise<{ document_id: string; filename: string }> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/api/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function summarizeDocument(documentId: string): Promise<SummaryResponse> {
  const res = await api.post(`/api/analysis/${documentId}/summarize`)
  return res.data
}

export async function detectClauses(documentId: string): Promise<ClausesResponse> {
  const res = await api.post(`/api/analysis/${documentId}/clauses`)
  return res.data
}

export async function generateChecklist(documentId: string): Promise<ChecklistResponse> {
  const res = await api.post(`/api/analysis/${documentId}/checklist`)
  return res.data
}

export async function generateLawyerBrief(documentId: string): Promise<LawyerBriefResponse> {
  const res = await api.post(`/api/analysis/${documentId}/lawyer-brief`)
  return res.data
}

export async function chatWithDocument(
  documentId: string,
  message: string,
  history: Array<{ role: string; content: string }> = [],
  language: string = 'auto'
): Promise<ChatResponse> {
  const res = await api.post(`/api/chat/${documentId}/message`, { message, history, language })
  return res.data
}

export async function compareDocuments(
  file1: File,
  file2: File
): Promise<ComparisonResponse> {
  const form = new FormData()
  form.append('file1', file1)
  form.append('file2', file2)
  const res = await api.post('/api/comparison', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
