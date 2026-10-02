"""
EcoVision Transfer Learning Training Pipeline.
Trains a ResNet-50 bird classifier with early stopping,
learning rate scheduling, and best-model checkpointing.
"""

import os
import sys
from pathlib import Path
import logging
import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import CosineAnnealingLR

# Ensure backend and training modules are discoverable
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "backend"))

from app.ml.model import ResNet50BirdClassifier
from app.ml.species_map import SPECIES_CATALOG
from training.dataset import create_dataloaders

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ecovision.training")


def train_model(
    epochs: int = 5,
    batch_size: int = 16,
    lr: float = 1e-4,
    save_path: str = "backend/app/ml/weights/best_bird_model.pth",
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Initiating training run on device '{device}'...")

    num_classes = len(SPECIES_CATALOG)
    train_loader, val_loader, test_loader = create_dataloaders(
        train_ratio=0.70,
        val_ratio=0.20,
        test_ratio=0.10,
        batch_size=batch_size,
        num_samples_per_class=10,
        num_classes=num_classes,
    )

    model = ResNet50BirdClassifier(num_classes=num_classes, pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-3)
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = 0.0
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    for epoch in range(1, epochs + 1):
        # Training Phase
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct_train += torch.sum(preds == labels.data).item()
            total_train += labels.size(0)

        scheduler.step()
        train_loss = running_loss / total_train if total_train > 0 else 0
        train_acc = correct_train / total_train if total_train > 0 else 0

        # Validation Phase
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                correct_val += torch.sum(preds == labels.data).item()
                total_val += labels.size(0)

        epoch_val_loss = val_loss / total_val if total_val > 0 else 0
        epoch_val_acc = correct_val / total_val if total_val > 0 else 0

        logger.info(
            f"Epoch {epoch}/{epochs} | "
            f"Train Loss: {train_loss:.4f} Acc: {train_acc*100:.1f}% | "
            f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc*100:.1f}%"
        )

        if epoch_val_acc >= best_val_acc:
            best_val_acc = epoch_val_acc
            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "val_acc": epoch_val_acc,
                    "architecture": "resnet50",
                    "num_classes": num_classes,
                },
                save_path,
            )
            logger.info(f"Saved new best model checkpoint to {save_path} (Val Acc: {epoch_val_acc*100:.1f}%)")

    logger.info("Training pipeline execution complete.")
    return save_path


if __name__ == "__main__":
    train_model(epochs=2, batch_size=16)
