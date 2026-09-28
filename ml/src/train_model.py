"""Train a beginner-friendly Random Forest landslide-risk classifier."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline


PROJECT_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = PROJECT_DIR / "data" / "landslide_dataset.csv"
MODEL_PATH = PROJECT_DIR / "models" / "landslide_risk_model.joblib"
METRICS_PATH = PROJECT_DIR / "models" / "evaluation_metrics.json"

FEATURE_COLUMNS = [
    "latitude",
    "longitude",
    "rainfall",
    "soil_moisture",
    "slope",
    "elevation",
    "ndvi",
    "historical_landslide",
]
TARGET_COLUMN = "landslide_risk"
VALID_RISK_LEVELS = ["Low", "Moderate", "High", "Critical"]


def load_and_clean_dataset(csv_path: str | Path = DATA_PATH) -> pd.DataFrame:
    """Load the CSV, validate its schema, and prepare clean model inputs."""
    data = pd.read_csv(csv_path)
    data.columns = data.columns.str.strip().str.lower()

    required_columns = FEATURE_COLUMNS + [TARGET_COLUMN]
    missing_columns = set(required_columns) - set(data.columns)
    if missing_columns:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing_columns)}")

    # Convert sensor and terrain fields to numeric. Invalid text becomes a missing value.
    for column in FEATURE_COLUMNS:
        data[column] = pd.to_numeric(data[column], errors="coerce")

    data[TARGET_COLUMN] = data[TARGET_COLUMN].astype("string").str.strip().str.title()
    data = data.drop_duplicates().dropna(subset=[TARGET_COLUMN]).copy()
    data = data[data[TARGET_COLUMN].isin(VALID_RISK_LEVELS)].copy()

    # Remove physically impossible values. Missing values are intentionally retained:
    # the training pipeline fills them with median values learned from training data.
    valid_rows = (
        data["latitude"].between(-90, 90)
        & data["longitude"].between(-180, 180)
        & data["rainfall"].ge(0)
        & data["soil_moisture"].between(0, 100)
        & data["slope"].between(0, 90)
        & data["elevation"].ge(-500)
        & data["ndvi"].between(-1, 1)
        & data["historical_landslide"].isin([0, 1])
    )
    data = data[valid_rows | data[FEATURE_COLUMNS].isna().any(axis=1)].copy()

    if data.empty:
        raise ValueError("No valid rows remain after cleaning the dataset.")

    return data


def build_model() -> Pipeline:
    """Create a pipeline that imputes missing values before Random Forest training."""
    feature_preprocessor = ColumnTransformer(
        transformers=[("numeric", SimpleImputer(strategy="median"), FEATURE_COLUMNS)],
        remainder="drop",
    )

    classifier = RandomForestClassifier(
        n_estimators=250,
        random_state=42,
        class_weight="balanced",
    )

    return Pipeline(
        steps=[("preprocessor", feature_preprocessor), ("classifier", classifier)],
    )


def evaluate_model(model: Pipeline, x_test: pd.DataFrame, y_test: pd.Series) -> dict:
    """Return standard multi-class classification metrics."""
    predictions = model.predict(x_test)
    labels = list(model.named_steps["classifier"].classes_)

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "precision_weighted": round(float(precision_score(y_test, predictions, average="weighted", zero_division=0)), 4),
        "recall_weighted": round(float(recall_score(y_test, predictions, average="weighted", zero_division=0)), 4),
        "f1_weighted": round(float(f1_score(y_test, predictions, average="weighted", zero_division=0)), 4),
        "labels": labels,
        "confusion_matrix": confusion_matrix(y_test, predictions, labels=labels).tolist(),
        "classification_report": classification_report(y_test, predictions, zero_division=0),
    }
    return metrics


def train_and_save_model(csv_path: str | Path = DATA_PATH) -> dict:
    """Train, evaluate, and save the model artifact and evaluation metrics."""
    data = load_and_clean_dataset(csv_path)
    x = data[FEATURE_COLUMNS]
    y = data[TARGET_COLUMN]

    if y.value_counts().min() < 2:
        raise ValueError("Each risk class needs at least two labelled rows for a stratified split.")

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y,
    )

    model = build_model()
    model.fit(x_train, y_train)
    metrics = evaluate_model(model, x_test, y_test)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": model,
            "feature_columns": FEATURE_COLUMNS,
            "risk_levels": VALID_RISK_LEVELS,
        },
        MODEL_PATH,
    )
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print(f"Cleaned rows: {len(data)}")
    print(f"Model saved to: {MODEL_PATH}")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Precision (weighted): {metrics['precision_weighted']:.4f}")
    print(f"Recall (weighted): {metrics['recall_weighted']:.4f}")
    print(f"F1-score (weighted): {metrics['f1_weighted']:.4f}")
    print("Confusion matrix:")
    print(pd.DataFrame(metrics["confusion_matrix"], index=metrics["labels"], columns=metrics["labels"]))
    print("Note: these metrics use synthetic demonstration data and are not real-world accuracy claims.")

    return metrics


if __name__ == "__main__":
    train_and_save_model()
