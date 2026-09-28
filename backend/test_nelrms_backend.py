import db
from app import (
    health_check,
    get_dashboard_stats,
    get_model_info,
    get_locations,
    get_states,
    get_state_detail,
    predict_risk,
    submit_feedback,
    get_feedback,
    login,
    PredictionPayload,
    FeedbackPayload,
    LoginPayload,
    MODEL,
)

def test_all():
    print("1. Testing Health...")
    h = health_check()
    print("   Health:", h["system"], "Model loaded:", h["model_loaded"])
    assert h["model_loaded"] is True

    print("\n2. Testing Stats...")
    s = get_dashboard_stats()
    print("   Locations:", s["total_locations"], "Historical events:", s["total_historical_events"])
    assert s["total_locations"] >= 30

    print("\n3. Testing Model Info...")
    m = get_model_info()
    print("   Model:", m["model_name"], "Accuracy:", m["accuracy"])
    assert m["accuracy"] >= 0.85
    assert len(m["feature_importances"]) > 0

    print("\n4. Testing States...")
    states = get_states()["states"]
    print("   States count:", len(states))
    assert len(states) == 8

    print("\n5. Testing State Detail (Meghalaya)...")
    megh = get_state_detail("Meghalaya")
    print("   Meghalaya locations:", len(megh["locations"]), "Historical events:", len(megh["historical_events"]))

    print("\n6. Testing Prediction...")
    payload = PredictionPayload(
        rainfall=185.0,
        slope=34.0,
        elevation=1400.0,
        soil_moisture=89.0,
        ndvi=0.55,
        historical_landslide=1,
        distance_to_river=90.0,
        latitude=25.27,
        longitude=91.73,
        state="Meghalaya",
    )
    pred = predict_risk(payload)
    print("   Prediction probability:", pred["landslide_probability"], "Risk level:", pred["risk_level"])
    print("   Explanation:", pred["explanation"])
    print("   Recommendation:", pred["recommendation"])
    assert "will definitely happen" not in pred["explanation"].lower()
    assert pred["risk_level"] in ["HIGH", "CRITICAL"]

    print("\n7. Testing Feedback...")
    fb = submit_feedback(FeedbackPayload(
        name="Arun Kumar",
        email="arun@test.edu",
        rating=5,
        category="Model Usability",
        message="Clear predictions and natural explanations.",
    ))
    all_fb = get_feedback()
    assert len(all_fb["feedback"]) >= 1
    print("   Total feedback items:", all_fb["total"])

    print("\n8. Testing Auth Login...")
    usr = login(LoginPayload(
        email="analyst@nelrms.gov.in",
        password="nelrms@2026",
    ))
    print("   Auth successful for:", usr["user"]["name"])

    print("\nALL 8 BACKEND TESTS PASSED CLEANLY & VERIFIED!")

if __name__ == "__main__":
    test_all()
