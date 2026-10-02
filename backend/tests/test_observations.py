from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_observations():
    response = client.get("/api/observations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    obs = data[0]
    assert "id" in obs
    assert "predicted_species" in obs
    assert "habitat" in obs
    assert "bird_count" in obs


def test_dashboard_metrics():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_observations" in data
    assert "unique_species" in data
    assert "habitat_distribution" in data
    assert "confidence_distribution" in data
    assert data["total_observations"] >= 1


def test_map_markers():
    response = client.get("/api/map")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first_pt = data[0]
    assert "latitude" in first_pt
    assert "longitude" in first_pt
    assert "species_name" in first_pt
    assert "habitat" in first_pt


def test_create_and_delete_demo_observation():
    new_obs = {
        "species_id": "indian-peafowl",
        "predicted_species": "Indian Peafowl",
        "prediction_confidence": 92.5,
        "image_url": "https://example.com/bird.jpg",
        "latitude": 28.61,
        "longitude": 77.23,
        "location_name": "Delhi Ridge Forest",
        "habitat": "Forest",
        "bird_count": 3,
        "behavior": "Foraging",
        "environmental_notes": "Observed in woodland canopy edge",
        "weather_conditions": "Clear, 25C",
        "is_demo": True,
    }
    response = client.post("/api/observations", json=new_obs)
    assert response.status_code == 201
    created = response.json()
    assert created["predicted_species"] == "Indian Peafowl"
    obs_id = created["id"]

    # Retrieve single observation
    get_resp = client.get(f"/api/observations/{obs_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == obs_id
