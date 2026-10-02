"""
Species Explorer Endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.services.species_service import species_service
from app.schemas.species import SpeciesResponse, SpeciesListItem

router = APIRouter(prefix="/species", tags=["Species"])


@router.get("", response_model=List[SpeciesListItem])
def list_species(
    query: Optional[str] = Query(None, description="Search by common or scientific name"),
    habitat: Optional[str] = Query(None, description="Filter by habitat type"),
    order: Optional[str] = Query(None, description="Filter by taxonomic order"),
    limit: int = Query(50, ge=1, le=100),
):
    """Retrieves bird species catalog with search and filters."""
    return species_service.get_species_list(
        query=query,
        habitat=habitat,
        order_name=order,
        limit=limit,
    )


@router.get("/{species_id}", response_model=SpeciesResponse)
def get_species_details(species_id: str):
    """Retrieves complete natural-history profile for a specific species."""
    species = species_service.get_species_by_id(species_id)
    if not species:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Species '{species_id}' not found in ornithological database.",
        )
    return species
