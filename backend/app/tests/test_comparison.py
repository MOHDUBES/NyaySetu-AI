"""
Unit tests for Document Comparison Service and Diff Detection.
"""
from app.services.comparison import compare_documents, structural_diff
from app.services.parser import ParsedDocument


def test_structural_diff_identical_documents():
    text = (
        "This is paragraph one of the lease agreement.\n\n"
        "This is paragraph two outlining the rent of Rs 25,000.\n\n"
        "This is paragraph three specifying the notice period."
    )
    doc1 = ParsedDocument(text=text, page_count=1, word_count=30)
    doc2 = ParsedDocument(text=text, page_count=1, word_count=30)

    diffs = structural_diff(doc1, doc2)
    # Identical documents should only produce unchanged sections
    changed = [d for d in diffs if d.change_type != "unchanged"]
    assert len(changed) == 0


def test_structural_diff_modified_and_added():
    text1 = (
        "1. Rent shall be Rs. 20,000 payable on 5th of each month.\n\n"
        "2. Notice period is 30 days for either party."
    )
    text2 = (
        "1. Rent shall be Rs. 25,000 payable on 1st of each month.\n\n"
        "2. Notice period is 30 days for either party.\n\n"
        "3. Tenant must pay maintenance of Rs. 3,000 separately."
    )
    doc1 = ParsedDocument(text=text1, page_count=1, word_count=20)
    doc2 = ParsedDocument(text=text2, page_count=1, word_count=30)

    diffs = structural_diff(doc1, doc2)
    types = [d.change_type for d in diffs]
    assert "modified" in types or "added" in types


def test_compare_documents_complete_pipeline():
    text1 = "Old clause 1 for residential tenancy agreement."
    text2 = "New revised clause 1 with updated rental terms and deposit increase."
    doc1 = ParsedDocument(text=text1, page_count=1, word_count=10)
    doc2 = ParsedDocument(text=text2, page_count=1, word_count=12)

    result = compare_documents(doc1, doc2, doc1_name="Draft v1.pdf", doc2_name="Draft v2.pdf")

    assert result["doc1_name"] == "Draft v1.pdf"
    assert result["doc2_name"] == "Draft v2.pdf"
    assert "diff_sections" in result
    assert "ai_summary" in result
    assert "favorable_to_user" in result
    assert isinstance(result["key_differences"], list)
