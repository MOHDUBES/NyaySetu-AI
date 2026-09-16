"""
Unit tests for Session Store (Bounded LRU & TTL Eviction).
"""
import time
import pytest

from app.services.session_store import (
    DocumentSession,
    store_session,
    get_session,
    delete_session,
    list_sessions,
    clear_all_sessions,
)
from app.services.parser import ParsedDocument


@pytest.fixture(autouse=True)
def clean_store():
    clear_all_sessions()
    yield
    clear_all_sessions()


def _create_mock_session(doc_id: str) -> DocumentSession:
    parsed = ParsedDocument(
        text="Sample text content for legal document",
        sections=[],
        page_count=1,
        word_count=6,
        metadata={},
    )
    return DocumentSession(
        document_id=doc_id,
        filename=f"{doc_id}.txt",
        parsed=parsed,
    )


def test_store_and_get_session():
    session = _create_mock_session("doc-101")
    store_session(session)

    retrieved = get_session("doc-101")
    assert retrieved is not None
    assert retrieved.document_id == "doc-101"
    assert retrieved.filename == "doc-101.txt"
    assert "doc-101" in list_sessions()


def test_delete_session():
    session = _create_mock_session("doc-102")
    store_session(session)
    assert get_session("doc-102") is not None

    delete_session("doc-102")
    assert get_session("doc-102") is None
    assert "doc-102" not in list_sessions()


def test_session_ttl_expiration(monkeypatch):
    session = _create_mock_session("doc-103")
    store_session(session)

    # Fast-forward time by 7300 seconds (greater than 7200s TTL)
    future_time = time.time() + 7300.0
    monkeypatch.setattr(time, "time", lambda: future_time)

    # Should return None because TTL has passed
    assert get_session("doc-103") is None


def test_lru_capacity_eviction(monkeypatch):
    # Temporarily set max sessions to 3 for testing
    import app.services.session_store as ss
    monkeypatch.setattr(ss, "MAX_SESSIONS", 3)

    s1 = _create_mock_session("doc-1")
    s2 = _create_mock_session("doc-2")
    s3 = _create_mock_session("doc-3")

    store_session(s1)
    store_session(s2)
    store_session(s3)

    assert len(list_sessions()) == 3

    # Now insert a 4th session -> should evict the oldest (doc-1)
    s4 = _create_mock_session("doc-4")
    store_session(s4)

    assert len(list_sessions()) == 3
    assert get_session("doc-1") is None
    assert get_session("doc-4") is not None
