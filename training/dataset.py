"""
EcoVision Dataset Preparation & Augmentation Pipeline.
Implements reproducible data loading, train/validation/test splits,
and domain-specific biological data augmentations.
"""

from typing import Tuple, Dict, Any, List
import torch
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms
from PIL import Image


def get_data_transforms() -> Dict[str, transforms.Compose]:
    """
    Returns train and validation transforms.
    Augmentation avoids unrealistic distortions that could destroy avian plumage features.
    """
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])

    val_test_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])

    return {"train": train_transform, "val": val_test_transform}


class SyntheticBirdDataset(Dataset):
    """
    Synthetic dataset generator for testing and verifying the training
    pipeline without requiring multi-gigabyte raw dataset downloads.
    Generates synthetic samples representing the 20 bird classes.
    """

    def __init__(self, num_samples_per_class: int = 15, num_classes: int = 20, transform=None):
        self.num_classes = num_classes
        self.transform = transform
        self.samples = []

        # Color seeds distinct per class
        for c in range(num_classes):
            for _ in range(num_samples_per_class):
                self.samples.append(c)

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        label = self.samples[idx]
        # Generate distinct pattern per class
        r = (label * 37) % 256
        g = (label * 67 + 50) % 256
        b = (label * 97 + 100) % 256
        img = Image.new("RGB", (256, 256), color=(r, g, b))

        if self.transform:
            img = self.transform(img)

        return img, label


def create_dataloaders(
    train_ratio: float = 0.70,
    val_ratio: float = 0.20,
    test_ratio: float = 0.10,
    batch_size: int = 16,
    num_samples_per_class: int = 20,
    num_classes: int = 20,
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    """
    Partitions dataset into train, validation, and test splits with data loaders.
    """
    assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-5, "Splits must sum to 1.0"

    tfs = get_data_transforms()
    full_ds = SyntheticBirdDataset(num_samples_per_class=num_samples_per_class, num_classes=num_classes, transform=tfs["train"])

    total = len(full_ds)
    train_len = int(total * train_ratio)
    val_len = int(total * val_ratio)
    test_len = total - train_len - val_len

    train_ds, val_ds, test_ds = random_split(
        full_ds,
        [train_len, val_len, test_len],
        generator=torch.Generator().manual_seed(42),
    )

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)

    return train_loader, val_loader, test_loader
