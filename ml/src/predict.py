"""Load the saved model and predict landslide risk for one location."""

from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd

from train_model import FEATURE_COLUMNS, MODEL_PATH


# Used only to turn four class probabilities into one dashboard-friendly 0-100 score.
RISK_WEIGHTS = {"Low": 0, "Moderate": 35, "High": 70, "Critical": 100}


def score_to_risk_level(risk_score: float) -> str:
    """Map the calculated 0-100 score to the four dashboard risk levels."""
    if risk_score < 25:
        return "Low"
    if risk_score < 50:
        return "Moderate"
    if risk_score < 75:
        return "High"
    return "Critical"


def predict_landslide_risk(location_features: dict, model_path: str | Path = MODEL_PATH) -> dict:
    """Return probability, score, and risk level for one location.

    risk_probability is the probability of the two most dangerous classes
    (High + Critical). risk_score is an expected-severity score from 0 to 100.
    """
    missing_features = set(FEATURE_COLUMNS) - set(location_features)
    if missing_features:
        raise ValueError(f"Missing prediction fields: {sorted(missing_features)}")

    artifact = joblib.load(model_path)
    model = artifact["model"]
    input_data = pd.DataFrame([{column: location_features[column] for column in FEATURE_COLUMNS}])

    probabilities = model.predict_proba(input_data)[0]
    class_probabilities = dict(zip(model.named_steps["classifier"].classes_, probabilities))
    risk_probability = class_probabilities.get("High", 0) + class_probabilities.get("Critical", 0)
    risk_score = sum(
        class_probabilities.get(level, 0) * weight
        for level, weight in RISK_WEIGHTS.items()
    )

    return {
        "risk_probability": round(float(risk_probability), 4),
        "risk_score": round(float(risk_score), 2),
        "risk_level": score_to_risk_level(risk_score),
        "class_probabilities": {level: round(float(value), 4) for level, value in class_probabilities.items()},
    }


if __name__ == "__main__":
    example_location = {
        "latitude": 27.586,
        "longitude": 91.8657,
        "rainfall": 156,
        "soil_moisture": 89,
        "slope": 34,
        "elevation": 2669,
        "ndvi": 0.54,
        "historical_landslide": 1,
    }
    print(predict_landslide_risk(example_location))
