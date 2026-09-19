import os
import zipfile
import json
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

DETECTOR_CATEGORIES = {
    0: 'biowaste',
    1: 'glass',
    2: 'household waste',
    3: 'metal',
    4: 'paper/cardboard',
    5: 'plastic'
}

def main():
    print("=== EcoSetu AI: Training Garbage Object Detector / Classifier ===")
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    zip_path = os.path.join(base_dir, "Ecosetu-ML", "04_garbage_segmentation.zip")
    
    if not os.path.exists(zip_path):
        raise FileNotFoundError(f"Dataset zip not found at {zip_path}")
        
    print(f"Reading COCO annotations from {zip_path}...")
    
    X_bbox = []
    y_cat = []
    num_polygons = 0
    
    with zipfile.ZipFile(zip_path, 'r') as zf:
        for item in zf.infolist():
            if item.filename.endswith('train_json.json'):
                raw = zf.read(item.filename)
                data = json.loads(raw.decode('utf-8'))
                
                annotations = data.get('annotations', [])
                images = {img['id']: img for img in data.get('images', [])}
                
                print(f"Found {len(images)} images and {len(annotations)} object annotations.")
                
                for ann in annotations:
                    cat_id = ann.get('category_id')
                    bbox = ann.get('bbox') # [x, y, width, height]
                    area = ann.get('area', 0)
                    segmentation = ann.get('segmentation', [])
                    
                    if cat_id in DETECTOR_CATEGORIES and bbox and len(bbox) == 4:
                        img_info = images.get(ann.get('image_id'), {})
                        img_w = img_info.get('width', 1000)
                        img_h = img_info.get('height', 1000)
                        
                        # Normalized bbox features: [rel_x, rel_y, rel_w, rel_h, aspect_ratio, rel_area]
                        x, y, w, h = bbox
                        aspect_ratio = w / h if h > 0 else 1.0
                        rel_x = x / img_w
                        rel_y = y / img_h
                        rel_w = w / img_w
                        rel_h = h / img_h
                        rel_area = area / (img_w * img_h)
                        
                        X_bbox.append([rel_x, rel_y, rel_w, rel_h, aspect_ratio, rel_area])
                        y_cat.append(cat_id)
                        
                        if segmentation and len(segmentation) > 0:
                            num_polygons += 1
                            
    X = np.array(X_bbox)
    y = np.array(y_cat)
    
    print(f"Processed {len(X)} object instances with {num_polygons} segmentation polygon masks.")
    
    # Train object classifier / anchor detector
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    
    y_pred = clf.predict(X)
    acc = accuracy_score(y, y_pred)
    
    print(f"Detector BBox Feature Classifier Accuracy: {acc * 100:.2f}%")
    unique_labels = sorted(list(set(y)))
    target_names = [DETECTOR_CATEGORIES[i] for i in unique_labels]
    report = classification_report(y, y_pred, labels=unique_labels, target_names=target_names, output_dict=True)
    
    # Save model artifact
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app", "models"))
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "waste_detector_v1.joblib")
    meta_path = os.path.join(models_dir, "waste_detector_v1_meta.json")
    
    joblib.dump(clf, model_path)
    
    metadata = {
        "modelName": "waste-detector",
        "version": "v1",
        "categories": DETECTOR_CATEGORIES,
        "totalAnnotations": len(X),
        "totalPolygons": num_polygons,
        "accuracy": float(acc),
        "classificationReport": report
    }
    
    with open(meta_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved detector artifact to: {model_path}")
    print(f"Saved metadata to: {meta_path}")
    print("=== Training Complete ===")

if __name__ == "__main__":
    main()
