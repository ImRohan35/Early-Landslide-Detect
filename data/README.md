# Dataset & Terrain Data Repository (NER Landslide System)

This directory contains reference datasets, historical records, and terrain vulnerability tables for the 8 North Eastern Region (NER) states.

## Files
- `ner_landslide_dataset.csv`: Historical observation records used for training and testing the Scikit-Learn Random Forest risk model.
- `ner_terrain_vulnerability.json`: Static terrain elevation, slope distributions, and soil types for NER monitoring stations.

## Schema: `ner_landslide_dataset.csv`
| Column | Type | Range | Description |
|---|---|---|---|
| `rainfall_mm` | Float | 0.0 - 400.0 | 24-hour antecedent precipitation |
| `slope_deg` | Float | 5.0 - 75.0 | Average terrain slope angle in degrees |
| `soil_moisture`| Float | 0.0 - 100.0 | Soil saturation index (%) |
| `elevation_m` | Integer | 100 - 3000 | Altitude above mean sea level |
| `history_count`| Integer | 0 - 25 | Historical recorded landslide count |
| `geology_risk` | Float | 0.1 - 1.0 | Geological fracture / fault zone vulnerability index |
| `risk_score` | Float | 0.0 - 100.0 | Calculated ground-truth disaster vulnerability score |
