import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_predict_endpoint_with_valid_image():
    # Create synthetic test image
    img = Image.new("RGB", (224, 224), color=(60, 120, 80))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    image_bytes = buffer.getvalue()

    response = client.post(
        "/api/predict",
        files={"file": ("bird.jpg", image_bytes, "image/jpeg")},
        params={"include_gradcam": True},
    )

    assert response.status_code == 200
    data = response.json()

    assert "top_prediction" in data
    assert "alternative_predictions" in data
    assert len(data["alternative_predictions"]) == 2  # Top 3 total: 1 top + 2 alternatives
    assert "confidence_level" in data
    assert data["confidence_level"] in [
        "Likely identified",
        "Possible identification",
        "Identification uncertain",
    ]
    assert "disclaimer" in data
    assert "gradcam_heatmap" in data
    assert data["gradcam_heatmap"] is not None
    assert data["gradcam_heatmap"].startswith("data:image/png;base64,")


def test_predict_invalid_file_type():
    response = client.post(
        "/api/predict",
        files={"file": ("test.txt", b"plain text is not an image", "text/plain")},
    )
    assert response.status_code == 415  # Unsupported media type
