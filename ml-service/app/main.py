import os
import json
import uvicorn
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import predict_event, classify_waste, detect_waste

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise microservice providing event waste predictions, waste image classification, and object detection.",
    version=settings.VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(predict_event.router, prefix="/api/ml/event-waste", tags=["Event Waste Prediction"])
app.include_router(classify_waste.router, prefix="/api/ml/waste-classification", tags=["Waste Image Classification"])
app.include_router(detect_waste.router, prefix="/api/ml/waste-detection", tags=["Waste Detection"])

def _load_meta_file(file_path: str):
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return None
    return None

@app.get("/live")
def liveness_check():
    return {"status": "ok"}

@app.get("/ready")
def readiness_check(response: Response):
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "models"))
    event_model_exists = os.path.exists(os.path.join(models_dir, "event_waste_model_v1.joblib"))
    classifier_exists = os.path.exists(os.path.join(models_dir, "waste_classifier_v1.joblib"))
    
    is_ready = event_model_exists and classifier_exists
    if not is_ready:
        response.status_code = 530
        return {"status": "degraded", "modelsReady": False}

    return {"status": "ready", "modelsReady": True}

@app.get("/health")
def health_check():
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "models"))
    
    event_model_path = os.path.join(models_dir, "event_waste_model_v1.joblib")
    event_meta = _load_meta_file(os.path.join(models_dir, "event_waste_model_v1_meta.json"))
    
    classifier_model_path = os.path.join(models_dir, "waste_classifier_v1.joblib")
    classifier_meta = _load_meta_file(os.path.join(models_dir, "waste_classifier_v1_meta.json"))
    
    detector_model_path = os.path.join(models_dir, "waste_detector_v1.joblib")
    detector_meta = _load_meta_file(os.path.join(models_dir, "waste_detector_v1_meta.json"))
    
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "models": {
            "event_waste_model_v1": {
                "loaded": os.path.exists(event_model_path),
                "algorithm": event_meta.get("algorithm", "RandomForestRegressor") if event_meta else "RandomForestRegressor",
                "r2Score": event_meta.get("metrics", {}).get("R2", 0.9238) if event_meta else 0.9238,
                "maeKg": event_meta.get("metrics", {}).get("MAE", 1.67) if event_meta else 1.67
            },
            "waste_classifier_v1": {
                "loaded": os.path.exists(classifier_model_path),
                "classes": len(classifier_meta.get("classes", [])) if classifier_meta else 8,
                "accuracy": classifier_meta.get("accuracy", 0.5525) if classifier_meta else 0.5525
            },
            "waste_detector_v1": {
                "loaded": os.path.exists(detector_model_path),
                "categories": len(detector_meta.get("categories", {})) if detector_meta else 6
            }
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
