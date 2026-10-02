# EcoVision System Architecture & Technical Design

EcoVision is an AI-assisted biodiversity and environmental monitoring platform that bridges deep-learning image classification with ecological research workflows.

---

## 1. Architectural Overview

EcoVision follows a modular, decoupled architecture consisting of a React + Vite TypeScript frontend, a FastAPI Python ML backend, a PyTorch deep-learning inference service with Grad-CAM visual attention mapping, and Supabase managed PostgreSQL, Storage, and Authentication services.

```
                    ┌────────────────────────────┐
                    │      Observer / User       │
                    │ (Desktop, Tablet, Mobile)  │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │   React 18 + Vite + TS     │
                    │  (Tailwind CSS + Leaflet)  │
                    └─────────────┬──────────────┘
                                  │ HTTPS / REST
                                  ▼
                    ┌────────────────────────────┐
                    │      FastAPI Backend       │
                    │   (Uvicorn ASGI Server)    │
                    └───┬────────────────────┬───┘
                        │                    │
          ┌─────────────▼──────┐      ┌──────▼─────────────┐
          │ PyTorch ResNet-50  │      │ Supabase Client    │
          │ + Grad-CAM Engine  │      │ (PostgREST / HTTP) │
          └────────────────────┘      └──┬──────────────┬──┘
                                         │              │
                                         ▼              ▼
                              ┌──────────────┐   ┌─────────────┐
                              │  PostgreSQL  │   │   Storage   │
                              │ (RLS + SQL)  │   │  (Buckets)  │
                              └──────────────┘   └─────────────┘
```

---

## 2. Core Subsystems

### A. AI Inference Engine (`backend/app/ml/`)
- **Base Classifier Abstraction (`BaseBirdClassifier`)**: Provides a decoupled interface allowing architectures to be swapped between ResNet-50, MobileNetV3, EfficientNet, or ConvNeXt without touching API routing.
- **Model Lifecycle**: Model weights are loaded once into memory during the FastAPI application startup (`@asynccontextmanager lifespan`), eliminating per-request cold-start penalties.
- **Probability Calibration & Top-3 Candidates**: Logits are passed through a Softmax function, extracting the top 3 class candidates and formatting confidence percentages.
- **Uncertainty Tiers**:
  - `Likely identified` ($\ge 80\%$ confidence)
  - `Possible identification` ($50\% - 79\%$ confidence)
  - `Identification uncertain` ($< 50\%$ confidence)
- **Grad-CAM Visual Attention (`app/ml/gradcam.py`)**: Computes gradients of the target class score with respect to feature activation maps of the final bottleneck convolutional layer (`layer4[-1]`), applying ReLU and bilinear interpolation to render a thermal attention heatmap blended over the specimen image.

### B. Persistence Layer (`Supabase PostgreSQL`)
- **`species` Table**: Stores ornithological taxonomy (IOC standards), family, order, dietary niche, habitat typologies, geographical distribution, conservation status (IUCN Red List), and plumage identification notes.
- **`observations` Table**: Stores geolocated field sightings, predicted species, confidence score, individual bird count, behavioral dynamics (foraging, nesting, courtship display), weather conditions, and observer notes.
- **Row-Level Security (RLS)**: Enforces access control at the database engine level. Public/demo observations are universally readable, while user-submitted observations can only be updated or deleted by their verified creator (`auth.uid() = user_id`).

### C. Storage Service (`Supabase Storage`)
- Dedicated `bird-observations` bucket stores uploaded specimen imagery.
- Server-side validation restricts uploads to valid JPEG, PNG, and WebP media under 10MB.
- Files are saved with unique UUID hashes to prevent collisions and path traversals.

### D. Geospatial Mapping (`Leaflet + OpenStreetMap`)
- Zero paid API dependencies.
- Custom colored SVG map pins categorized by ecological habitat (Forest, Wetland, Coastal, Urban, Mountain, Garden).
- Coordinate safety: Coordinates can be fuzzed or rounded to avoid publishing precise nest locations of vulnerable taxa.

---

## 3. Data Flow Diagram

```
User uploads / captures image
              │
              ▼
FastAPI `/api/predict` validates file format & size
              │
              ▼
PyTorch ResNet-50 extracts visual features & computes logits
              │
              ▼
Softmax computes Top-1 and Top-3 species candidates
              │
              ▼
Grad-CAM hook extracts layer4 activations & gradients -> renders attention heatmap
              │
              ▼
Inference response sent to client with confidence tier & natural-history data
              │
              ▼
User logs observation with GPS, habitat, bird count & notes
              │
              ▼
FastAPI `/api/observations` persists record to Supabase PostgreSQL & Storage
              │
              ▼
Dashboard metrics and Leaflet map instantly reflect updated field sightings
```
