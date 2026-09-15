"""
NyaySetu AI — Embeddings & RAG Service
Chunk documents, generate embeddings, and retrieve relevant context.
"""
import math
import os
from dataclasses import dataclass, field
from typing import Optional

from google import genai
import numpy as np
from dotenv import load_dotenv

load_dotenv()

_API_KEY = os.getenv("GEMINI_API_KEY", "")
_client = genai.Client(api_key=_API_KEY) if _API_KEY else None

# ── Constants ─────────────────────────────────────────────────────────────────
CHUNK_SIZE = 800          # characters per chunk
CHUNK_OVERLAP = 150       # overlap between chunks
EMBEDDING_MODEL = "gemini-embedding-001"   # Google GenAI embedding model


# ── Data Classes ──────────────────────────────────────────────────────────────
@dataclass
class TextChunk:
    text: str
    chunk_index: int
    start_char: int
    end_char: int
    embedding: Optional[list[float]] = field(default=None, repr=False)


# ── Chunking ──────────────────────────────────────────────────────────────────
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[TextChunk]:
    """
    Split document text into overlapping chunks for embedding.
    Tries to split at sentence boundaries when possible.
    """
    chunks: list[TextChunk] = []
    text_len = len(text)
    start = 0
    index = 0

    while start < text_len:
        end = min(start + chunk_size, text_len)

        # Try to end at a sentence boundary (period, question mark, newline)
        if end < text_len:
            boundary = max(
                text.rfind(". ", start, end),
                text.rfind(".\n", start, end),
                text.rfind("\n\n", start, end),
            )
            if boundary > start + chunk_size // 2:
                end = boundary + 1

        chunk_text_content = text[start:end].strip()
        if chunk_text_content:
            chunks.append(TextChunk(
                text=chunk_text_content,
                chunk_index=index,
                start_char=start,
                end_char=end,
            ))
            index += 1

        # Move forward with overlap
        start = max(start + 1, end - overlap)

    return chunks


# ── Embedding Generation ──────────────────────────────────────────────────────
def generate_embeddings(chunks: list[TextChunk]) -> list[TextChunk]:
    """
    Generate Gemini embeddings for a list of text chunks.
    Batches requests to stay within API limits.
    """
    if not _client:
        # Fallback: use simple TF-based pseudo-embeddings for testing
        for chunk in chunks:
            chunk.embedding = _pseudo_embedding(chunk.text)
        return chunks

    batch_size = 20  # Safe batch size

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        try:
            result = _client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=[c.text for c in batch],
            )
            for chunk, emb in zip(batch, result.embeddings):
                chunk.embedding = emb.values
        except Exception:
            # Fallback to pseudo-embeddings if API call fails
            for chunk in batch:
                chunk.embedding = _pseudo_embedding(chunk.text)

    return chunks


def embed_query(query: str) -> list[float]:
    """Generate an embedding for a search query."""
    if not _client:
        return _pseudo_embedding(query)
    try:
        result = _client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=query,
        )
        if result.embeddings:
            return result.embeddings[0].values
        return _pseudo_embedding(query)
    except Exception:
        return _pseudo_embedding(query)


# ── Retrieval ─────────────────────────────────────────────────────────────────
def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    a_arr = np.array(a, dtype=float)
    b_arr = np.array(b, dtype=float)
    norm_a = np.linalg.norm(a_arr)
    norm_b = np.linalg.norm(b_arr)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a_arr, b_arr) / (norm_a * norm_b))


def retrieve_relevant_chunks(
    query: str,
    chunks: list[TextChunk],
    k: int = 5,
    min_similarity: float = 0.1,
) -> list[str]:
    """
    Retrieve the top-k most relevant chunks for a given query.
    Returns list of chunk texts sorted by relevance.
    """
    query_embedding = embed_query(query)
    scored: list[tuple[float, str]] = []

    for chunk in chunks:
        if chunk.embedding is None:
            continue
        score = cosine_similarity(query_embedding, chunk.embedding)
        if score >= min_similarity:
            scored.append((score, chunk.text))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)
    return [text for _, text in scored[:k]]


# ── Fallback Pseudo-Embeddings ────────────────────────────────────────────────
def _pseudo_embedding(text: str, dim: int = 128) -> list[float]:
    """
    Simple word-frequency-based pseudo-embedding for offline testing.
    NOT suitable for production — only used when Gemini API key is absent.
    """
    words = text.lower().split()
    vec = [0.0] * dim
    for word in words:
        idx = hash(word) % dim
        vec[idx] += 1.0
    # L2 normalize
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]
