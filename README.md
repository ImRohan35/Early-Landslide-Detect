# AI-Based Early Warning and Landslide Risk Monitoring System for North Eastern Region (NER)

**College Mini Project &middot; Disaster Risk Reduction & AI Decision Support Platform**

A complete, modern, responsive full-stack software application designed to monitor landslide hazards, analyze contributing geological and meteorological triggers, and provide actionable early warnings across the **8 North Eastern states of India**:

- **Assam**
- **Arunachal Pradesh**
- **Meghalaya**
- **Manipur**
- **Mizoram**
- **Nagaland**
- **Tripura**
- **Sikkim**

---

## 🌟 Key Features

1. **Interactive GIS Map (Leaflet + OpenStreetMap)**
   - Multi-layer visualization:
     - 🗺️ NER State Boundaries (8 states GeoJSON)
     - 🟢🟡🟠🔴 Color-coded Risk Stations (Low: 0–25, Moderate: 26–50, High: 51–75, Critical: 76–100)
     - 🔥 Dynamic Risk Heatmap Layer
     - 🛣️ Strategic Highway Corridors with real-time connectivity status (🟢 Open, 🟡 Caution, 🔴 Blocked)
     - 🏘️ Monitored Catchment Villages
     - 📷 Crowdsourced Citizen Field Incident Markers
     - ⚠️ Historical Landslide Disasters Catalog (GSI & SDMA records)
   - Interactive popups containing: Location, State, Risk Level, Risk Score, Rainfall, Slope, Historical Count, Last updated time, and quick link to full analysis.

2. **Location Search & Detailed Condition Page**
   - Instant search bar (e.g., search *"Gangtok"*, *"Haflong"*, *"Aizawl"*, *"Tawang"*).
   - **Current Condition**: Temperature, Rainfall, Humidity, Wind Speed, Risk Score, Risk Level, and Telemetry timestamp.
   - **Explainable AI (XAI) Risk Analysis**: Human-understandable breakdown explaining *why* the risk is predicted at that level (e.g., *"High rainfall and steep terrain are the major contributing factors. Historical landslide activity also increases the risk."*).
   - Factor breakdown gauges for Rainfall Intensity, Slope Gradient, Elevation, Soil Moisture, Vegetation (NDVI), and Historical frequency.
   - Feature Importance weight chart from Scikit-Learn Random Forest model.
   - One-click PDF Risk Assessment Export.

3. **AI / ML Risk Prediction Engine (Python + Scikit-Learn)**
   - Random Forest Classifier (250 estimators) with balanced class weighting.
   - Input Features: Rainfall, Rainfall Intensity, Slope, Elevation, Historical Landslide Frequency, Soil Moisture, NDVI, Coordinates.
   - Output: Risk score 0–100 and Risk tier classification.
   - Academic Transparency: Clear distinction between Demo/Simulated Telemetry and Live Weather API data.

4. **Weather Integration (Open-Meteo & OpenWeatherMap)**
   - Free, reliable real-time meteorological queries via Open-Meteo for any GPS coordinates in India (0 paid API key required).
   - Optional OpenWeatherMap support via `.env`.
   - Safe regional meteorological fallback to ensure zero demo crashes if offline.

5. **Early Warnings & Emergency Alerts**
   - Automated threshold triggers whenever rainfall or combined risk crosses dangerous limits.
   - Alert details: Severity (CRITICAL, HIGH, MODERATE), Target Location, Trigger Reason, Recommended Public Actions, and Status.
   - Filter by State and Severity.
   - Live cloudburst simulation button for live demonstrations.

6. **Road Connectivity & Interstate Corridor Monitoring**
   - Real-time tracking of strategic NER highways (NH-10 Siliguri-Gangtok, NH-29 Dimapur-Kohima, NH-54 Silchar-Aizawl, NH-6 Shillong-Silchar, NH-13 Trans-Arunachal, NH-37, NH-102, NH-8).
   - Status indicators: 🟢 Open, 🟡 Caution (single-lane/slurry), 🔴 Blocked (debris washouts).
   - Filter by State and Status.
   - Interactive status update button for evaluation walkthroughs.

7. **Citizen & Field Ground Reporting**
   - "Report Incident" form with photo upload (device upload or sample attachment), video link, report type (*Landslide, Slope Crack, Road Blockage, Falling Rocks, Soil Movement, Other*), location, and observation description.
   - "Incident Directory" with Report ID, timestamp, priority, review status (*Pending, Under Review, Verified, Resolved*), and interactive verification triage buttons.

8. **Historical Multi-Year Analysis**
   - Visual charts (Recharts):
     - Year-wise reported incidents (2018–2024) and associated casualties.
     - State-wise incident distribution across all 8 states.
     - 24-hour rainfall threshold correlation curve.
     - High-risk mountain districts ranking table.
     - Curated documented case studies catalog (Tupul yard, New Haflong, Mangan, Sohra, Melthum, etc.).

9. **Bilingual Support (English & हिन्दी)**
   - Instant language toggle button in the top navigation bar.
   - Complete UI text switches smoothly using a centralized translation dictionary.

10. **Zero IoT / Physical Hardware Requirement**
    - Built specifically as a software platform for college mini-projects.
    - No physical sensors or microcontroller hardware required.

---

## 🗂️ Project Structure

```
landslideguard-ai/
├── backend/
│   ├── .venv/                   # Python Virtual Environment
│   ├── app.py                   # FastAPI application with REST endpoints & ML integration
│   ├── db.py                    # SQLite database models, migrations & 8-state seed data
│   ├── weather.py               # Weather service (Open-Meteo, OpenWeather, regional fallback)
│   ├── model.pkl                # Trained Random Forest Scikit-learn pipeline artifact
│   ├── test_backend.py          # Backend automated test suite
│   ├── requirements.txt         # Python dependencies (fastapi, uvicorn, scikit-learn, etc.)
│   ├── .env                     # Active environment variables
│   └── .env.example             # Sample environment variables template
├── frontend/
│   ├── dist/                    # Production bundle
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx              # App title, search, language switcher (EN/HI), alerts
│   │   │   ├── Sidebar.jsx             # 8 working navigation links with live counters
│   │   │   ├── Dashboard.jsx           # 8 KPI cards, critical alerts ticker, GIS preview
│   │   │   ├── Map.jsx                 # Leaflet GIS map with 7 interactive layers & popups
│   │   │   ├── HeatmapLayer.jsx        # Dynamic risk heatmap layer
│   │   │   ├── LocationDetails.jsx     # Current condition & Explainable AI contributing factors
│   │   │   ├── LocationsView.jsx       # Search & state/risk filtering with embedded details
│   │   │   ├── AlertsView.jsx          # Early warnings feed with recommended actions
│   │   │   ├── RoadMonitoringView.jsx  # Highway connectivity & Open/Caution/Blocked status
│   │   │   ├── IncidentReportsView.jsx # Citizen reporting form + directory triage dashboard
│   │   │   ├── HistoricalAnalysisView.jsx # Recharts charts: year, state, rainfall threshold
│   │   │   ├── AboutView.jsx           # Project documentation, architecture & academic notice
│   │   │   └── WhatIfSimulator.jsx     # Interactive ML parameter sandbox
│   │   ├── data/
│   │   │   ├── riskLocations.js        # 22+ monitoring stations across all 8 NER states
│   │   │   ├── roadsData.js            # Strategic highway corridors database
│   │   │   ├── historicalLandslides.js # Documented disaster inventory (GSI, SDMA, BRO)
│   │   │   └── nerGeoJSON.js           # 8 NER State boundary polygons
│   │   ├── i18n/
│   │   │   └── translations.js         # Complete English and Hindi bilingual dictionary
│   │   ├── services/
│   │   │   ├── api.js                  # FastAPI client with offline demo fallbacks
│   │   │   ├── report.js               # PDF risk assessment report generator
│   │   │   └── weather.js              # Formatting helpers
│   │   ├── App.jsx                     # Root application coordinator
│   │   ├── App.css                     # Modern disaster-management design system
│   │   ├── main.jsx                    # Vite entry point
│   │   └── index.html                  # HTML5 entry with metadata and Inter font
│   ├── package.json                    # Frontend dependencies
│   └── vite.config.js                  # Vite configuration
└── README.md                           # This comprehensive guide
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### Step 1: Backend Setup & Execution

1. Open a terminal in the `backend` directory:
   ```bash
   cd landslideguard-ai/backend
   ```

2. If needed, create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables (optional):
   ```bash
   # Copies sample .env
   cp .env.example .env
   ```
   *(By default, port `8000` is used. Open-Meteo works out of the box without any API key).*

5. Run the automated backend verification test:
   ```bash
   python test_backend.py
   ```

6. Start the FastAPI server:
   ```bash
   python app.py
   # Or using uvicorn directly:
   uvicorn app:app --reload --host 127.0.0.1 --port 8000
   ```
   - Interactive Swagger API docs are available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### Step 2: Frontend Setup & Execution

1. In a second terminal, navigate to the `frontend` directory:
   ```bash
   cd landslideguard-ai/frontend
   ```

2. Install npm dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Build production bundle (to test for zero errors):
   ```bash
   npm run build
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser at: [http://localhost:5173](http://localhost:5173)

---

## 🧪 How to Demonstrate All Major Features

| Feature | Where to Click / How to Test | Expected Behavior |
| :--- | :--- | :--- |
| **8 NER States Coverage** | Click **Locations** tab or filter dropdown | Displays stations from Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim. |
| **Location Search** | In top search bar or Locations search input, type `"Gangtok"` | Opens Gangtok detailed page showing current condition, weather, 89% Critical risk score, and factor explanation. |
| **Explainable AI** | Inspect any location page (e.g. Haflong or Sohra) | Clearly explains *why* the risk is elevated: *"Torrential rainfall exceeding regional saturation thresholds and steep terrain are major contributing factors."* |
| **Bilingual Language** | Click **हिन्दी** / **English** button in top header | Whole UI (navigation, cards, risk labels, alerts, table columns) instantly translates to Hindi without page reload. |
| **GIS Risk Map** | Click **Risk Map** tab | Fullscreen Leaflet map displaying 8 state boundaries, color markers (🟢 Low, 🟡 Mod, 🟠 High, 🔴 Critical), roads, villages, and citizen report pins. |
| **Map Popup** | Click on any circular location pin on the map | Popup shows Location, State, Risk Level, Risk Score, Rainfall, Slope, Historical count, Last updated time, and "Inspect Details" button. |
| **Early Warnings** | Click **Alerts** tab & click *"Simulate Cloudburst Alert"* | Generates a live Critical emergency bulletin with reason, affected sector, and recommended public safety action. |
| **Road Monitoring** | Click **Road Monitoring** tab | Displays strategic highway lifelines (NH-10, NH-29, NH-54, NH-6, NH-13) with Open/Caution/Blocked statuses and status cycle button. |
| **Citizen Reporting** | Click **Incident Reports** &rarr; *"Submit New Incident Report"* | Fill in location, description, attach photo, click submit &rarr; Report instantly appears in the live directory. |
| **Historical Analysis** | Click **Historical Analysis** tab | Displays year-wise disaster chart, state-wise chart, rainfall probability curve, high-risk districts, and GSI case studies. |
| **About System** | Click **About System** tab | Displays complete college mini-project overview, architecture diagram, methodology, and academic disclaimer. |

---

## 🔐 Operator Console Credentials (Optional)
The system comes pre-configured with active session bypass for easy college evaluation. If using authentication screens:
- **Email:** `analyst@ner-disaster.gov.in`
- **Password:** `disaster2026` (or any non-empty string for local evaluation)
- **Role:** Disaster Operations Lead &middot; Node NER-GHY-04

---

## 📜 Academic Transparency & Disclaimer
This application is created as a **College Mini Project** in the domain of Computer Science and Disaster Risk Reduction. It utilizes scientific datasets, open meteorological APIs (Open-Meteo), and Scikit-Learn machine learning pipelines. No physical hardware sensors or IoT microcontrollers are deployed. Demo and simulated datasets are explicitly marked as such throughout the user interface.
