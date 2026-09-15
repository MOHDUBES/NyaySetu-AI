"""
NyaySetu AI — pytest tests for clause detection service.
Run with: pytest backend/app/tests/test_clause_detector.py -v
"""
import pytest

from app.models.schemas import ClauseItem, ClauseType
from app.services.clause_detector import detect_clauses, summarize_clause_counts


# ── Fixtures ──────────────────────────────────────────────────────────────────
MOCK_RAW_CLAUSES = [
    {
        "text": "The Tenant shall pay monthly rent of INR 15,000 on the 1st.",
        "clause_type": "obligation",
        "explanation": "This clause typically means you are required to pay rent on time each month.",
    },
    {
        "text": "Late payment will result in a penalty of 5% per day.",
        "clause_type": "risk",
        "explanation": "This clause could mean significant financial penalties for late payment.",
    },
    {
        "text": "The agreement expires on December 31, 2025.",
        "clause_type": "deadline",
        "explanation": "This sets a hard expiry date for the agreement.",
    },
    {
        "text": "Security deposit of INR 45,000 is required upfront.",
        "clause_type": "financial",
        "explanation": "This clause means you need to pay 3 months' rent as a deposit.",
    },
    {
        "text": "Arbitrary unknown clause.",
        "clause_type": "UNKNOWN_TYPE",  # Should be normalized
        "explanation": "This is an unknown clause type.",
    },
]


# ── Mock LLM ──────────────────────────────────────────────────────────────────
def _mock_extract_clauses(text: str) -> list[dict]:
    """Return predictable mock data without calling Gemini."""
    return MOCK_RAW_CLAUSES


# ── ClauseDetector Tests ──────────────────────────────────────────────────────
class TestDetectClauses:
    def test_returns_clause_items(self, monkeypatch):
        monkeypatch.setattr("app.services.clause_detector.extract_clauses", _mock_extract_clauses)
        clauses = detect_clauses("Sample contract text.")
        assert isinstance(clauses, list)
        assert all(isinstance(c, ClauseItem) for c in clauses)

    def test_clause_has_required_fields(self, monkeypatch):
        monkeypatch.setattr("app.services.clause_detector.extract_clauses", _mock_extract_clauses)
        clauses = detect_clauses("Sample contract text.")
        for clause in clauses:
            assert clause.id  # UUID generated
            assert clause.text
            assert clause.explanation
            assert clause.clause_type in ClauseType

    def test_normalizes_unknown_clause_type(self, monkeypatch):
        monkeypatch.setattr("app.services.clause_detector.extract_clauses", _mock_extract_clauses)
        clauses = detect_clauses("Sample text.")
        # The UNKNOWN_TYPE clause should be normalized to "obligation"
        types = [c.clause_type for c in clauses]
        assert ClauseType.OBLIGATION in types
        assert all(t in ClauseType for t in types)

    def test_handles_all_clause_types(self, monkeypatch):
        monkeypatch.setattr("app.services.clause_detector.extract_clauses", _mock_extract_clauses)
        clauses = detect_clauses("Sample text.")
        types = {c.clause_type for c in clauses}
        assert ClauseType.OBLIGATION in types
        assert ClauseType.RISK in types
        assert ClauseType.DEADLINE in types
        assert ClauseType.FINANCIAL in types

    def test_truncates_long_clause_text(self, monkeypatch):
        long_clause = [{
            "text": "X" * 1000,  # 1000 chars, should be truncated to 500
            "clause_type": "obligation",
            "explanation": "Test explanation.",
        }]
        monkeypatch.setattr("app.services.clause_detector.extract_clauses", lambda t: long_clause)
        clauses = detect_clauses("text")
        assert len(clauses[0].text) <= 500

    def test_handles_empty_clause_list(self, monkeypatch):
        monkeypatch.setattr("app.services.clause_detector.extract_clauses", lambda t: [])
        clauses = detect_clauses("Empty document.")
        assert clauses == []

    def test_each_clause_has_unique_id(self, monkeypatch):
        monkeypatch.setattr("app.services.clause_detector.extract_clauses", _mock_extract_clauses)
        clauses = detect_clauses("text")
        ids = [c.id for c in clauses]
        assert len(ids) == len(set(ids))  # All IDs are unique


# ── SummarizeClauseCounts Tests ───────────────────────────────────────────────
class TestSummarizeClauseCounts:
    def test_counts_all_types(self, monkeypatch):
        monkeypatch.setattr("app.services.clause_detector.extract_clauses", _mock_extract_clauses)
        clauses = detect_clauses("text")
        counts = summarize_clause_counts(clauses)
        assert "obligation" in counts
        assert "risk" in counts
        assert "deadline" in counts
        assert "financial" in counts

    def test_counts_are_non_negative(self, monkeypatch):
        monkeypatch.setattr("app.services.clause_detector.extract_clauses", _mock_extract_clauses)
        clauses = detect_clauses("text")
        counts = summarize_clause_counts(clauses)
        assert all(v >= 0 for v in counts.values())

    def test_empty_clauses_returns_zero_counts(self):
        counts = summarize_clause_counts([])
        assert all(v == 0 for v in counts.values())
