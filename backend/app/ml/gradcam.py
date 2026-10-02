"""
Grad-CAM (Gradient-weighted Class Activation Mapping) for EcoVision.
Provides visual model explainability by generating visual attention heatmaps
highlighting the regions of a bird photograph that influenced the prediction.
"""

import base64
import io
import logging
from typing import Tuple, Optional
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F

logger = logging.getLogger("ecovision.ml.gradcam")


class GradCAM:
    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        # Register forward and backward hooks
        self.target_layer.register_forward_hook(self._save_activation)
        self.target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        # grad_output is a tuple; first element contains the gradients w.r.t layer output
        self.gradients = grad_output[0].detach()

    def generate_heatmap(self, input_tensor: torch.Tensor, class_idx: int) -> np.ndarray:
        """
        Generates a 2D normalized Grad-CAM heatmap array in range [0, 1].
        """
        self.model.zero_grad()

        # Ensure gradients are enabled for this pass
        with torch.enable_grad():
            tensor = input_tensor.clone().requires_grad_(True)
            output = self.model(tensor)
            if class_idx is None:
                class_idx = torch.argmax(output, dim=1).item()

            score = output[0, class_idx]
            score.backward()

        if self.gradients is None or self.activations is None:
            logger.warning("Grad-CAM hooks failed to capture activations/gradients; returning neutral map.")
            return np.zeros((input_tensor.shape[2], input_tensor.shape[3]), dtype=np.float32)

        # Global average pooling of gradients: weights shape [C]
        weights = torch.mean(self.gradients, dim=(2, 3), keepdim=True)  # [1, C, 1, 1]

        # Linear combination of activations weighted by gradients
        cam = torch.sum(weights * self.activations, dim=1, keepdim=True)  # [1, 1, H, W]

        # Apply ReLU to retain only features having positive impact
        cam = F.relu(cam)

        # Interpolate to input image dimensions
        cam = F.interpolate(cam, size=(input_tensor.shape[2], input_tensor.shape[3]), mode="bilinear", align_corners=False)
        cam = cam.squeeze().cpu().numpy()

        # Min-max normalization
        cam_min, cam_max = cam.min(), cam.max()
        if cam_max - cam_min > 1e-8:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)

        return cam


def apply_colormap_on_image(org_img: Image.Image, activation_map: np.ndarray, alpha: float = 0.45) -> Image.Image:
    """
    Blends a normalized [0, 1] heatmap over a PIL image using a scientific pseudo-color palette.
    """
    img_rgb = np.array(org_img.convert("RGB"), dtype=np.float32) / 255.0
    h, w = img_rgb.shape[:2]

    # Resize heatmap to match original image dimensions
    heatmap_pil = Image.fromarray((activation_map * 255).astype(np.uint8)).resize((w, h), Image.Resampling.BILINEAR)
    heatmap = np.array(heatmap_pil, dtype=np.float32) / 255.0

    # Color palette (Jet-style / thermal gradient): Blue -> Cyan -> Yellow -> Red
    # Heatmap color components:
    r = np.clip(1.5 - np.abs(4.0 * heatmap - 3.0), 0.0, 1.0)
    g = np.clip(1.5 - np.abs(4.0 * heatmap - 2.0), 0.0, 1.0)
    b = np.clip(1.5 - np.abs(4.0 * heatmap - 1.0), 0.0, 1.0)
    colored_heatmap = np.stack([r, g, b], axis=-1)

    # Blend
    overlay = alpha * colored_heatmap + (1.0 - alpha) * img_rgb
    overlay = np.clip(overlay * 255, 0, 255).astype(np.uint8)

    return Image.fromarray(overlay)


def generate_gradcam_overlay_base64(
    model: torch.nn.Module,
    target_layer: torch.nn.Module,
    input_tensor: torch.Tensor,
    original_pil: Image.Image,
    class_idx: int,
) -> Optional[str]:
    """
    Executes Grad-CAM and returns a base64 encoded PNG data URI.
    """
    try:
        gradcam = GradCAM(model, target_layer)
        heatmap = gradcam.generate_heatmap(input_tensor, class_idx)
        overlay_pil = apply_colormap_on_image(original_pil, heatmap)

        buffer = io.BytesIO()
        overlay_pil.save(buffer, format="PNG", optimize=True)
        b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64_str}"
    except Exception as e:
        logger.error(f"Grad-CAM generation error: {e}", exc_info=True)
        return None
