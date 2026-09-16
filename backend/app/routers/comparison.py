"""
NyaySetu AI — Comparison Router
Upload two documents and get a structural + AI-powered comparison.
"""
from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import ComparisonResponse
from app.services.comparison import compare_documents
from app.services.parser import parse_document

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB per file for comparison


@router.post("", response_model=ComparisonResponse)
@limiter.limit("60/hour")
async def compare_two_documents(
    request: Request,
    file1: UploadFile = File(..., description="First document (PDF or DOCX)"),
    file2: UploadFile = File(..., description="Second document (PDF or DOCX)"),
) -> ComparisonResponse:
    """
    Compare two legal documents and return:
    - Structural diff sections (added/removed/modified)
    - AI-generated summary of key differences
    - Which document appears more favorable to the user
    """
    file1_bytes = await file1.read()
    file2_bytes = await file2.read()

    if len(file1_bytes) > MAX_FILE_SIZE_BYTES or len(file2_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Each file must be under {MAX_FILE_SIZE_BYTES // (1024*1024)} MB.",
        )

    try:
        doc1 = parse_document(file1_bytes, file1.filename or "Document 1")
        doc2 = parse_document(file2_bytes, file2.filename or "Document 2")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse documents: {str(e)}")

    try:
        result = compare_documents(
            doc1, doc2,
            doc1_name=file1.filename or "Document 1",
            doc2_name=file2.filename or "Document 2",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

    return ComparisonResponse(**result)


