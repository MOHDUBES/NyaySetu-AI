"""
NyaySetu AI — Document Comparison Service
Structural diff + AI semantic summary of two legal documents.
"""
import difflib
import uuid

from app.models.schemas import DiffSection
from app.services.llm import compare_documents_ai
from app.services.parser import ParsedDocument


def _split_into_paragraphs(text: str) -> list[str]:
    """Split text into non-empty paragraphs for comparison."""
    return [p.strip() for p in text.split("\n\n") if p.strip()]


def structural_diff(doc1: ParsedDocument, doc2: ParsedDocument) -> list[DiffSection]:
    """
    Perform a structural diff between two documents at the paragraph level.
    Returns a list of DiffSection objects annotating what changed.
    """
    paras1 = _split_into_paragraphs(doc1.text)
    paras2 = _split_into_paragraphs(doc2.text)

    # Use SequenceMatcher for paragraph-level diff
    matcher = difflib.SequenceMatcher(None, paras1, paras2, autojunk=False)
    diff_sections: list[DiffSection] = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for para in paras1[i1:i2]:
                if len(para) > 30:  # skip trivially short paragraphs
                    diff_sections.append(DiffSection(
                        section_title=f"Unchanged",
                        doc1_text=para,
                        doc2_text=para,
                        change_type="unchanged",
                    ))
        elif tag == "replace":
            old_block = "\n\n".join(paras1[i1:i2])
            new_block = "\n\n".join(paras2[j1:j2])
            diff_sections.append(DiffSection(
                section_title="Modified Section",
                doc1_text=old_block,
                doc2_text=new_block,
                change_type="modified",
            ))
        elif tag == "delete":
            removed = "\n\n".join(paras1[i1:i2])
            diff_sections.append(DiffSection(
                section_title="Removed in Document 2",
                doc1_text=removed,
                doc2_text="[Not present in Document 2]",
                change_type="removed",
            ))
        elif tag == "insert":
            added = "\n\n".join(paras2[j1:j2])
            diff_sections.append(DiffSection(
                section_title="Added in Document 2",
                doc1_text="[Not present in Document 1]",
                doc2_text=added,
                change_type="added",
            ))

    # Limit to 50 sections for reasonable response size
    return diff_sections[:50]


def compare_documents(
    doc1: ParsedDocument,
    doc2: ParsedDocument,
    doc1_name: str = "Document 1",
    doc2_name: str = "Document 2",
) -> dict:
    """
    Full comparison pipeline: structural diff + AI semantic analysis.
    Returns the complete comparison result dict.
    """
    diff_sections = structural_diff(doc1, doc2)

    # Serialize diff for AI analysis (only changed sections)
    changed = [
        {
            "change_type": s.change_type,
            "doc1": s.doc1_text[:300],
            "doc2": s.doc2_text[:300],
        }
        for s in diff_sections
        if s.change_type != "unchanged"
    ]

    ai_result = compare_documents_ai(changed, doc1_name, doc2_name)

    return {
        "doc1_name": doc1_name,
        "doc2_name": doc2_name,
        "diff_sections": [s.model_dump() for s in diff_sections],
        "ai_summary": ai_result.get("ai_summary", ""),
        "ai_summary_hi": ai_result.get("ai_summary_hi"),
        "favorable_to_user": ai_result.get("favorable_to_user", "depends"),
        "favorable_to_user_hi": ai_result.get("favorable_to_user_hi"),
        "key_differences": ai_result.get("key_differences", []),
        "key_differences_hi": ai_result.get("key_differences_hi", []),
    }
