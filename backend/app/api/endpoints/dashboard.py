"""
Biodiversity Dashboard and Ecological Analytics Endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.core.security import get_current_user_optional
from app.services.observation_service import observation_service
from app.schemas.observation import ObservationStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=ObservationStats)
def get_dashboard_metrics(
    user_only: bool = Query(False, description="Compute statistics only for current user"),
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Computes real-time ecological statistics: species counts, habitat breakdown,
    observation timelines, and confidence metrics.
    """
    user_id = current_user["id"] if (user_only and current_user) else None
    return observation_service.get_dashboard_stats(user_id=user_id)
