"""
Lightweight prediction function without heavy ML dependencies.
Uses simple rule-based logic for fault detection.
"""

from pydantic import BaseModel
from typing import Tuple

class PredictionInput(BaseModel):
    vibration_x: float
    vibration_y: float
    vibration_z: float
    acoustic_level: float
    temperature: float

class PredictionResponse(BaseModel):
    fault: str
    status: str

def predict_fault_simple(vibration_x: float, vibration_y: float, vibration_z: float, 
                        acoustic_level: float, temperature: float) -> Tuple[str, str]:
    """
    Simple rule-based fault detection without heavy ML models.
    """
    # Calculate overall vibration magnitude
    vibration_magnitude = (vibration_x**2 + vibration_y**2 + vibration_z**2)**0.5
    
    # Rule-based fault detection
    if vibration_magnitude > 7.0:
        return "Severe Vibration Fault", "Fault Detected"
    elif vibration_magnitude > 4.0:
        return "Moderate Vibration Fault", "Warning"
    elif temperature > 80:
        return "Overheating", "Fault Detected"
    elif acoustic_level > 90:
        return "Acoustic Anomaly", "Warning"
    elif vibration_magnitude > 2.5 or temperature > 65 or acoustic_level > 75:
        return "Minor Anomaly", "Monitor"
    else:
        return "Normal", "Healthy"

def predict_handler(payload: PredictionInput) -> PredictionResponse:
    """Handle prediction request."""
    fault, status = predict_fault_simple(
        payload.vibration_x,
        payload.vibration_y,
        payload.vibration_z,
        payload.acoustic_level,
        payload.temperature
    )
    return PredictionResponse(fault=fault, status=status)
