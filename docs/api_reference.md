# EcoVision REST API Specification

FastAPI automatically generates interactive Swagger documentation available at `/docs` and ReDoc at `/redoc`.

Base URL: `http://localhost:8000/api`

---

## 1. System Health

### `GET /api/health`
Returns system diagnostics, database connection status, active PyTorch architecture, device, and confidence thresholds.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "service": "EcoVision",
  "version": "1.0.0",
  "environment": "development",
  "database": {
    "connected": true,
    "provider": "Supabase PostgreSQL"
  },
  "ml_system": {
    "architecture": "resnet50",
    "device": "cpu",
    "model_loaded": true,
    "torch_version": "2.12.0+cpu",
    "classes_supported": 20
  },
  "thresholds": {
    "high": 0.8,
    "medium": 0.5
  }
}
```

---

## 2. AI Identification & Explainability

### `POST /api/predict`
Analyzes an uploaded bird photograph using PyTorch ResNet-50 transfer learning.

- **Content-Type**: `multipart/form-data`
- **Query Parameters**:
  - `include_gradcam` (bool, default `true`): Whether to generate Grad-CAM visual attention overlay.

**Form Data**:
- `file`: Image binary (JPEG, PNG, WebP)

**Response `200 OK`**:
```json
{
  "top_prediction": {
    "species_id": "indian-peafowl",
    "common_name": "Indian Peafowl",
    "scientific_name": "Pavo cristatus",
    "confidence": 0.946,
    "confidence_percentage": 94.6
  },
  "alternative_predictions": [
    {
      "species_id": "white-throated-kingfisher",
      "common_name": "White-throated Kingfisher",
      "scientific_name": "Halcyon smyrnensis",
      "confidence": 0.032,
      "confidence_percentage": 3.2
    },
    {
      "species_id": "great-hornbill",
      "common_name": "Great Hornbill",
      "scientific_name": "Buceros bicornis",
      "confidence": 0.012,
      "confidence_percentage": 1.2
    }
  ],
  "confidence_level": "Likely identified",
  "threshold_applied": 0.8,
  "is_uncertain": false,
  "guidance_message": "Model exhibits strong visual correspondence with Indian Peafowl (94.6%).",
  "species_details": {
    "id": "indian-peafowl",
    "common_name": "Indian Peafowl",
    "scientific_name": "Pavo cristatus",
    "family": "Phasianidae",
    "order_name": "Galliformes",
    "conservation_status": "Least Concern (LC)"
  },
  "gradcam_heatmap": "data:image/png;base64,...",
  "model_architecture": "resnet50",
  "disclaimer": "AI-assisted prediction tool. Predictions may reflect visual similarity..."
}
```

---

## 3. Avian Species Catalog

### `GET /api/species`
Queries species catalog with optional text search and filters.
- **Parameters**:
  - `query` (string, optional): Search by common or scientific name
  - `habitat` (string, optional): Filter by habitat (e.g. Forest, Wetland)
  - `limit` (int, default 50)

### `GET /api/species/{species_id}`
Returns the comprehensive natural-history monograph for a specific avian species.

---

## 4. Biodiversity Observations

### `POST /api/observations/upload-image`
Uploads an image to Supabase Storage `bird-observations` bucket.
- **Returns**: `{ "image_url": "https://..." }`

### `POST /api/observations`
Persists an observation into Supabase PostgreSQL.
- **Payload**:
```json
{
  "species_id": "indian-peafowl",
  "predicted_species": "Indian Peafowl",
  "prediction_confidence": 94.6,
  "image_url": "https://...",
  "latitude": 28.5983,
  "longitude": 77.2189,
  "location_name": "Lodhi Gardens, New Delhi",
  "habitat": "Garden",
  "bird_count": 2,
  "behavior": "Courtship Display",
  "environmental_notes": "Two adult males observed fanning full trains.",
  "weather_conditions": "Overcast, 28°C"
}
```

### `GET /api/observations`
Lists observation records with optional filtering by habitat, species, or authenticated user.

### `GET /api/observations/{obs_id}`
Retrieves a single observation by UUID.

### `PATCH /api/observations/{obs_id}`
Updates editable observation metadata (notes, bird count, habitat, behavior).

### `DELETE /api/observations/{obs_id}`
Deletes an observation record owned by the authenticated user.

---

## 5. Analytics & Geospatial Endpoints

### `GET /api/dashboard`
Returns real-time aggregated metrics:
- Total observations
- Distinct species count
- Total birds tallied
- Habitat distribution breakdown
- Most observed species rankings
- Confidence categorization counts

### `GET /api/map`
Returns geolocated observation points for Leaflet map markers.
- **Query Parameter**: `habitat` (optional filter)
