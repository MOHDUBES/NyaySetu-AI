"""
NyaySetu AI — Auth Router
Thin wrapper for Supabase auth operations (signup, login, logout).
Token validation for protected routes.
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr

router = APIRouter()


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


@router.post("/signup", response_model=AuthResponse)
async def signup(body: SignupRequest, request: Request) -> AuthResponse:
    """
    Create a new user account via Supabase Auth.
    Returns a JWT access token on success.
    """
    import os
    from supabase import create_client

    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    if not url or not key:
        raise HTTPException(
            status_code=503,
            detail="Auth service not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        )

    try:
        client = create_client(url, key)
        result = client.auth.sign_up({"email": body.email, "password": body.password})
        session = result.session
        user = result.user
        if not session or not user:
            raise HTTPException(status_code=400, detail="Signup failed. User may already exist.")
        return AuthResponse(
            access_token=session.access_token,
            user_id=str(user.id),
            email=user.email or body.email,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, request: Request) -> AuthResponse:
    """
    Login with email and password via Supabase Auth.
    Returns a JWT access token.
    """
    import os
    from supabase import create_client

    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_ANON_KEY", "")

    if not url or not key:
        raise HTTPException(status_code=503, detail="Auth service not configured.")

    try:
        client = create_client(url, key)
        result = client.auth.sign_in_with_password({"email": body.email, "password": body.password})
        session = result.session
        user = result.user
        if not session or not user:
            raise HTTPException(status_code=401, detail="Invalid credentials.")
        return AuthResponse(
            access_token=session.access_token,
            user_id=str(user.id),
            email=user.email or body.email,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password.")


@router.post("/logout")
async def logout(request: Request):
    """Logout — client should discard the JWT token."""
    return {"message": "Logged out successfully. Please discard your access token."}
