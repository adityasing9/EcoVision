"""
Biodiversity Observation Management Endpoints.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, Query, HTTPException, status
from app.core.security import get_current_user_optional, get_current_user
from app.services.observation_service import observation_service
from app.services.storage_service import storage_service
from app.schemas.observation import (
    ObservationCreate,
    ObservationUpdate,
    ObservationResponse,
)

router = APIRouter(prefix="/observations", tags=["Observations"])
logger = logging.getLogger("ecovision.api.observations")


@router.post("/upload-image")
async def upload_observation_image(
    file: UploadFile = File(...),
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """Uploads an image to Supabase Storage and returns public URL."""
    content_type = file.content_type or "image/jpeg"
    contents = await file.read()
    user_id = current_user["id"] if current_user else "guest"
    public_url = storage_service.upload_observation_image(
        file_bytes=contents,
        content_type=content_type,
        user_id=user_id,
    )
    return {"image_url": public_url}


@router.post("", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
def record_observation(
    observation: ObservationCreate,
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """
    Saves a newly verified biodiversity observation with environmental and geospatial metadata.
    """
    user_id = current_user["id"] if current_user else None
    user_email = current_user.get("email") if current_user else None

    try:
        return observation_service.create_observation(
            data=observation,
            user_id=user_id,
            user_email=user_email,
        )
    except Exception as e:
        logger.error(f"Error saving observation: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not persist observation: {str(e)}",
        )


@router.get("", response_model=List[ObservationResponse])
def list_observations(
    species_id: Optional[str] = Query(None, description="Filter by species"),
    habitat: Optional[str] = Query(None, description="Filter by habitat type"),
    user_only: bool = Query(False, description="Filter only observations by authenticated user"),
    include_demo: bool = Query(True, description="Include demonstration records"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """Queries biodiversity observations with filtering and pagination."""
    target_user_id = None
    if user_only:
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to filter personal journal observations.",
            )
        target_user_id = current_user["id"]

    return observation_service.get_observations(
        user_id=target_user_id,
        species_id=species_id,
        habitat=habitat,
        limit=limit,
        offset=offset,
        include_demo=include_demo,
    )


@router.get("/{obs_id}", response_model=ObservationResponse)
def get_observation(obs_id: str):
    """Fetches details for a single observation record."""
    obs = observation_service.get_observation_by_id(obs_id)
    if not obs:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Observation with ID '{obs_id}' not found.",
        )
    return obs


@router.patch("/{obs_id}", response_model=ObservationResponse)
def update_observation(
    obs_id: str,
    update_data: ObservationUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Updates editable metadata on an observation owned by the user."""
    updated = observation_service.update_observation(
        obs_id=obs_id,
        data=update_data,
        user_id=current_user["id"],
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observation not found or unauthorized to modify.",
        )
    return updated


@router.delete("/{obs_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_observation(
    obs_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Removes an observation owned by the user."""
    success = observation_service.delete_observation(
        obs_id=obs_id,
        user_id=current_user["id"],
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observation not found or unauthorized to delete.",
        )
    return None
