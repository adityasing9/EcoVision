from datetime import datetime
from enum import Enum
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.species import SpeciesResponse


class HabitatType(str, Enum):
    FOREST = "Forest"
    WETLAND = "Wetland"
    GRASSLAND = "Grassland"
    AGRICULTURAL = "Agricultural"
    URBAN = "Urban"
    COASTAL = "Coastal"
    RIVER_LAKE = "River/Lake"
    MOUNTAIN = "Mountain"
    GARDEN = "Garden"
    OTHER = "Other"


class BirdBehavior(str, Enum):
    FORAGING = "Foraging"
    PERCHING = "Perching"
    FLYING = "Flying"
    CALLING = "Calling / Vocalizing"
    NESTING = "Nesting"
    FLOCKING = "Flocking"
    SWIMMING = "Swimming / Diving"
    COURTSHIP = "Courtship Display"
    RESTING = "Resting"
    OTHER = "Other"


class ObservationBase(BaseModel):
    species_id: Optional[str] = None
    predicted_species: str
    prediction_confidence: float = Field(..., ge=0.0, le=100.0)
    top_predictions: Optional[List[Dict[str, Any]]] = []
    image_url: str
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    location_name: str
    habitat: HabitatType
    observed_at: datetime = Field(default_factory=datetime.utcnow)
    bird_count: int = Field(default=1, ge=1)
    behavior: BirdBehavior = BirdBehavior.PERCHING
    environmental_notes: Optional[str] = None
    weather_conditions: Optional[str] = None
    is_demo: bool = False


class ObservationCreate(ObservationBase):
    pass


class ObservationUpdate(BaseModel):
    bird_count: Optional[int] = Field(None, ge=1)
    behavior: Optional[BirdBehavior] = None
    location_name: Optional[str] = None
    habitat: Optional[HabitatType] = None
    environmental_notes: Optional[str] = None
    weather_conditions: Optional[str] = None


class ObservationResponse(ObservationBase):
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    created_at: datetime
    species: Optional[SpeciesResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ObservationStats(BaseModel):
    total_observations: int
    unique_species: int
    total_bird_count: int
    most_observed_species: List[Dict[str, Any]]
    habitat_distribution: Dict[str, int]
    timeline_trends: List[Dict[str, Any]]
    confidence_distribution: Dict[str, int]
    recent_observations: List[ObservationResponse]
