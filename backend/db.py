"""
SQLite database models, migrations, and seed data for
NorthEast Landslide Risk Monitoring System.
"""

from __future__ import annotations

import datetime
import hashlib
from pathlib import Path
import random
import secrets
import sqlite3
from typing import Any, Dict, List, Optional

DB_PATH = Path(__file__).resolve().parent / "landslideguard.db"


def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with a unique random salt."""
    salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return f"pbkdf2_sha256${salt}${pw_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash, supporting backward compatibility."""
    if not stored_hash or not password:
        return False
    if stored_hash.startswith("pbkdf2_sha256$"):
        parts = stored_hash.split("$")
        if len(parts) != 3:
            return False
        _, salt, expected_hash = parts
        calc_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
        return secrets.compare_digest(calc_hash, expected_hash)
    # Plain-text legacy fallback for existing unhashed rows
    return secrets.compare_digest(password, stored_hash)


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# Initial seed data across all 8 North Eastern states
SEED_LOCATIONS = [
    # Assam
    {
        "id": "haflong",
        "name": "Haflong Hills",
        "district": "Dima Hasao",
        "state": "Assam",
        "latitude": 25.1645,
        "longitude": 93.0176,
        "rainfall": 142.0,
        "soil_moisture": 78.0,
        "slope": 28.0,
        "elevation": 966.0,
        "ndvi": 0.62,
        "distance_to_river": 120.0,
        "historical_landslides": 5,
        "risk_score": 78.0,
        "risk_level": "Critical",
    },
    {
        "id": "diphu",
        "name": "Diphu Corridor",
        "district": "Karbi Anglong",
        "state": "Assam",
        "latitude": 25.8430,
        "longitude": 93.4315,
        "rainfall": 74.0,
        "soil_moisture": 58.0,
        "slope": 16.0,
        "elevation": 186.0,
        "ndvi": 0.72,
        "distance_to_river": 450.0,
        "historical_landslides": 1,
        "risk_score": 42.0,
        "risk_level": "Moderate",
    },
    {
        "id": "guwahati_hills",
        "name": "Kalapahar Slopes",
        "district": "Kamrup Metropolitan",
        "state": "Assam",
        "latitude": 26.1365,
        "longitude": 91.7342,
        "rainfall": 122.0,
        "soil_moisture": 74.0,
        "slope": 24.0,
        "elevation": 210.0,
        "ndvi": 0.58,
        "distance_to_river": 250.0,
        "historical_landslides": 4,
        "risk_score": 68.0,
        "risk_level": "High",
    },
    {
        "id": "bokakhat",
        "name": "Bokakhat Ridge",
        "district": "Golaghat",
        "state": "Assam",
        "latitude": 26.6210,
        "longitude": 93.5970,
        "rainfall": 45.0,
        "soil_moisture": 42.0,
        "slope": 9.0,
        "elevation": 95.0,
        "ndvi": 0.78,
        "distance_to_river": 800.0,
        "historical_landslides": 0,
        "risk_score": 18.0,
        "risk_level": "Low",
    },

    # Arunachal Pradesh
    {
        "id": "tawang",
        "name": "Tawang Valley Pass",
        "district": "Tawang",
        "state": "Arunachal Pradesh",
        "latitude": 27.5860,
        "longitude": 91.8657,
        "rainfall": 165.0,
        "soil_moisture": 91.0,
        "slope": 35.0,
        "elevation": 2669.0,
        "ndvi": 0.52,
        "distance_to_river": 85.0,
        "historical_landslides": 8,
        "risk_score": 92.0,
        "risk_level": "Critical",
    },
    {
        "id": "yingkiong",
        "name": "Yingkiong Ridge",
        "district": "Upper Siang",
        "state": "Arunachal Pradesh",
        "latitude": 28.6106,
        "longitude": 95.0460,
        "rainfall": 142.0,
        "soil_moisture": 82.0,
        "slope": 30.0,
        "elevation": 341.0,
        "ndvi": 0.65,
        "distance_to_river": 110.0,
        "historical_landslides": 3,
        "risk_score": 77.0,
        "risk_level": "Critical",
    },
    {
        "id": "itanagar",
        "name": "Itanagar Hills",
        "district": "Papum Pare",
        "state": "Arunachal Pradesh",
        "latitude": 27.0844,
        "longitude": 93.6053,
        "rainfall": 88.0,
        "soil_moisture": 62.0,
        "slope": 21.0,
        "elevation": 320.0,
        "ndvi": 0.70,
        "distance_to_river": 520.0,
        "historical_landslides": 2,
        "risk_score": 48.0,
        "risk_level": "Moderate",
    },
    {
        "id": "pasighat",
        "name": "Pasighat Foothills",
        "district": "East Siang",
        "state": "Arunachal Pradesh",
        "latitude": 28.0670,
        "longitude": 95.3260,
        "rainfall": 52.0,
        "soil_moisture": 44.0,
        "slope": 11.0,
        "elevation": 153.0,
        "ndvi": 0.82,
        "distance_to_river": 900.0,
        "historical_landslides": 0,
        "risk_score": 20.0,
        "risk_level": "Low",
    },

    # Meghalaya
    {
        "id": "sohra",
        "name": "Sohra Escarpment",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "latitude": 25.2702,
        "longitude": 91.7328,
        "rainfall": 195.0,
        "soil_moisture": 92.0,
        "slope": 33.0,
        "elevation": 1313.0,
        "ndvi": 0.54,
        "distance_to_river": 95.0,
        "historical_landslides": 9,
        "risk_score": 94.0,
        "risk_level": "Critical",
    },
    {
        "id": "jowai",
        "name": "Jowai Ridge",
        "district": "West Jaintia Hills",
        "state": "Meghalaya",
        "latitude": 25.4520,
        "longitude": 92.2087,
        "rainfall": 105.0,
        "soil_moisture": 66.0,
        "slope": 22.0,
        "elevation": 1390.0,
        "ndvi": 0.72,
        "distance_to_river": 360.0,
        "historical_landslides": 2,
        "risk_score": 62.0,
        "risk_level": "High",
    },
    {
        "id": "shillong_peak",
        "name": "Shillong Peak Slopes",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "latitude": 25.5340,
        "longitude": 91.8840,
        "rainfall": 85.0,
        "soil_moisture": 60.0,
        "slope": 19.0,
        "elevation": 1961.0,
        "ndvi": 0.75,
        "distance_to_river": 480.0,
        "historical_landslides": 1,
        "risk_score": 46.0,
        "risk_level": "Moderate",
    },
    {
        "id": "tura",
        "name": "Tura Peak",
        "district": "West Garo Hills",
        "state": "Meghalaya",
        "latitude": 25.5140,
        "longitude": 90.2200,
        "rainfall": 76.0,
        "soil_moisture": 55.0,
        "slope": 18.0,
        "elevation": 872.0,
        "ndvi": 0.76,
        "distance_to_river": 650.0,
        "historical_landslides": 0,
        "risk_score": 38.0,
        "risk_level": "Moderate",
    },

    # Manipur
    {
        "id": "tupul",
        "name": "Tupul Railway Corridor",
        "district": "Noney",
        "state": "Manipur",
        "latitude": 24.7186,
        "longitude": 93.6331,
        "rainfall": 178.0,
        "soil_moisture": 90.0,
        "slope": 34.0,
        "elevation": 820.0,
        "ndvi": 0.53,
        "distance_to_river": 60.0,
        "historical_landslides": 6,
        "risk_score": 95.0,
        "risk_level": "Critical",
    },
    {
        "id": "senapati",
        "name": "Senapati Highway",
        "district": "Senapati",
        "state": "Manipur",
        "latitude": 25.2671,
        "longitude": 94.0222,
        "rainfall": 128.0,
        "soil_moisture": 78.0,
        "slope": 27.0,
        "elevation": 1061.0,
        "ndvi": 0.64,
        "distance_to_river": 210.0,
        "historical_landslides": 4,
        "risk_score": 75.0,
        "risk_level": "High",
    },
    {
        "id": "tamenglong",
        "name": "Tamenglong Hills",
        "district": "Tamenglong",
        "state": "Manipur",
        "latitude": 24.9820,
        "longitude": 93.4940,
        "rainfall": 158.0,
        "soil_moisture": 86.0,
        "slope": 31.0,
        "elevation": 1260.0,
        "ndvi": 0.58,
        "distance_to_river": 130.0,
        "historical_landslides": 5,
        "risk_score": 88.0,
        "risk_level": "Critical",
    },
    {
        "id": "imphal_east",
        "name": "Imphal Valley Edge",
        "district": "Imphal East",
        "state": "Manipur",
        "latitude": 24.8100,
        "longitude": 93.9400,
        "rainfall": 48.0,
        "soil_moisture": 42.0,
        "slope": 10.0,
        "elevation": 786.0,
        "ndvi": 0.81,
        "distance_to_river": 750.0,
        "historical_landslides": 0,
        "risk_score": 21.0,
        "risk_level": "Low",
    },

    # Mizoram
    {
        "id": "aizawl",
        "name": "Aizawl Urban Slopes",
        "district": "Aizawl",
        "state": "Mizoram",
        "latitude": 23.7271,
        "longitude": 92.7176,
        "rainfall": 132.0,
        "soil_moisture": 78.0,
        "slope": 28.0,
        "elevation": 1132.0,
        "ndvi": 0.60,
        "distance_to_river": 180.0,
        "historical_landslides": 5,
        "risk_score": 74.0,
        "risk_level": "High",
    },
    {
        "id": "melthum",
        "name": "Melthum Quarry Sector",
        "district": "Aizawl",
        "state": "Mizoram",
        "latitude": 23.6980,
        "longitude": 92.7112,
        "rainfall": 182.0,
        "soil_moisture": 91.0,
        "slope": 36.0,
        "elevation": 980.0,
        "ndvi": 0.50,
        "distance_to_river": 90.0,
        "historical_landslides": 6,
        "risk_score": 93.0,
        "risk_level": "Critical",
    },
    {
        "id": "lunglei",
        "name": "Lunglei Ridge",
        "district": "Lunglei",
        "state": "Mizoram",
        "latitude": 22.8671,
        "longitude": 92.7654,
        "rainfall": 76.0,
        "soil_moisture": 57.0,
        "slope": 18.0,
        "elevation": 722.0,
        "ndvi": 0.74,
        "distance_to_river": 540.0,
        "historical_landslides": 1,
        "risk_score": 41.0,
        "risk_level": "Moderate",
    },
    {
        "id": "champhai",
        "name": "Champhai Valley",
        "district": "Champhai",
        "state": "Mizoram",
        "latitude": 23.4720,
        "longitude": 93.3280,
        "rainfall": 60.0,
        "soil_moisture": 47.0,
        "slope": 14.0,
        "elevation": 1350.0,
        "ndvi": 0.79,
        "distance_to_river": 620.0,
        "historical_landslides": 0,
        "risk_score": 25.0,
        "risk_level": "Low",
    },

    # Nagaland
    {
        "id": "kohima",
        "name": "Kohima Bypass",
        "district": "Kohima",
        "state": "Nagaland",
        "latitude": 25.6751,
        "longitude": 94.1086,
        "rainfall": 135.0,
        "soil_moisture": 79.0,
        "slope": 29.0,
        "elevation": 1444.0,
        "ndvi": 0.61,
        "distance_to_river": 160.0,
        "historical_landslides": 4,
        "risk_score": 76.0,
        "risk_level": "High",
    },
    {
        "id": "tuensang",
        "name": "Tuensang Escarpment",
        "district": "Tuensang",
        "state": "Nagaland",
        "latitude": 26.2800,
        "longitude": 94.8300,
        "rainfall": 156.0,
        "soil_moisture": 87.0,
        "slope": 32.0,
        "elevation": 1371.0,
        "ndvi": 0.55,
        "distance_to_river": 110.0,
        "historical_landslides": 5,
        "risk_score": 86.0,
        "risk_level": "Critical",
    },
    {
        "id": "pfutsero",
        "name": "Pfutsero Hill Pass",
        "district": "Phek",
        "state": "Nagaland",
        "latitude": 25.6840,
        "longitude": 94.3120,
        "rainfall": 72.0,
        "soil_moisture": 54.0,
        "slope": 17.0,
        "elevation": 1524.0,
        "ndvi": 0.77,
        "distance_to_river": 490.0,
        "historical_landslides": 1,
        "risk_score": 38.0,
        "risk_level": "Moderate",
    },
    {
        "id": "dimapur",
        "name": "Dimapur Plains Border",
        "district": "Dimapur",
        "state": "Nagaland",
        "latitude": 25.9060,
        "longitude": 93.7270,
        "rainfall": 44.0,
        "soil_moisture": 41.0,
        "slope": 8.0,
        "elevation": 145.0,
        "ndvi": 0.82,
        "distance_to_river": 820.0,
        "historical_landslides": 0,
        "risk_score": 19.0,
        "risk_level": "Low",
    },

    # Sikkim
    {
        "id": "gangtok",
        "name": "Gangtok Ridge & NH-10",
        "district": "East Sikkim",
        "state": "Sikkim",
        "latitude": 27.3389,
        "longitude": 88.6065,
        "rainfall": 175.0,
        "soil_moisture": 88.0,
        "slope": 33.0,
        "elevation": 1650.0,
        "ndvi": 0.57,
        "distance_to_river": 110.0,
        "historical_landslides": 7,
        "risk_score": 91.0,
        "risk_level": "Critical",
    },
    {
        "id": "mangan",
        "name": "Mangan-Chungthang Link",
        "district": "North Sikkim",
        "state": "Sikkim",
        "latitude": 27.5096,
        "longitude": 88.5309,
        "rainfall": 182.0,
        "soil_moisture": 91.0,
        "slope": 38.0,
        "elevation": 956.0,
        "ndvi": 0.53,
        "distance_to_river": 70.0,
        "historical_landslides": 8,
        "risk_score": 96.0,
        "risk_level": "Critical",
    },
    {
        "id": "pakyong",
        "name": "Pakyong Hillside",
        "district": "Pakyong",
        "state": "Sikkim",
        "latitude": 27.2280,
        "longitude": 88.5890,
        "rainfall": 110.0,
        "soil_moisture": 71.0,
        "slope": 24.0,
        "elevation": 1422.0,
        "ndvi": 0.67,
        "distance_to_river": 240.0,
        "historical_landslides": 3,
        "risk_score": 68.0,
        "risk_level": "High",
    },
    {
        "id": "namchi",
        "name": "Namchi Terraces",
        "district": "South Sikkim",
        "state": "Sikkim",
        "latitude": 27.1660,
        "longitude": 88.3510,
        "rainfall": 72.0,
        "soil_moisture": 55.0,
        "slope": 18.0,
        "elevation": 1315.0,
        "ndvi": 0.76,
        "distance_to_river": 460.0,
        "historical_landslides": 0,
        "risk_score": 37.0,
        "risk_level": "Moderate",
    },

    # Tripura
    {
        "id": "ambassa",
        "name": "Ambassa Slope",
        "district": "Dhalai",
        "state": "Tripura",
        "latitude": 23.9240,
        "longitude": 91.8550,
        "rainfall": 62.0,
        "soil_moisture": 51.0,
        "slope": 13.0,
        "elevation": 45.0,
        "ndvi": 0.78,
        "distance_to_river": 580.0,
        "historical_landslides": 0,
        "risk_score": 31.0,
        "risk_level": "Moderate",
    },
    {
        "id": "jampui",
        "name": "Jampui Hills Pass",
        "district": "North Tripura",
        "state": "Tripura",
        "latitude": 23.9800,
        "longitude": 92.2700,
        "rainfall": 95.0,
        "soil_moisture": 65.0,
        "slope": 22.0,
        "elevation": 780.0,
        "ndvi": 0.71,
        "distance_to_river": 340.0,
        "historical_landslides": 1,
        "risk_score": 52.0,
        "risk_level": "Moderate",
    },
    {
        "id": "dharmanagar",
        "name": "Dharmanagar Ridge",
        "district": "North Tripura",
        "state": "Tripura",
        "latitude": 24.3667,
        "longitude": 92.1694,
        "rainfall": 36.0,
        "soil_moisture": 35.0,
        "slope": 8.0,
        "elevation": 21.0,
        "ndvi": 0.84,
        "distance_to_river": 920.0,
        "historical_landslides": 0,
        "risk_score": 16.0,
        "risk_level": "Low",
    },
    {
        "id": "agartala",
        "name": "Agartala Urban Periphery",
        "district": "West Tripura",
        "state": "Tripura",
        "latitude": 23.8315,
        "longitude": 91.2868,
        "rainfall": 32.0,
        "soil_moisture": 30.0,
        "slope": 6.0,
        "elevation": 15.0,
        "ndvi": 0.86,
        "distance_to_river": 1100.0,
        "historical_landslides": 0,
        "risk_score": 14.0,
        "risk_level": "Low",
    },
]

SEED_STATES_INFO = {
    "Assam": {
        "description": "High susceptibility along the southern Barak valley, Dima Hasao hill rail corridors, and urban inselbergs around Guwahati.",
        "capital": "Dispur",
        "total_districts": 31,
        "vulnerable_corridors": "Haflong, Silchar link, Guwahati urban hills",
    },
    "Arunachal Pradesh": {
        "description": "Steep eastern Himalayan slopes with heavy rainfall, deep gorges, and seismic fault lines causing severe translational slides.",
        "capital": "Itanagar",
        "total_districts": 26,
        "vulnerable_corridors": "Tawang-Bomdila corridor, Yingkiong-Pasighat highway",
    },
    "Meghalaya": {
        "description": "World-record precipitation triggers dramatic escarpment failures along sandstone and limestone cliffs overlooking Bangladesh plains.",
        "capital": "Shillong",
        "total_districts": 12,
        "vulnerable_corridors": "Sohra rim, NH-6 Sonapur tunnel, Jowai pass",
    },
    "Manipur": {
        "description": "Young fold mountains characterized by soft shale and sandstone prone to deep-seated rotational slides along river gorges.",
        "capital": "Imphal",
        "total_districts": 16,
        "vulnerable_corridors": "Tupul-Ijei river basin, Imphal-Dimapur NH-29, Senapati",
    },
    "Mizoram": {
        "description": "Parallel north-south trending hill ranges with steep western slopes vulnerable to cyclonic cloudbursts and urban quarry collapses.",
        "capital": "Aizawl",
        "total_districts": 11,
        "vulnerable_corridors": "Aizawl city slopes, Melthum quarry, NH-54 Silchar-Aizawl",
    },
    "Nagaland": {
        "description": "High geological instability with fractured sedimentary formations and active road cut subsidence along strategic highway links.",
        "capital": "Kohima",
        "total_districts": 16,
        "vulnerable_corridors": "Kohima bypass NH-29, Chumukedima, Pfutsero",
    },
    "Sikkim": {
        "description": "High Himalayan terrain with fractured gneiss, steep glaciated valleys, and major river cut corridors prone to GLOF debris flows.",
        "capital": "Gangtok",
        "total_districts": 6,
        "vulnerable_corridors": "Teesta River basin NH-10, Mangan-Chungthang, Pakyong",
    },
    "Tripura": {
        "description": "Predominantly undulating low hills with localized slope degradation in the Jampui and Dhalai ranges during monsoon storms.",
        "capital": "Agartala",
        "total_districts": 8,
        "vulnerable_corridors": "Jampui ridge, Ambassa pass, NH-8 Assam-Agartala",
    },
}

SEED_HISTORICAL = [
    {
        "id": "hist-1",
        "date": "2022-06-30",
        "location": "Tupul Railway Station Yard",
        "district": "Noney",
        "state": "Manipur",
        "latitude": 24.7186,
        "longitude": 93.6331,
        "severity": "Critical",
        "rainfall_recorded_mm": 285.0,
        "description": "Catastrophic debris avalanche and mudslide into the Ijei river at Tupul railway yard construction site.",
        "casualties": 58,
        "source": "Geological Survey of India (GSI) Disaster Report 2022",
    },
    {
        "id": "hist-2",
        "date": "2022-05-15",
        "location": "New Haflong Station & Dima Hasao",
        "district": "Dima Hasao",
        "state": "Assam",
        "latitude": 25.1782,
        "longitude": 93.0247,
        "severity": "Critical",
        "rainfall_recorded_mm": 210.0,
        "description": "Massive hill slide buried station trackbeds and stranded train coaches, paralyzing Lumding-Badarpur hill rail.",
        "casualties": 3,
        "source": "Northeast Frontier Railway (NFR) / ASDMA",
    },
    {
        "id": "hist-3",
        "date": "2022-06-14",
        "location": "Kalapahar-Boragaon Slopes",
        "district": "Kamrup Metropolitan",
        "state": "Assam",
        "latitude": 26.1365,
        "longitude": 91.7342,
        "severity": "High",
        "rainfall_recorded_mm": 165.0,
        "description": "Multiple translational slides across urban periphery triggered by blocked drain channels.",
        "casualties": 4,
        "source": "ASDMA Guwahati Incident Bulletin",
    },
    {
        "id": "hist-4",
        "date": "2023-10-04",
        "location": "South Lhonak GLOF & Teesta Basin",
        "district": "North Sikkim",
        "state": "Sikkim",
        "latitude": 27.5210,
        "longitude": 88.5412,
        "severity": "Critical",
        "rainfall_recorded_mm": 195.0,
        "description": "Glacial Lake Outburst Flood induced severe toe erosion, triggering widespread slope failures along NH-10 and Chungthang.",
        "casualties": 42,
        "source": "NDMA / Geological Survey of India",
    },
    {
        "id": "hist-5",
        "date": "2022-06-17",
        "location": "Sohra-Shella Escarpment",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "latitude": 25.2631,
        "longitude": 91.7145,
        "severity": "High",
        "rainfall_recorded_mm": 372.0,
        "description": "Massive cliff collapse along gorge following intense Cherrapunji cloudburst downpours.",
        "casualties": 2,
        "source": "Meghalaya SDMA Disaster Assessment",
    },
    {
        "id": "hist-6",
        "date": "2024-05-28",
        "location": "Melthum-Hlimen Slope",
        "district": "Aizawl",
        "state": "Mizoram",
        "latitude": 23.6980,
        "longitude": 92.7112,
        "severity": "Critical",
        "rainfall_recorded_mm": 182.0,
        "description": "Cyclone Remal-induced cloudburst triggered collapse of hillside stone quarry into habitation.",
        "casualties": 29,
        "source": "Disaster Management & Rehabilitation Dept, Mizoram",
    },
    {
        "id": "hist-7",
        "date": "2021-08-12",
        "location": "Pfutsero Hill Pass",
        "district": "Phek",
        "state": "Nagaland",
        "latitude": 25.6840,
        "longitude": 94.3120,
        "severity": "Moderate",
        "rainfall_recorded_mm": 115.0,
        "description": "Road subsidence and mudslip along interstate highway during late monsoon.",
        "casualties": 0,
        "source": "Nagaland SDMA",
    },
    {
        "id": "hist-8",
        "date": "2022-07-04",
        "location": "Hunli Corridor",
        "district": "Lower Dibang Valley",
        "state": "Arunachal Pradesh",
        "latitude": 28.3214,
        "longitude": 95.9621,
        "severity": "High",
        "rainfall_recorded_mm": 158.0,
        "description": "Debris flow swept away 60m of strategic trans-Arunachal highway near Hunli.",
        "casualties": 0,
        "source": "Arunachal SDMA Disaster Bulletin",
    },
    {
        "id": "hist-9",
        "date": "2020-09-23",
        "location": "Gangtok 32nd Mile NH-10",
        "district": "East Sikkim",
        "state": "Sikkim",
        "latitude": 27.2800,
        "longitude": 88.5400,
        "severity": "High",
        "rainfall_recorded_mm": 145.0,
        "description": "Continuous rockfall and soil creep severed vehicular connectivity to Gangtok capital.",
        "casualties": 1,
        "source": "Border Roads Organisation (BRO)",
    },
    {
        "id": "hist-10",
        "date": "2023-08-14",
        "location": "Jampui Ridge Highway",
        "district": "North Tripura",
        "state": "Tripura",
        "latitude": 23.9800,
        "longitude": 92.2700,
        "severity": "Moderate",
        "rainfall_recorded_mm": 128.0,
        "description": "Shoulder slope failure and fallen trees blocked local horticulture supply route.",
        "casualties": 0,
        "source": "Tripura PWD / Disaster Response Cell",
    },
]

SEED_ALERTS = [
    {
        "id": "alert-1",
        "location_id": "gangtok",
        "location_name": "Gangtok Ridge & NH-10",
        "state": "Sikkim",
        "severity": "Critical",
        "probability": 91,
        "reason": "Estimated landslide risk is critical based on historical rainfall patterns (175mm) and steep 33° terrain.",
        "recommended_action": "Follow local authorities and disaster-management advisories and avoid high-risk areas.",
        "is_read": 0,
        "created_at": "2026-09-12 14:30:00",
    },
    {
        "id": "alert-2",
        "location_id": "sohra",
        "location_name": "Sohra Escarpment",
        "state": "Meghalaya",
        "severity": "Critical",
        "probability": 94,
        "reason": "Historical torrential precipitation patterns and shear sandstone gorge cuts indicate severe slope instability.",
        "recommended_action": "Follow local authorities and disaster-management advisories and avoid high-risk areas.",
        "is_read": 0,
        "created_at": "2026-09-12 11:15:00",
    },
    {
        "id": "alert-3",
        "location_id": "haflong",
        "location_name": "Haflong Hills",
        "state": "Assam",
        "severity": "Critical",
        "probability": 78,
        "reason": "Heavy historical rainfall patterns, steep terrain, and vulnerable geographical conditions contribute to increased landslide risk.",
        "recommended_action": "Follow local authorities and disaster-management advisories and avoid high-risk areas.",
        "is_read": 0,
        "created_at": "2026-09-12 09:40:00",
    },
    {
        "id": "alert-4",
        "location_id": "kohima",
        "location_name": "Kohima Bypass",
        "state": "Nagaland",
        "severity": "High",
        "probability": 76,
        "reason": "Estimated landslide risk is high based on historical and environmental patterns along hill road cuts.",
        "recommended_action": "Increase monitoring and avoid unnecessary travel through vulnerable slopes during adverse conditions.",
        "is_read": 0,
        "created_at": "2026-09-11 18:20:00",
    },
    {
        "id": "alert-5",
        "location_id": "aizawl",
        "location_name": "Aizawl Urban Slopes",
        "state": "Mizoram",
        "severity": "High",
        "probability": 74,
        "reason": "High historical rainfall and steep hillside habitations suggest elevated vulnerability.",
        "recommended_action": "Increase monitoring and avoid unnecessary travel through vulnerable slopes during adverse conditions.",
        "is_read": 1,
        "created_at": "2026-09-11 12:05:00",
    },
]

SEED_FEEDBACK = [
    {
        "name": "Prof. D. Bhattacharya",
        "email": "dbhatt@nerist.ac.in",
        "rating": 5,
        "category": "Accuracy & Usability",
        "message": "The historical risk correlation for Dima Hasao and Sikkim matches official GSI survey reports very closely. Excellent interface.",
        "created_at": "2026-09-10 16:20:00",
    },
    {
        "name": "Dr. T. Sangma",
        "email": "sangma.t@asdma.gov.in",
        "rating": 5,
        "category": "Reporting",
        "message": "The downloadable risk summary reports are well formatted and clear for divisional review.",
        "created_at": "2026-09-08 10:15:00",
    },
]


def init_db() -> None:
    """Initialize SQLite database tables and seed baseline records."""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 1. Locations Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS locations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                district TEXT,
                state TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                rainfall REAL DEFAULT 0,
                soil_moisture REAL DEFAULT 0,
                slope REAL DEFAULT 0,
                elevation REAL DEFAULT 0,
                ndvi REAL DEFAULT 0.7,
                distance_to_river REAL DEFAULT 300,
                historical_landslides INTEGER DEFAULT 0,
                risk_score REAL DEFAULT 0,
                risk_level TEXT DEFAULT 'Low',
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # 2. Risk Data Logs Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS risk_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location_id TEXT,
                location_name TEXT,
                risk_score REAL,
                risk_level TEXT,
                rainfall REAL,
                slope REAL,
                elevation REAL,
                soil_moisture REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # 3. Alerts Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                location_id TEXT,
                location_name TEXT NOT NULL,
                state TEXT NOT NULL,
                severity TEXT NOT NULL,
                probability INTEGER DEFAULT 50,
                reason TEXT NOT NULL,
                recommended_action TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # 4. Historical Landslides Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS historical_landslides (
                id TEXT PRIMARY KEY,
                date TEXT NOT NULL,
                location TEXT NOT NULL,
                district TEXT NOT NULL,
                state TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                severity TEXT NOT NULL,
                rainfall_recorded_mm REAL,
                description TEXT,
                casualties INTEGER DEFAULT 0,
                source TEXT
            )
            """
        )

        # 5. Users Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'Analyst',
                agency TEXT DEFAULT 'North-East Disaster Management Authority',
                avatar TEXT DEFAULT '🛡️',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # 6. Feedback Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                rating INTEGER NOT NULL,
                category TEXT DEFAULT 'General',
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # Populate locations if empty
        cursor.execute("SELECT COUNT(*) FROM locations")
        if cursor.fetchone()[0] == 0:
            for loc in SEED_LOCATIONS:
                cursor.execute(
                    """
                    INSERT INTO locations (id, name, district, state, latitude, longitude, rainfall, soil_moisture, slope, elevation, ndvi, distance_to_river, historical_landslides, risk_score, risk_level)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        loc["id"],
                        loc["name"],
                        loc["district"],
                        loc["state"],
                        loc["latitude"],
                        loc["longitude"],
                        loc["rainfall"],
                        loc["soil_moisture"],
                        loc["slope"],
                        loc["elevation"],
                        loc["ndvi"],
                        loc.get("distance_to_river", 300.0),
                        loc["historical_landslides"],
                        loc["risk_score"],
                        loc["risk_level"],
                    ),
                )

        # Populate historical disasters if empty
        cursor.execute("SELECT COUNT(*) FROM historical_landslides")
        if cursor.fetchone()[0] == 0:
            for h in SEED_HISTORICAL:
                cursor.execute(
                    """
                    INSERT INTO historical_landslides (id, date, location, district, state, latitude, longitude, severity, rainfall_recorded_mm, description, casualties, source)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (h["id"], h["date"], h["location"], h["district"], h["state"], h["latitude"], h["longitude"], h["severity"], h["rainfall_recorded_mm"], h["description"], h["casualties"], h["source"]),
                )

        # Populate alerts if empty
        cursor.execute("SELECT COUNT(*) FROM alerts")
        if cursor.fetchone()[0] == 0:
            for a in SEED_ALERTS:
                cursor.execute(
                    """
                    INSERT INTO alerts (id, location_id, location_name, state, severity, probability, reason, recommended_action, is_read, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (a["id"], a["location_id"], a["location_name"], a["state"], a["severity"], a.get("probability", 70), a["reason"], a["recommended_action"], a.get("is_read", 0), a["created_at"]),
                )

        # Populate default user if empty
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            cursor.execute(
                """
                INSERT INTO users (id, name, email, password_hash, role, agency, avatar)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "usr-1",
                    "Disaster Risk Analyst",
                    "analyst@nelrms.gov.in",
                    hash_password("nelrms@2026"),
                    "Lead Operations Analyst",
                    "North-East Disaster Management Authority",
                    "🛡️",
                ),
            )
        else:
            # Automatic migration for existing plain-text passwords
            cursor.execute("SELECT id, password_hash FROM users")
            for uid, phash in cursor.fetchall():
                if phash and not phash.startswith("pbkdf2_sha256$"):
                    cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?", (hash_password(phash), uid))

        # Populate initial feedback if empty
        cursor.execute("SELECT COUNT(*) FROM feedback")
        if cursor.fetchone()[0] == 0:
            for fb in SEED_FEEDBACK:
                cursor.execute(
                    """
                    INSERT INTO feedback (name, email, rating, category, message, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (fb["name"], fb["email"], fb["rating"], fb["category"], fb["message"], fb["created_at"]),
                )

        conn.commit()


# --- Database Queries ---

def list_locations(state: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM locations WHERE 1=1"
        params = []
        if state and state.lower() != "all":
            query += " AND LOWER(state) = LOWER(?)"
            params.append(state)
        if search:
            query += " AND (LOWER(name) LIKE ? OR LOWER(district) LIKE ? OR LOWER(state) LIKE ?)"
            term = f"%{search.lower()}%"
            params.extend([term, term, term])
        query += " ORDER BY risk_score DESC"
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


def get_location(loc_id: str) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM locations WHERE id = ? OR LOWER(name) = ? OR LOWER(id) = ?", (loc_id, loc_id.lower(), loc_id.lower()))
        row = cursor.fetchone()
        if not row:
            # Substring search
            cursor.execute("SELECT * FROM locations WHERE LOWER(name) LIKE ? LIMIT 1", (f"%{loc_id.lower()}%",))
            row = cursor.fetchone()
        return dict(row) if row else None


def get_states_summary() -> List[Dict[str, Any]]:
    """Retrieve aggregate statistics for all 8 NER states."""
    states_list = [
        "Assam",
        "Arunachal Pradesh",
        "Meghalaya",
        "Manipur",
        "Mizoram",
        "Nagaland",
        "Sikkim",
        "Tripura",
    ]
    with get_db_connection() as conn:
        cursor = conn.cursor()
        summaries = []
        for st in states_list:
            cursor.execute("SELECT COUNT(*), AVG(risk_score), AVG(rainfall), AVG(slope) FROM locations WHERE state = ?", (st,))
            count, avg_risk, avg_rain, avg_slope = cursor.fetchone()

            cursor.execute("SELECT COUNT(*) FROM locations WHERE state = ? AND risk_level IN ('Critical', 'High')", (st,))
            high_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM historical_landslides WHERE state = ?", (st,))
            hist_count = cursor.fetchone()[0]

            info = SEED_STATES_INFO.get(st, {})

            summaries.append({
                "state": st,
                "location_count": count or 0,
                "high_risk_count": high_count or 0,
                "average_risk_score": round(avg_risk or 0, 1),
                "average_rainfall": round(avg_rain or 0, 1),
                "average_slope": round(avg_slope or 0, 1),
                "historical_events_count": hist_count or 0,
                "capital": info.get("capital", ""),
                "description": info.get("description", ""),
                "vulnerable_corridors": info.get("vulnerable_corridors", ""),
            })

        summaries.sort(key=lambda x: x["high_risk_count"], reverse=True)
        return summaries


def get_state_detail(state_name: str) -> Optional[Dict[str, Any]]:
    """Retrieve detailed state info, locations, and historical disaster events."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM locations WHERE LOWER(state) = LOWER(?) ORDER BY risk_score DESC", (state_name,))
        locations = [dict(row) for row in cursor.fetchall()]
        if not locations:
            # Check if valid state name
            matched_key = None
            for k in SEED_STATES_INFO:
                if k.lower() == state_name.lower():
                    matched_key = k
                    break
            if not matched_key:
                return None
            state_name = matched_key

        cursor.execute("SELECT * FROM historical_landslides WHERE LOWER(state) = LOWER(?) ORDER BY date DESC", (state_name,))
        history = [dict(row) for row in cursor.fetchall()]

        info = SEED_STATES_INFO.get(state_name, {})
        return {
            "state": state_name,
            "capital": info.get("capital", ""),
            "description": info.get("description", ""),
            "vulnerable_corridors": info.get("vulnerable_corridors", ""),
            "locations": locations,
            "historical_events": history,
            "total_locations": len(locations),
            "critical_locations": sum(1 for l in locations if l["risk_level"] == "Critical"),
            "high_locations": sum(1 for l in locations if l["risk_level"] == "High"),
            "moderate_locations": sum(1 for l in locations if l["risk_level"] == "Moderate"),
            "low_locations": sum(1 for l in locations if l["risk_level"] == "Low"),
        }


def list_alerts(severity: Optional[str] = None, state: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM alerts WHERE 1=1"
        params = []
        if severity and severity.lower() != "all":
            query += " AND LOWER(severity) = LOWER(?)"
            params.append(severity)
        if state and state.lower() != "all":
            query += " AND LOWER(state) = LOWER(?)"
            params.append(state)
        query += " ORDER BY created_at DESC"
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


def mark_alert_read(alert_id: str) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE alerts SET is_read = 1 WHERE id = ?", (alert_id,))
        conn.commit()
        return cursor.rowcount > 0


def mark_all_alerts_read() -> int:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE alerts SET is_read = 1 WHERE is_read = 0")
        conn.commit()
        return cursor.rowcount


def clear_alerts() -> int:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM alerts")
        conn.commit()
        return cursor.rowcount


def add_alert(alert_data: Dict[str, Any]) -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        alert_id = alert_data.get("id") or f"alert-{int(datetime.datetime.now().timestamp())}"
        cursor.execute(
            """
            INSERT OR REPLACE INTO alerts (id, location_id, location_name, state, severity, probability, reason, recommended_action, is_read)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                alert_id,
                alert_data.get("location_id", ""),
                alert_data.get("location_name", "Unknown Location"),
                alert_data.get("state", "NER"),
                alert_data.get("severity", "High"),
                alert_data.get("probability", 75),
                alert_data.get("reason", "Elevated landslide risk threshold detected based on environmental patterns."),
                alert_data.get("recommended_action", "Increase monitoring and exercise caution."),
                0,
            ),
        )
        conn.commit()
        alert_data["id"] = alert_id
        return alert_data


def list_historical_events() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM historical_landslides ORDER BY date DESC")
        return [dict(row) for row in cursor.fetchall()]


def log_prediction(data: Dict[str, Any]) -> None:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO risk_data (location_id, location_name, risk_score, risk_level, rainfall, slope, elevation, soil_moisture)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.get("location_id", ""),
                data.get("location_name", "Unknown"),
                data.get("risk_score", 0),
                data.get("risk_level", "Low"),
                data.get("rainfall", 0),
                data.get("slope", 0),
                data.get("elevation", 0),
                data.get("soil_moisture", 0),
            ),
        )
        conn.commit()


def add_feedback(feedback_data: Dict[str, Any]) -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO feedback (name, email, rating, category, message)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                feedback_data.get("name", "Anonymous"),
                feedback_data.get("email", ""),
                int(feedback_data.get("rating", 5)),
                feedback_data.get("category", "General"),
                feedback_data.get("message", ""),
            ),
        )
        conn.commit()
        feedback_data["id"] = cursor.lastrowid
        feedback_data["created_at"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return feedback_data


def list_feedback() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM feedback ORDER BY created_at DESC")
        return [dict(row) for row in cursor.fetchall()]


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(id) = LOWER(?)",
            (email.strip(), email.strip()),
        )
        row = cursor.fetchone()
        return dict(row) if row else None


def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        user_id = f"usr-{int(datetime.datetime.now().timestamp())}"
        hashed_password = hash_password(user_data["password"])
        cursor.execute(
            """
            INSERT INTO users (id, name, email, password_hash, role, agency, avatar)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                user_data["name"].strip(),
                user_data["email"].lower().strip(),
                hashed_password,
                user_data.get("role", "Field Analyst"),
                user_data.get("agency", "North-East Disaster Management Authority"),
                user_data.get("avatar", "👤"),
            ),
        )
        conn.commit()
        return {
            "id": user_id,
            "name": user_data["name"].strip(),
            "email": user_data["email"].lower().strip(),
            "role": user_data.get("role", "Field Analyst"),
            "agency": user_data.get("agency", "North-East Disaster Management Authority"),
            "avatar": user_data.get("avatar", "👤"),
        }


def update_user_profile(user_id: str, updates: Dict[str, Any]) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE users
            SET name = COALESCE(?, name),
                role = COALESCE(?, role),
                agency = COALESCE(?, agency),
                avatar = COALESCE(?, avatar)
            WHERE id = ? OR email = ?
            """,
            (
                updates.get("name"),
                updates.get("role"),
                updates.get("agency"),
                updates.get("avatar"),
                user_id,
                user_id,
            ),
        )
        conn.commit()
        return cursor.rowcount > 0


def update_user_password(email: str, new_password: str) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        hashed = hash_password(new_password)
        cursor.execute(
            "UPDATE users SET password_hash = ? WHERE LOWER(email) = LOWER(?)",
            (hashed, email.strip()),
        )
        conn.commit()
        return cursor.rowcount > 0


def get_system_stats() -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM locations")
        total_locs = cursor.fetchone()[0]

        cursor.execute("SELECT risk_level, COUNT(*) FROM locations GROUP BY risk_level")
        risk_counts = dict(cursor.fetchall())

        cursor.execute("SELECT COUNT(*) FROM alerts WHERE is_read = 0")
        unread_alerts = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM alerts")
        total_alerts = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM historical_landslides")
        total_historical = cursor.fetchone()[0]

        return {
            "total_locations": total_locs,
            "low_risk": risk_counts.get("Low", 0),
            "moderate_risk": risk_counts.get("Moderate", 0),
            "high_risk": risk_counts.get("High", 0),
            "critical_risk": risk_counts.get("Critical", 0),
            "unread_alerts": unread_alerts,
            "total_alerts": total_alerts,
            "total_historical_events": total_historical,
            "states_count": 8,
        }
