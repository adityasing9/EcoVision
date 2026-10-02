"""
EcoVision ML Architecture & Model Definitions.
Implements an extensible model hierarchy supporting ResNet-50, MobileNet,
EfficientNet, and custom architectures.
"""

from abc import ABC, abstractmethod
import logging
from typing import Dict, Any, Optional
import torch
import torch.nn as nn
from torchvision import models

logger = logging.getLogger("ecovision.ml.model")


class BaseBirdClassifier(nn.Module, ABC):
    """Abstract base class for all EcoVision avian classification models."""

    def __init__(self, num_classes: int):
        super().__init__()
        self.num_classes = num_classes

    @abstractmethod
    def get_target_layer_for_gradcam(self) -> nn.Module:
        """Returns the final convolutional layer for Grad-CAM explainability."""
        pass


class ResNet50BirdClassifier(BaseBirdClassifier):
    """
    ResNet-50 transfer learning classifier for bird species.
    Uses pretrained ImageNet feature backbone with custom classification head.
    """

    def __init__(self, num_classes: int, pretrained: bool = True):
        super().__init__(num_classes=num_classes)
        weights = models.ResNet50_Weights.DEFAULT if pretrained else None
        self.backbone = models.resnet50(weights=weights)

        # Replace final fully connected layer for bird species classes
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, 512),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(512),
            nn.Dropout(p=0.2),
            nn.Linear(512, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

    def get_target_layer_for_gradcam(self) -> nn.Module:
        # Final bottleneck convolutional layer of layer4
        return self.backbone.layer4[-1]


class MobileNetV3BirdClassifier(BaseBirdClassifier):
    """Alternative lightweight model architecture for edge or mobile deployment."""

    def __init__(self, num_classes: int, pretrained: bool = True):
        super().__init__(num_classes=num_classes)
        weights = models.MobileNet_V3_Large_Weights.DEFAULT if pretrained else None
        self.backbone = models.mobilenet_v3_large(weights=weights)
        in_features = self.backbone.classifier[0].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.Hardswish(inplace=True),
            nn.Dropout(p=0.2),
            nn.Linear(512, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

    def get_target_layer_for_gradcam(self) -> nn.Module:
        return self.backbone.features[-1]


class ModelFactory:
    """Factory to instantiate and load the configured classification model."""

    @staticmethod
    def create_model(architecture: str, num_classes: int, weights_path: Optional[str] = None) -> BaseBirdClassifier:
        arch = architecture.lower()
        logger.info(f"Instantiating model architecture '{arch}' for {num_classes} species classes.")

        if arch == "resnet50":
            model = ResNet50BirdClassifier(num_classes=num_classes, pretrained=True)
        elif arch in ["mobilenet", "mobilenet_v3"]:
            model = MobileNetV3BirdClassifier(num_classes=num_classes, pretrained=True)
        else:
            logger.warning(f"Architecture '{arch}' not explicitly matched; defaulting to ResNet-50.")
            model = ResNet50BirdClassifier(num_classes=num_classes, pretrained=True)

        if weights_path:
            import os
            if os.path.exists(weights_path):
                logger.info(f"Loading custom fine-tuned weights from {weights_path}")
                checkpoint = torch.load(weights_path, map_location="cpu")
                if "model_state_dict" in checkpoint:
                    model.load_state_dict(checkpoint["model_state_dict"])
                else:
                    model.load_state_dict(checkpoint)
            else:
                logger.warning(f"Weights path {weights_path} not found; proceeding with initialized weights.")

        model.eval()
        return model
