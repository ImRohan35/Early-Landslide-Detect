"""Weather service for North Eastern Region (NER) landslide monitoring."""

from __future__ import annotations

import os
import random
import logging
from typing import Any, Dict
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("landslideguard.weather")

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "").strip()

# WMO Weather interpretation codes (WW) mapped to conditions
WMO_WEATHER_CODES = {
    0: ("Clear Sky", "☀️"),
    1: ("Mainly Clear", "🌤️"),
    2: ("Partly Cloudy", "⛅"),
    3: ("Overcast", "☁️"),
    45: ("Foggy", "🌫️"),
    48: ("Depositing Rime Fog", "🌫️"),
    51: ("Light Drizzle", "🌦️"),
    53: ("Moderate Drizzle", "🌦️"),
    55: ("Dense Drizzle", "🌧️"),
    61: ("Slight Rain", "🌧️"),
    63: ("Moderate Rain", "🌧️"),
    65: ("Heavy Rain", "⛈️"),
    80: ("Rain Showers", "🌦️"),
    81: ("Moderate Rain Showers", "🌧️"),
    82: ("Violent Rain Showers", "⛈️"),
    95: ("Thunderstorm", "⚡⛈️"),
    96: ("Thunderstorm with Slight Hail", "⛈️"),
    99: ("Thunderstorm with Heavy Hail", "⛈️"),
}


def get_fallback_weather(location_name: str, rainfall_baseline: float = 80.0) -> Dict[str, Any]:
    """Safe fallback weather generator when external APIs are unreachable."""
    condition_choices = [
        ("Heavy Rain", "⛈️", 22.4, 94),
        ("Continuous Downpour", "🌧️", 21.0, 96),
        ("Moderate Showers", "🌦️", 24.5, 88),
        ("Overcast with Mist", "☁️", 25.0, 82),
        ("Thunderstorm Warning", "⚡⛈️", 20.8, 98),
    ]

    choice = condition_choices[hash(location_name) % len(condition_choices)]
    temp = round(choice[2] + random.uniform(-1.5, 1.5), 1)
    humidity = min(100, max(60, int(choice[3] + random.uniform(-4, 4))))
    rainfall = round(max(5.0, rainfall_baseline + random.uniform(-12.0, 15.0)), 1)

    return {
        "source": "SIMULATED_DEMO_DATA",
        "temperature_c": temp,
        "humidity_pct": humidity,
        "rainfall_mm": rainfall,
        "condition": choice[0],
        "icon": choice[1],
        "wind_speed_kmh": round(12.0 + random.uniform(-3, 8), 1),
        "pressure_hpa": round(1008.0 + random.uniform(-4, 4), 1),
        "forecast": [
            {"day": "Today", "condition": choice[0], "rainfall_expected_mm": rainfall, "temp": temp},
            {"day": "Tomorrow", "condition": "Rain Showers", "rainfall_expected_mm": round(rainfall * 0.9, 1), "temp": temp + 0.5},
            {"day": "Day 3", "condition": "Cloudy with Light Rain", "rainfall_expected_mm": round(rainfall * 0.6, 1), "temp": temp + 1.2},
        ],
        "is_simulated": True,
    }


def fetch_weather(lat: float, lon: float, location_name: str = "", rainfall_baseline: float = 80.0) -> Dict[str, Any]:
    """Fetch current weather and forecast for given coordinates using Open-Meteo or OpenWeatherMap."""
    # 1. Try OpenWeatherMap if an API key is provided
    if OPENWEATHER_API_KEY:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
            resp = requests.get(url, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json()
                temp = data.get("main", {}).get("temp", 22.0)
                humidity = data.get("main", {}).get("humidity", 85)
                rain_dict = data.get("rain", {})
                rainfall = rain_dict.get("1h", rain_dict.get("3h", rainfall_baseline))
                condition = data.get("weather", [{}])[0].get("main", "Rain")

                return {
                    "source": "OPENWEATHERMAP_LIVE_API",
                    "temperature_c": round(float(temp), 1),
                    "humidity_pct": int(humidity),
                    "rainfall_mm": round(float(rainfall), 1),
                    "condition": condition,
                    "icon": "🌧️" if "Rain" in condition else "⛅",
                    "wind_speed_kmh": round(float(data.get("wind", {}).get("speed", 3.0) * 3.6), 1),
                    "pressure_hpa": data.get("main", {}).get("pressure", 1010),
                    "forecast": [
                        {"day": "Today", "condition": condition, "rainfall_expected_mm": round(float(rainfall), 1), "temp": temp},
                        {"day": "Tomorrow", "condition": "Scattered Showers", "rainfall_expected_mm": round(float(rainfall) * 0.85, 1), "temp": temp},
                        {"day": "Day 3", "condition": "Overcast", "rainfall_expected_mm": round(float(rainfall) * 0.5, 1), "temp": temp + 1},
                    ],
                    "is_simulated": False,
                }
        except Exception as err:
            logger.warning("OpenWeatherMap request failed: %s", err)

    # 2. Try Open-Meteo (No API key needed, high reliability for Indian sub-continent)
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,surface_pressure"
            f"&daily=weather_code,precipitation_sum,temperature_2m_max"
            f"&timezone=Asia%2FKolkata"
        )
        resp = requests.get(url, timeout=3.5)
        if resp.status_code == 200:
            data = resp.json()
            curr = data.get("current", {})
            daily = data.get("daily", {})

            code = curr.get("weather_code", 63)
            condition_desc, icon = WMO_WEATHER_CODES.get(code, ("Precipitation", "🌧️"))
            temp = curr.get("temperature_2m", 22.5)
            humidity = curr.get("relative_humidity_2m", 88)
            current_precip = curr.get("precipitation", 0.0)

            # Open-Meteo precipitation: daily precipitation_sum gives cumulative 24h rainfall
            daily_precip = daily.get("precipitation_sum", [])
            if daily_precip and len(daily_precip) > 0 and daily_precip[0] is not None:
                recorded_rainfall = float(daily_precip[0])
            else:
                recorded_rainfall = float(current_precip or 0.0)

            forecast = []
            days_labels = ["Today", "Tomorrow", "Day 3"]
            for i in range(min(3, len(daily.get("precipitation_sum", [])))):
                d_code = daily.get("weather_code", [63])[i]
                d_cond, _ = WMO_WEATHER_CODES.get(d_code, ("Showers", "🌧️"))
                forecast_rain = daily.get("precipitation_sum", [0.0])[i]
                forecast.append({
                    "day": days_labels[i],
                    "condition": d_cond,
                    "rainfall_expected_mm": round(float(forecast_rain or 0.0), 1),
                    "temp": round(daily.get("temperature_2m_max", [temp])[i] or temp, 1),
                })

            return {
                "source": "OPEN_METEO_LIVE_API",
                "temperature_c": round(float(temp), 1),
                "humidity_pct": int(humidity),
                "rainfall_mm": round(float(recorded_rainfall), 1),
                "condition": condition_desc,
                "icon": icon,
                "wind_speed_kmh": round(float(curr.get("wind_speed_10m", 12.0)), 1),
                "pressure_hpa": round(float(curr.get("surface_pressure", 1008.0)), 1),
                "forecast": forecast,
                "is_simulated": False,
            }
    except Exception as err:
        logger.warning("Open-Meteo request failed, using safe fallback: %s", err)

    # 3. Fallback simulation (ensures zero demo crashes)
    return get_fallback_weather(location_name, rainfall_baseline)
