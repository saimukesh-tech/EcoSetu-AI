import os
import zipfile
import json
import io
import sys
import numpy as np
from PIL import Image
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support
import joblib

CLASSES = ['battery', 'glass', 'metal', 'organic_waste', 'paper_cardboard', 'plastic', 'textiles', 'trash']
IMG_SIZE = (32, 32)

def extract_image_features(img: Image.Image) -> np.ndarray:
    """Extracts fast resized RGB image + color channel statistics."""
    img_rgb = img.convert('RGB').resize(IMG_SIZE)
    arr = np.array(img_rgb, dtype=np.float32) / 255.0
    
    spatial = arr.flatten()
    r_mean, g_mean, b_mean = np.mean(arr, axis=(0, 1))
    r_std, g_std, b_std = np.std(arr, axis=(0, 1))
    
    return np.hstack([spatial, [r_mean, g_mean, b_mean, r_std, g_std, b_std]])

def main():
    print("=== EcoSetu AI: Training Waste Image Classifier ===", flush=True)
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    zip_path = os.path.join(base_dir, "Ecosetu-ML", "02_unified_waste_classification.zip")
    
    if not os.path.exists(zip_path):
        raise FileNotFoundError(f"Dataset zip not found at {zip_path}")
        
    print(f"Sampling images from {zip_path}...", flush=True)
    
    X_data = []
    y_data = []
    
    SAMPLES_PER_CLASS = 250
    class_counts = {c: 0 for c in CLASSES}
    
    with zipfile.ZipFile(zip_path, 'r') as zf:
        infolist = zf.infolist()
        for item in infolist:
            if item.is_dir() or not item.filename.endswith(('.jpg', '.png', '.jpeg')):
                continue
                
            parts = item.filename.split('/')
            if len(parts) >= 3:
                cls_name = parts[2]
                if cls_name in CLASSES and class_counts[cls_name] < SAMPLES_PER_CLASS:
                    try:
                        img_bytes = zf.read(item.filename)
                        img = Image.open(io.BytesIO(img_bytes))
                        feat = extract_image_features(img)
                        X_data.append(feat)
                        y_data.append(CLASSES.index(cls_name))
                        class_counts[cls_name] += 1
                    except Exception:
                        pass
                    
                    total_samples = sum(class_counts.values())
                    if total_samples % 400 == 0:
                        print(f"Extracted {total_samples} / {len(CLASSES)*SAMPLES_PER_CLASS} image features...", flush=True)
                        
                    if all(count >= SAMPLES_PER_CLASS for count in class_counts.values()):
                        break
                        
    X = np.array(X_data)
    y = np.array(y_data)
    print(f"Extracted dataset shape: X={X.shape}, y={y.shape}", flush=True)
    print(f"Class distribution: {class_counts}", flush=True)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Fitting MLP Neural Classifier pipeline...", flush=True)
    clf_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('mlp', MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=100, random_state=42))
    ])
    
    clf_pipeline.fit(X_train, y_train)
    y_pred = clf_pipeline.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
    
    print(f"\nClassification Test Accuracy: {acc * 100:.2f}%", flush=True)
    print(f"Weighted Precision: {prec:.4f}, Recall: {rec:.4f}, F1-Score: {f1:.4f}", flush=True)
    
    report = classification_report(y_test, y_pred, target_names=CLASSES, output_dict=True)
    
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app", "models"))
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "waste_classifier_v1.joblib")
    meta_path = os.path.join(models_dir, "waste_classifier_v1_meta.json")
    
    joblib.dump(clf_pipeline, model_path)
    
    metadata = {
        "modelName": "waste-classifier",
        "version": "v1",
        "algorithm": "StandardScaler + MLPClassifier(128, 64)",
        "classes": CLASSES,
        "inputImageSize": list(IMG_SIZE),
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1Score": float(f1),
        "confidenceThreshold": 0.40,
        "classificationReport": report,
        "sampleCounts": class_counts
    }
    
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved classifier artifact to: {model_path}", flush=True)
    print(f"Saved metadata to: {meta_path}", flush=True)
    print("=== Training Complete ===", flush=True)

if __name__ == "__main__":
    main()
