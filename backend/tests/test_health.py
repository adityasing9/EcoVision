from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "EcoVision"
    assert "tagline" in data
    assert data["status"] == "operational"


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ml_system" in data
    assert data["ml_system"]["architecture"] == "resnet50"
    assert data["ml_system"]["classes_supported"] >= 20
    assert "thresholds" in data
