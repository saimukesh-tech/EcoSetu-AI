import os
import zipfile
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
import joblib

def main():
    print("=== EcoSetu AI: Training Event Food Waste Prediction Model ===")
    
    # 1. Locate dataset zip
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    zip_path = os.path.join(base_dir, "Ecosetu-ML", "01_food_waste_management.zip")
    
    if not os.path.exists(zip_path):
        raise FileNotFoundError(f"Dataset zip not found at {zip_path}")
        
    print(f"Reading dataset from {zip_path}...")
    with zipfile.ZipFile(zip_path, 'r') as zf:
        with zf.open('food_wastage_data.csv') as f:
            df = pd.read_csv(f)
            
    # Clean BOM header if present
    df.columns = [c.replace('\ufeff', '').strip() for c in df.columns]
    print(f"Dataset loaded successfully. Shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    
    target_col = "Wastage Food Amount"
    if target_col not in df.columns:
        raise KeyError(f"Target column '{target_col}' not found in dataset")
        
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    categorical_cols = X.select_dtypes(include=['object', 'category']).columns.tolist()
    numerical_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    
    print(f"Categorical features ({len(categorical_cols)}): {categorical_cols}")
    print(f"Numerical features ({len(numerical_cols)}): {numerical_cols}")
    
    # Preprocessor pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols),
            ('num', 'passthrough', numerical_cols)
        ]
    )
    
    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
    
    models = {
        "RandomForestRegressor": RandomForestRegressor(n_estimators=100, random_state=42),
        "GradientBoostingRegressor": GradientBoostingRegressor(n_estimators=100, random_state=42),
        "RidgeRegression": Ridge(alpha=1.0)
    }
    
    best_name = None
    best_pipeline = None
    best_r2 = -float('inf')
    best_metrics = {}
    
    results = {}
    
    for name, model in models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(root_mean_squared_error(y_test, y_pred))
        r2 = float(r2_score(y_test, y_pred))
        
        print(f"Model: {name} -> MAE: {mae:.2f} kg, RMSE: {rmse:.2f} kg, R2: {r2:.4f}")
        results[name] = {"MAE": mae, "RMSE": rmse, "R2": r2}
        
        if r2 > best_r2:
            best_r2 = r2
            best_name = name
            best_pipeline = pipeline
            best_metrics = {"MAE": mae, "RMSE": rmse, "R2": r2}
            
    print(f"\nBest Model Selected: {best_name} (R2: {best_r2:.4f})")
    
    # Save model artifact
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app", "models"))
    os.makedirs(models_dir, exist_ok=True)
    
    model_file_path = os.path.join(models_dir, "event_waste_model_v1.joblib")
    meta_file_path = os.path.join(models_dir, "event_waste_model_v1_meta.json")
    
    joblib.dump(best_pipeline, model_file_path)
    
    metadata = {
        "modelName": "event-waste-model",
        "version": "v1",
        "algorithm": best_name,
        "features": {
            "categorical": categorical_cols,
            "numerical": numerical_cols
        },
        "metrics": best_metrics,
        "allModelResults": results,
        "trainingRecords": len(df),
        "targetVariable": target_col
    }
    
    with open(meta_file_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved model to: {model_file_path}")
    print(f"Saved metadata to: {meta_file_path}")
    print("=== Training Complete ===")

if __name__ == "__main__":
    main()
