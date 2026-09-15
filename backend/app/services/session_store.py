"""
NyaySetu AI — In-memory document session store.
Holds parsed documents and their embeddings for the duration of the session.
In production, replace with Redis or Supabase storage for persistence.
"""
from dataclasses import dataclass, field
from typing import Optional

from app.services.embeddings import TextChunk
from app.services.parser import ParsedDocument


@dataclass
class DocumentSession:
    document_id: str
    filename: str
    parsed: ParsedDocument
    chunks: list[TextChunk] = field(default_factory=list)
    summary: Optional[dict] = None
    clauses: Optional[list] = None


# Simple in-process store (per-worker; fine for demo/single-worker deployment)
_store: dict[str, DocumentSession] = {}


def store_session(session: DocumentSession) -> None:
    _store[session.document_id] = session


def get_session(document_id: str) -> Optional[DocumentSession]:
    return _store.get(document_id)


def delete_session(document_id: str) -> None:
    _store.pop(document_id, None)


def list_sessions() -> list[str]:
    return list(_store.keys())
