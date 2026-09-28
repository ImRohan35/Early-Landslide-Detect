# LandslideGuard AI – ML Module

This folder contains a small Random Forest classification example for a college mini project. It does not connect to the React dashboard yet.

## Dataset schema

| Column | Type | Description |
| --- | --- | --- |
| `latitude` | number | Location latitude in decimal degrees |
| `longitude` | number | Location longitude in decimal degrees |
| `rainfall` | number | Rainfall measurement in millimetres |
| `soil_moisture` | number | Soil moisture percentage, 0–100 |
| `slope` | number | Slope angle in degrees |
| `elevation` | number | Elevation in metres |
| `ndvi` | number | Vegetation index, normally -1 to 1 |
| `historical_landslide` | 0 or 1 | Whether the location has a historical landslide record |
| `landslide_risk` | label | Target: Low, Moderate, High, or Critical |

## Important data note

`data/landslide_dataset.csv` is synthetic demonstration data only. It is useful for exercising the code, but its evaluation scores must not be described as real-world accuracy.

For a real model, collect labelled location-time records from official landslide inventories and monitoring sources. Every row should include the eight input features measured for a known date and location, plus a verified landslide occurrence or risk label. The data should cover multiple monsoon seasons, districts, terrain types, and both landslide and non-landslide cases.

## Setup and run

From the `ml` folder:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python src\train_model.py
python src\predict.py
```

The training script saves these generated files:

```text
models/landslide_risk_model.joblib
models/evaluation_metrics.json
```

## ML workflow

1. Read the CSV with Pandas.
2. Validate the expected columns, convert feature values to numbers, remove duplicates, and reject impossible values.
3. Keep missing feature values for median imputation inside the training pipeline.
4. Make a stratified training/testing split.
5. Train a `RandomForestClassifier`.
6. Evaluate accuracy, weighted precision, weighted recall, weighted F1-score, and a confusion matrix.
7. Save the pipeline with Joblib.
8. Load the model with `predict_landslide_risk()` to receive risk probability, score, and level.
