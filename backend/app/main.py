"""
NyaySetu AI — FastAPI Application Entry Point
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.routers import analysis, auth, chat, comparison, documents

load_dotenv()

# ── Rate Limiter ──────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    print("NyaySetu AI backend starting up...")
    yield
    print("NyaySetu AI backend shutting down...")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NyaySetu AI API",
    description=(
        "GenAI-powered legal document assistance platform. "
        "This service does NOT provide legal advice. "
        "Always consult a licensed legal professional."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# High-efficiency GZip compression (reduces payload size by up to 80%)
app.add_middleware(GZipMiddleware, minimum_size=500)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_and_disclaimer_headers(request: Request, call_next):
    """Inject persistent security headers and legal disclaimer into every response."""
    response = await call_next(request)
    response.headers["X-Legal-Disclaimer"] = (
        "This service provides informational assistance only and does NOT "
        "constitute legal advice. Consult a licensed legal professional."
    )
    # Industry-standard HTTP security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    return response


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(comparison.router, prefix="/api/comparison", tags=["Comparison"])


# ── Health & Root ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "NyaySetu AI API",
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "disclaimer": "Informational assistance only. Not legal advice.",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "NyaySetu AI",
        "disclaimer": (
            "This service provides informational assistance only. "
            "Not legal advice."
        ),
    }


# ── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again."},
    )
