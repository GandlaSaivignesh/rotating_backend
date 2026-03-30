"""
FastAPI backend for Rotating Equipment Fault Detection System.
Exposes /predict endpoint for fault classification from sensor data.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from utils import load_models, predict_fault

app = FastAPI(
    title="Rotating Equipment Fault Detection API",
    description="ML-powered fault detection from vibration and sensor data",
    version="1.0.0",
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request/Response Schemas ---


class PredictionInput(BaseModel):
    """Input schema for /predict endpoint."""

    vibration_x: float = Field(..., description="Vibration amplitude on X-axis (mm/s)")
    vibration_y: float = Field(..., description="Vibration amplitude on Y-axis (mm/s)")
    vibration_z: float = Field(..., description="Vibration amplitude on Z-axis (mm/s)")
    acoustic_level: float = Field(..., description="Acoustic emission level (dB)")
    temperature: float = Field(..., description="Bearing temperature (°C)")


class PredictionResponse(BaseModel):
    """Response schema for /predict endpoint."""

    fault: str
    status: str


# --- Startup: Load ML models ---


@app.on_event("startup")
def startup_event():
    """Load ML models on application startup."""
    success, error = load_models()
    if not success:
        raise RuntimeError(f"Failed to load models: {error}")


# --- Endpoints ---


@app.get("/")
def root():
    """Health check / API info."""
    return {
        "service": "Rotating Equipment Fault Detection API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    """Health check for load balancers / monitoring."""
    return {"status": "healthy"}


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionInput):
    """
    Predict equipment fault from sensor readings.
    Input: vibration (x,y,z), acoustic level, temperature.
    Output: fault label and status (Normal / Fault Detected).
    """
    try:
        fault, status = predict_fault(
            vibration_x=payload.vibration_x,
            vibration_y=payload.vibration_y,
            vibration_z=payload.vibration_z,
            acoustic_level=payload.acoustic_level,
            temperature=payload.temperature,
        )
        return PredictionResponse(fault=fault, status=status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
