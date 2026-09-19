import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predict_event, classify_waste, detect_waste

app = FastAPI(
    title="EcoSetu AI ML Service",
    description="Microservice providing event waste predictions, waste image classification, and object detection.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_event.router, prefix="/api/ml/event-waste", tags=["Event Waste Prediction"])
app.include_router(classify_waste.router, prefix="/api/ml/waste-classification", tags=["Waste Image Classification"])
app.include_router(detect_waste.router, prefix="/api/ml/waste-detection", tags=["Waste Detection"])

@app.get("/health")
def health_check():
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "models"))
    event_model_exists = os.path.exists(os.path.join(models_dir, "event_waste_model_v1.joblib"))
    classifier_exists = os.path.exists(os.path.join(models_dir, "waste_classifier_v1.joblib"))
    detector_exists = os.path.exists(os.path.join(models_dir, "waste_detector_v1.joblib"))
    
    return {
        "status": "ok",
        "service": "EcoSetu ML Service",
        "modelsLoaded": {
            "event_waste_model": event_model_exists,
            "waste_classifier": classifier_exists,
            "waste_detector": detector_exists
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
