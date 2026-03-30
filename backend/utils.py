"""
Utility functions for preprocessing and prediction logic.
Handles sensor data preprocessing and fault prediction using trained ML models.
"""

import numpy as np
import joblib
from pathlib import Path
from typing import Tuple, Optional

# Model paths relative to this file
MODEL_DIR = Path(__file__).parent / "model"
MODEL_PATH = MODEL_DIR / "xgboost_fault_model.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
LABEL_ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"

# Cached model objects (loaded once at startup)
_model = None
_scaler = None
_label_encoder = None


def load_models() -> Tuple[bool, Optional[str]]:
    """
    Load all ML artifacts (model, scaler, label encoder) into memory.
    Returns (success: bool, error_message: Optional[str])
    """
    global _model, _scaler, _label_encoder

    try:
        if not MODEL_PATH.exists():
            return False, f"Model file not found: {MODEL_PATH}"
        if not SCALER_PATH.exists():
            return False, f"Scaler file not found: {SCALER_PATH}"
        if not LABEL_ENCODER_PATH.exists():
            return False, f"Label encoder file not found: {LABEL_ENCODER_PATH}"

        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        _label_encoder = joblib.load(LABEL_ENCODER_PATH)

        return True, None

    except Exception as e:
        return False, str(e)


def preprocess_input(
    vibration_x: float,
    vibration_y: float,
    vibration_z: float,
    acoustic_level: float,
    temperature: float,
) -> np.ndarray:
    """
    Preprocess sensor input into feature array and scale using fitted scaler.
    Feature order must match training pipeline.
    """
    features = np.array(
        [
            [vibration_x, vibration_y, vibration_z, acoustic_level, temperature]
        ]
    )
    return _scaler.transform(features)


def predict_fault(
    vibration_x: float,
    vibration_y: float,
    vibration_z: float,
    acoustic_level: float,
    temperature: float,
) -> Tuple[str, str]:
    """
    Run fault prediction on sensor data.
    Returns (fault_label: str, status: str)
    """
    if _model is None or _scaler is None or _label_encoder is None:
        raise RuntimeError("Models not loaded. Call load_models() first.")

    # Preprocess input
    X = preprocess_input(
        vibration_x, vibration_y, vibration_z, acoustic_level, temperature
    )

    # Predict
    pred_encoded = _model.predict(X)
    fault_label = _label_encoder.inverse_transform(pred_encoded)[0]

    # Map to status
    status = "Fault Detected" if fault_label != "Normal" else "Normal"

    return fault_label, status
