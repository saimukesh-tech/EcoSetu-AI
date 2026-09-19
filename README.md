<div align="center">

# ♻️ EcoSetu AI
### Production-Grade Enterprise Sustainability & Festival Waste Intelligence Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/saimukesh-tech/EcoSetu-AI)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Git LFS](https://img.shields.io/badge/Git_LFS-3.7.1-orange.svg)](https://git-lfs.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**EcoSetu AI** is a real-world, production-ready AI platform engineered for Indian weddings, festivals (Diwali, Ganesh Chaturthi), corporate galas, and community events. It unifies high-accuracy **Machine Learning waste forecasting**, **real-time 8-class computer vision image classification**, **garbage instance detection**, **deterministic recovery partner matching**, **pickup logistics state machines**, and **EPA WARM v15 environmental impact conversion**.

[Architecture Docs](docs/ARCHITECTURE.md) • [API Specification](docs/API.md) • [Database Schema](docs/DATABASE.md) • [ML Whitepaper](docs/ML.md) • [Datasets Guide](DATASETS.md)

</div>

---

## 📸 Overview & Vision

Large-scale events generate massive volumes of unsegregated organic, plastic, paper, and floral waste that end up in landfills. **EcoSetu AI** bridges the gap between event organizers and local eco-recovery partners (NGOs, composting units, recyclers, food banks) through automated AI prediction, verified partner matching, transparent logistics tracking, and verified lifecycle impact telemetry.

```
                  [ Event Organizer ]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
 📊 AI Waste Prediction       📷 Photo Scanner
 (Random Forest R²=0.9238)     (8-Class Classifier / Detector)
             │                           │
             └─────────────┬─────────────┘
                           ▼
             🤖 Express Matching Engine
             (Multi-factor Deterministic Scoring)
                           │
                           ▼
             🤝 Verified Recovery Partner
                           │
                           ▼
             🚛 Pickup Request State Machine
             (PENDING → ACCEPTED → SCHEDULED → COLLECTED → RECOVERED)
                           │
                           ▼
             📈 EPA WARM v15 Impact Analytics
             (CO₂e Avoided, Meals Rescued, Trees Equivalent)
```

---

## 🌟 Key Features & Systems

### 1. 🤖 ML Waste Prediction & Computer Vision (`ml-service/`)
- **Event Waste Forecasting:** Trained on real-world event dataset (`01_food_waste_management.zip`). Uses a pre-trained **Random Forest Regressor** ($R^2 = 0.9238$, MAE = 1.67 kg) to forecast total, food, and recyclable waste based on guest headcount, duration, meal style, and venue type.
- **8-Class Waste Image Classifier:** Real-time waste category inference across 8 classes (*Cardboard, Glass, Metal, Organic, Paper, Plastic, Trash, Textile*) with confidence thresholding.
- **RealWaste External Benchmark:** Evaluated against 4,752 landfill images from Whyte's Gully Waste Facility (Australia). Full evaluation report stored in [`ml_reports/realwaste_evaluation.json`](ml_reports/realwaste_evaluation.json).
- **Garbage Object Detector:** Polygon mask instance detector trained on COCO waste annotations (`04_garbage_segmentation.zip`).

### 2. ⚡ Express API Backend (`backend/`)
- **Deterministic Partner Matching Engine:** Evaluates recovery partners dynamically using a multi-factor score algorithm (waste type compatibility, available vehicle capacity, geographical proximity, real-time availability, and partner verification status).
- **Strict Pickup State Machine:** Enforces valid lifecycle transitions (`PENDING` $\rightarrow$ `ACCEPTED` $\rightarrow$ `SCHEDULED` $\rightarrow$ `PICKUP_IN_PROGRESS` $\rightarrow$ `COLLECTED` $\rightarrow$ `RECOVERED` $\rightarrow$ `COMPLETED`).
- **EPA WARM v15 Impact Calculator:** Uses EPA Waste Reduction Model v15 factors (`backend/src/config/impactFactors.json`) for verifiable metric calculation ($1 \text{ kg food diverted} = 0.3 \text{ meals rescued}, 1 \text{ kg plastic diverted} = 1.5 \text{ kg CO}_2\text{e saved}$).
- **Gemini AI Sustainability Assistant:** Express `/api/chat` route with contextual prompt injection for waste segregation and composting guidance.
- **Role-Based Access Middleware:** Server-side JWT/Firebase token validation for `ORGANIZER`, `RECOVERY_PARTNER`, and `ADMIN` roles.

### 3. 🎨 Production Frontend (`frontend/`)
- **React 19 & TypeScript:** Modern, type-safe single-page application built with Vite and Tailwind CSS.
- **Interactive Dashboards:** Live analytics charts, event management, real-time partner matching interface, pickup tracking timelines, and impact metrics.
- **Progressive Web App (PWA):** Mobile-installable with service worker offline caching.
- **Dual Light/Dark Theme:** System-aware theme toggle with custom brand tokens.

### 4. 📦 Complete Datasets Tracked via Git LFS (`Ecosetu-ML/`)
All 4 primary ML datasets are included directly in the repository via Git LFS:
1. `01_food_waste_management.zip` — Event food waste tabular dataset
2. `02_unified_waste_classification.zip` — 64,000-image waste classification dataset
3. `03_realwaste.zip` — RealWaste Australian landfill facility dataset
4. `04_garbage_segmentation.zip` — COCO Garbage Segmentation dataset

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite 6 |
| **Backend API** | Node.js, Express.js, TypeScript (`tsx`), Firebase Admin SDK |
| **ML Microservice** | Python 3.11+, FastAPI, Uvicorn, Scikit-Learn, Joblib, NumPy, Pandas |
| **Database & Auth** | Firebase Authentication, Google OAuth 2.0, Cloud Firestore |
| **Dataset Storage** | Git LFS (Large File Storage) 3.7.1 |
| **Impact Standards** | EPA WARM v15, IPCC Lifecycle Assessment (LCA) |

---

## 📁 Repository Structure

```
EcoSetu-AI/
├── frontend/                     # React 19 + TypeScript + Vite Web Application
│   ├── src/
│   │   ├── components/           # UI Components, Navigation, Layouts, Charts
│   │   ├── contexts/             # AuthContext (Firebase) & ThemeContext
│   │   ├── lib/                  # Live API client (`api.ts`), Firebase config
│   │   ├── pages/                # Predictor, Scanner, Partner Matching, Dashboards, Impact
│   │   └── types/                # TypeScript Interface definitions
│   ├── public/                   # PWA Manifest & Brand Assets
│   └── vite.config.ts            # Vite Build & PWA Configuration
│
├── backend/                      # Node.js + Express API Backend Server
│   ├── src/
│   │   ├── config/               # EPA WARM Impact Factors JSON
│   │   ├── middleware/           # Token & Role-Based Auth Middleware
│   │   ├── services/             # Deterministic Matching Engine, State Machine, Impact Calculator
│   │   └── index.ts              # Express Server Routes & Health Check
│   └── tsconfig.json             # TypeScript Compiler Options
│
├── ml-service/                   # Python FastAPI ML Inference Microservice
│   ├── app/
│   │   ├── models/               # Pre-Trained Joblib Models & Metadata (.joblib, .json)
│   │   ├── routes/               # FastAPI Inference Endpoints (Predict, Classify, Detect)
│   │   └── main.py               # FastAPI App Engine & Startup Caching
│   ├── training/                 # Offline Model Training Scripts
│   └── requirements.txt          # Python Dependencies
│
├── Ecosetu-ML/                   # Full ML Datasets Tracked via Git LFS (3.7 GB)
│   ├── 01_food_waste_management.zip
│   ├── 02_unified_waste_classification.zip
│   ├── 03_realwaste.zip
│   └── 04_garbage_segmentation.zip
│
├── docs/                         # Production Documentation Suite
│   ├── ARCHITECTURE.md           # System Architecture & Component Interactions
│   ├── API.md                    # Complete OpenAPI/Swagger Endpoint Reference
│   ├── DATABASE.md               # Firestore Collections & Index Definitions
│   ├── ML.md                     # Model Architectures, Metrics & Validation
│   ├── DEPLOYMENT.md             # Docker, Vercel & Render Deployment Guides
│   ├── SECURITY.md               # Security Controls & Compliance
│   └── TESTING.md                # Unit & E2E Testing Strategies
│
├── DATASETS.md                   # Dataset Attribution, License & Schema Guide
├── README.md                     # Master Repository Guide
├── .env.example                  # Centralized Environment Variables Template
└── start_services.bat            # One-Click Automated Windows Launcher
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git & Git LFS**: Installed locally

---

### Method A: One-Click Launcher (Windows)

Simply double-click or run from PowerShell:
```cmd
.\start_services.bat
```
*This automatically starts the FastAPI ML Service (Port 8000), Express Backend (Port 3001), and Vite Frontend (Port 5173).*

---

### Method B: Manual Step-by-Step Setup

#### 1. Clone the Repository (with Git LFS)
```bash
git clone https://github.com/saimukesh-tech/EcoSetu-AI.git
cd EcoSetu-AI
git lfs pull
```

#### 2. Start ML Microservice (Python)
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
*ML Service running at: `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`)*

#### 3. Start Express Backend (Node.js)
```bash
cd backend
npm install
npm run dev
```
*Express Backend running at: `http://localhost:3001`*

#### 4. Start React Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend running at: `http://localhost:5173`*

---

## 🔌 API Endpoint Highlights

### ML Microservice (`http://localhost:8000`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check & model status |
| `POST` | `/api/ml/event-waste/predict` | Predict waste weights using Random Forest |
| `POST` | `/api/ml/waste-classification/predict` | Classify image into 8 waste categories |
| `POST` | `/api/ml/waste-detection/predict` | Detect waste objects in uploaded photo |

### Express Backend (`http://localhost:3001`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Express server & downstream ML service check |
| `POST` | `/api/waste/predict` | Unified frontend prediction route |
| `POST` | `/api/matching/recommend` | Execute deterministic partner matching |
| `POST` | `/api/pickup/status/validate` | State machine transition validator |
| `POST` | `/api/impact/calculate` | EPA WARM v15 conversion calculator |
| `POST` | `/api/chat` | Gemini AI Assistant conversational endpoint |

---

## 📈 ML Model Benchmarks

```
   ┌─────────────────────────────────────────────────────────┐
   │ Model                   Algorithm          Metric/Score │
   ├─────────────────────────────────────────────────────────┤
   │ Event Waste Model       RandomForest       R² = 0.9238  │
   │ Waste Classifier        8-Class Pipeline   Acc = 89.4%  │
   │ RealWaste Benchmark     ResNet Validation  Acc = 84.2%  │
   │ Garbage Detector        COCO Mask R-CNN    mAP = 0.76   │
   └─────────────────────────────────────────────────────────┘
```

Detailed model evaluation reports are documented in [`docs/ML.md`](docs/ML.md).

---

## 📚 Technical Documentation

Explore the comprehensive engineering documentation suite in the `docs/` folder:

- 🏗️ **[System Architecture](docs/ARCHITECTURE.md)** — C4 Diagrams, Data Flows, Fault Tolerance
- 📡 **[API Specification](docs/API.md)** — OpenAPI Specs, Schemas, Request/Response Payload Examples
- 🗄️ **[Database Architecture](docs/DATABASE.md)** — Firestore Schema, Indexes, Security Rules
- 🧠 **[ML Model Whitepaper](docs/ML.md)** — Feature Engineering, Cross-Validation, RealWaste Benchmarks
- 🚀 **[Deployment Guide](docs/DEPLOYMENT.md)** — Docker, Vercel, Render, Environment Matrix
- 🔒 **[Security & Compliance](docs/SECURITY.md)** — Threat Modeling, Token Verification, Rate Limiting
- 🧪 **[Testing Strategy](docs/TESTING.md)** — Jest, Pytest, Playwright E2E Integration

---

## 🤝 Contributing & Community

We welcome contributions from open-source developers, ML researchers, and environmental sustainability advocates!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

Made with ❤️ for a Zero-Waste Future 🌱  
**EcoSetu AI Team**

</div>
