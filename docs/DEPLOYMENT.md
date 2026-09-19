# EcoSetu AI — Deployment & Setup Guide

This guide covers local development setup, model training execution, and production deployment instructions for EcoSetu AI.

---

## 1. Prerequisites

- **Node.js:** v18+ or v20+ / v24+
- **Python:** Python 3.11+
- **Git:** Git CLI

---

## 2. Local Development Setup

### Step A: Clone Repository & Install Dependencies

```bash
git clone https://github.com/saimukesh-tech/datsets.git EcoSetuAI
cd EcoSetuAI

# Frontend dependencies
cd frontend
npm install
cd ..

# Backend dependencies
cd backend
npm install
cd ..

# ML Service dependencies
pip install -r ml-service/requirements.txt
```

---

### Step B: Run Reproducible ML Model Training

```bash
# 1. Train Event Food Waste Tabular ML Model
python ml-service/training/train_event_waste.py

# 2. Train Waste Image Classifier Model
python ml-service/training/train_waste_classifier.py

# 3. Evaluate Classifier against RealWaste Validation Dataset
python ml-service/training/evaluate_realwaste.py

# 4. Train Garbage Object Detector
python ml-service/training/train_waste_detector.py
```

---

### Step C: Launch Services

#### 1. Start Python FastAPI ML Microservice (Port 8000)
```bash
cd ml-service
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

#### 2. Start Express Backend (Port 3001)
```bash
cd backend
npx tsx watch src/index.ts
```

#### 3. Start React Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

Open browser at `http://localhost:5173`.

---

## 3. Production Build & Deployment

- **Frontend:** `npm run build` in `frontend/` outputs optimized bundle to `frontend/dist/`. Deploy to Vercel, Netlify, or Firebase Hosting.
- **Backend:** `npm run build` in `backend/` compiles TypeScript to `backend/dist/index.js`. Run with `node dist/index.js` or Docker on AWS EC2, GCP Cloud Run, or Render.
- **ML Microservice:** Deploy Python FastAPI microservice using Uvicorn or Gunicorn with Docker container on AWS ECS, GCP Cloud Run, or DigitalOcean App Platform.
