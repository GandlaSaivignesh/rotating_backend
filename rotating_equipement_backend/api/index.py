"""
Vercel serverless function entry point for lightweight FastAPI backend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any

# Import lightweight prediction
from predict import predict_handler, PredictionInput, PredictionResponse

app = FastAPI(
    title="Rotating Equipment Fault Detection API",
    description="Lightweight fault detection from sensor data",
    version="1.0.0",
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    Predict equipment fault from sensor readings using rule-based logic.
    Input: vibration (x,y,z), acoustic level, temperature.
    Output: fault label and status.
    """
    try:
        return predict_handler(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Vercel serverless handler - export the app directly
handler = app

# For Vercel Python runtime
def lambda_handler(event, context):
    """AWS Lambda handler for Vercel compatibility."""
    return handler
