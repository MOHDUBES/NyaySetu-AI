"""
NyaySetu AI — Documents Router
File upload, parsing, and document management endpoints.
"""
import uuid
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import DocumentMetadata, UploadResponse
from app.services.embeddings import chunk_text, generate_embeddings
from app.services.parser import parse_document
from app.services.session_store import DocumentSession, store_session

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB


@router.post("/upload", response_model=UploadResponse)
@limiter.limit("10/hour")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
) -> UploadResponse:
    """
    Upload a legal document (PDF or DOCX) for analysis.
    - Validates file type via magic bytes
    - Parses text and structure
    - Generates embeddings for RAG chat
    - Stores in session store
    """
    if file.content_type not in (
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",  # some browsers send this for DOCX
    ):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Only PDF and DOCX are accepted.",
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_BYTES // (1024*1024)} MB.",
        )

    filename = file.filename or "document"

    try:
        parsed = parse_document(file_bytes, filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse document: {str(e)}")

    # Generate chunks and embed top initial chunks quickly for immediate readiness
    chunks = chunk_text(parsed.text)
    if chunks:
        # Embed first 10 key chunks fast (<1s)
        initial_chunks = generate_embeddings(chunks[:10])
        chunks = initial_chunks + chunks[10:]

    document_id = str(uuid.uuid4())
    session = DocumentSession(
        document_id=document_id,
        filename=filename,
        parsed=parsed,
        chunks=chunks,
    )
    store_session(session)

    return UploadResponse(
        document_id=document_id,
        filename=filename,
    )


@router.get("/{document_id}", response_model=DocumentMetadata)
async def get_document_metadata(document_id: str, request: Request) -> DocumentMetadata:
    """Get metadata for a previously uploaded document."""
    from app.services.session_store import get_session
    session = get_session(document_id)
    if not session:
        raise HTTPException(status_code=404, detail="Document not found. It may have expired.")

    return DocumentMetadata(
        id=document_id,
        filename=session.filename,
        file_type=session.parsed.metadata.get("source", "unknown"),
        page_count=session.parsed.page_count,
        word_count=session.parsed.word_count,
    )


@router.delete("/{document_id}")
async def delete_document(document_id: str, request: Request):
    """Delete a document session and its embeddings."""
    from app.services.session_store import delete_session, get_session
    session = get_session(document_id)
    if not session:
        raise HTTPException(status_code=404, detail="Document not found.")
    delete_session(document_id)
    return {"message": "Document deleted successfully."}
