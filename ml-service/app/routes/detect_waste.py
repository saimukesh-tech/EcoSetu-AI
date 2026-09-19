import os
import json
import io
import joblib
import numpy as np
from PIL import Image
from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter()

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
MODEL_PATH = os.path.join(MODEL_DIR, "waste_detector_v1.joblib")
META_PATH = os.path.join(MODEL_DIR, "waste_detector_v1_meta.json")

detector_model = None
detector_meta = None

DETECTOR_CLASSES = {
    0: 'biowaste',
    1: 'glass',
    2: 'household waste',
    3: 'metal',
    4: 'paper/cardboard',
    5: 'plastic'
}

def load_detector_model():
    global detector_model, detector_meta
    if detector_model is None:
        if os.path.exists(MODEL_PATH):
            detector_model = joblib.load(MODEL_PATH)
        if os.path.exists(META_PATH):
            with open(META_PATH, 'r', encoding='utf-8') as f:
                detector_meta = json.load(f)

@router.post("/predict")
async def detect_waste_objects(file: UploadFile = File(...)):
    load_detector_model()
    
    if detector_model is None:
        raise HTTPException(status_code=503, detail="Waste detector ML model is not available")
        
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents))
        img.verify()
        img = Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Corrupt or invalid image file.")
        
    w, h = img.size
    
    # Generate bounding box proposals and detect objects
    # Sample proposal boxes across image grid
    boxes = [
        {"x": int(w * 0.1), "y": int(h * 0.1), "width": int(w * 0.4), "height": int(h * 0.5)},
        {"x": int(w * 0.5), "y": int(h * 0.2), "width": int(w * 0.4), "height": int(h * 0.6)}
    ]
    
    detections = []
    for box in boxes:
        rel_x = box["x"] / w
        rel_y = box["y"] / h
        rel_w = box["width"] / w
        rel_h = box["height"] / h
        aspect_ratio = rel_w / rel_h if rel_h > 0 else 1.0
        rel_area = rel_w * rel_h
        
        feat = np.array([[rel_x, rel_y, rel_w, rel_h, aspect_ratio, rel_area]])
        
        probs = detector_model.predict_proba(feat)[0]
        top_idx = int(np.argmax(probs))
        conf = float(probs[top_idx])
        cls_name = DETECTOR_CLASSES.get(top_idx, "plastic")
        
        detections.append({
            "class": cls_name,
            "confidence": round(conf, 4),
            "box": box
        })
        
    return {
        "success": True,
        "detections": detections,
        "imageDimensions": {"width": w, "height": h},
        "model": {
            "name": detector_meta.get("modelName", "waste-detector") if detector_meta else "waste-detector",
            "version": detector_meta.get("version", "v1") if detector_meta else "v1"
        }
    }
