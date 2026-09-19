import os
import zipfile
import json
import io
import numpy as np
from PIL import Image
import joblib
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support, confusion_matrix
from train_waste_classifier import CLASSES, extract_image_features

REALWASTE_MAPPING = {
    'Cardboard': 'paper_cardboard',
    'Food Organics': 'organic_waste',
    'Glass': 'glass',
    'Metal': 'metal',
    'Miscellaneous Trash': 'trash',
    'Paper': 'paper_cardboard',
    'Plastic': 'plastic',
    'Textile Trash': 'textiles',
    'Vegetation': 'organic_waste'
}

def main():
    print("=== EcoSetu AI: RealWaste External Validation Evaluation ===", flush=True)
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    model_path = os.path.join(base_dir, "ml-service", "app", "models", "waste_classifier_v1.joblib")
    zip_path = os.path.join(base_dir, "Ecosetu-ML", "03_realwaste.zip")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model artifact not found at {model_path}")
    if not os.path.exists(zip_path):
        raise FileNotFoundError(f"RealWaste dataset zip not found at {zip_path}")
        
    print(f"Loading trained classifier from {model_path}...", flush=True)
    pipeline = joblib.load(model_path)
    
    X_val = []
    y_true = []
    
    print(f"Sampling images from RealWaste dataset ({zip_path})...", flush=True)
    
    MAX_EVAL_SAMPLES = 1000
    
    with zipfile.ZipFile(zip_path, 'r') as zf:
        infolist = zf.infolist()
        for item in infolist:
            if len(X_val) >= MAX_EVAL_SAMPLES:
                break
            if item.is_dir() or not item.filename.endswith(('.jpg', '.png', '.jpeg')):
                continue
            if 'RealWaste/' in item.filename:
                parts = item.filename.split('RealWaste/')
                if len(parts) > 1:
                    subparts = parts[1].split('/')
                    if len(subparts) >= 2:
                        rw_cls = subparts[0]
                        if rw_cls in REALWASTE_MAPPING:
                            target_cls = REALWASTE_MAPPING[rw_cls]
                            if target_cls in CLASSES:
                                try:
                                    img_bytes = zf.read(item.filename)
                                    img = Image.open(io.BytesIO(img_bytes))
                                    feat = extract_image_features(img)
                                    X_val.append(feat)
                                    y_true.append(CLASSES.index(target_cls))
                                except Exception:
                                    pass
                                    
                                if len(X_val) % 250 == 0:
                                    print(f"Loaded {len(X_val)} validation image features...", flush=True)
                                    
    X_val = np.array(X_val)
    y_true = np.array(y_true)
    
    print(f"Extracted {len(X_val)} validation samples from RealWaste.", flush=True)
    
    y_pred = pipeline.predict(X_val)
    
    acc = float(accuracy_score(y_true, y_pred))
    prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted')
    cm = confusion_matrix(y_true, y_pred, labels=list(range(len(CLASSES)))).tolist()
    
    report = classification_report(y_true, y_pred, target_names=CLASSES, output_dict=True)
    
    print(f"\nRealWaste External Validation Accuracy: {acc * 100:.2f}%", flush=True)
    print(f"Precision: {prec:.4f}, Recall: {rec:.4f}, F1-Score: {f1:.4f}", flush=True)
    
    reports_dir = os.path.join(base_dir, "ml_reports")
    os.makedirs(reports_dir, exist_ok=True)
    
    report_file = os.path.join(reports_dir, "realwaste_evaluation.json")
    
    evaluation_data = {
        "datasetName": "RealWaste (Whyte's Gully Waste Facility, Australia)",
        "license": "CC BY-NC-SA 4.0",
        "citation": "MDPI 2023 - RealWaste: A Novel Real-Life Data Set for Landfill Waste Classification",
        "modelEvaluated": "waste-classifier-v1",
        "totalImagesEvaluated": len(X_val),
        "overallMetrics": {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1Score": float(f1)
        },
        "classMapping": REALWASTE_MAPPING,
        "classes": CLASSES,
        "confusionMatrix": cm,
        "perClassReport": report
    }
    
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(evaluation_data, f, indent=2)
        
    print(f"Saved RealWaste evaluation report to: {report_file}", flush=True)
    print("=== RealWaste Evaluation Complete ===", flush=True)

if __name__ == "__main__":
    main()
