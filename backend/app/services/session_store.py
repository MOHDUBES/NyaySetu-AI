"""
NyaySetu AI — In-memory document session store.
Holds parsed documents and their embeddings for the duration of the session.
In production, replace with Redis or Supabase storage for persistence.
"""
from dataclasses import dataclass, field
import threading
import time
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
    created_at: float = field(default_factory=time.time)
    last_accessed: float = field(default_factory=time.time)


# High-efficiency, bounded in-process store with thread-safety and TTL eviction
_store: dict[str, DocumentSession] = {}
_lock = threading.Lock()
MAX_SESSIONS: int = 50
SESSION_TTL_SECONDS: float = 7200.0  # 2-hour TTL eviction


def cleanup_expired_sessions() -> int:
    """Evicts expired sessions to guarantee constant O(1) memory bound."""
    now = time.time()
    with _lock:
        expired_keys = [
            k for k, v in _store.items()
            if (now - v.last_accessed) > SESSION_TTL_SECONDS
        ]
        for k in expired_keys:
            _store.pop(k, None)
        return len(expired_keys)


def store_session(session: DocumentSession) -> None:
    """Store session with automatic LRU and TTL eviction."""
    session.last_accessed = time.time()
    with _lock:
        # 1. Purge expired sessions
        now = time.time()
        expired = [k for k, v in _store.items() if (now - v.last_accessed) > SESSION_TTL_SECONDS]
        for k in expired:
            _store.pop(k, None)

        # 2. If at capacity, evict least recently accessed (LRU)
        if len(_store) >= MAX_SESSIONS and session.document_id not in _store:
            oldest_key = min(_store.keys(), key=lambda k: _store[k].last_accessed)
            _store.pop(oldest_key, None)

        _store[session.document_id] = session


def get_session(document_id: str) -> Optional[DocumentSession]:
    """Retrieve session and update its LRU access timestamp."""
    with _lock:
        session = _store.get(document_id)
        if session is None:
            return None
        # Check TTL
        if (time.time() - session.last_accessed) > SESSION_TTL_SECONDS:
            _store.pop(document_id, None)
            return None
        session.last_accessed = time.time()
        return session


def delete_session(document_id: str) -> None:
    with _lock:
        _store.pop(document_id, None)


def list_sessions() -> list[str]:
    with _lock:
        return list(_store.keys())


def clear_all_sessions() -> None:
    """Helper for unit test teardown."""
    with _lock:
        _store.clear()
