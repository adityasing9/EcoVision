"""
Authentication endpoints using Supabase Auth.
"""

import logging
from fastapi import APIRouter, HTTPException, status, Depends
from app.db.supabase import get_supabase_client
from app.core.security import get_current_user
from app.schemas.user import UserSignup, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger("ecovision.api.auth")


@router.post("/signup", response_model=TokenResponse)
def sign_up(user_data: UserSignup):
    """Registers a new user account via Supabase Auth."""
    supabase = get_supabase_client()
    try:
        res = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name or user_data.email.split("@")[0]
                }
            }
        })
        if not res.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User registration failed. Please verify email formatting and password strength.",
            )

        # In cases where email confirmation is disabled or automatic session returned
        token = res.session.access_token if res.session else "mock-session-token"
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=res.user.id,
                email=res.user.email,
                full_name=res.user.user_metadata.get("full_name") if res.user.user_metadata else None,
                created_at=str(res.user.created_at) if hasattr(res.user, "created_at") else None,
            ),
        )
    except Exception as e:
        logger.error(f"Sign up error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    """Authenticates a user and returns a Supabase JWT access token."""
    supabase = get_supabase_client()
    try:
        res = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })
        if not res.user or not res.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password credentials.",
            )

        return TokenResponse(
            access_token=res.session.access_token,
            user=UserResponse(
                id=res.user.id,
                email=res.user.email,
                full_name=res.user.user_metadata.get("full_name") if res.user.user_metadata else None,
                created_at=str(res.user.created_at) if hasattr(res.user, "created_at") else None,
            ),
        )
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}",
        )


@router.get("/me", response_model=UserResponse)
def get_current_profile(current_user: dict = Depends(get_current_user)):
    """Returns the authenticated user's profile."""
    return UserResponse(
        id=current_user["id"],
        email=current_user.get("email", ""),
        full_name=current_user.get("user_metadata", {}).get("full_name"),
    )
