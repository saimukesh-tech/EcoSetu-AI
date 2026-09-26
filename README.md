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

**EcoSetu AI** is a full-stack sustainability platform designed for weddings, festivals, corporate events, and community gatherings. It integrates **Machine Learning waste forecasting**, **computer vision waste classification & detection**, **explainable SHAP-style attribution**, **Grounded Gemini + RAG AI advisory**, **verified partner matching**, **pickup state machine logistics**, and **EPA WARM v15 environmental impact analytics**.

[Architecture Docs](docs/ARCHITECTURE.md) • [Impact Methodology](docs/IMPACT_METHODOLOGY.md) • [Threat Model](docs/THREAT_MODEL.md) • [Datasets Guide](DATASETS.md) • [License](LICENSE)

</div>

---

## 📌 Implementation Status Matrix

| Component / Feature | Implementation Status | Evidence & Validation Details |
| :--- | :--- | :--- |
| **Firebase Authentication** | 🟢 Implemented & Hardened | ID Token verification (`verifyIdToken`), environment-gated demo auth |
| **Server-Side RBAC** | 🟢 Implemented | Express middleware enforcing `ORGANIZER`, `RECOVERY_PARTNER`, `ADMIN` roles |
| **Firestore Security Rules** | 🟢 Implemented | Hardened [`firestore.rules`](firestore.rules) checking owner & admin permissions |
| **Event Waste Prediction API** | 🟢 Implemented | Express $\rightarrow$ FastAPI ML microservice with domain heuristic fallback |
| **Explainable ML Predictions** | 🟢 Implemented | Feature attribution rankings (% importance & $kg$ contributions) |
| **Waste Photo Scanner** | 🟢 Implemented | Interactive UI connecting classification & object detection APIs |
| **Gemini AI + RAG Assistant** | 🟢 Implemented | Grounded Gemini 1.5 Flash assistant with local RAG knowledge retriever |
| **Partner Matching Engine** | 🟢 Implemented | Haversine distance ($R=6,371\text{ km}$), 5-factor scoring engine filtering `VERIFIED` partners |
| **Pickup State Machine** | 🟢 Implemented | 7-stage lifecycle state machine with immutable status audit logs |
| **EPA WARM Impact Engine** | 🟢 Implemented | EPA WARM v15 lifecycle metrics ([`docs/IMPACT_METHODOLOGY.md`](docs/IMPACT_METHODOLOGY.md)) |
| **Actual Waste Feedback Loop** | 🟢 Implemented | Post-event outcome tracking, $\text{MAPE}$ error metrics, retraining dataset readiness |
| **Admin Dashboard & Telemetry** | 🟢 Implemented | Admin route (`/admin`) for partner verification, model registry & telemetry |
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
```

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite 6 |
| **Backend API** | Node.js, Express.js, TypeScript (`tsx`), Firebase Admin SDK, Zod |
| **ML Microservice** | Python 3.11+, FastAPI, Uvicorn, Scikit-Learn, Joblib, NumPy, Pandas |
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

## 🧪 Running Automated Tests

### Backend Unit Tests (Jest)
```bash
cd backend
npm test
```

### ML Microservice Tests (Pytest)
```bash
cd ml-service
pytest tests/
```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
