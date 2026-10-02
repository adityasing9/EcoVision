from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.species import SpeciesResponse


class ConfidenceLevel(str, Enum):
    HIGH = "Likely identified"
    MEDIUM = "Possible identification"
    LOW = "Identification uncertain"


class PredictionCandidate(BaseModel):
    species_id: str
    common_name: str
    scientific_name: str
    confidence: float = Field(..., ge=0.0, le=1.0, description="Raw confidence score (0.0 - 1.0)")
    confidence_percentage: float = Field(..., description="Confidence formatted as percentage (0-100%)")


class PredictionResult(BaseModel):
    top_prediction: PredictionCandidate
    alternative_predictions: List[PredictionCandidate]
    confidence_level: ConfidenceLevel
    threshold_applied: float
    is_uncertain: bool
    guidance_message: str
    species_details: Optional[SpeciesResponse] = None
    gradcam_heatmap: Optional[str] = Field(None, description="Base64 encoded Grad-CAM attention overlay PNG")
    model_architecture: str
    disclaimer: str = (
        "AI-assisted prediction tool. Predictions may reflect visual similarity or dataset bias "
        "and should not replace qualified ornithological verification for scientific or conservation research."
    )

    model_config = {"protected_namespaces": ()}
