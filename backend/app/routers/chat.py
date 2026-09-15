"""
NyaySetu AI — Chat Router
RAG-based document Q&A with scope enforcement.
"""
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import ChatRequest, ChatResponse
from app.services.embeddings import retrieve_relevant_chunks
from app.services.llm import answer_question
from app.services.session_store import get_session

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/{document_id}/message", response_model=ChatResponse)
@limiter.limit("60/hour")
async def chat_with_document(
    document_id: str,
    body: ChatRequest,
    request: Request,
) -> ChatResponse:
    """
    RAG-based chat scoped to the uploaded document.
    Retrieves relevant document chunks, answers via Gemini.
    Refuses to answer questions outside the document scope.
    """
    session = get_session(document_id)
    if not session:
        raise HTTPException(status_code=404, detail="Document not found.")

    question = body.message.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Check if chunks with embeddings are available
    embedded_chunks = [c for c in session.chunks if c.embedding is not None]
    if not embedded_chunks:
        raise HTTPException(
            status_code=503,
            detail="Document embeddings not available. Please re-upload the document.",
        )

    # Retrieve relevant chunks via semantic search
    relevant_chunks = retrieve_relevant_chunks(question, embedded_chunks, k=5)

    if not relevant_chunks:
        return ChatResponse(
            answer=(
                "I couldn't find relevant information in this document to answer your question. "
                "You may want to consult a legal professional for this specific question."
            ),
            sources=[],
            is_out_of_scope=True,
        )

    try:
        result = answer_question(
            question,
            relevant_chunks,
            session.filename,
            language=body.language or "auto"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate answer: {str(e)}")

    return ChatResponse(
        answer=result["answer"],
        answer_hi=result.get("answer_hi"),
        sources=result["sources"],
        is_out_of_scope=result["is_out_of_scope"],
    )
