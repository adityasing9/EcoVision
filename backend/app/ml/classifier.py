"""
EcoVision Bird Species Classifier Service.
Handles image preprocessing, PyTorch forward inference, probability calibration,
Top-3 ranking, threshold-based uncertainty handling, and Grad-CAM explainability.
"""

import io
import logging
from typing import Tuple, List, Optional
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms

from app.core.config import settings
from app.ml.model import ModelFactory, BaseBirdClassifier
from app.ml.species_map import SPECIES_CATALOG, get_species_id_by_index, get_species_by_id
from app.ml.gradcam import generate_gradcam_overlay_base64
from app.schemas.prediction import PredictionResult, PredictionCandidate, ConfidenceLevel
from app.schemas.species import SpeciesResponse

logger = logging.getLogger("ecovision.ml.classifier")


class BirdClassifierService:
    def __init__(self):
        self.model: Optional[BaseBirdClassifier] = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.num_classes = len(SPECIES_CATALOG)
        self.species_keys = list(SPECIES_CATALOG.keys())

        # Standard ImageNet preprocessing
        self.preprocess = transforms.Compose([
            transforms.Resize(256, interpolation=transforms.InterpolationMode.BILINEAR),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ])

    def load_model(self):
        """Loads the classifier model once at backend startup."""
        if self.model is None:
            logger.info(f"Loading EcoVision classifier on device '{self.device}'...")
            self.model = ModelFactory.create_model(
                architecture=settings.MODEL_ARCHITECTURE,
                num_classes=self.num_classes,
                weights_path=settings.MODEL_WEIGHTS_PATH if settings.MODEL_WEIGHTS_PATH else None,
            )
            self.model.to(self.device)
            self.model.eval()
            logger.info("EcoVision classifier successfully loaded and ready for inference.")

    def predict_image(
        self,
        image_bytes: bytes,
        include_gradcam: bool = True,
    ) -> PredictionResult:
        """
        Processes an input image, computes species predictions, top-3 candidates,
        confidence levels, and optional Grad-CAM explainability heatmap.
        """
        if self.model is None:
            self.load_model()

        # Load and convert image to RGB
        try:
            pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Invalid image file or format: {e}")

        # Preprocess for model
        input_tensor = self.preprocess(pil_image).unsqueeze(0).to(self.device)

        # Forward pass
        with torch.no_grad():
            logits = self.model(input_tensor)
            probabilities = F.softmax(logits, dim=1).squeeze(0)

        # Top 3 predictions
        top_k = min(3, self.num_classes)
        top_probs, top_indices = torch.topk(probabilities, k=top_k)

        top_candidates: List[PredictionCandidate] = []
        for prob, idx in zip(top_probs.tolist(), top_indices.tolist()):
            species_id = self.species_keys[idx]
            spec_info = SPECIES_CATALOG[species_id]
            conf = float(prob)
            top_candidates.append(
                PredictionCandidate(
                    species_id=species_id,
                    common_name=spec_info["common_name"],
                    scientific_name=spec_info["scientific_name"],
                    confidence=round(conf, 4),
                    confidence_percentage=round(conf * 100.0, 1),
                )
            )

        top_pred = top_candidates[0]
        alt_preds = top_candidates[1:]

        # Confidence categorization
        high_th = settings.CONFIDENCE_HIGH_THRESHOLD
        med_th = settings.CONFIDENCE_MEDIUM_THRESHOLD

        if top_pred.confidence >= high_th:
            confidence_level = ConfidenceLevel.HIGH
            is_uncertain = False
            guidance = (
                f"Model exhibits strong visual correspondence with {top_pred.common_name} "
                f"({top_pred.confidence_percentage}%). Verification against regional habitat and season is recommended."
            )
        elif top_pred.confidence >= med_th:
            confidence_level = ConfidenceLevel.MEDIUM
            is_uncertain = False
            guidance = (
                f"Moderate confidence for {top_pred.common_name} ({top_pred.confidence_percentage}%). "
                f"Review alternative candidates or capture a clearer angle of bill/plumage."
            )
        else:
            confidence_level = ConfidenceLevel.LOW
            is_uncertain = True
            guidance = (
                f"Low confidence ({top_pred.confidence_percentage}%). Identification is uncertain due to distance, "
                f"obstruction, lighting, or plumage variation. Consult local field guides or expert ornithologists."
            )

        # Grad-CAM explainability
        gradcam_b64 = None
        if include_gradcam:
            try:
                target_layer = self.model.get_target_layer_for_gradcam()
                top_class_idx = top_indices[0].item()
                gradcam_b64 = generate_gradcam_overlay_base64(
                    model=self.model,
                    target_layer=target_layer,
                    input_tensor=input_tensor,
                    original_pil=pil_image,
                    class_idx=top_class_idx,
                )
            except Exception as e:
                logger.warning(f"Grad-CAM generation skipped due to error: {e}")

        # Fetch species details
        species_info_dict = get_species_by_id(top_pred.species_id)
        species_resp = SpeciesResponse(**species_info_dict) if species_info_dict else None

        return PredictionResult(
            top_prediction=top_pred,
            alternative_predictions=alt_preds,
            confidence_level=confidence_level,
            threshold_applied=high_th if confidence_level == ConfidenceLevel.HIGH else med_th,
            is_uncertain=is_uncertain,
            guidance_message=guidance,
            species_details=species_resp,
            gradcam_heatmap=gradcam_b64,
            model_architecture=settings.MODEL_ARCHITECTURE,
        )


classifier_service = BirdClassifierService()
