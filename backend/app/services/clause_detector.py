"""
NyaySetu AI — Clause Detection Service
Detects and categorizes legal clauses using Gemini LLM.
"""
import uuid
from typing import Any

from app.models.schemas import ClauseItem, ClauseType
from app.services.llm import extract_clauses


def detect_clauses(text: str) -> list[ClauseItem]:
    """
    Main entry point for clause detection.
    Calls LLM, validates output, and returns typed ClauseItem list.
    """
    raw_clauses = extract_clauses(text)
    items: list[ClauseItem] = []

    valid_types = {ct.value for ct in ClauseType}

    for raw in raw_clauses:
        clause_type_str = raw.get("clause_type", "obligation").lower()

        # Normalize unknown types to "obligation"
        if clause_type_str not in valid_types:
            clause_type_str = "obligation"

        items.append(ClauseItem(
            id=str(uuid.uuid4()),
            text=str(raw.get("text", ""))[:500],
            clause_type=ClauseType(clause_type_str),
            explanation=str(raw.get("explanation", "")),
            explanation_hi=raw.get("explanation_hi"),
            start_char=int(raw.get("start_char", 0)),
            end_char=int(raw.get("end_char", 0)),
        ))

    return items


def summarize_clause_counts(clauses: list[ClauseItem]) -> dict[str, int]:
    """Return a summary count of clauses by type."""
    counts: dict[str, int] = {ct.value: 0 for ct in ClauseType}
    for clause in clauses:
        counts[clause.clause_type.value] += 1
    return counts
