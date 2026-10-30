# LandslideGuard AI · Early Landslide Detection & Surveillance System

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![ML Model](https://img.shields.io/badge/ML%20Accuracy-95.0%25-brightgreen.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An advanced, AI-driven disaster risk reduction and environmental surveillance platform tailored for the **8 North Eastern States of India** (Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, and Sikkim).

The system integrates real-time satellite weather telemetry from **Open-Meteo**, geotechnical terrain modeling (NASA SRTM DEM + NASA SMAP soil moisture), and a **Scikit-Learn Random Forest Classifier (95.0% Accuracy)** to predict landslide hazard probabilities, evaluate highway passability, advise safe alternative travel corridors, and generate comprehensive multi-format disaster risk reports.

---

## 🌟 Key Features

1. **🗺️ 2D Interactive GIS Surveillance Map**
   - High-resolution Planimetric & Satellite cartography with real-time terrain contours.
   - 8 North-Eastern state boundary polygons (GeoJSON).
   - Color-coded risk station markers (🟢 Low, 🟡 Moderate, 🟠 High, 🔴 Critical).
   - Strategic highway corridors with live road status (🟢 OPEN, ⚠️ CAUTION, ⛔ BLOCKED).
   - Interactive GIS Toolbar: Pan/Zoom compass, GPS Geolocation tracker, Layer toggles, and dedicated **Map Only View** and **Fullscreen / Short Screen Mode**.

2. **🤖 Machine Learning Prediction Engine (95.0% Accuracy)**
   - Pre-trained **Random Forest Classifier** (`backend/model.pkl`) with 150 ensemble estimators.
   - Trained on 1,000+ geological landslide records (`data/landslide_dataset.csv`).
   - Dynamic 9-feature geotechnical pipeline: Rainfall (27.7%), Slope Angle (21.6%), Soil Moisture (18.4%), Historical Landslides (13.4%), Distance to River (11.9%), Vegetation NDVI (4.3%), and Elevation.

3. **🛣️ Strategic Highway Corridors & Best Route Advisor**
   - Real-time road passability monitoring across strategic lifelines:
     - **NH-10** (Siliguri – Kalimpong – Gangtok)
     - **NH-29** (Dimapur – Kohima – Imphal)
     - **NH-6** (Guwahati – Shillong – Silchar)
     - **NH-13** (Trans-Arunachal Corridor)
     - **NH-54** (Silchar – Kolasib – Aizawl)
     - **NH-37** (Kaziranga – Jorhat bypass)
   - Live AI passability predictions with recommended alternative safe detour routes.

4. **🛰️ Live Meteorological & Satellite Telemetry**
   - Live weather integration via Open-Meteo (zero API keys required, rate-friendly).
   - Real-time 24-hour rainfall precipitation, ambient temperature, relative humidity, and surface pressure.
   - Synchronized AI Risk Estimate gauge and 7-day predictive risk curves.

5. **📊 State-Wise Historical Analytics & Custom Filters**
   - State-specific 5-year trend lines and event distribution charts for any chosen state.
   - Date range selector (From Date ➔ To Date) and severity filters.
   - Direct clickable incident catalog with detailed modal inspector.

6. **📑 Multi-Format Report Generator**
   - Instant one-click generation and export:
     - 📄 **PDF Disaster Report** (with official letterhead, summary stats, and high-risk stations)
     - 📊 **Excel Spreadsheet (.xlsx)**
     - 📝 **Word Document (.docx)**
     - 📋 **CSV Data Export**

7. **🎛️ What-If Physics Simulator & HillGuard AI Assistant**
   - Interactive environmental sandbox to test hypothetical scenarios (e.g., rainfall surges, slope steepening, deforestation).
   - Embedded AI conversational copilot (*HillGuard AI*) for disaster safety questions.

8. **🔐 Universal Access & Authentication**
   - Clean, modern, responsive glassmorphic login portal.
   - Universal testing login enabled: any valid email and password auto-provisions access.

---

## 🏗️ Project Architecture

```
Early-Landslide-Detect/
├── backend/
│   ├── app.py                   # FastAPI REST API & ML prediction service
│   ├── db.py                    # SQLite database models & seed datasets
│   ├── weather.py               # Open-Meteo & OpenWeatherMap live weather service
│   ├── model.pkl                # Trained Random Forest Scikit-learn pipeline artifact
│   ├── model_metrics.json       # Verified accuracy (0.95), F1-score & confusion matrix
│   ├── landslideguard.db        # Seeded SQLite database
│   ├── test_backend.py          # Automated backend verification test suite
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Local environment config
│   └── .env.example             # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx              # Navigation header, state selector & live clock
│   │   │   ├── Sidebar.jsx             # Left navigation menu with unread badges
│   │   │   ├── LandingPage.jsx         # Modern landing & welcome portal
│   │   │   ├── Login.jsx               # Centered login portal with universal test access
│   │   │   ├── InteractiveMapPage.jsx  # Map container with Fullscreen & Map-only controls
│   │   │   ├── Map.jsx                 # Leaflet 2D GIS map with live controls
│   │   │   ├── RiskAnalysisPage.jsx    # Synchronized AI Risk Estimate & 7-day timeline
│   │   │   ├── AlertsPage.jsx          # Live emergency alerts & highway route advisor
│   │   │   ├── HistoricalAnalysisView.jsx # State-specific historical charts & filters
│   │   │   ├── ReportsView.jsx         # Multi-format report builder (PDF, Word, Excel, CSV)
│   │   │   ├── WhatIfSimulator.jsx     # Interactive geotechnical physics sandbox
│   │   │   └── HillGuardChat.jsx       # Floating AI safety chat assistant
│   │   ├── data/
│   │   │   ├── riskLocations.js        # 22+ monitoring stations across all 8 states
│   │   │   ├── roadsData.js            # Strategic highway corridor database
│   │   │   ├── historicalLandslides.js # Disaster catalog (GSI, SDMA records)
│   │   │   └── nerGeoJSON.js           # 8 NER State boundary coordinates
│   │   ├── services/
│   │   │   ├── api.js                  # Axios client for backend endpoints
│   │   │   └── weather.js              # Live Open-Meteo API consumer
│   │   ├── App.jsx                     # Core application state coordinator
│   │   └── main.jsx                    # Vite React entry point
│   ├── package.json                    # Node dependencies
│   └── vite.config.js                  # Vite configuration
├── data/
│   └── landslide_dataset.csv           # 1,000+ records geological training dataset
└── README.md                           # Comprehensive documentation & execution guide
```

---

## 💻 How to Run in VS Code (Visual Studio Code)

Follow these simple steps to run both the **Backend** and **Frontend** inside VS Code:

### 1. Open the Project in VS Code
1. Launch **Visual Studio Code**.
2. Click **File ➔ Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Select the extracted project folder:
   ```
   landslideguard-ai
   ```

---

### 2. Start the Backend Server (Terminal 1)
1. Open a new terminal in VS Code: **Terminal ➔ New Terminal** (or press `` Ctrl + ` ``).
2. Run the following commands:

```powershell
# Navigate to backend directory
cd backend

# (Optional: If setting up virtual environment for the first time)
# python -m venv .venv
# pip install -r requirements.txt

# Start FastAPI backend server with reload enabled
.\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

> *(If using Windows CMD instead of PowerShell, run: `cd backend && .venv\Scripts\activate.bat && uvicorn app:app --host 127.0.0.1 --port 8000 --reload`)*

✅ **Backend will run at:** **`http://127.0.0.1:8000`**  
📖 **API Swagger Docs:** **`http://127.0.0.1:8000/docs`**

---

### 3. Start the Frontend Server (Terminal 2)
1. In the VS Code terminal panel, click the **`+`** (Plus icon) on the top-right of the terminal to open a **Second Terminal**.
2. Run the following commands:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (only required the first time)
npm install

# Start Vite React development server
npm run dev
```

✅ **Frontend will run at:** **`http://localhost:5173`** (or `http://127.0.0.1:5173`)

---

### 4. Open in Your Browser
Open your web browser (Chrome, Edge, Brave, etc.) and go to:
👉 **`http://localhost:5173`**

---

### ⚡ 1-Click Alternative Launcher (`run.bat`)
If you prefer not to type commands in two separate terminals, you can use the included 1-click batch launcher:
- In the VS Code File Explorer (or Windows Explorer), simply double-click **`run.bat`**, or run:
  ```powershell
  .\run.bat
  ```
- This automatically opens two separate command windows for **Backend** and **Frontend** simultaneously!

---

## 🚀 Detailed Manual Setup Guide

### Prerequisites

Before starting, ensure you have the following installed on your computer:
1. **Python 3.10+** ([Download Python](https://www.python.org/downloads/)) — *Make sure to check "Add Python to PATH" during installation.*
2. **Node.js 18+ & npm** ([Download Node.js](https://nodejs.org/))
3. **Git** ([Download Git](https://git-scm.com/))

---

### Step 1: Clone or Open the Repository

Open your terminal (PowerShell, Command Prompt, or Bash) and run:

```bash
git clone https://github.com/ImRohan35/Early-Landslide-Detect.git
cd Early-Landslide-Detect
```

*(If you are running from inside the extracted folder `landslideguard-ai`, navigate into `landslideguard-ai`).*

---

### Step 2: Setup & Start Backend (FastAPI + ML Model)

Open a **First Terminal Window**:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   # On Windows (PowerShell):
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # On Windows (CMD):
   python -m venv .venv
   .\.venv\Scripts\activate.bat

   # On Linux / macOS:
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment file (optional):
   ```bash
   cp .env.example .env
   ```

5. Run automated test suite to verify the ML model:
   ```bash
   python test_backend.py
   ```

6. Start the FastAPI backend server:
   ```bash
   uvicorn app:app --host 127.0.0.1 --port 8000 --reload
   ```

   ✅ Backend will start running at: **`http://127.0.0.1:8000`**
   - **Interactive API Documentation (Swagger UI):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **Health Check Endpoint:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
   - **Model Metrics Endpoint:** [http://127.0.0.1:8000/api/model/metrics](http://127.0.0.1:8000/api/model/metrics)

---

### Step 3: Setup & Start Frontend (React + Vite)

Open a **Second Terminal Window** (keep the backend terminal running):

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

   ✅ Frontend will start running at: **`http://localhost:5173`** (or `http://127.0.0.1:5173`)

4. Open your web browser and navigate to:
   ```
   http://localhost:5173
   ```

---

  
## 🔐 How to Log In

The system includes a universal testing authentication pipeline:
- **Email:** Type any valid email (e.g., `rohan@gmail.com` or `analyst@disaster.gov.in`)
- **Password:** Type any password (e.g., `password123` or `admin123`)
- Click **"Sign In to Operations"** to enter the live dashboard.

---

## 🧪 Feature Walkthrough & Verification

| Module / Screen | Actions to Test | What Happens |
| :--- | :--- | :--- |
| **Interactive Map** | Click **"Map"** in sidebar | Opens 2D Leaflet map showing all 8 NER states, stations, roads, and incidents. |
| **Map Only & Fullscreen** | Click **"🗺️ Map Only View"** or **"⛶ Full Screen Map"** | Expands map to 100% full screen; shows floating button to exit back. |
| **Highway Route Advisor** | Click **"Alerts"** in sidebar | View highway corridors (NH-10, NH-29, NH-6) with Open/Blocked status and alternate safe travel detours. |
| **State Historical Trends** | Click **"Historical Data"** & select a state (e.g., *Meghalaya*) | 5-Year incident chart and event donut update dynamically for that specific state. |
| **Multi-Format Reports** | Click **"Reports"** ➔ Select format (PDF, Excel, Word, CSV) | Downloads verified reports in your chosen format instantly. |
| **What-If Simulator** | Click **"What-If Simulator"** & adjust rainfall slider | Risk score recalculates in real-time using live ML weights. |
| **Live Telemetry Proof** | Open browser `F12` ➔ Network tab ➔ Filter `open-meteo` | View live outgoing satellite weather requests for current coordinates. |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Leaflet, React-Leaflet, Lucide Icons, Recharts, jsPDF, docx, xlsx.
- **Backend:** Python 3.10+, FastAPI, Uvicorn, SQLite, Pydantic, Joblib, NumPy, Pandas.
- **Machine Learning:** Scikit-Learn Random Forest Classifier (Accuracy: 95.0%).
- **Telemetry & APIs:** Open-Meteo REST API, WMO Codes, NASA SRTM DEM, NASA SMAP.

---

## 📜 Academic Notice & License

This software platform is developed as a comprehensive **Disaster Risk Reduction & AI Decision Support System** for monitoring landslide hazards across North-Eastern India.

Released under the [MIT License](LICENSE).
