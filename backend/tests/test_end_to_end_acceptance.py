"""
Comprehensive End-to-End Acceptance Test for EcoVision Platform.
Verifies the complete Section 51 workflow:
Image -> PyTorch Inference -> Confidence & Top-3 -> Grad-CAM ->
Storage Upload -> Observation DB Record -> Dashboard Aggregation -> Map Markers -> Species Explorer.
"""

import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app


def test_full_acceptance_workflow():
    with TestClient(app) as client:
        # 1. System Health & ML Initialization
        health_resp = client.get("/api/health")
        assert health_resp.status_code == 200
        health_data = health_resp.json()
        assert health_data["status"] == "healthy"
        assert health_data["ml_system"]["model_loaded"] is True
        print("[OK] Stage 1: System health & ML initialization verified.")

        # 2. Bird Photograph Inference with PyTorch ResNet-50
        test_img = Image.new("RGB", (256, 256), color=(30, 90, 140))
        buf = io.BytesIO()
        test_img.save(buf, format="JPEG")
        image_bytes = buf.getvalue()

        predict_resp = client.post(
            "/api/predict",
            files={"file": ("field_specimen.jpg", image_bytes, "image/jpeg")},
            params={"include_gradcam": True},
        )
        assert predict_resp.status_code == 200
        pred_data = predict_resp.json()

        assert "top_prediction" in pred_data
        assert "confidence_level" in pred_data
        assert len(pred_data["alternative_predictions"]) == 2  # Top 3 total
        assert pred_data["gradcam_heatmap"] is not None
        assert pred_data["gradcam_heatmap"].startswith("data:image/png;base64,")

        top_pred = pred_data["top_prediction"]
        species_id = top_pred["species_id"]
        print(f"[OK] Stage 2: ML inference passed. Predicted: {top_pred['common_name']} ({top_pred['confidence_percentage']}%), Grad-CAM generated.")

        # 3. Upload Image to Supabase Storage
        upload_resp = client.post(
            "/api/observations/upload-image",
            files={"file": ("field_specimen.jpg", image_bytes, "image/jpeg")},
        )
        assert upload_resp.status_code == 200
        upload_data = upload_resp.json()
        assert "image_url" in upload_data
        image_url = upload_data["image_url"]
        print(f"[OK] Stage 3: Image stored in Supabase Storage: {image_url}")

        # 4. Save Observation Record into Supabase PostgreSQL
        obs_payload = {
            "species_id": species_id,
            "predicted_species": top_pred["common_name"],
            "prediction_confidence": top_pred["confidence_percentage"],
            "top_predictions": [top_pred, *pred_data["alternative_predictions"]],
            "image_url": image_url,
            "latitude": 28.5983,
            "longitude": 77.2189,
            "location_name": "Acceptance Test Ecological Field",
            "habitat": "Forest",
            "bird_count": 3,
            "behavior": "Foraging",
            "environmental_notes": "Automated acceptance test verification sighting",
            "weather_conditions": "Clear, 26C",
            "is_demo": False,
        }

        obs_resp = client.post("/api/observations", json=obs_payload)
        assert obs_resp.status_code == 201
        obs_data = obs_resp.json()
        assert obs_data["id"] is not None
        assert obs_data["predicted_species"] == top_pred["common_name"]
        created_id = obs_data["id"]
        print(f"[OK] Stage 4: Observation stored in Supabase PostgreSQL (ID: {created_id}).")

        # 5. Dashboard Aggregates Updates
        dash_resp = client.get("/api/dashboard")
        assert dash_resp.status_code == 200
        dash_data = dash_resp.json()
        assert dash_data["total_observations"] >= 1
        assert "Forest" in dash_data["habitat_distribution"]
        print(f"[OK] Stage 5: Dashboard reflects updated counts (Total: {dash_data['total_observations']}).")

        # 6. Observation Appears on Interactive Map
        map_resp = client.get("/api/map?habitat=Forest")
        assert map_resp.status_code == 200
        map_points = map_resp.json()
        matching_marker = any(pt["id"] == created_id for pt in map_points)
        assert matching_marker is True
        print("[OK] Stage 6: Observation pin successfully mapped with coordinates.")

        # 7. Species Explorer Profile Retrieval
        spec_resp = client.get(f"/api/species/{species_id}")
        assert spec_resp.status_code == 200
        spec_data = spec_resp.json()
        assert spec_data["id"] == species_id
        assert "family" in spec_data
        assert "diet" in spec_data
        assert "ecological_role" in spec_data
        print(f"[OK] Stage 7: Species natural-history compendium verified for {spec_data['common_name']}.")

        # Cleanup test record using admin privileges
        try:
            from app.db.supabase import get_supabase_admin_client
            admin = get_supabase_admin_client()
            admin.table("observations").delete().eq("id", created_id).execute()
            print(f"[OK] Cleanup: Test observation {created_id} cleaned up.")
        except Exception as e:
            print(f"[WARN] Cleanup failed: {e}")
        print("\nALL 7 ACCEPTANCE TEST WORKFLOW PHASES VERIFIED SUCCESSFULLY!")


if __name__ == "__main__":
    test_full_acceptance_workflow()
