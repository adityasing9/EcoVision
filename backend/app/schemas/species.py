from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class SpeciesBase(BaseModel):
    id: str = Field(..., description="Unique slug or identifier, e.g. 'indian-peafowl'")
    common_name: str
    scientific_name: str
    family: str
    order_name: str
    habitat_types: List[str]
    diet: str
    geographic_distribution: str
    ecological_role: str
    behavior_notes: str
    identification_features: str
    conservation_status: str
    description: str
    image_url: Optional[str] = None


class SpeciesCreate(SpeciesBase):
    pass


class SpeciesResponse(SpeciesBase):
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SpeciesListItem(BaseModel):
    id: str
    common_name: str
    scientific_name: str
    family: str
    order_name: str
    habitat_types: List[str]
    conservation_status: str
    image_url: Optional[str] = None
    observation_count: Optional[int] = 0
