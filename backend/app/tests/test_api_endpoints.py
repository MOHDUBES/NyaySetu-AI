"""
Unit tests for FastAPI Endpoints (Root, Health, Disclaimer Headers, and Error Handling).
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "NyaySetu" in data["service"]


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "disclaimer" in data


def test_legal_disclaimer_header_middleware():
    response = client.get("/")
    assert "X-Legal-Disclaimer" in response.headers
    assert "Not legal advice" in response.headers["X-Legal-Disclaimer"] or "informational assistance" in response.headers["X-Legal-Disclaimer"]


def test_invalid_document_not_found():
    response = client.get("/api/documents/non-existent-id")
    assert response.status_code == 404
