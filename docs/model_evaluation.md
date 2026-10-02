# EcoVision AI/ML Methodology & Evaluation Report

## 1. Deep Learning Vision Architecture

EcoVision employs transfer learning using a deep convolutional backbone (**ResNet-50**) initialized with pretrained ImageNet weights. The architecture consists of 49 convolutional layers culminating in a residual bottleneck block (`layer4[-1]`), followed by a custom classification head designed for avian species:

```
Input Image (3 x 224 x 224)
            │
            ▼
ResNet-50 Convolutional Backbone (Layers 1-4)
            │
            ▼
Adaptive Average Pooling (2048-dim)
            │
            ▼
Dropout (p=0.3)
            │
            ▼
Linear Projection (2048 -> 512)
            │
            ▼
ReLU + BatchNorm1d
            │
            ▼
Dropout (p=0.2)
            │
            ▼
Output Classifier (512 -> N Species Classes)
```

---

## 2. Grad-CAM Explainability Implementation

To prevent black-box machine learning and foster scientific trust, EcoVision integrates **Grad-CAM** (*Gradient-weighted Class Activation Mapping*):

1. **Feature Map Hook**: Forward hook captures activations $A^k$ of the final convolutional layer `layer4[-1]`.
2. **Gradient Hook**: Backward hook captures gradients $\frac{\partial y^c}{\partial A^k}$ with respect to the top predicted species logit $y^c$.
3. **Neuron Importance Weights**:
   $$\alpha_k^c = \frac{1}{Z} \sum_i \sum_j \frac{\partial y^c}{\partial A_{i,j}^k}$$
4. **Heatmap Synthesis**:
   $$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$
5. **Colormap Rendering**: Normalized in range $[0, 1]$, upsampled to image resolution, and blended with a thermal palette over the bird photo.

---

## 3. Training & Evaluation Pipeline (`training/`)

- **Dataset Splitting**: Configurable 70% Training / 20% Validation / 10% Testing.
- **Biologically Sound Augmentation**: Random resized crop (scale 0.8 to 1.0), horizontal flips, subtle rotations ($\le 15^\circ$), and minor color jitter (brightness, contrast, saturation $\le 0.1$). Extreme shears or distortions are avoided to maintain diagnostic feather morphology.
- **Optimization**: AdamW with weight decay $1\times 10^{-3}$ and Cosine Annealing learning rate schedule.
- **Metrics Computed**: Accuracy, Precision (weighted), Recall (weighted), F1-Score, and full multi-class confusion matrix exported to `training/evaluation_report.json`.

---

## 4. Scientific Disclaimer

Model predictions provide observational decision-support and visual pattern matching. They do not constitute molecular or certified taxonomical verification. Conservation and ecological policy decisions must be based on validated scientific fieldwork.
