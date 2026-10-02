"""
Health and System Diagnostics Endpoint.
"""

from fastapi import APIRouter
import torch
from app.core.config import settings
from app.db.supabase import get_supabase_client
from app.ml.classifier import classifier_service

router = APIRouter()


@router.get("/health", tags=["System"])
def health_check():
    # Check database connectivity
    db_connected = False
    try:
        sb = get_supabase_client()
        res = sb.table("species").select("id", count="exact").limit(1).execute()
        db_connected = True
    except Exception:
        db_connected = False

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "connected": db_connected,
            "provider": "Supabase PostgreSQL",
        },
        "ml_system": {
            "architecture": settings.MODEL_ARCHITECTURE,
            "device": str(classifier_service.device),
            "model_loaded": classifier_service.model is not None,
            "torch_version": torch.__version__,
            "classes_supported": classifier_service.num_classes,
        },
        "thresholds": {
            "high": settings.CONFIDENCE_HIGH_THRESHOLD,
            "medium": settings.CONFIDENCE_MEDIUM_THRESHOLD,
        },
    }
