from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_species():
    response = client.get("/api/species")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 10
    first = data[0]
    assert "id" in first
    assert "common_name" in first
    assert "scientific_name" in first
    assert "conservation_status" in first


def test_species_search_and_filter():
    response = client.get("/api/species?query=peafowl")
    assert response.status_code == 200
    data = response.json()
    assert any("peafowl" in s["common_name"].lower() for s in data)

    habitat_resp = client.get("/api/species?habitat=Forest")
    assert habitat_resp.status_code == 200
    hab_data = habitat_resp.json()
    assert len(hab_data) > 0


def test_get_single_species():
    response = client.get("/api/species/indian-peafowl")
    assert response.status_code == 200
    data = response.json()
    assert data["common_name"] == "Indian Peafowl"
    assert data["scientific_name"] == "Pavo cristatus"
    assert "ecological_role" in data
    assert "diet" in data
    assert "conservation_status" in data


def test_species_not_found():
    response = client.get("/api/species/non-existent-bird-xyz")
    assert response.status_code == 404
