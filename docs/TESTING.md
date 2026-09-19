# EcoSetu AI — Automated & Manual Testing Specification

## 1. Automated Verification Procedures

### Python ML Service Tests
- **Event Waste Prediction:** Verify prediction outputs on valid guest counts and check error handling for zero or negative values.
- **Image Classification:** Test upload endpoints with valid JPG/PNG images, corrupt files, and non-image MIME types. Check confidence thresholding for `class: "uncertain"`.

### Node.js Express Backend Tests
- **API Health Check:** Verify `GET /health` returns status `ok` and reports FastAPI ML service health.
- **Deterministic Partner Matching:** Test scoring algorithm across 0%, 50%, and 100% capacity and waste type overlap scenarios.
- **Pickup State Machine:** Verify legal state transitions (`PENDING` -> `ACCEPTED` -> `SCHEDULED` -> `IN_PROGRESS` -> `COMPLETED`) and rejection of invalid jumps (`COMPLETED` -> `PENDING`).
- **Environmental Impact Calculator:** Test total kg diverted and CO2e calculation accuracy against `config/impactFactors.json`.

### Frontend Build Verification
- Execute `npm run build` in `frontend/` to confirm 0 TypeScript compiler errors or broken chunk dependencies.

---

## 2. End-to-End User Verification Flow

1. **User Authentication:** Log in as Organizer via Firebase Auth or Demo mode.
2. **Dashboard Overview:** Reach Organizer Dashboard showing real KPI tiles.
3. **Create Event:** Fill out New Event form and verify event record creation.
4. **AI Waste Prediction:** Execute `POST /api/waste/predict` and view predicted food waste kg and category breakdown.
5. **Waste Image Classification:** Upload a waste item photo on `WastePredictionPage` and receive category classification, confidence score, and guidance.
6. **Partner Matching:** Open `PartnerMatchingPage` to view ranked partners with deterministic match scores and explainable reasons.
7. **Pickup Request & Tracking:** Create a pickup request, track state machine status changes from `PENDING` -> `ACCEPTED` -> `COMPLETED`.
8. **Environmental Impact:** View `ImpactPage` metrics showing diverted waste, avoided CO2e, and rescued meals.
9. **Gemini AI Assistant:** Ask questions on `AIAssistantPage` and receive domain-focused responses.
