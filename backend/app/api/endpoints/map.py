"""
Geospatial Map Data Endpoints.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Query
from app.services.observation_service import observation_service

router = APIRouter(prefix="/map", tags=["Geospatial Map"])


@router.get("", response_model=List[Dict[str, Any]])
def get_map_markers(
    habitat: Optional[str] = Query(None, description="Filter map points by habitat type"),
):
    """
    Returns mapped observation coordinates and metadata for interactive Leaflet rendering.
    """
    return observation_service.get_map_points(habitat=habitat)
