# EcoSetu AI — Machine Learning Pipeline & Model Specifications

This document outlines the three machine learning models developed, trained, and integrated into EcoSetu AI.

---

## Model 1: Tabular Event Food Waste Predictor (`event-waste-model-v1`)

* **Dataset:** `Ecosetu-ML/01_food_waste_management.zip` (`food_wastage_data.csv`, 1,782 records)
* **Target Variable:** `Wastage Food Amount` (kg)
* **Features:**
  - Categorical: `Type of Food`, `Event Type`, `Storage Conditions`, `Purchase History`, `Seasonality`, `Preparation Method`, `Geographical Location`, `Pricing`
  - Numerical: `Number of Guests`, `Quantity of Food`
* **Algorithm Comparison:**
  - **Random Forest Regressor:** MAE = 1.67 kg, RMSE = 2.81 kg, $R^2 = 0.9238$ (**Selected Best Model**)
  - Gradient Boosting Regressor: MAE = 2.35 kg, RMSE = 3.10 kg, $R^2 = 0.9073$
  - Ridge Regression: MAE = 3.91 kg, RMSE = 5.02 kg, $R^2 = 0.7564$
* **Artifact Files:**
  - `ml-service/app/models/event_waste_model_v1.joblib`
  - `ml-service/app/models/event_waste_model_v1_meta.json`

---

## Model 2: Waste Image Classifier (`waste-classifier-v1`)

* **Training Dataset:** `Ecosetu-ML/02_unified_waste_classification.zip` (64,000 images across 8 balanced classes)
* **Categories:** `battery`, `glass`, `metal`, `organic_waste`, `paper_cardboard`, `plastic`, `textiles`, `trash`
* **Architecture:** `StandardScaler` + `MLPClassifier(128, 64)` trained on spatial & RGB color histogram feature vectors.
* **Confidence Threshold:** 0.40 (Returns `class: "uncertain"` when top probability < 0.40).
* **External Validation Dataset:** `Ecosetu-ML/03_realwaste.zip` (4,752 images from Whyte's Gully Waste Facility, Australia, CC BY-NC-SA 4.0 license).
* **Validation Report:** `ml_reports/realwaste_evaluation.json`.

---

## Model 3: Garbage Object Detector (`waste-detector-v1`)

* **Dataset:** `Ecosetu-ML/04_garbage_segmentation.zip` (941 images, 2,461 annotations in COCO JSON format)
* **Categories:** `biowaste` (0), `glass` (1), `household waste` (2), `metal` (3), `paper/cardboard` (4), `plastic` (5).
* **Format:** Polygon segmentation masks (`segmentation`) and bounding boxes (`bbox`).
* **Artifact Files:**
  - `ml-service/app/models/waste_detector_v1.joblib`
  - `ml-service/app/models/waste_detector_v1_meta.json`
