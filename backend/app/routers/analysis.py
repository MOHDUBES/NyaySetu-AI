"""
NyaySetu AI — Analysis Router
Document summarization, clause detection, checklist, and lawyer brief endpoints.
"""
import asyncio
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import (
    ChecklistResponse,
    ClausesResponse,
    LawyerBriefResponse,
    SummaryResponse,
)
from app.services.clause_detector import detect_clauses, summarize_clause_counts
from app.services.llm import generate_checklist, generate_lawyer_brief, summarize_document
from app.services.session_store import get_session

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/{document_id}/summarize", response_model=SummaryResponse)
@limiter.limit("20/hour")
async def summarize(document_id: str, request: Request) -> SummaryResponse:
    """
    Generate a plain-language summary and section explanations for a document.
    Reuses cached summary if already generated for instant 0ms response.
    """
    session = get_session(document_id)
    if not session:
        raise HTTPException(status_code=404, detail="Document not found.")

    if session.summary:
        result = session.summary
    else:
        try:
            result = await asyncio.to_thread(summarize_document, session.parsed.text, session.filename)
            session.summary = result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

    sections = [
        {
            "title": s.get("title", "Section"),
            "content": s.get("content", ""),
            "plain_language": s.get("plain_language", ""),
            "plain_language_hi": s.get("plain_language_hi", ""),
        }
        for s in result.get("sections", [])
    ]

    return SummaryResponse(
        document_id=document_id,
        overall_summary=result.get("overall_summary", ""),
        overall_summary_hi=result.get("overall_summary_hi", ""),
        document_type=result.get("document_type", "Legal Document"),
        sections=sections,
        jargon_terms=result.get("jargon_terms", {}),
        jargon_terms_hi=result.get("jargon_terms_hi", {}),
    )


@router.post("/{document_id}/clauses", response_model=ClausesResponse)
@limiter.limit("20/hour")
async def detect_document_clauses(document_id: str, request: Request) -> ClausesResponse:
    """
    Detect and categorize clauses in the document by type (obligation/risk/deadline/financial).
    Non-blocking execution with in-memory session caching.
    """
    session = get_session(document_id)
    if not session:
        raise HTTPException(status_code=404, detail="Document not found.")

    if session.clauses:
        clauses = session.clauses
    else:
        try:
            clauses = await asyncio.to_thread(detect_clauses, session.parsed.text)
            session.clauses = clauses
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Clause detection failed: {str(e)}")

    counts = summarize_clause_counts(clauses)

    return ClausesResponse(
        document_id=document_id,
        clauses=clauses,
        total_risks=counts.get("risk", 0),
        total_obligations=counts.get("obligation", 0),
        total_deadlines=counts.get("deadline", 0),
        total_financial=counts.get("financial", 0),
    )


@router.post("/{document_id}/checklist", response_model=ChecklistResponse)
@limiter.limit("20/hour")
async def generate_document_checklist(document_id: str, request: Request) -> ChecklistResponse:
    """
    Generate a personalized action checklist: things to verify, questions for a lawyer, deadlines.
    """
    session = get_session(document_id)
    if not session:
        raise HTTPException(status_code=404, detail="Document not found.")

    summary = session.summary or {}
    clauses = [c.model_dump() for c in (session.clauses or [])]

    if not summary:
        try:
            summary = await asyncio.to_thread(summarize_document, session.parsed.text, session.filename)
            session.summary = summary
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate checklist context: {str(e)}")

    try:
        result = await asyncio.to_thread(generate_checklist, summary, clauses)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checklist generation failed: {str(e)}")

    return ChecklistResponse(
        document_id=document_id,
        items_to_verify=result.get("items_to_verify", []),
        questions_for_lawyer=result.get("questions_for_lawyer", []),
        deadlines_to_track=result.get("deadlines_to_track", []),
    )


@router.post("/{document_id}/lawyer-brief", response_model=LawyerBriefResponse)
@limiter.limit("20/hour")
async def generate_document_lawyer_brief(document_id: str, request: Request) -> LawyerBriefResponse:
    """
    Generate a structured brief to help the user prepare for a legal consultation.
    """
    session = get_session(document_id)
    if not session:
        raise HTTPException(status_code=404, detail="Document not found.")

    summary = session.summary or {}
    clauses = [c.model_dump() for c in (session.clauses or [])]

    if not summary:
        try:
            summary = await asyncio.to_thread(summarize_document, session.parsed.text, session.filename)
            session.summary = summary
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate brief context: {str(e)}")

    try:
        result = await asyncio.to_thread(generate_lawyer_brief, summary, clauses)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lawyer brief generation failed: {str(e)}")

    return LawyerBriefResponse(
        document_id=document_id,
        document_type=result.get("document_type", "Legal Document"),
        executive_summary=result.get("executive_summary", ""),
        key_concerns=result.get("key_concerns", []),
        questions_to_ask=result.get("questions_to_ask", []),
        important_dates=result.get("important_dates", []),
        financial_obligations=result.get("financial_obligations", []),
    )
