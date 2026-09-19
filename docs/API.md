# EcoSetu AI — REST API Documentation

This document describes all API endpoints provided by the Express Backend (`http://localhost:3001`) and Python FastAPI ML Microservice (`http://127.0.0.1:8000`).

---

## 1. FastAPI ML Microservice Endpoints (`http://127.0.0.1:8000`)

### `GET /health`
* **Description:** Returns ML service health and model artifact loading status.
* **Response:**
  ```json
  {
    "status": "ok",
    "service": "EcoSetu ML Service",
    "modelsLoaded": {
      "event_waste_model": true,
      "waste_classifier": true,
      "waste_detector": true
    }
  }
  ```

### `POST /api/ml/event-waste/predict`
* **Description:** Predicts event food waste using pre-trained Random Forest ML model ($R^2 = 0.9238$).
* **Request Body:**
  ```json
  {
    "eventType": "Wedding",
    "guestCount": 500,
    "durationHours": 6,
    "foodType": "Vegetarian",
    "cateringType": "Buffet",
    "location": "Vijayawada"
  }
  ```
* **Response:**
  ```json
  {
    "success": true,
    "prediction": {
      "foodWasteKg": 37.39,
      "flowerWasteKg": 135.0,
      "plasticWasteKg": 75.0,
      "paperWasteKg": 60.0,
      "fabricWasteKg": 112.5,
      "totalWasteKg": 419.89,
      "recoverableWasteKg": 314.92,
      "diversionPercentage": 75.0
    },
    "model": {
      "name": "event-waste-model",
      "version": "v1",
      "algorithm": "RandomForestRegressor",
      "r2Score": 0.9238
    }
  }
  ```

### `POST /api/ml/waste-classification/predict`
* **Description:** Classifies uploaded waste image into categories (`battery`, `glass`, `metal`, `organic_waste`, `paper_cardboard`, `plastic`, `textiles`, `trash`).
* **Content-Type:** `multipart/form-data` (`file`)
* **Response:**
  ```json
  {
    "success": true,
    "prediction": {
      "class": "plastic",
      "confidence": 0.8842
    },
    "topPredictions": [
      { "class": "plastic", "confidence": 0.8842 },
      { "class": "glass", "confidence": 0.0512 }
    ],
    "recommendations": [
      "Check plastic resin code (PET #1, HDPE #2)",
      "Rinse containers before segregation",
      "Connect with plastic recovery partners"
    ]
  }
  ```

---

## 2. Express Backend Endpoints (`http://localhost:3001`)

### `GET /health`
* **Description:** Health check for Express backend & ML service bridge.

### `POST /api/waste/predict`
* **Description:** Proxies event waste prediction to FastAPI ML service, with Gemini AI and heuristic fallback.

### `POST /api/matching/recommend`
* **Description:** Executes multi-factor deterministic partner matching engine.
* **Request:**
  ```json
  {
    "partners": [...],
    "requestedWasteTypes": ["plastic", "paper"],
    "totalKg": 250
  }
  ```
* **Response:**
  ```json
  {
    "success": true,
    "count": 1,
    "matches": [
      {
        "partnerId": "p1",
        "partnerName": "Vijayawada EcoRecycle",
        "matchScore": 1.0,
        "compatibilityPercentage": 100,
        "reasons": [
          "Accepts plastic, paper waste",
          "Has sufficient capacity (1200 kg available vs 250 kg requested)",
          "Currently available for immediate pickup scheduling",
          "Verified EcoSetu recovery partner"
        ]
      }
    ]
  }
  ```

### `POST /api/pickups/validate-transition`
* **Description:** Validates pickup status state machine transitions (`PENDING` -> `ACCEPTED` -> `SCHEDULED` -> `IN_PROGRESS` -> `COMPLETED`).

### `POST /api/impact/calculate`
* **Description:** Calculates environmental impact using EPA WARM / IPCC lifecycle conversion factors.

### `POST /api/chat`
* **Description:** Contextual Gemini 1.5 Flash AI Assistant query endpoint.

### `GET /api/analytics/dashboard`
* **Description:** Aggregate platform metrics for dashboard KPI tiles.
