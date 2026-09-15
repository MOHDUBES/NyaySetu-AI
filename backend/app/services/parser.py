"""
NyaySetu AI — Document Parser Service
Handles PDF and DOCX parsing with sanitization.
"""
import io
import re
from dataclasses import dataclass, field
from typing import Optional

# PDF parsing
try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

# DOCX parsing
try:
    from docx import Document as DocxDocument
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False


# ── Data Classes ──────────────────────────────────────────────────────────────
@dataclass
class ParsedSection:
    title: str
    content: str
    page_number: Optional[int] = None


@dataclass
class ParsedDocument:
    text: str
    sections: list[ParsedSection] = field(default_factory=list)
    metadata: dict = field(default_factory=dict)
    word_count: int = 0
    page_count: int = 0


# ── Sanitization ──────────────────────────────────────────────────────────────
# Patterns that suggest embedded scripts or macros in extracted text
_SCRIPT_PATTERNS = [
    re.compile(r"<script[\s\S]*?</script>", re.IGNORECASE),
    re.compile(r"javascript:", re.IGNORECASE),
    re.compile(r"vbscript:", re.IGNORECASE),
    re.compile(r"on\w+\s*=", re.IGNORECASE),   # onclick=, onerror=, etc.
    re.compile(r"\\x[0-9a-fA-F]{2}"),           # hex-escaped chars
    re.compile(r"eval\s*\(", re.IGNORECASE),
    re.compile(r"exec\s*\(", re.IGNORECASE),
]

# Allowed MIME types (validated by magic bytes, not filename extension)
_ALLOWED_MAGIC_BYTES = {
    b"%PDF": "application/pdf",
    b"PK\x03\x04": "application/vnd.openxmlformats-officedocument",  # DOCX (ZIP-based)
}


def detect_file_type(file_bytes: bytes) -> Optional[str]:
    """
    Detect file type from magic bytes (first 4 bytes).
    Returns MIME type string or None if unrecognized/unsafe.
    """
    for magic, mime in _ALLOWED_MAGIC_BYTES.items():
        if file_bytes[:len(magic)] == magic:
            return mime
    return None


def sanitize_text(text: str) -> str:
    """
    Strip any script/macro patterns from extracted text before LLM processing.
    """
    for pattern in _SCRIPT_PATTERNS:
        text = pattern.sub("[REDACTED]", text)
    # Normalize whitespace
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    text = re.sub(r"[ \t]{4,}", "   ", text)
    return text.strip()


# ── Heading Detection ─────────────────────────────────────────────────────────
_HEADING_PATTERN = re.compile(
    r"^(?:"
    r"\d+[\.\)]\s+"           # "1. " or "1) "
    r"|[A-Z][A-Z\s]{3,}$"     # ALL CAPS HEADING
    r"|(?:Article|Section|Clause|Schedule)\s+\w+"  # Named sections
    r")",
    re.MULTILINE,
)


def _split_into_sections(text: str) -> list[ParsedSection]:
    """Heuristically split document text into sections."""
    sections: list[ParsedSection] = []
    lines = text.split("\n")
    current_title = "Document"
    current_content: list[str] = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            current_content.append("")
            continue

        if _HEADING_PATTERN.match(stripped) and len(stripped) < 120:
            # Save previous section
            if current_content:
                content = "\n".join(current_content).strip()
                if content:
                    sections.append(ParsedSection(title=current_title, content=content))
            current_title = stripped
            current_content = []
        else:
            current_content.append(line)

    # Flush last section
    if current_content:
        content = "\n".join(current_content).strip()
        if content:
            sections.append(ParsedSection(title=current_title, content=content))

    # Ensure at least one section
    if not sections:
        sections.append(ParsedSection(title="Full Document", content=text))

    return sections


# ── PDF Parser ────────────────────────────────────────────────────────────────
def parse_pdf(file_bytes: bytes) -> ParsedDocument:
    """
    Parse a PDF from raw bytes. Tries PyMuPDF first, falls back to pdfplumber.
    Returns a ParsedDocument with sanitized text and detected sections.
    """
    if not (PYMUPDF_AVAILABLE or PDFPLUMBER_AVAILABLE):
        raise RuntimeError("No PDF parsing library available. Install PyMuPDF or pdfplumber.")

    text_parts: list[str] = []
    page_count = 0

    if PYMUPDF_AVAILABLE:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        page_count = len(doc)
        for page in doc:
            text_parts.append(page.get_text("text"))
        doc.close()
    elif PDFPLUMBER_AVAILABLE:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            page_count = len(pdf.pages)
            for page in pdf.pages:
                extracted = page.extract_text() or ""
                text_parts.append(extracted)

    full_text = "\n\n".join(text_parts)
    full_text = sanitize_text(full_text)
    sections = _split_into_sections(full_text)
    word_count = len(full_text.split())

    return ParsedDocument(
        text=full_text,
        sections=sections,
        metadata={"source": "pdf"},
        word_count=word_count,
        page_count=page_count,
    )


# ── DOCX Parser ───────────────────────────────────────────────────────────────
def parse_docx(file_bytes: bytes) -> ParsedDocument:
    """
    Parse a DOCX file from raw bytes.
    Preserves heading structure using python-docx paragraph styles.
    """
    if not DOCX_AVAILABLE:
        raise RuntimeError("python-docx not installed. Install it with pip.")

    doc = DocxDocument(io.BytesIO(file_bytes))
    sections: list[ParsedSection] = []
    current_title = "Document"
    current_content: list[str] = []
    all_text_parts: list[str] = []

    for para in doc.paragraphs:
        if not para.text.strip():
            continue

        all_text_parts.append(para.text)

        if para.style.name.startswith("Heading"):
            # Flush current section
            if current_content:
                content = "\n".join(current_content).strip()
                if content:
                    sections.append(ParsedSection(title=current_title, content=content))
            current_title = para.text.strip()
            current_content = []
        else:
            current_content.append(para.text)

    # Flush last section
    if current_content:
        content = "\n".join(current_content).strip()
        if content:
            sections.append(ParsedSection(title=current_title, content=content))

    full_text = "\n".join(all_text_parts)
    full_text = sanitize_text(full_text)

    if not sections:
        sections = _split_into_sections(full_text)

    return ParsedDocument(
        text=full_text,
        sections=sections,
        metadata={"source": "docx"},
        word_count=len(full_text.split()),
        page_count=len(doc.sections),
    )


# ── Main Entry Point ──────────────────────────────────────────────────────────
def parse_document(file_bytes: bytes, filename: str) -> ParsedDocument:
    """
    Detect file type from magic bytes, then parse accordingly.
    Raises ValueError if file type is unsupported or suspicious.
    """
    mime = detect_file_type(file_bytes)
    if mime is None:
        raise ValueError(
            f"Unsupported or potentially unsafe file type for '{filename}'. "
            "Only PDF and DOCX files are accepted."
        )

    if mime == "application/pdf":
        return parse_pdf(file_bytes)
    elif "officedocument" in mime:
        return parse_docx(file_bytes)
    else:
        raise ValueError(f"Cannot parse file type: {mime}")
