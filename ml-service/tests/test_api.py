from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_liveness():
    response = client.get("/live")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_readiness():
    response = client.get("/ready")
    assert response.status_code in [200, 530]

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "models" in data

def test_event_prediction():
    payload = {
        "eventType": "Wedding",
        "guestCount": 200,
        "durationHours": 6,
        "foodType": "Vegetarian",
        "cateringType": "Buffet",
        "decorationType": "Flowers + Fabric",
        "location": "Vijayawada"
    }
    response = client.post("/api/ml/event-waste/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "prediction" in data
    assert "explainability" in data
    assert data["prediction"]["totalWasteKg"] > 0
