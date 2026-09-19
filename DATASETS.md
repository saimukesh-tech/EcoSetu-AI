# EcoSetu AI - Comprehensive Dataset Audit (DATASETS.md)

This document presents a detailed audit of all 4 datasets included in `Ecosetu-ML/` within the repository.

---

## 1. Food Waste Management Dataset

* **Source Archive:** `Ecosetu-ML/01_food_waste_management.zip`
* **Contents:** `food_wastage_data.csv`
* **Record Count:** 1,782 records
* **Total Columns:** 11 features
* **Missing Values:** 0
* **Target Variable:** `Wastage Food Amount` (Continuous, numerical kg)
* **Features:**
  1. `Type of Food` (Categorical: Meat, Vegetarian, Vegan, Mixed, etc.)
  2. `Number of Guests` (Integer)
  3. `Event Type` (Categorical: Corporate, Birthday, Wedding, etc.)
  4. `Quantity of Food` (Numerical)
  5. `Storage Conditions` (Categorical: Refrigerated, Room Temperature, etc.)
  6. `Purchase History` (Categorical: Regular, Bulk, etc.)
  7. `Seasonality` (Categorical: All Seasons, Winter, Summer, etc.)
  8. `Preparation Method` (Categorical: Buffet, Plated, etc.)
  9. `Geographical Location` (Categorical: Urban, Suburban, Rural, etc.)
  10. `Pricing` (Categorical: Low, Medium, High)
  11. `Wastage Food Amount` (Numerical target - kg)
* **Intended Purpose:** Training tabular ML models (Random Forest, Gradient Boosting, XGBoost/LightGBM, Linear Regression) to predict food waste amount for events based on guest count, food type, event type, and catering parameters.

---

## 2. Unified Waste Classification Dataset

* **Source Archive:** `Ecosetu-ML/02_unified_waste_classification.zip`
* **Contents:** 64,000 images across 8 balanced class directories
* **Class Distribution (8,000 images per class):**
  - `battery`: 8,000
  - `glass`: 8,000
  - `metal`: 8,000
  - `organic_waste`: 8,000
  - `paper_cardboard`: 8,000
  - `plastic`: 8,000
  - `textiles`: 8,000
  - `trash`: 8,000
* **Total Files:** 64,000 images (.jpg format)
* **Intended Purpose:** Primary training dataset for transfer learning image classification models (MobileNetV3 / ResNet / EfficientNet) to classify waste into categories for recovery recommendations.

---

## 3. RealWaste External Validation Dataset

* **Source Archive:** `Ecosetu-ML/03_realwaste.zip`
* **Contents:** 4,752 real-world waste images from Whyte's Gully Waste Facility (Wollongong NSW Australia)
* **License:** CC BY-NC-SA 4.0 (Citation: *RealWaste: A Novel Real-Life Data Set for Landfill Waste Classification Using Deep Learning*, MDPI 2023)
* **Class Distribution (9 classes):**
  - `Cardboard`: 461
  - `Food Organics`: 411
  - `Glass`: 420
  - `Metal`: 790
  - `Miscellaneous Trash`: 495
  - `Paper`: 500
  - `Plastic`: 921
  - `Textile Trash`: 318
  - `Vegetation`: 436
* **Total Files:** 4,752 images
* **Intended Purpose:** External validation benchmark to evaluate out-of-distribution performance, precision, recall, F1-score, and confusion matrices for the waste classification model.

---

## 4. Garbage Segmentation / Detection Dataset

* **Source Archive:** `Ecosetu-ML/04_garbage_segmentation.zip`
* **Contents:** 941 images with COCO-formatted JSON annotations (`train_json.json`), test images, and submission format
* **Annotation Format:** COCO JSON format with bounding boxes (`bbox`) and polygon segmentation coordinates (`segmentation`).
* **Categories (6 classes):**
  - ID 0: `biowaste`
  - ID 1: `glass`
  - ID 2: `household waste`
  - ID 3: `metal`
  - ID 4: `paper/cardboard`
  - ID 5: `plastic`
* **Image Count:** 941 train images
* **Annotation Count:** 2,461 labeled waste instances
* **Intended Purpose:** Object detection and instance segmentation for identifying and localizing waste items in uploaded photos.

---

## Production Architecture & Dataset Rules

1. **No Runtime Loading of Raw Data:** The multi-gigabyte raw dataset zips in `Ecosetu-ML/` will be used ONLY during reproducible offline/scripted training routines (`ml-service/training/`).
2. **Artifact Persistence:** Trained model weights (e.g. ONNX, PyTorch `.pt`, Scikit-learn `.joblib`) and metadata JSON files will be exported to `ml-service/app/models/` for fast CPU inference.
3. **Inference Service:** The FastAPI ML service (`ml-service`) will load model artifacts once at startup into memory for sub-second REST API predictions.
