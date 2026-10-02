# EcoVision — AI-Powered Bird Biodiversity & Environmental Monitoring Platform

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Storage-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **"See. Identify. Understand Biodiversity."**  
> *EcoVision is an AI-assisted biodiversity monitoring platform that identifies bird species from images and transforms wildlife observations into structured ecological data for biodiversity awareness, environmental education, and preliminary environmental monitoring.*

---

## 1. Project Overview

**EcoVision** is a production-quality environmental intelligence platform. Unlike standard computer vision demos that conclude with an isolated classification label, EcoVision bridges deep learning with ornithological field science. It empowers naturalists, researchers, students, and citizens to:

- Capture or upload bird photographs directly from browsers and mobile devices.
- Perform deep-learning inference using **PyTorch ResNet-50** transfer learning.
- Inspect model confidence across standardized certainty tiers with top-3 alternative candidates.
- Understand model visual focus through **Grad-CAM** (*Gradient-weighted Class Activation Mapping*).
- Enrich raw sightings with IUCN conservation status, dietary niches, behavioral dynamics, and ecological services.
- Record structured field observations with GPS coordinates, habitat categories, bird counts, and observer field notes into a **Supabase PostgreSQL** database.
- Visualize geospatial patterns on an interactive **Leaflet + OpenStreetMap** map.
- Track real-time biodiversity trends on a scientific analytics dashboard.

---

## 2. Environmental Problem

Biodiversity is collapsing worldwide at an unprecedented rate, yet tracking avian populations remains labor-intensive and difficult to standardize:
- Amateur wildlife sightings often lack taxonomical precision and structured metadata.
- Images taken by birders remain siloed on local phone galleries or social media without scientific utility.
- Casual observers lack immediate access to authoritative IUCN threat data and habitat context.
- Most machine learning classifiers operate as black boxes, providing zero visibility into why a species was selected.

---

## 3. The EcoVision Solution

EcoVision solves this by creating a continuous observational workflow:

$$\text{Field Photograph} \longrightarrow \text{PyTorch Inference} \longrightarrow \text{Confidence \& Grad-CAM} \longrightarrow \text{Ecological Context} \longrightarrow \text{Structured Journal Record} \longrightarrow \text{Geospatial Map \& Analytics}$$

By grounding image classification in ecological taxonomy, behavioral notes, and habitat classifications, sightings transform into structured datasets suitable for preliminary environmental monitoring and biodiversity education.

---

## 4. Key Features

- **Deep Learning Vision Classifier**: PyTorch ResNet-50 with extensible architecture loader (supporting MobileNet, EfficientNet, and ConvNeXt).
- **Grad-CAM Explainability**: Interactive toggle revealing the convolutional layer attention heatmap overlaid on the bird image.
- **Top-3 Alternative Candidates**: Exposes classification uncertainty with authentic probability bars.
- **Confidence Tiers**: Configurable thresholds categorizing results into *Likely identified* ($\ge 80\%$), *Possible identification* ($50\%-79\%$), and *Identification uncertain* ($< 50\%$).
- **Digital Field Journal**: Full field notebook with search, habitat filtering, specimen detail modals, and personal record curation.
- **Interactive Biodiversity Map**: Powered by Leaflet and OpenStreetMap with custom habitat-coded SVG pins and coordinate protection.
- **Environmental Analytics Dashboard**: Real-time breakdown of habitat distributions, top-recorded species, temporal observation timelines, and confidence metrics.
- **Species Natural History Explorer**: Digital compendium of avian species detailing family, order, dietary niche, behavior, geographic range, and IUCN Red List statuses.
- **In-Browser Field Camera**: Mobile-responsive camera capture using HTML5 MediaDevices with front/rear lens switching.
- **Responsible AI Warnings**: Explicit reminders that AI predictions assist rather than certify scientific truth, emphasizing that recorded observation $\ne$ proof of ecosystem health.

---

## 5. System Architecture

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

## 6. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router DOM, Lucide Icons |
| **Mapping** | Leaflet, OpenStreetMap (Zero paid API keys required) |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn, Pydantic V2 |
| **Machine Learning**| PyTorch, Torchvision, Pillow, NumPy, Scikit-learn |
| **Explainability** | Grad-CAM (Gradient-weighted Class Activation Mapping) |
| **Database** | Supabase Managed PostgreSQL with Row-Level Security (RLS) |
| **Storage** | Supabase Storage (`bird-observations` public bucket) |
| **Authentication** | Supabase Auth (JWT Bearer Token verification) |
| **Testing** | Pytest, FastAPI TestClient |
| **DevOps** | Multi-stage Dockerfile, Docker Compose |

---

## 7. AI Methodology & Extensible Architecture

The classifier is built using transfer learning on top of an ImageNet-pretrained **ResNet-50** backbone:
1. **Model Loader Lifecycle**: Model weights are loaded once in memory when the FastAPI application starts (`app/main.py` lifespan context), avoiding request-time model instantiation latency.
2. **Modular Architecture Factory (`ModelFactory`)**: New neural architectures (such as MobileNetV3 or EfficientNet) can be configured via `MODEL_ARCHITECTURE` environment variable without rewriting endpoints.
3. **Inference Pipeline**:
   - Resizes input image to $256\times 256$, applies Center Crop to $224\times 224$.
   - Normalizes with ImageNet channel means `[0.485, 0.456, 0.406]` and standard deviations `[0.229, 0.224, 0.225]`.
   - Forward pass produces raw logits, passed through `torch.nn.functional.softmax` to yield authentic probabilities.
   - Computes Grad-CAM gradients w.r.t the final bottleneck convolutional block (`layer4[-1]`).

---

## 8. Supported Bird Species Catalog

The platform launches pre-seeded with authentic ornithological profiles:
- **Indian Peafowl** (*Pavo cristatus*) — Phasianidae
- **White-throated Kingfisher** (*Halcyon smyrnensis*) — Alcedinidae
- **Great Hornbill** (*Buceros bicornis*) — Bucerotidae [Vulnerable]
- **Rose-ringed Parakeet** (*Psittacula krameri*) — Psittaculidae
- **Brahminy Kite** (*Haliastur indus*) — Accipitridae
- **Black-crowned Night Heron** (*Nycticorax nycticorax*) — Ardeidae
- **Purple Sunbird** (*Cinnyris asiaticus*) — Nectariniidae
- **Barn Owl** (*Tyto alba*) — Tytonidae
- **Peregrine Falcon** (*Falco peregrinus*) — Falconidae
- **Black-rumped Flameback** (*Dinopium benghalense*) — Picidae
- **Greater Flamingo** (*Phoenicopterus roseus*) — Phoenicopteridae
- **Red-vented Bulbul** (*Pycnonotus cafer*) — Pycnonotidae
- **Osprey** (*Pandion haliaetus*) — Pandionidae
- **Sarus Crane** (*Antigone antigone*) — Gruidae [Vulnerable]
- **Oriental Magpie-Robin** (*Copsychus saularis*) — Muscicapidae
- **Painted Stork** (*Mycteria leucocephala*) — Ciconiidae [Near Threatened]
- **Common Kingfisher** (*Alcedo atthis*) — Alcedinidae
- **Spotted Owlet** (*Athene brama*) — Strigidae
- **Indian Roller** (*Coracias benghalensis*) — Coraciidae
- **House Sparrow** (*Passer domesticus*) — Passeridae

---

## 9. Model Training & Evaluation Pipeline

The `training/` directory contains a standalone, reproducible training pipeline:
- **`training/dataset.py`**: Handles dataset loading, train/validation/test partitioning (70/20/10), and biological data augmentations (RandomResizedCrop, RandomHorizontalFlip, Rotation $\le 15^\circ$, ColorJitter).
- **`training/train.py`**: Executes transfer learning with AdamW optimizer, Cosine Annealing learning rate schedule, early stopping, and checkpoint saving.
- **`training/evaluate.py`**: Generates multi-class Top-1 Accuracy, Precision, Recall, F1-Score, and exports results to `training/evaluation_report.json`.

---

## 10. Database Schema & Security

Relational PostgreSQL schema managed in Supabase:
- **`public.species`**: Primary taxonomy table indexed by slug identifier.
- **`public.observations`**: Stores geolocated observation entities with foreign key references to species, user IDs, bird counts, habitat, and environmental notes.
- **Row-Level Security (RLS)**:
  - `Public Read Species`: Anyone can query natural-history profiles.
  - `Read Observations`: Demo sightings and public records are readable by all; private sightings are restricted to `auth.uid() = user_id`.
  - `Insert/Update/Delete`: Enforces user identity checks. Privileged service credentials remain strictly server-side.

---

## 11. Local Development Setup

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/adityasing9/SettleHub.git EcoVision
cd EcoVision
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env
# Edit .env with your Supabase credentials

# Seed the database species and demo records:
python -m app.db.seeds

# Start FastAPI server:
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` (Docs: `http://localhost:8000/docs`).

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 12. Automated Testing Suite

EcoVision features an automated pytest test suite covering API health, prediction, Grad-CAM generation, species retrieval, observation persistence, dashboard metrics, and end-to-end user workflows:

```bash
cd backend
pytest tests
```

To run the complete end-to-end acceptance test:
```bash
python -m tests.test_end_to_end_acceptance
```

---

## 13. Docker Deployment

### Run Complete Stack with Docker Compose
```bash
docker compose up --build
```

### Build Backend Standalone Container
```bash
docker build -t ecovision-backend ./backend
docker run -p 8000:8000 -e PORT=8000 ecovision-backend
```

Compatible with:
- Google Cloud Run
- Render
- Railway
- AWS ECS / App Runner

---

## 14. Responsible AI & Ethical Birding Guidelines

1. **AI Decision Support**: The model is an identification assistant. Predictions should always be cross-referenced with plumage patterns, vocalizations, and seasonal range maps.
2. **Coordinate Blurring**: Coordinates are rounded on public map endpoints to obscure precise nest locations of threatened or sensitive species.
3. **No Wildlife Harassment**: Never use automated bird playback tools to flush or harass breeding birds. Keep a safe distance from nests and roosting sites.
4. **Recorded Observation $\ne$ Proof**: Individual sightings do not substitute for multi-year peer-reviewed ecological surveys.

---

## 15. License & Academic Attribution

This project is licensed under the **MIT License**. Created for academic demonstration, environmental science presentations, and AI/ML portfolio evaluation.
