import db
import weather
from app import compute_prediction, get_feature_importances, score_to_risk_level

def run():
    print("1. Testing Database Initialization...")
    db.init_db()
    locs = db.list_locations()
    print(f"   Locations count: {len(locs)}")
    assert len(locs) >= 16, "Expected at least 16 locations across NER"

    alerts = db.list_alerts()
    print(f"   Alerts count: {len(alerts)}")
    assert len(alerts) >= 5, "Expected alerts in db"

    historical = db.list_historical_events()
    print(f"   Historical events count: {len(historical)}")
    assert len(historical) >= 8, "Expected historical events in db"

    stats = db.get_system_stats()
    print(f"   Dashboard stats: {stats}")

    print("\n2. Testing ML Prediction & Explainable AI...")
    features = {
        "rainfall": 172.0,
        "soil_moisture": 88.0,
        "slope": 33.0,
        "elevation": 1650.0,
        "ndvi": 0.55,
        "historical_landslide": 1,
        "latitude": 27.33,
        "longitude": 88.60,
    }
    prob, score, level, narrative, rec = compute_prediction(features)
    print(f"   Risk Level: {level}, Score: {score}, Prob: {prob}")
    print(f"   Explanation: {narrative}")
    print(f"   Recommendation: {rec}")
    assert score >= 75.0, f"Expected critical/high score for extreme features, got {score}"

    feats = get_feature_importances()
    print(f"   Feature importances verified: {len(feats)} features")
    assert len(feats) >= 6

    print("\n3. Testing Weather Fallback...")
    w = weather.fetch_weather(27.33, 88.60, "Gangtok", 150.0)
    print(f"   Weather: {w['condition']}, Temp: {w['temperature_c']}C, Rain: {w['rainfall_mm']}mm, Source: {w['source']}")

    print("\nALL BACKEND CORE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run()
