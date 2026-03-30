# Rotating Equipment Fault Detection System

A full-stack web application for ML-powered fault detection in rotating equipment using vibration and sensor data.

## Project Structure

```
rotating-equipment-fault-app/
├── backend/
│   ├── app.py              # FastAPI backend
│   ├── model/
│   │   ├── xgboost_fault_model.pkl
│   │   ├── scaler.pkl
│   │   └── label_encoder.pkl
│   ├── requirements.txt
│   ├── utils.py            # Preprocessing & prediction logic
│   └── create_dummy_models.py   # Generates dummy models for dev
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── README.md
└── .gitignore
```

## Quick Start

### 1. Create ML Models (if you don't have trained models)

```bash
cd backend
python create_dummy_models.py
```

This generates dummy XGBoost models for development/testing.

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Start the Backend

```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 4. Open the Frontend

Open `frontend/index.html` in a browser, or serve it with a simple HTTP server:

```bash
cd frontend
python -m http.server 3000
```

Then visit `http://localhost:3000`.

## API

### POST /predict

**Request:**
```json
{
  "vibration_x": 2.5,
  "vibration_y": 2.3,
  "vibration_z": 2.1,
  "acoustic_level": 65.0,
  "temperature": 45.0
}
```

**Response:**
```json
{
  "fault": "Bearing Fault",
  "status": "Fault Detected"
}
```

- `status` is `"Normal"` when no fault is detected, otherwise `"Fault Detected"`.

## Using Your Own Trained Models

Replace the files in `backend/model/` with your trained artifacts:

- `xgboost_fault_model.pkl` — XGBoost classifier
- `scaler.pkl` — Fitted `StandardScaler` (or equivalent)
- `label_encoder.pkl` — Fitted `LabelEncoder` for fault labels

Feature order must match: `[vibration_x, vibration_y, vibration_z, acoustic_level, temperature]`.

## Tech Stack

- **Backend:** FastAPI, joblib, XGBoost, scikit-learn, NumPy
- **Frontend:** HTML, CSS, JavaScript (vanilla)
