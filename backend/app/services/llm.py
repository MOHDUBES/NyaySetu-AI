"""
NyaySetu AI — Gemini LLM Service
All calls to the Google Gemini API, with safety guardrails.
"""
import json
import os
import re
from typing import Any

from dotenv import load_dotenv

load_dotenv()

# ── Client Setup (Google GenAI SDK) ───────────────────────────────────────────
_API_KEY = os.getenv("GEMINI_API_KEY", "")
_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

try:
    from google import genai
    _GENAI_AVAILABLE = True
except ImportError:
    _GENAI_AVAILABLE = False


def _get_client():
    if not _GENAI_AVAILABLE:
        raise RuntimeError(
            "google-genai SDK is not installed. Please run: pip install google-genai"
        )
    if _API_KEY:
        return genai.Client(api_key=_API_KEY)
    return genai.Client()


def _generate(prompt: str) -> str:
    """Execute Gemini text generation via google-genai Client."""
    client = _get_client()
    response = client.models.generate_content(
        model=_MODEL_NAME,
        contents=prompt,
    )
    return response.text or ""


# ── Shared Disclaimer Preamble ────────────────────────────────────────────────
_DISCLAIMER_PREAMBLE = """
IMPORTANT INSTRUCTION: You are NyaySetu AI, a bilingual legal document assistant 
providing informational analysis and accessibility support only. 
You MUST follow these rules without exception:
1. NEVER give definitive legal advice, verdicts, or conclusions.
2. NEVER say "this is illegal", "you will win", "this contract is valid/invalid".
3. ALWAYS frame findings as: "this clause typically means...", "you may want to ask 
   a lawyer about...", "based on this document...", "इस दस्तावेज़ के अनुसार...".
4. If asked for legal advice or a definitive answer, say: "I can provide informational 
   context but cannot give legal advice. Please consult a licensed professional."
5. Focus ONLY on the document content provided. Do not speculate beyond it.
6. Provide clear, empathetic, conversational language in both English and Hindi/Hinglish
   to bridge the legal literacy gap.

"""


def _extract_json(text: str) -> Any:
    """Extract JSON from LLM response that may include markdown code fences."""
    # Remove ```json ... ``` wrappers
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = re.sub(r"```\s*$", "", text, flags=re.MULTILINE)
    return json.loads(text.strip())


# ── Document Summarization (Bilingual English + Hindi/Hinglish) ───────────────
def summarize_document(text: str, filename: str = "document") -> dict:
    """
    Generate a plain-language summary and section-by-section explanation
    in BOTH English and Hindi/Hinglish for accessibility.
    """
    # Truncate to avoid token limits (~100k chars ≈ ~25k tokens)
    truncated = text[:100_000]

    prompt = f"""{_DISCLAIMER_PREAMBLE}
You are analyzing a legal document for everyday users in India. 
Provide a structured analysis in JSON format in BOTH English and natural Hindi/Hinglish.

Document filename: {filename}
Document content:
---
{truncated}
---

Return a JSON object with exactly these fields:
{{
  "document_type": "string (e.g. 'Rental Agreement', 'Employment Contract', 'Terms of Service')",
  "overall_summary": "string - 3-5 sentence plain-language English summary of what this document is about",
  "overall_summary_hi": "string - 3-5 sentence conversational Hindi / Hinglish summary (सरल हिंदी/हिंग्लिश में ताकि कोई भी आसानी से समझ सके)",
  "sections": [
    {{
      "title": "string - section name",
      "content": "string - original section text (first 200 chars)",
      "plain_language": "string - 2-3 sentence plain English explanation of what this section means for the reader",
      "plain_language_hi": "string - 2-3 sentence plain Hindi / Hinglish explanation of what this section means"
    }}
  ],
  "jargon_terms": {{
    "legal term": "plain-language English definition (1-2 sentences)"
  }},
  "jargon_terms_hi": {{
    "legal term": "सरल हिंदी / Hinglish में व्याख्या (1-2 वाक्य)"
  }}
}}

Include up to 10 sections and up to 15 jargon terms. Use simple, clear language accessible to someone with no legal background.
"""

    response_text = _generate(prompt)
    return _extract_json(response_text)


# ── Clause Detection ──────────────────────────────────────────────────────────
# ── Clause Detection ──────────────────────────────────────────────────────────
def extract_clauses(text: str) -> list[dict]:
    """
    Detect and categorize legal clauses with English and Hindi/Hinglish explanations.
    Returns list of {text, clause_type, explanation, explanation_hi}.
    """
    truncated = text[:80_000]

    prompt = f"""{_DISCLAIMER_PREAMBLE}
Analyze this legal document and identify important clauses. Categorize each clause as one of:
- "obligation": Things one party MUST do
- "risk": Potentially unfavorable terms, red flags, or liability clauses
- "deadline": Time-sensitive dates, notice periods, renewal dates
- "financial": Money, fees, penalties, payment terms

Document:
---
{truncated}
---

Return a JSON array of clause objects:
[
  {{
    "text": "exact quote from document (max 300 chars)",
    "clause_type": "obligation|risk|deadline|financial",
    "explanation": "1-2 sentence plain-language English explanation of WHY this clause matters to the reader. Use 'this clause typically means...' framing. NEVER give definitive legal conclusions.",
    "explanation_hi": "1-2 sentence plain Hindi / Hinglish explanation of why this clause matters (e.g. 'इस शर्त का मतलब है कि...')"
  }}
]

Include 5-20 of the most important clauses. Focus on clauses that meaningfully impact the reader's rights, obligations, or financial position.
"""

    response_text = _generate(prompt)
    return _extract_json(response_text)


# ── Checklist Generation ──────────────────────────────────────────────────────
def generate_checklist(summary: dict, clauses: list[dict]) -> dict:
    """
    Generate an action checklist from document analysis.
    Returns dict with items_to_verify, questions_for_lawyer, deadlines_to_track.
    """
    context = json.dumps({
        "document_type": summary.get("document_type", "Legal Document"),
        "summary": summary.get("overall_summary", ""),
        "key_clauses": clauses[:10],  # limit context size
    })

    prompt = f"""{_DISCLAIMER_PREAMBLE}
Based on this legal document analysis, create a practical action checklist for the user.

Document analysis:
{context}

Return a JSON object with exactly these fields:
{{
  "items_to_verify": [
    {{
      "category": "verify",
      "text": "Specific thing to verify or check",
      "priority": "high|medium|low"
    }}
  ],
  "questions_for_lawyer": [
    {{
      "category": "ask_lawyer",
      "text": "Specific question to ask a legal professional",
      "priority": "high|medium|low"
    }}
  ],
  "deadlines_to_track": [
    {{
      "category": "deadline",
      "text": "Deadline or time-sensitive action to track",
      "priority": "high|medium|low"
    }}
  ]
}}

Include 3-7 items per category. Be specific and actionable. Frame lawyer questions as genuine open questions, not conclusions.
"""

    response_text = _generate(prompt)
    return _extract_json(response_text)


# ── Lawyer Brief Generation ───────────────────────────────────────────────────
def generate_lawyer_brief(summary: dict, clauses: list[dict]) -> dict:
    """
    Generate a structured consultation brief in both English and Hindi.
    """
    context = json.dumps({
        "document_type": summary.get("document_type", "Legal Document"),
        "summary": summary.get("overall_summary", ""),
        "sections": summary.get("sections", [])[:5],
        "clauses": clauses[:15],
    })

    prompt = f"""{_DISCLAIMER_PREAMBLE}
Create a structured consultation brief that helps the user walk into a lawyer meeting 
fully prepared. This is NOT legal advice — it's a preparation tool. Provide bilingual details.

Document analysis:
{context}

Return a JSON object:
{{
  "document_type": "string",
  "executive_summary": "2-3 sentence overview a lawyer can read in 30 seconds",
  "executive_summary_hi": "2-3 sentence Hindi / Hinglish summary for the user",
  "key_concerns": ["list of specific concerns found in the document in English"],
  "key_concerns_hi": ["list of specific concerns in Hindi / Hinglish"],
  "questions_to_ask": ["specific, well-formulated questions the user should ask their lawyer"],
  "questions_to_ask_hi": ["वकील से पूछने योग्य मुख्य सवाल (Hindi)"],
  "important_dates": ["any dates, deadlines, or time periods found"],
  "financial_obligations": ["any financial commitments, fees, or penalties mentioned"]
}}

Be thorough. The goal is to help the user make the most of their consultation time.
"""

    response_text = _generate(prompt)
    return _extract_json(response_text)


# ── Document Comparison ───────────────────────────────────────────────────────
def compare_documents_ai(diff_sections: list[dict], doc1_name: str, doc2_name: str) -> dict:
    """
    Generate AI semantic summary of document comparison results.
    """
    prompt = f"""{_DISCLAIMER_PREAMBLE}
You are comparing two versions of a legal document to help a user understand what changed.

Document 1: {doc1_name}
Document 2: {doc2_name}

Changed sections (sample):
{json.dumps(diff_sections[:8], indent=2)}

Return a JSON object:
{{
  "ai_summary": "2-4 sentence plain-language summary of the key differences between the documents",
  "favorable_to_user": "doc1|doc2|neither|depends (which document appears more favorable to a typical user signing it)",
  "key_differences": ["list of 3-7 most important changes and what they mean for the user — informational framing only, not legal conclusions"]
}}
"""

    response_text = _generate(prompt)
    return _extract_json(response_text)


# ── RAG Question Answering (Voice-first, bilingual) ───────────────────────────
_OUT_OF_SCOPE_KEYWORDS = [
    "outside this document", "not in this document", "cannot find", "not mentioned",
    "no information", "beyond the scope", "not covered", "दस्तावेज़ में नहीं",
    "उल्लेख नहीं"
]

_LEGAL_VERDICT_PATTERNS = [
    re.compile(r"\byou will win\b", re.IGNORECASE),
    re.compile(r"\bthis is illegal\b", re.IGNORECASE),
    re.compile(r"\bcontract is (valid|invalid|void|enforceable)\b", re.IGNORECASE),
    re.compile(r"\byou are entitled to\b", re.IGNORECASE),
    re.compile(r"यह गैर-कानूनी है", re.IGNORECASE),
    re.compile(r"आप केस जीतेंगे", re.IGNORECASE),
]


def answer_question(
    question: str,
    context_chunks: list[str],
    document_name: str = "document",
    language: str = "auto"
) -> dict:
    """
    Answer a question about a document using RAG context.
    Supports Hindi, English, or Hinglish questions and voice response framing.
    Returns dict with answer, answer_hi, sources, is_out_of_scope.
    """
    context = "\n\n---\n\n".join(context_chunks[:5])  # top 5 chunks

    prompt = f"""{_DISCLAIMER_PREAMBLE}
You are answering a question about a specific legal document.
CRITICAL: Answer ONLY based on the document content provided below.
If the question cannot be answered from the document, say so clearly.
NEVER give legal advice, definitive legal conclusions, or speculate beyond the document.

Language mode: {language}
User question: {question}

If the user asked in Hindi or Hinglish, or if language is 'hi', formulate the answer primarily in natural, clear conversational Hindi / Hinglish.
Also provide a concise English counterpart or vice versa.

Document name: {document_name}

Relevant document sections:
---
{context}
---

Return a JSON object:
{{
  "answer": "Clear, direct informational answer based solely on the document",
  "answer_hi": "सरल हिंदी / हिंग्लिश में वही उत्तर (Voice TTS और सहज समझ के लिए)",
  "is_out_of_scope": false
}}

If the answer is NOT in the document, set "is_out_of_scope": true and state that the document does not contain this information.
"""

    try:
        response_text = _generate(prompt)
        res_json = _extract_json(response_text)
        answer = res_json.get("answer", "")
        answer_hi = res_json.get("answer_hi", "")
        is_out_of_scope = bool(res_json.get("is_out_of_scope", False))
    except Exception:
        # Fallback if json extraction fails
        answer = response_text.strip()
        answer_hi = None
        is_out_of_scope = any(kw in answer.lower() for kw in _OUT_OF_SCOPE_KEYWORDS)

    # Post-process: check for out-of-scope indicators
    if not is_out_of_scope:
        is_out_of_scope = any(kw in answer.lower() for kw in _OUT_OF_SCOPE_KEYWORDS)

    # Guard against slipped-through legal verdicts (strip and replace)
    for pattern in _LEGAL_VERDICT_PATTERNS:
        answer = pattern.sub("[Informational context only — please consult a lawyer]", answer)
        if answer_hi:
            answer_hi = pattern.sub("[केवल सूचनात्मक संदर्भ — कृपया वकील से परामर्श लें]", answer_hi)

    return {
        "answer": answer,
        "answer_hi": answer_hi,
        "sources": context_chunks[:3],
        "is_out_of_scope": is_out_of_scope,
    }
