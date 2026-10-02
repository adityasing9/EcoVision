"""
EcoVision Model Evaluation & Benchmark Metrics.
Computes Top-1 Accuracy, Precision, Recall, F1-Score,
per-class performance, and confusion matrix.
"""

import json
from pathlib import Path
import sys
import logging
import torch
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

# Ensure backend and training modules are discoverable
root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(root_dir / "backend"))

from app.ml.model import ModelFactory
from app.ml.species_map import SPECIES_CATALOG
from training.dataset import create_dataloaders

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ecovision.evaluation")


def evaluate_model(
    checkpoint_path: str = None,
    output_report_path: str = "training/evaluation_report.json",
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    num_classes = len(SPECIES_CATALOG)
    species_names = [SPECIES_CATALOG[k]["common_name"] for k in SPECIES_CATALOG]

    _, _, test_loader = create_dataloaders(
        train_ratio=0.70,
        val_ratio=0.20,
        test_ratio=0.10,
        batch_size=16,
        num_samples_per_class=10,
        num_classes=num_classes,
    )

    model = ModelFactory.create_model("resnet50", num_classes=num_classes, weights_path=checkpoint_path)
    model.to(device)
    model.eval()

    all_preds = []
    all_targets = []

    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)

            all_preds.extend(preds.cpu().numpy())
            all_targets.extend(labels.numpy())

    y_true = np.array(all_targets)
    y_pred = np.array(all_preds)

    acc = float(accuracy_score(y_true, y_pred))
    prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)
    conf_matrix = confusion_matrix(y_true, y_pred).tolist()

    report_dict = {
        "architecture": "ResNet-50",
        "num_classes": num_classes,
        "metrics": {
            "top1_accuracy": round(acc, 4),
            "precision_weighted": round(float(prec), 4),
            "recall_weighted": round(float(rec), 4),
            "f1_score_weighted": round(float(f1), 4),
        },
        "scientific_disclaimer": (
            "Benchmark metrics reflect evaluation against partitioned test sets and visual features. "
            "Model predictions are designed to provide decision-support for field observers and educators, "
            "not certified automated taxonomical proof."
        ),
        "confusion_matrix_shape": [len(conf_matrix), len(conf_matrix[0]) if conf_matrix else 0],
    }

    Path(output_report_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_report_path, "w", encoding="utf-8") as f:
        json.dump(report_dict, f, indent=2)

    logger.info(f"Evaluation report successfully exported to {output_report_path}")
    logger.info(f"Top-1 Accuracy: {acc*100:.2f}% | F1: {f1:.4f}")
    return report_dict


if __name__ == "__main__":
    evaluate_model()
