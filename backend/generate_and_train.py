"""
Dataset generator and Random Forest model trainer for
NorthEast Landslide Risk Monitoring System.
"""

from __future__ import annotations

import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
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
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
import joblib

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
CSV_PATH = DATA_DIR / "landslide_dataset.csv"
MODEL_PATH = BASE_DIR / "model.pkl"
METRICS_PATH = BASE_DIR / "model_metrics.json"

FEATURE_COLUMNS = [
    "latitude",
    "longitude",
    "rainfall",
    "soil_moisture",
    "slope",
    "elevation",
    "ndvi",
    "distance_to_river",
    "historical_landslide",
]
TARGET_COLUMN = "landslide_risk"
VALID_RISK_LEVELS = ["Low", "Moderate", "High", "Critical"]

# Realistic geomorphic profiles for the 8 North-Eastern states
NER_SITES = [
    # Assam
    {"name": "Haflong Hills", "district": "Dima Hasao", "state": "Assam", "lat": 25.16, "lon": 93.02, "elev": 966, "base_slope": 28, "base_rain": 140, "base_sm": 78, "hist": 1, "river": 120, "ndvi": 0.62, "risk": "Critical"},
    {"name": "Diphu Corridor", "district": "Karbi Anglong", "state": "Assam", "lat": 25.84, "lon": 93.43, "elev": 186, "base_slope": 16, "base_rain": 75, "base_sm": 58, "hist": 0, "river": 450, "ndvi": 0.72, "risk": "Moderate"},
    {"name": "Kalapahar Slopes", "district": "Kamrup Metro", "state": "Assam", "lat": 26.14, "lon": 91.73, "elev": 210, "base_slope": 24, "base_rain": 125, "base_sm": 74, "hist": 1, "river": 250, "ndvi": 0.58, "risk": "High"},
    {"name": "Bokakhat Ridge", "district": "Golaghat", "state": "Assam", "lat": 26.62, "lon": 93.60, "elev": 95, "base_slope": 9, "base_rain": 45, "base_sm": 42, "hist": 0, "river": 800, "ndvi": 0.78, "risk": "Low"},
    {"name": "Goalpara Bluffs", "district": "Goalpara", "state": "Assam", "lat": 26.18, "lon": 90.62, "elev": 115, "base_slope": 14, "base_rain": 65, "base_sm": 50, "hist": 0, "river": 320, "ndvi": 0.75, "risk": "Low"},

    # Arunachal Pradesh
    {"name": "Tawang Valley Pass", "district": "Tawang", "state": "Arunachal Pradesh", "lat": 27.59, "lon": 91.87, "elev": 2669, "base_slope": 35, "base_rain": 165, "base_sm": 90, "hist": 1, "river": 85, "ndvi": 0.52, "risk": "Critical"},
    {"name": "Yingkiong Ridge", "district": "Upper Siang", "state": "Arunachal Pradesh", "lat": 28.61, "lon": 95.05, "elev": 341, "base_slope": 30, "base_rain": 145, "base_sm": 82, "hist": 1, "river": 110, "ndvi": 0.65, "risk": "Critical"},
    {"name": "Itanagar Hills", "district": "Papum Pare", "state": "Arunachal Pradesh", "lat": 27.08, "lon": 93.61, "elev": 320, "base_slope": 21, "base_rain": 90, "base_sm": 64, "hist": 0, "river": 520, "ndvi": 0.70, "risk": "Moderate"},
    {"name": "Bomdila Pass", "district": "West Kameng", "state": "Arunachal Pradesh", "lat": 27.27, "lon": 92.42, "elev": 2217, "base_slope": 27, "base_rain": 115, "base_sm": 73, "hist": 1, "river": 280, "ndvi": 0.63, "risk": "High"},
    {"name": "Pasighat Foothills", "district": "East Siang", "state": "Arunachal Pradesh", "lat": 28.07, "lon": 95.33, "elev": 153, "base_slope": 12, "base_rain": 55, "base_sm": 45, "hist": 0, "river": 900, "ndvi": 0.82, "risk": "Low"},

    # Meghalaya
    {"name": "Sohra Escarpment", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.27, "lon": 91.73, "elev": 1313, "base_slope": 33, "base_rain": 210, "base_sm": 92, "hist": 1, "river": 95, "ndvi": 0.54, "risk": "Critical"},
    {"name": "Jowai Ridge", "district": "West Jaintia Hills", "state": "Meghalaya", "lat": 25.45, "lon": 92.21, "elev": 1390, "base_slope": 22, "base_rain": 105, "base_sm": 66, "hist": 0, "river": 360, "ndvi": 0.72, "risk": "High"},
    {"name": "Shillong Peak Slopes", "district": "East Khasi Hills", "state": "Meghalaya", "lat": 25.53, "lon": 91.88, "elev": 1961, "base_slope": 19, "base_rain": 85, "base_sm": 60, "hist": 0, "river": 480, "ndvi": 0.75, "risk": "Moderate"},
    {"name": "Nongstoin Slopes", "district": "West Khasi Hills", "state": "Meghalaya", "lat": 25.52, "lon": 91.27, "elev": 1409, "base_slope": 26, "base_rain": 130, "base_sm": 76, "hist": 1, "river": 190, "ndvi": 0.64, "risk": "High"},
    {"name": "Tura Peak", "district": "West Garo Hills", "state": "Meghalaya", "lat": 25.51, "lon": 90.22, "elev": 872, "base_slope": 18, "base_rain": 78, "base_sm": 56, "hist": 0, "river": 650, "ndvi": 0.77, "risk": "Moderate"},

    # Manipur
    {"name": "Tupul Railway Corridor", "district": "Noney", "state": "Manipur", "lat": 24.72, "lon": 93.63, "elev": 820, "base_slope": 34, "base_rain": 180, "base_sm": 90, "hist": 1, "river": 60, "ndvi": 0.53, "risk": "Critical"},
    {"name": "Senapati Highway", "district": "Senapati", "state": "Manipur", "lat": 25.27, "lon": 94.02, "elev": 1061, "base_slope": 27, "base_rain": 128, "base_sm": 78, "hist": 1, "river": 210, "ndvi": 0.64, "risk": "High"},
    {"name": "Tamenglong Hills", "district": "Tamenglong", "state": "Manipur", "lat": 24.98, "lon": 93.49, "elev": 1260, "base_slope": 31, "base_rain": 160, "base_sm": 86, "hist": 1, "river": 130, "ndvi": 0.58, "risk": "Critical"},
    {"name": "Imphal Valley Edge", "district": "Imphal West", "state": "Manipur", "lat": 24.81, "lon": 93.94, "elev": 786, "base_slope": 10, "base_rain": 48, "base_sm": 44, "hist": 0, "river": 750, "ndvi": 0.81, "risk": "Low"},
    {"name": "Churachandpur Ridge", "district": "Churachandpur", "state": "Manipur", "lat": 24.33, "lon": 93.68, "elev": 922, "base_slope": 20, "base_rain": 82, "base_sm": 61, "hist": 0, "river": 400, "ndvi": 0.71, "risk": "Moderate"},

    # Mizoram
    {"name": "Aizawl Urban Slopes", "district": "Aizawl", "state": "Mizoram", "lat": 23.73, "lon": 92.72, "elev": 1132, "base_slope": 28, "base_rain": 135, "base_sm": 79, "hist": 1, "river": 180, "ndvi": 0.60, "risk": "High"},
    {"name": "Melthum Quarry Sector", "district": "Aizawl", "state": "Mizoram", "lat": 23.70, "lon": 92.71, "elev": 980, "base_slope": 36, "base_rain": 185, "base_sm": 91, "hist": 1, "river": 90, "ndvi": 0.50, "risk": "Critical"},
    {"name": "Lunglei Ridge", "district": "Lunglei", "state": "Mizoram", "lat": 22.87, "lon": 92.77, "elev": 722, "base_slope": 18, "base_rain": 76, "base_sm": 57, "hist": 0, "river": 540, "ndvi": 0.74, "risk": "Moderate"},
    {"name": "Champhai Valley", "district": "Champhai", "state": "Mizoram", "lat": 23.47, "lon": 93.33, "elev": 1350, "base_slope": 15, "base_rain": 62, "base_sm": 48, "hist": 0, "river": 620, "ndvi": 0.79, "risk": "Low"},
    {"name": "Serchhip Incline", "district": "Serchhip", "state": "Mizoram", "lat": 23.31, "lon": 92.85, "elev": 890, "base_slope": 23, "base_rain": 110, "base_sm": 72, "hist": 1, "river": 290, "ndvi": 0.67, "risk": "High"},

    # Nagaland
    {"name": "Kohima Bypass (NH-29)", "district": "Kohima", "state": "Nagaland", "lat": 25.68, "lon": 94.11, "elev": 1444, "base_slope": 29, "base_rain": 138, "base_sm": 80, "hist": 1, "river": 160, "ndvi": 0.61, "risk": "High"},
    {"name": "Pfutsero Hill Pass", "district": "Phek", "state": "Nagaland", "lat": 25.68, "lon": 94.31, "elev": 1524, "base_slope": 17, "base_rain": 72, "base_sm": 54, "hist": 0, "river": 490, "ndvi": 0.77, "risk": "Moderate"},
    {"name": "Mokokchung Slopes", "district": "Mokokchung", "state": "Nagaland", "lat": 26.32, "lon": 94.52, "elev": 1325, "base_slope": 14, "base_rain": 46, "base_sm": 43, "hist": 0, "river": 710, "ndvi": 0.82, "risk": "Low"},
    {"name": "Wokha Ridge", "district": "Wokha", "state": "Nagaland", "lat": 26.10, "lon": 94.26, "elev": 1313, "base_slope": 22, "base_rain": 98, "base_sm": 67, "hist": 0, "river": 380, "ndvi": 0.70, "risk": "Moderate"},
    {"name": "Tuensang Escarpment", "district": "Tuensang", "state": "Nagaland", "lat": 26.28, "lon": 94.83, "elev": 1371, "base_slope": 32, "base_rain": 158, "base_sm": 87, "hist": 1, "river": 110, "ndvi": 0.55, "risk": "Critical"},

    # Sikkim
    {"name": "Gangtok Ridge & NH-10", "district": "East Sikkim", "state": "Sikkim", "lat": 27.34, "lon": 88.61, "elev": 1650, "base_slope": 33, "base_rain": 175, "base_sm": 88, "hist": 1, "river": 110, "ndvi": 0.57, "risk": "Critical"},
    {"name": "Mangan-Chungthang Link", "district": "North Sikkim", "state": "Sikkim", "lat": 27.51, "lon": 88.53, "elev": 956, "base_slope": 38, "base_rain": 182, "base_sm": 91, "hist": 1, "river": 70, "ndvi": 0.53, "risk": "Critical"},
    {"name": "Pakyong Hillside", "district": "Pakyong", "state": "Sikkim", "lat": 27.23, "lon": 88.59, "elev": 1422, "base_slope": 25, "base_rain": 112, "base_sm": 72, "hist": 1, "river": 240, "ndvi": 0.66, "risk": "High"},
    {"name": "Namchi Terraces", "district": "South Sikkim", "state": "Sikkim", "lat": 27.17, "lon": 88.35, "elev": 1315, "base_slope": 18, "base_rain": 74, "base_sm": 56, "hist": 0, "river": 460, "ndvi": 0.76, "risk": "Moderate"},
    {"name": "Gyalshing Slopes", "district": "West Sikkim", "state": "Sikkim", "lat": 27.28, "lon": 88.25, "elev": 1520, "base_slope": 21, "base_rain": 88, "base_sm": 63, "hist": 0, "river": 390, "ndvi": 0.72, "risk": "Moderate"},

    # Tripura
    {"name": "Ambassa Slope", "district": "Dhalai", "state": "Tripura", "lat": 23.92, "lon": 91.86, "elev": 45, "base_slope": 13, "base_rain": 62, "base_sm": 51, "hist": 0, "river": 580, "ndvi": 0.78, "risk": "Moderate"},
    {"name": "Dharmanagar Ridge", "district": "North Tripura", "state": "Tripura", "lat": 24.37, "lon": 92.17, "elev": 21, "base_slope": 8, "base_rain": 36, "base_sm": 35, "hist": 0, "river": 920, "ndvi": 0.84, "risk": "Low"},
    {"name": "Jampui Hills Pass", "district": "North Tripura", "state": "Tripura", "lat": 23.98, "lon": 92.27, "elev": 780, "base_slope": 22, "base_rain": 96, "base_sm": 66, "hist": 0, "river": 340, "ndvi": 0.71, "risk": "Moderate"},
    {"name": "Agartala Urban Periphery", "district": "West Tripura", "state": "Tripura", "lat": 23.83, "lon": 91.28, "elev": 15, "base_slope": 6, "base_rain": 32, "base_sm": 30, "hist": 0, "river": 1100, "ndvi": 0.86, "risk": "Low"},
    {"name": "Belonia Valley", "district": "South Tripura", "state": "Tripura", "lat": 23.25, "lon": 91.45, "elev": 28, "base_slope": 7, "base_rain": 35, "base_sm": 32, "hist": 0, "river": 980, "ndvi": 0.85, "risk": "Low"},
]

def generate_dataset() -> pd.DataFrame:
    """Generate balanced historical dataset with realistic environmental variance."""
    np.random.seed(42)
    records = []

    for site in NER_SITES:
        # Create 4 variations per site across different historical seasons
        for i in range(4):
            # Apply slight natural variation around site baseline
            rf_noise = np.random.normal(0, 10)
            sm_noise = np.random.normal(0, 3)
            slope_noise = np.random.normal(0, 1.5)
            ndvi_noise = np.random.normal(0, 0.03)
            river_noise = np.random.normal(0, 25)

            rf = max(10.0, round(site["base_rain"] + rf_noise, 1))
            sm = min(98.0, max(20.0, round(site["base_sm"] + sm_noise, 1)))
            slope = min(45.0, max(4.0, round(site["base_slope"] + slope_noise, 1)))
            ndvi = min(0.95, max(0.40, round(site["ndvi"] + ndvi_noise, 2)))
            river = max(30.0, round(site["river"] + river_noise, 1))
            elev = site["elev"]
            hist = site["hist"]
            lat = site["lat"]
            lon = site["lon"]

            # Ground truth geomorphic classification
            # Calculated risk index
            score = (
                (rf / 220.0) * 35.0
                + (slope / 45.0) * 25.0
                + (sm / 100.0) * 20.0
                + (12.0 if hist == 1 else 0.0)
                + ((0.9 - ndvi) / 0.9) * 8.0
            )

            if score >= 72:
                risk = "Critical"
            elif score >= 52:
                risk = "High"
            elif score >= 32:
                risk = "Moderate"
            else:
                risk = "Low"

            records.append({
                "location_id": f"{site['name'].lower().replace(' ', '_').replace('&', 'and')}_{i+1}",
                "location_name": site["name"],
                "district": site["district"],
                "state": site["state"],
                "latitude": lat,
                "longitude": lon,
                "rainfall": rf,
                "soil_moisture": sm,
                "slope": slope,
                "elevation": elev,
                "ndvi": ndvi,
                "distance_to_river": river,
                "historical_landslide": hist,
                "landslide_risk": risk,
            })

    df = pd.DataFrame(records)
    df.to_csv(CSV_PATH, index=False)
    print(f"Generated clean dataset: {len(df)} records at {CSV_PATH}")
    return df


def train_model(df: pd.DataFrame):
    """Train Random Forest classifier and output actual metrics."""
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    preprocessor = ColumnTransformer(
        transformers=[("num", SimpleImputer(strategy="median"), FEATURE_COLUMNS)]
    )

    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        random_state=42,
        class_weight="balanced"
    )

    model = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", clf)
    ])

    model.fit(X_train, y_train)

    # Evaluate on held-out test split
    y_pred = model.predict(X_test)
    labels = ["Low", "Moderate", "High", "Critical"]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    cm = confusion_matrix(y_test, y_pred, labels=labels).tolist()

    feature_importances = clf.feature_importances_
    feat_map = [
        {
            "feature": name,
            "importance": round(float(weight), 4),
            "percentage": round(float(weight) * 100, 2),
        }
        for name, weight in zip(FEATURE_COLUMNS, feature_importances)
    ]
    feat_map.sort(key=lambda x: x["importance"], reverse=True)

    metrics = {
        "model_name": "Random Forest Classifier",
        "algorithm": "RandomForestClassifier (scikit-learn)",
        "framework": "Scikit-Learn",
        "n_estimators": 150,
        "classes": labels,
        "features": FEATURE_COLUMNS,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "labels": labels,
        "feature_importances": feat_map,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "total_dataset_records": len(df),
        "classification_report": classification_report(y_test, y_pred, labels=labels, zero_division=0, output_dict=True),
    }

    # Save model artifact and metrics
    joblib.dump(model, MODEL_PATH)
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    # Also save to ml/models if directory exists
    ml_models = PROJECT_ROOT / "ml" / "models"
    if ml_models.exists():
        joblib.dump(model, ml_models / "landslide_risk_model.joblib")
        with open(ml_models / "evaluation_metrics.json", "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)

    print(f"Model saved to {MODEL_PATH}")
    print(f"Metrics saved to {METRICS_PATH}")
    print(f"Accuracy: {acc*100:.2f}% | F1: {f1*100:.2f}% | Precision: {prec*100:.2f}% | Recall: {rec*100:.2f}%")
    print("\nFeature Importances:")
    for f in feat_map:
        print(f" - {f['feature']}: {f['percentage']}%")

    return metrics


if __name__ == "__main__":
    df = generate_dataset()
    train_model(df)
