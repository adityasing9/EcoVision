import logging
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger("ecovision.db")

_supabase_client: Optional[Client] = None
_supabase_admin_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Returns a singleton client with public anon key for general user operations."""
    global _supabase_client
    if _supabase_client is None:
        key = settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY
        if not settings.SUPABASE_URL or not key:
            raise ValueError("Supabase URL and API Key must be configured in environment variables.")
        _supabase_client = create_client(settings.SUPABASE_URL, key)
        logger.info("Initialized standard Supabase client")
    return _supabase_client


def get_supabase_admin_client() -> Client:
    """Returns a client with service role key for privileged operations (e.g. system seeds)."""
    global _supabase_admin_client
    if _supabase_admin_client is None:
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        if not settings.SUPABASE_URL or not key:
            raise ValueError("Supabase URL and Key must be configured in environment variables.")
        _supabase_admin_client = create_client(settings.SUPABASE_URL, key)
        logger.info("Initialized admin Supabase client")
    return _supabase_admin_client
