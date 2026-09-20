import os
import uvicorn
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predict_event, classify_waste, detect_waste

app = FastAPI(
    title="EcoSetu AI ML Service",
    description="Enterprise microservice providing event waste predictions, waste image classification, and object detection.",
    version="1.0.0"
)

allowed_origins = [
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ecosetu-ai.vercel.app",
    "https://frontend-olive-mu-zals2li3b6.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(predict_event.router, prefix="/api/ml/event-waste", tags=["Event Waste Prediction"])
app.include_router(classify_waste.router, prefix="/api/ml/waste-classification", tags=["Waste Image Classification"])
app.include_router(detect_waste.router, prefix="/api/ml/waste-detection", tags=["Waste Detection"])

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
    event_model_exists = os.path.exists(os.path.join(models_dir, "event_waste_model_v1.joblib"))
    classifier_exists = os.path.exists(os.path.join(models_dir, "waste_classifier_v1.joblib"))
    detector_exists = os.path.exists(os.path.join(models_dir, "waste_detector_v1.joblib"))
    
    return {
        "status": "ok",
        "service": "EcoSetu ML Service",
        "version": "1.0.0",
        "models": {
            "event_waste_model_v1": {"loaded": event_model_exists, "algorithm": "RandomForestRegressor", "r2": 0.9238},
            "waste_classifier_v1": {"loaded": classifier_exists, "classes": 8},
            "waste_detector_v1": {"loaded": detector_exists, "type": "COCO_Mask_RCNN"}
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
