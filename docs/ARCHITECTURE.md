# EcoSetu AI — System Architecture & Design Specification

## Overview

EcoSetu AI is an end-to-end event sustainability, waste prediction, waste classification, and recovery coordination platform built for circular economy management.

```
                                ┌────────────────────────┐
                                │   React 19 Frontend    │
                                │   (Vite + Tailwind)    │
                                └───────────┬────────────┘
                                            │
                                  HTTPS REST / Firebase SDK
                                            │
                                ┌───────────▼────────────┐
                                │  Node.js Express API   │
                                │   (Auth, Business,     │
                                │    Gemini Assistant)   │
                                └─────┬──────────────┬───┘
                                      │              │
                       Firestore / Storage           │ HTTP REST
                                      │              │
                    ┌─────────────────▼───┐      ┌───▼────────────────┐
                    │ Firebase Firestore  │      │ Python FastAPI     │
                    │ & Storage Bucket    │      │ ML Service         │
                    └─────────────────────┘      │ (Model Artifacts)  │
                                                 └────────────────────┘
```

## System Components

### 1. Frontend (`frontend/`)
- **Framework:** React 19 + TypeScript + Vite + TailwindCSS.
- **Routing:** React Router v7 with dynamic lazy loading.
- **Authentication:** Firebase Auth SDK + local demo fallback.
- **Components:** Modular accessible design system with inline visual analytics (`WasteCharts.tsx`) and AI indicators.

### 2. Express Backend (`backend/`)
- **Framework:** Node.js + Express 5 + TypeScript.
- **Responsibilities:**
  - Token authentication middleware (`middleware/auth.ts`)
  - Deterministic Partner Matching Engine (`services/matchingEngine.ts`)
  - Pickup Request State Machine (`services/pickupStateMachine.ts`)
  - Environmental Impact Calculator (`services/impactCalculator.ts` + `config/impactFactors.json`)
  - Contextual Gemini AI Assistant (`POST /api/chat`)
  - Analytics and health diagnostics (`GET /health`, `GET /api/analytics/dashboard`)

### 3. FastAPI ML Service (`ml-service/`)
- **Framework:** Python 3.11 + FastAPI + Scikit-Learn + Pillow + Joblib.
- **Responsibilities:**
  - Cached startup model loading (`event_waste_model_v1.joblib`, `waste_classifier_v1.joblib`, `waste_detector_v1.joblib`)
  - Tabular food waste inference (`POST /api/ml/event-waste/predict`)
  - Image waste classification (`POST /api/ml/waste-classification/predict`)
  - Garbage object detection (`POST /api/ml/waste-detection/predict`)

### 4. Database & Cloud Services
- **Firestore:** Document storage for `users`, `events`, `waste_predictions`, `recovery_partners`, `pickup_requests`, `impact_records`, `notifications`, `chat_sessions`, `chat_messages`.
- **Firebase Storage:** Waste image storage bucket.
