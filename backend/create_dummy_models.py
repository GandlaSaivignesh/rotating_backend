"""
Creates dummy ML models for development/testing.
Run this script if you don't have trained models yet.
Usage: python create_dummy_models.py
"""

import joblib
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler, LabelEncoder
import xgboost as xgb

MODEL_DIR = Path(__file__).parent / "model"
MODEL_DIR.mkdir(exist_ok=True)

# Generate synthetic training-like data
np.random.seed(42)
n_samples = 500

# Normal: low vibration, moderate temp
normal = np.column_stack([
    np.random.uniform(0.1, 2.0, n_samples),   # vibration_x
    np.random.uniform(0.1, 2.0, n_samples),   # vibration_y
    np.random.uniform(0.1, 2.0, n_samples),   # vibration_z
    np.random.uniform(40, 70, n_samples),     # acoustic_level
    np.random.uniform(25, 55, n_samples),     # temperature
])

# Bearing fault: higher vibration, elevated temp
bearing = np.column_stack([
    np.random.uniform(3.0, 8.0, n_samples),
    np.random.uniform(3.0, 8.0, n_samples),
    np.random.uniform(3.0, 8.0, n_samples),
    np.random.uniform(70, 95, n_samples),
    np.random.uniform(55, 85, n_samples),
])

# Misalignment: moderate vibration
misalign = np.column_stack([
    np.random.uniform(2.0, 5.0, n_samples),
    np.random.uniform(2.0, 5.0, n_samples),
    np.random.uniform(2.0, 5.0, n_samples),
    np.random.uniform(55, 80, n_samples),
    np.random.uniform(45, 70, n_samples),
])

X = np.vstack([normal, bearing, misalign])
y = ["Normal"] * n_samples + ["Bearing Fault"] * n_samples + ["Misalignment"] * n_samples

# Fit scaler and transform
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Fit label encoder
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

# Train XGBoost
model = xgb.XGBClassifier(n_estimators=50, max_depth=4, random_state=42)
model.fit(X_scaled, y_encoded)

# Save artifacts
joblib.dump(model, MODEL_DIR / "xgboost_fault_model.pkl")
joblib.dump(scaler, MODEL_DIR / "scaler.pkl")
joblib.dump(label_encoder, MODEL_DIR / "label_encoder.pkl")

print(f"Models saved to {MODEL_DIR}")
print("  - xgboost_fault_model.pkl")
print("  - scaler.pkl")
print("  - label_encoder.pkl")
