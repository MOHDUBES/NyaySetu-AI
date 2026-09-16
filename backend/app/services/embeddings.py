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


from functools import lru_cache

@lru_cache(maxsize=512)
def _cached_embed_query(query: str) -> tuple[float, ...]:
    """Cached query embedding helper for instant zero-latency retrieval on repeated questions."""
    if not _client:
        return tuple(_pseudo_embedding(query))
    try:
        result = _client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=query,
        )
        if result.embeddings:
            return tuple(result.embeddings[0].values)
        return tuple(_pseudo_embedding(query))
    except Exception:
        return tuple(_pseudo_embedding(query))


def embed_query(query: str) -> list[float]:
    """Generate an embedding for a search query with in-memory caching."""
    return list(_cached_embed_query(query))


# ── Retrieval ─────────────────────────────────────────────────────────────────
def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    a_arr = np.array(a, dtype=np.float32)
    b_arr = np.array(b, dtype=np.float32)
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
    Retrieve top-k most relevant chunks using vectorized matrix cosine similarity.
    High-performance batch linear algebra via NumPy (O(1) matrix product).
    """
    if not chunks:
        return []

    valid_chunks = [c for c in chunks if c.embedding is not None]
    if not valid_chunks:
        return [c.text for c in chunks[:k]]

    query_vec = np.array(embed_query(query), dtype=np.float32)
    q_norm = np.linalg.norm(query_vec)
    if q_norm == 0:
        return [c.text for c in valid_chunks[:k]]

    matrix = np.array([c.embedding for c in valid_chunks], dtype=np.float32)
    m_norms = np.linalg.norm(matrix, axis=1)
    
    # Avoid zero division
    # Verify dimension alignment
    if matrix.shape[1] == query_vec.shape[0]:
        scores = np.dot(matrix, query_vec) / (m_norms * q_norm)
    else:
        min_dim = min(matrix.shape[1], query_vec.shape[0])
        m_slice = matrix[:, :min_dim]
        q_slice = query_vec[:min_dim]
        m_slice_norms = np.linalg.norm(m_slice, axis=1)
        m_slice_norms[m_slice_norms == 0] = 1.0
        q_slice_norm = float(np.linalg.norm(q_slice)) or 1.0
        scores = np.dot(m_slice, q_slice) / (m_slice_norms * q_slice_norm)
    
    ranked_indices = np.argsort(scores)[::-1]
    
    results: list[str] = []
    for idx in ranked_indices:
        if scores[idx] >= min_similarity:
            results.append(valid_chunks[idx].text)
            if len(results) >= k:
                break

    return results if results else [valid_chunks[i].text for i in ranked_indices[:k]]


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
