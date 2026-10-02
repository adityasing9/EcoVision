"""
Bird Species Identification Inference Endpoint.
"""

import logging
from fastapi import APIRouter, File, UploadFile, Query, HTTPException, status
from app.ml.classifier import classifier_service
from app.schemas.prediction import PredictionResult
from app.services.storage_service import storage_service

router = APIRouter(tags=["AI Identification"])
logger = logging.getLogger("ecovision.api.predict")


@router.post("/predict", response_model=PredictionResult)
async def predict_bird_species(
    file: UploadFile = File(..., description="Bird photograph (JPEG, PNG, WebP)"),
    include_gradcam: bool = Query(True, description="Generate Grad-CAM visual attention heatmap"),
):
    """
    Analyzes an uploaded bird photograph using PyTorch ResNet-50 transfer learning.
    Computes top-3 species predictions, calibrated confidence levels, ecological details,
    and optional Grad-CAM explainability visualization.
    """
    content_type = file.content_type or "image/jpeg"
    contents = await file.read()

    # Validate image file
    storage_service.validate_image_file(contents, content_type)

    try:
        result = classifier_service.predict_image(
            image_bytes=contents,
            include_gradcam=include_gradcam,
        )
        return result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        logger.error(f"Inference pipeline failure: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bird identification analysis encountered an unexpected server error.",
        )
