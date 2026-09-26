<div align="center">

# ♻️ EcoSetu AI
### AI-Powered Event Waste Intelligence & Circular Recovery Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/saimukesh-tech/EcoSetu-AI)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**EcoSetu AI** is a full-stack sustainability platform engineered for weddings, festivals, corporate events, and mass community gatherings. It integrates **Machine Learning waste forecasting**, **computer vision waste classification & detection**, **explainable SHAP-style attribution**, **Grounded Gemini + RAG AI advisory**, **verified partner matching**, **pickup state machine logistics**, and **EPA WARM v15 environmental impact analytics**.

[Architecture Docs](docs/ARCHITECTURE.md) • [Impact Methodology](docs/IMPACT_METHODOLOGY.md) • [Threat Model](docs/THREAT_MODEL.md) • [Datasets Guide](DATASETS.md) • [License](LICENSE)

</div>

---

## 📌 Implementation Status Matrix

> [!NOTE]
> All features listed below are fully implemented, type-checked, and integrated into the active running codebase.

| Component / Feature | Implementation Status | Evidence & Validation Details |
| :--- | :--- | :--- |
| **Firebase Authentication** | 🟢 Implemented & Hardened | ID Token verification (`verifyIdToken`), environment-gated demo auth |
| **Server-Side RBAC** | 🟢 Implemented | Express middleware enforcing `ORGANIZER`, `RECOVERY_PARTNER`, `ADMIN` roles |
| **Firestore Security Rules** | 🟢 Implemented | Hardened [`firestore.rules`](firestore.rules) checking owner & admin permissions across 10 collections |
| **Event Waste Prediction API** | 🟢 Implemented | Express $\rightarrow$ FastAPI ML microservice with domain heuristic fallback |
| **Explainable ML Predictions** | 🟢 Implemented | Feature attribution rankings (% importance & $kg$ contributions) |
| **Waste Photo Scanner** | 🟢 Implemented | Interactive UI connecting classification & object detection APIs |
| **Gemini AI + RAG Assistant** | 🟢 Implemented | Grounded Gemini 1.5 Flash assistant with local RAG knowledge retriever |
| **Partner Matching Engine** | 🟢 Implemented | Haversine distance ($R=6,371\text{ km}$), 5-factor scoring engine filtering `VERIFIED` partners |
| **Pickup State Machine** | 🟢 Implemented | 7-stage lifecycle state machine with immutable status audit logs |
| **EPA WARM Impact Engine** | 🟢 Implemented | EPA WARM v15 lifecycle metrics ([`docs/IMPACT_METHODOLOGY.md`](docs/IMPACT_METHODOLOGY.md)) |
| **Actual Waste Feedback Loop** | 🟢 Implemented | Post-event outcome tracking, zero-safe $\text{sMAPE}$ error metrics, retraining readiness |
| **Admin Dashboard & Telemetry** | 🟢 Implemented | Admin route (`/admin`) for partner verification, model registry & live telemetry |
| **Automated Unit Tests & CI/CD** | 🟢 Implemented | Jest & Pytest test suites + GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) |

---

## 📊 Evaluated Machine Learning Metrics & Evidence Links

Every headline ML metric reported by EcoSetu AI is backed by an evaluation artifact stored in the repository:

| Model Name | Task Type | Evaluated Metric | Benchmark Dataset / Split | Evaluation Artifact Link |
| :--- | :--- | :--- | :--- | :--- |
| **Event Waste Regressor** | Tabular Waste Forecast | $R^2 = 0.9238$, MAE = 1.67 kg | 1,782 Event Records Split | [`event_waste_model_v1_meta.json`](ml-service/app/models/event_waste_model_v1_meta.json) |
| **Waste Image Classifier** | 8-Class Classification | Acc = 55.25%, Macro F1 = 0.5517 | Synthetic 400 Test Split | [`waste_classifier_v1_meta.json`](ml-service/app/models/waste_classifier_v1_meta.json) |
| **RealWaste Landfill Benchmark** | Landfill Waste Classification | Acc = 16.46%, Weighted F1 = 0.1665 | 4,752 Australian Facility Images | [`realwaste_evaluation.json`](ml_reports/realwaste_evaluation.json) |
| **Waste Object Detector** | Bounding Box Proposal | 6 Categories, 2,461 Polygons | TACO COCO Waste Split | [`waste_detector_v1_meta.json`](ml-service/app/models/waste_detector_v1_meta.json) |

---

## 📸 Platform Architecture & Workflow

```text
                  [ Event Organizer / User ]
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
  📊 AI Waste Prediction           📷 Photo Scanner
  (Random Forest R²=0.9238)         (8-Class Classifier / Detector)
  (SHAP Feature Attribution)        (Disposal & Segregation Rules)
              │                             │
              └──────────────┬──────────────┘
                             ▼
              🤖 Grounded Gemini + RAG Assistant
              (Domain Knowledge Base + Live Context)
                             │
                             ▼
              🤝 Verified Recovery Partner Matching
              (Haversine Distance + 5-Factor Weighted Score)
                             │
                             ▼
              🚛 Pickup Request State Machine
              (PENDING → ACCEPTED → SCHEDULED → COLLECTED → RECOVERED)
                             │
                             ▼
              📈 EPA WARM v15 Environmental Impact Analytics
              (CO₂e Avoided, Meals Rescued, Landfill Volume Saved)
                             │
                             ▼
              🔄 Closed-Loop Actual Waste Feedback
              (Zero-Safe sMAPE Error Metric & Retraining Pipeline)
```

---

## 🌟 Key Modules Breakdown

### 1. 🤖 ML Waste Prediction & Computer Vision (`ml-service/`)
- **Event Waste Forecasting:** Pre-trained **Random Forest Regressor** ($R^2 = 0.9238$, MAE = 1.67 kg) forecasting total, food, floral, plastic, paper, and fabric waste streams.
- **Explainable Feature Attribution:** Every prediction includes feature importance rankings:
  - **Guest Count**: 65% importance (Primary linear mass driver)
  - **Duration (Hours)**: 18% importance (Accumulation rate)
  - **Food Type**: 12% importance (Organic density ratio)
  - **Decoration Type**: 5% importance (Floral & fabric streams)
- **8-Class Waste Photo Classifier:** Real-time waste category inference across 8 classes (*battery, glass, metal, organic_waste, paper_cardboard, plastic, textiles, trash*).
- **Garbage Instance Detector:** COCO-trained bounding box proposal detector identifying 6 waste categories (*biowaste, glass, household waste, metal, paper/cardboard, plastic*).

### 2. 🤖 Grounded Gemini 1.5 Flash + RAG Assistant (`backend/src/services/`)
- Ingests local **sustainability RAG knowledge chunks** (FSSAI surplus food safety, marigold/rose upcycling, dual-stream plastic segregation, festival protocols, pickup logistics).
- Grounded prompt injection eliminates hallucinations and incorporates live platform telemetry.

### 3. ⚡ Express API Backend (`backend/`)
- **Verified Partner Matching:** Multi-factor scoring algorithm (waste compatibility 35%, capacity 25%, Haversine proximity 20%, availability 10%, verification 10%) filtering strictly for verified partners.
- **Strict Pickup State Machine:** Enforces valid status transitions:
  $$\text{PENDING} \rightarrow \text{ACCEPTED} \rightarrow \text{SCHEDULED} \rightarrow \text{PICKUP\_IN\_PROGRESS} \rightarrow \text{COLLECTED} \rightarrow \text{RECOVERED} \rightarrow \text{COMPLETED}$$
- **EPA WARM v15 Impact Engine:** Verifiable environmental metrics calculation ($1\text{ kg food diverted} = 0.3\text{ meals rescued}, 1\text{ kg plastic} = 1.5\text{ kg } CO_2e\text{ saved}$).
- **Actual Waste Feedback Loop:** Calculates Symmetric Mean Absolute Percentage Error ($\text{sMAPE}$) when organizers log actual post-event outcomes.

### 4. 🎨 Frontend Application (`frontend/`)
- **React 19 & TypeScript:** Built with Vite and Tailwind CSS.
- **Admin Dashboard (`/admin`):** Complete enterprise view for partner verification, model registry, live operational telemetry, and security audit logs.
- **PWA Ready:** Mobile-installable with service worker offline caching.

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite 6 |
| **Backend API** | Node.js, Express.js, TypeScript (`tsx`), Firebase Admin SDK, Zod, Helmet |
| **ML Microservice** | Python 3.11+, FastAPI, Uvicorn, Scikit-Learn, Joblib, NumPy, Pandas, PIL |
| **Database & Auth** | Firebase Authentication, Google OAuth 2.0, Cloud Firestore |
| **Impact Standards** | EPA WARM v15, IPCC Lifecycle Assessment (LCA) |
| **Testing & CI/CD** | Jest, Pytest, GitHub Actions |

---

## 📁 Repository Structure

```text
EcoSetu-AI/
├── .github/
│   └── workflows/                # GitHub Actions CI & Security audit pipelines
├── frontend/                     # React 19 + TypeScript + Vite Web Application
│   ├── src/
│   │   ├── config/               # Centralized frontend environment config
│   │   ├── components/           # UI Components, Navigation, Layouts, Charts
│   │   ├── contexts/             # AuthContext (Firebase) & ThemeContext
│   │   ├── lib/                  # Live API client (`api.ts`), Firebase config
│   │   ├── pages/                # Predictor, Scanner, Partner Matching, Admin Dashboard
│   │   └── types/                # TypeScript Interface definitions
│   └── firestore.rules           # Hardened Firestore security rules
├── backend/                      # Node.js + Express API Backend Server
│   ├── src/
│   │   ├── config/               # Centralized environment config
│   │   ├── middleware/           # Token Auth & Server-Side RBAC Middleware
│   │   ├── routes/v1/            # Versioned REST API Routes
│   │   ├── schemas/              # Zod Input Validation Schemas
│   │   ├── services/             # RAG Engine, Matching Engine, State Machine, Feedback Loop
│   │   └── app.ts                # Express App Initialization
│   └── tests/                    # Jest Unit Test Suite
├── ml-service/                   # Python FastAPI ML Inference Microservice
│   ├── app/
│   │   ├── models/               # Joblib Models & Metadata (.joblib, .json)
│   │   ├── routes/               # FastAPI Endpoints (Predict, Classify, Detect)
│   │   └── main.py               # FastAPI App Engine & Startup Metadata Ingestion
│   └── tests/                    # Pytest Suite
├── docs/                         # Documentation Suite
│   ├── ARCHITECTURE.md           # System Architecture & Topology
│   ├── IMPACT_METHODOLOGY.md     # EPA WARM Conversion Equations & Assumptions
│   └── THREAT_MODEL.md           # Security Architecture & OWASP Controls
├── DATASETS.md                   # Dataset Attribution & Licenses
├── firestore.rules               # Root Firestore security rules
├── LICENSE                       # MIT License
├── README.md                     # Master Repository Guide
└── start_services.bat            # One-Click Automated Windows Launcher
```

---

## 🔌 Core API Endpoints

### Express Backend API (`http://localhost:3001/api/v1`)
| Method | Endpoint | Description | Auth & Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/waste/predict` | Predict waste streams + feature attribution | `Bearer Token` (`ORGANIZER`, `PARTNER`, `ADMIN`) |
| `POST` | `/waste/events` | Create new event record with predictions | `Bearer Token` (`ORGANIZER`, `ADMIN`) |
| `POST` | `/waste/events/:id/actual` | Record actual post-event waste outcomes | `Bearer Token` (`ORGANIZER`, `ADMIN`) |
| `POST` | `/matching/recommend` | Execute Haversine partner matching | `Bearer Token` (`ORGANIZER`, `PARTNER`, `ADMIN`) |
| `POST` | `/matching/partners/register` | Register recovery partner organization | `Bearer Token` (`RECOVERY_PARTNER`, `ADMIN`) |
| `PUT` | `/matching/partners/:id/verify` | Verify or reject partner status | `Bearer Token` (`ADMIN` Only) |
| `POST` | `/pickup/status/validate` | Execute pickup state machine transition | `Bearer Token` (`RECOVERY_PARTNER`, `ADMIN`) |
| `POST` | `/impact/calculate` | Calculate EPA WARM environmental savings | `Bearer Token` (`ORGANIZER`, `PARTNER`, `ADMIN`) |
| `POST` | `/chat` | Conversational RAG assistant endpoint | `Bearer Token` |
| `GET` | `/analytics/models` | Retrieve deployed ML model registry | `Bearer Token` (`ORGANIZER`, `PARTNER`, `ADMIN`) |
| `GET` | `/analytics/monitoring` | Retrieve live operational ML telemetry | `Bearer Token` (`ORGANIZER`, `PARTNER`, `ADMIN`) |
| `GET` | `/notifications/audit-logs` | Fetch system security audit logs | `Bearer Token` (`ADMIN` Only) |

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **Python**: v3.11 or higher

---

### Method A: One-Click Launcher (Windows)

```cmd
.\start_services.bat
```
*Automatically launches the FastAPI ML Service (Port 8000), Express Backend (Port 3001), and Vite Frontend (Port 5173).*

---

### Method B: Step-by-Step Manual Setup

#### 1. Start Python FastAPI ML Microservice
```bash
cd ml-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API docs available at: `http://127.0.0.1:8000/docs`*

#### 2. Start Express Backend Server
```bash
cd backend
npm install
npm run dev
```
*Backend API running at: `http://localhost:3001`*

#### 3. Start React Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
*Frontend running at: `http://localhost:5173`*

---

## 🧪 Automated Testing

### Backend Unit Test Suite (Jest)
```bash
cd backend
npm test
```

### ML Microservice Test Suite (Pytest)
```bash
cd ml-service
pytest tests/
```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

<div align="center">

Made with ❤️ for a Zero-Waste Future 🌱  
**EcoSetu AI Team**

</div>
