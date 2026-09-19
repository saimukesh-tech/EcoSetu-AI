import os
import sys
import json
import io
import joblib
import numpy as np
from PIL import Image
from fastapi import APIRouter, File, UploadFile, HTTPException

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "training")))
from train_waste_classifier import CLASSES, extract_image_features

router = APIRouter()

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
MODEL_PATH = os.path.join(MODEL_DIR, "waste_classifier_v1.joblib")
META_PATH = os.path.join(MODEL_DIR, "waste_classifier_v1_meta.json")

classifier_pipeline = None
classifier_meta = None

RECOMMENDATIONS = {
    "battery": [
        "Store in a dry, non-conductive container.",
        "Do not dispose of in regular trash bins due to toxic metals.",
        "Send to a specialized hazardous waste recycler."
    ],
    "glass": [
        "Rinse glass containers to remove food residues.",
        "Segregate by color (clear, green, amber) if required.",
        "Send to local glass recycling partner for crushing into cullet."
    ],
    "metal": [
        "Clean and crush aluminum cans or tin containers.",
        "Keep scrap metal free of non-metallic contaminants.",
        "Send to scrap metal recovery partners."
    ],
    "organic_waste": [
        "Segregate food scraps and organic waste at source.",
        "Send to local commercial composting or biogas facility.",
        "Avoid mixing with plastics or inorganic materials."
    ],
    "paper_cardboard": [
        "Flatten cardboard boxes and keep paper dry.",
        "Remove plastic tape or heavy adhesive labels.",
        "Send to paper pulping recycling plant."
    ],
    "plastic": [
        "Check plastic resin code (PET #1, HDPE #2, etc.).",
        "Rinse containers and dry before segregation.",
        "Connect with plastic recovery partners for mechanical recycling."
    ],
    "textiles": [
        "Donate clean reusable fabrics and clothes.",
        "Segregate unwearable textile scraps for shredding/fiber recovery.",
        "Partner with textile recycling organizations."
    ],
    "trash": [
        "Inspect for any recyclable or compostable components.",
        "Dispose of non-recyclable residual waste responsibly.",
        "Minimize future use of single-use non-recyclable materials."
    ],
    "uncertain": [
        "Image feature confidence is below threshold.",
        "Please provide a clearer, well-lit photo of the waste item.",
        "Manual inspection or secondary verification recommended."
    ]
}

def load_classifier_model():
    global classifier_pipeline, classifier_meta
    if classifier_pipeline is None:
        if os.path.exists(MODEL_PATH):
            classifier_pipeline = joblib.load(MODEL_PATH)
        if os.path.exists(META_PATH):
            with open(META_PATH, 'r', encoding='utf-8') as f:
                classifier_meta = json.load(f)

@router.post("/predict")
async def classify_waste_image(file: UploadFile = File(...)):
    load_classifier_model()
    
    if classifier_pipeline is None:
        raise HTTPException(status_code=503, detail="Waste classifier ML model is not available")
        
    # Validation
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid image format. Supported formats: JPEG, PNG, WEBP.")
        
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds maximum limit of 10MB.")
        
    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
        # Re-open after verify()
        img = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Corrupt or invalid image file.")
        
    feat = extract_image_features(img)
    X_input = np.array([feat])
    
    probs = classifier_pipeline.predict_proba(X_input)[0]
    top_indices = np.argsort(probs)[::-1]
    
    top_class_idx = top_indices[0]
    top_confidence = float(probs[top_class_idx])
    
    threshold = classifier_meta.get("confidenceThreshold", 0.40) if classifier_meta else 0.40
    
    if top_confidence < threshold:
        predicted_class = "uncertain"
    else:
        predicted_class = CLASSES[top_class_idx]
        
    top_predictions = []
    for idx in top_indices[:3]:
        top_predictions.append({
            "class": CLASSES[idx],
            "confidence": round(float(probs[idx]), 4)
        })
        
    recs = RECOMMENDATIONS.get(predicted_class, RECOMMENDATIONS["uncertain"])
    
    return {
        "success": True,
        "prediction": {
            "class": predicted_class,
            "confidence": round(top_confidence, 4)
        },
        "topPredictions": top_predictions,
        "recommendations": recs,
        "model": {
            "name": classifier_meta.get("modelName", "waste-classifier") if classifier_meta else "waste-classifier",
            "version": classifier_meta.get("version", "v1") if classifier_meta else "v1"
        }
    }
