"""
NyaySetu AI — pytest tests for document parser service.
Run with: pytest backend/app/tests/test_parser.py -v
"""
import io
import pytest

from app.services.parser import (
    ParsedDocument,
    detect_file_type,
    parse_document,
    sanitize_text,
    _split_into_sections,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────
SAMPLE_TEXT = """
1. Introduction
This is a rental agreement between the Landlord and the Tenant.

2. RENT AND PAYMENT
The Tenant shall pay a monthly rent of INR 15,000 on the 1st of each month.
Late payment will incur a penalty of 2% per day.

3. Termination
Either party may terminate this agreement with 30 days written notice.
"""

SCRIPT_TEXT = """
<script>alert('xss')</script>
Normal contract text here.
eval(malicious_code)
javascript:void(0)
Regular clause about payment terms.
"""


# ── sanitize_text ─────────────────────────────────────────────────────────────
class TestSanitizeText:
    def test_removes_script_tags(self):
        result = sanitize_text("<script>alert('xss')</script>")
        assert "<script>" not in result
        assert "alert" not in result

    def test_removes_javascript_protocol(self):
        result = sanitize_text("Click here: javascript:void(0)")
        assert "javascript:" not in result

    def test_removes_eval(self):
        result = sanitize_text("eval(bad_code())")
        assert "eval(" not in result.lower()

    def test_preserves_normal_text(self):
        normal = "The tenant shall pay rent of INR 15,000 monthly."
        result = sanitize_text(normal)
        assert "tenant shall pay rent" in result.lower()

    def test_normalizes_excessive_whitespace(self):
        messy = "Line 1\n\n\n\n\nLine 2"
        result = sanitize_text(messy)
        assert result.count("\n") < messy.count("\n")

    def test_handles_empty_string(self):
        assert sanitize_text("") == ""


# ── detect_file_type ──────────────────────────────────────────────────────────
class TestDetectFileType:
    def test_detects_pdf_magic_bytes(self):
        pdf_bytes = b"%PDF-1.4 rest of content..."
        result = detect_file_type(pdf_bytes)
        assert result == "application/pdf"

    def test_detects_docx_magic_bytes(self):
        # DOCX files start with ZIP magic bytes PK\x03\x04
        docx_bytes = b"PK\x03\x04 rest of zip content..."
        result = detect_file_type(docx_bytes)
        assert result is not None
        assert "officedocument" in result

    def test_rejects_unknown_file(self):
        garbage = b"\x00\x01\x02\x03 random garbage"
        result = detect_file_type(garbage)
        assert result is None

    def test_rejects_exe_file(self):
        exe_bytes = b"MZ\x90\x00 windows exe header"
        result = detect_file_type(exe_bytes)
        assert result is None

    def test_rejects_empty_bytes(self):
        result = detect_file_type(b"")
        assert result is None


# ── _split_into_sections ──────────────────────────────────────────────────────
class TestSplitIntoSections:
    def test_splits_numbered_sections(self):
        sections = _split_into_sections(SAMPLE_TEXT)
        assert len(sections) >= 2

    def test_section_has_title_and_content(self):
        sections = _split_into_sections(SAMPLE_TEXT)
        for section in sections:
            assert section.title
            assert section.content

    def test_handles_single_block_text(self):
        plain = "This is a single paragraph without any section headings."
        sections = _split_into_sections(plain)
        assert len(sections) >= 1
        assert plain in sections[0].content


# ── parse_document ────────────────────────────────────────────────────────────
class TestParseDocument:
    def test_raises_on_unsupported_file(self):
        """Non-PDF/DOCX bytes should raise ValueError."""
        with pytest.raises(ValueError, match="Unsupported"):
            parse_document(b"This is a plain text file", "test.txt")

    def test_raises_on_empty_bytes(self):
        with pytest.raises(ValueError):
            parse_document(b"", "empty.pdf")

    def test_raises_on_exe_file(self):
        exe_bytes = b"MZ\x90\x00" + b"\x00" * 100
        with pytest.raises(ValueError):
            parse_document(exe_bytes, "malware.exe")
