"""
Unit tests for RAG Chat, Scope Filtering, and Legal Verdict Sanitization.
"""
from app.services.llm import answer_question, sanitize_legal_verdicts


def test_sanitize_legal_verdicts_strips_forbidden_phrases():
    # Definite legal assertions must be sanitized into informational framing
    input_text = "You will win this dispute because the landlord failed to give notice."
    sanitized = sanitize_legal_verdicts(input_text)
    assert "you will win" not in sanitized.lower()

    illegal_text = "This is illegal under Section 4."
    sanitized_illegal = sanitize_legal_verdicts(illegal_text)
    assert "this is illegal" not in sanitized_illegal.lower()


def test_answer_question_with_context():
    context = [
        "Clause 5: The security deposit of Rs 50,000 shall be refunded within 15 days of key handover.",
    ]
    result = answer_question("When will my deposit be refunded?", context, "Agreement.pdf", language="en")

    assert "answer" in result
    assert "sources" in result
    assert result["is_out_of_scope"] is False
    assert len(result["sources"]) > 0


def test_answer_question_out_of_scope():
    context = [
        "Clause 1: The property is located at flat 402 Green Park.",
    ]
    # Asking about unrelated topic outside the document
    result = answer_question("What is the recipe for butter chicken?", context, "Agreement.pdf", language="en")
    assert "answer" in result
