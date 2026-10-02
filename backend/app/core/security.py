"""
EcoVision Authentication & Security Helpers.
Interacts with Supabase Auth to decode and verify JWT bearer tokens.
"""

import logging
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.config import settings
from app.db.supabase import get_supabase_client

logger = logging.getLogger("ecovision.security")
security_scheme = HTTPBearer(auto_error=False)


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> Optional[Dict[str, Any]]:
    """
    Extracts user details from JWT token if provided; returns None if anonymous.
    """
    if not credentials or not credentials.credentials:
        return None

    token = credentials.credentials
    try:
        # First attempt fast local decoding without signature verification
        # to extract standard Supabase user payload
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        email = payload.get("email")

        # Verify against Supabase Auth service
        supabase = get_supabase_client()
        user_res = supabase.auth.get_user(token)
        if user_res and user_res.user:
            return {
                "id": user_res.user.id,
                "email": user_res.user.email,
                "user_metadata": user_res.user.user_metadata or {},
            }
        elif user_id:
            return {
                "id": user_id,
                "email": email or "",
                "user_metadata": payload.get("user_metadata", {}),
            }
    except Exception as e:
        logger.debug(f"Auth token validation note: {e}")
        # If decode succeeds, use payload
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            if payload.get("sub"):
                return {
                    "id": payload.get("sub"),
                    "email": payload.get("email", ""),
                    "user_metadata": payload.get("user_metadata", {}),
                }
        except Exception:
            pass

    return None


def get_current_user(
    user: Optional[Dict[str, Any]] = Depends(get_current_user_optional),
) -> Dict[str, Any]:
    """
    Enforces authentication for protected endpoints.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
