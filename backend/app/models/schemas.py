"""
NyaySetu AI — Pydantic Schemas / Models
All request and response shapes for the API.
"""
from enum import Enum
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── Clause Types ──────────────────────────────────────────────────────────────
class ClauseType(str, Enum):
    OBLIGATION = "obligation"
    RISK = "risk"
    DEADLINE = "deadline"
    FINANCIAL = "financial"


# ── Document ──────────────────────────────────────────────────────────────────
class DocumentMetadata(BaseModel):
    id: str
    filename: str
    file_type: str
    page_count: Optional[int] = None
    word_count: Optional[int] = None
    upload_timestamp: Optional[str] = None


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    message: str = "Document uploaded and parsed successfully."
    disclaimer: str = (
        "This analysis is informational only. Not legal advice."
    )


# ── Analysis ──────────────────────────────────────────────────────────────────
class ClauseItem(BaseModel):
    id: str
    text: str
    clause_type: ClauseType
    explanation: str = Field(
        description="Plain-language explanation of why this clause matters (English)"
    )
    explanation_hi: Optional[str] = Field(
        default=None,
        description="Plain-language explanation in Hindi / Hinglish for accessibility"
    )
    start_char: int = 0
    end_char: int = 0


class DocumentSection(BaseModel):
    title: str
    content: str
    plain_language: str = Field(
        description="Plain-language explanation of this section (English)"
    )
    plain_language_hi: Optional[str] = Field(
        default=None,
        description="Plain-language explanation in Hindi / Hinglish"
    )


class SummaryResponse(BaseModel):
    document_id: str
    overall_summary: str
    overall_summary_hi: Optional[str] = Field(
        default=None,
        description="Plain-language summary in conversational Hindi / Hinglish"
    )
    document_type: str
    sections: list[DocumentSection]
    jargon_terms: dict[str, str] = Field(
        default_factory=dict,
        description="Map of legal term → plain-language definition (English)",
    )
    jargon_terms_hi: dict[str, str] = Field(
        default_factory=dict,
        description="Map of legal term → plain-language definition in Hindi / Hinglish",
    )
    disclaimer: str = (
        "This summary is for informational purposes only. "
        "Not legal advice. Consult a licensed professional. / "
        "यह केवल सूचनात्मक उद्देश्यों के लिए है, कानूनी सलाह नहीं है।"
    )


class ClausesResponse(BaseModel):
    document_id: str
    clauses: list[ClauseItem]
    total_risks: int
    total_obligations: int
    total_deadlines: int
    total_financial: int
    disclaimer: str = (
        "Clause detection is informational only. Not legal advice."
    )


class ChecklistItem(BaseModel):
    category: str  # "verify", "ask_lawyer", "deadline"
    text: str
    priority: str = "medium"  # "high", "medium", "low"


class ChecklistResponse(BaseModel):
    document_id: str
    items_to_verify: list[ChecklistItem]
    questions_for_lawyer: list[ChecklistItem]
    deadlines_to_track: list[ChecklistItem]
    disclaimer: str = (
        "This checklist is informational only. Not legal advice."
    )


class LawyerBriefResponse(BaseModel):
    document_id: str
    document_type: str
    executive_summary: str
    executive_summary_hi: Optional[str] = None
    key_concerns: list[str]
    key_concerns_hi: Optional[list[str]] = None
    questions_to_ask: list[str]
    questions_to_ask_hi: Optional[list[str]] = None
    important_dates: list[str]
    financial_obligations: list[str]
    disclaimer: str = (
        "This brief helps you prepare for a consultation but is NOT legal advice. "
        "A licensed attorney should review your situation. / "
        "यह वकील से परामर्श के लिए तैयारी प्रपत्र है, कानूनी सलाह नहीं।"
    )


# ── Chat ──────────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list)
    language: Optional[str] = Field(default="auto", description="'en', 'hi', or 'auto'")


class ChatResponse(BaseModel):
    answer: str
    answer_hi: Optional[str] = None
    sources: list[str] = Field(
        default_factory=list,
        description="Relevant document excerpts used to answer",
    )
    is_out_of_scope: bool = False
    disclaimer: str = (
        "This answer is based on the document content only and is for "
        "informational purposes. Not legal advice."
    )


# ── Comparison ────────────────────────────────────────────────────────────────
class DiffSection(BaseModel):
    section_title: str
    doc1_text: str
    doc2_text: str
    change_type: str  # "added", "removed", "modified", "unchanged"
    ai_note: Optional[str] = None


class ComparisonResponse(BaseModel):
    doc1_name: str
    doc2_name: str
    diff_sections: list[DiffSection]
    ai_summary: str
    ai_summary_hi: Optional[str] = None
    favorable_to_user: Optional[str] = None  # "doc1" | "doc2" | "neither" | "depends"
    favorable_to_user_hi: Optional[str] = None
    key_differences: list[str]
    key_differences_hi: Optional[list[str]] = None
    disclaimer: str = (
        "This comparison is informational only. Not legal advice. / "
        "यह तुलना केवल सूचना के उद्देश्य से है, कानूनी सलाह नहीं।"
    )


# ── Error ─────────────────────────────────────────────────────────────────────
class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
