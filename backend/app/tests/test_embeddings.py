"""
Unit tests for Chunking, Embeddings, Vector Cosine Similarity, and RAG Retrieval.
"""
from app.services.embeddings import (
    TextChunk,
    chunk_text,
    cosine_similarity,
    embed_query,
    retrieve_relevant_chunks,
)


def test_chunk_text_creates_valid_chunks():
    sample_text = (
        "Clause 1: The tenant agrees to pay rent on time. "
        "Clause 2: Security deposit shall be refunded upon vacating. "
        "Clause 3: No subletting without written permission from the lessor. "
    ) * 10
    chunks = chunk_text(sample_text, chunk_size=200, overlap=50)

    assert len(chunks) > 1
    for chunk in chunks:
        assert isinstance(chunk, TextChunk)
        assert len(chunk.text) > 0
        assert chunk.end_char > chunk.start_char


def test_cosine_similarity_identical_vectors():
    vec = [0.5, 0.5, 0.5, 0.5]
    sim = cosine_similarity(vec, vec)
    assert abs(sim - 1.0) < 1e-5


def test_cosine_similarity_orthogonal_vectors():
    vec_a = [1.0, 0.0, 0.0]
    vec_b = [0.0, 1.0, 0.0]
    sim = cosine_similarity(vec_a, vec_b)
    assert abs(sim - 0.0) < 1e-5


def test_embed_query_cached():
    query = "What is the monthly rent?"
    emb1 = embed_query(query)
    emb2 = embed_query(query)
    assert emb1 == emb2
    assert len(emb1) > 0


def test_retrieve_relevant_chunks_vectorized():
    texts = [
        "The monthly rent is Rs 25,000 payable on 5th of each month.",
        "Pets and animals are strictly prohibited on the premises.",
        "Painting charges of Rs 5,000 will be deducted from deposit.",
    ]
    chunks = [
        TextChunk(text=t, chunk_index=i, start_char=0, end_char=len(t), embedding=embed_query(t))
        for i, t in enumerate(texts)
    ]
    results = retrieve_relevant_chunks("How much is the monthly rent?", chunks, k=2, min_similarity=0.0)
    assert len(results) > 0
    assert "rent" in results[0].lower()
