/**
 * Public Live Weather Service for LandslideGuard AI.
 * Uses Open-Meteo API (free, open, keyless, and rate-friendly) with graceful fallback.
 */

const WMO_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy continuous rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export function formatISTTime(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date) + ' IST';
  } catch {
    return date.toLocaleTimeString() + ' IST';
  }
}

export function formatISTDate(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toDateString();
  }
}

const weatherCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes in-memory cache

export async function fetchLiveWeather(latitude, longitude, locationName = '') {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { status: 'unavailable', error: 'Invalid coordinates' };
  }

  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Direct Open-Meteo query (real, live WMO weather station grid)
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`;
    
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const data = await response.json();
      const current = data.current || {};
      const daily = data.daily || {};

      const weatherCode = current.weather_code ?? 0;
      const conditionText = WMO_CODES[weatherCode] || 'Atmospheric monitoring';

      // Cumulative real 24h rainfall recorded today
      const realDailyRain = daily.precipitation_sum && daily.precipitation_sum[0] !== undefined && daily.precipitation_sum[0] !== null
        ? Number(Number(daily.precipitation_sum[0]).toFixed(1))
        : Number(Number(current.precipitation || 0).toFixed(1));

      const tempVal = Number(Number(current.temperature_2m ?? 22).toFixed(1));
      const humidityVal = Math.round(current.relative_humidity_2m ?? 75);
      const windVal = Number(Number(current.wind_speed_10m ?? 8).toFixed(1));
      const pressureVal = Math.round(current.surface_pressure || 1012);

      const result = {
        status: 'available',
        source: 'OPEN_METEO_LIVE_API',
        is_simulated: false,

        // Real Temperature
        temperature: tempVal,
        temperature_c: tempVal,
        temp: tempVal,

        // Real Relative Humidity
        humidity: humidityVal,
        relative_humidity: humidityVal,
        humidity_pct: humidityVal,

        // Real Rainfall
        precipitation: realDailyRain,
        rainfall_mm: realDailyRain,
        rainfall: realDailyRain,
        forecastRainfall: realDailyRain,
        current_rate_mm: Number(Number(current.precipitation || 0).toFixed(1)),

        // Real Wind Speed
        windSpeed: windVal,
        wind_speed_kmh: windVal,
        wind: windVal,

        pressure_hpa: pressureVal,
        weatherCode,
        condition: conditionText,
        condition_text: conditionText,
        updatedAt: formatISTTime(new Date()),
      };

      weatherCache.set(cacheKey, { timestamp: Date.now(), data: result });
      return result;
    }
  } catch (err) {
    console.warn('Direct Open-Meteo fetch failed, falling back to backend weather proxy:', err);
  }

  // 2. Secondary fallback via Backend live proxy
  try {
    const backendRes = await fetch(
      `http://127.0.0.1:8000/api/weather?latitude=${latitude}&longitude=${longitude}&location_name=${encodeURIComponent(locationName)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (backendRes.ok) {
      const bData = await backendRes.json();
      const result = {
        status: 'available',
        source: bData.source || 'BACKEND_LIVE_API',
        is_simulated: false,

        temperature: bData.temperature_c ?? 22,
        temperature_c: bData.temperature_c ?? 22,
        temp: bData.temperature_c ?? 22,

        humidity: bData.humidity_pct ?? 75,
        relative_humidity: bData.humidity_pct ?? 75,
        humidity_pct: bData.humidity_pct ?? 75,

        precipitation: bData.rainfall_mm ?? 0,
        rainfall_mm: bData.rainfall_mm ?? 0,
        rainfall: bData.rainfall_mm ?? 0,
        forecastRainfall: bData.rainfall_mm ?? 0,

        windSpeed: bData.wind_speed_kmh ?? 8,
        wind_speed_kmh: bData.wind_speed_kmh ?? 8,
        wind: bData.wind_speed_kmh ?? 8,

        condition: bData.condition || 'Partly Cloudy',
        condition_text: bData.condition || 'Partly Cloudy',
        updatedAt: formatISTTime(new Date()),
      };
      weatherCache.set(cacheKey, { timestamp: Date.now(), data: result });
      return result;
    }
  } catch {}

  return {
    status: 'unavailable',
    message: 'Weather data currently unavailable.',
  };
}

export async function fetchHourlyPrecipitationForecast(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return [];
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation,temperature_2m,weather_code&forecast_days=2&timezone=Asia%2FKolkata`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];

    const data = await response.json();
    const hourly = data.hourly || {};
    const times = hourly.time || [];
    const precips = hourly.precipitation || [];
    const temps = hourly.temperature_2m || [];
    const codes = hourly.weather_code || [];

    // Current time in ISO format substring
    const nowIso = new Date().toISOString().slice(0, 13);
    let startIndex = times.findIndex((t) => t.slice(0, 13) >= nowIso);
    if (startIndex === -1) startIndex = 0;

    const results = [];
    const maxPoints = Math.min(times.length, startIndex + 36);

    for (let i = startIndex; i < maxPoints; i++) {
      const tStr = times[i];
      const d = new Date(tStr);
      const isToday = d.getDate() === new Date().getDate();
      const hour12 = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
      const label = i === startIndex ? 'Now' : isToday ? hour12 : `Tmrw ${hour12}`;

      results.push({
        time: tStr,
        label,
        hour: d.getHours(),
        precipitation: Number((precips[i] || 0).toFixed(1)),
        temperature: Math.round(temps[i] || 22),
        condition: WMO_CODES[codes[i]] || 'Clear',
      });
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Fetch 7-Day Live Daily Meteorological Forecast & Project Multi-Day Landslide Risk Progression.
 * Uses Open-Meteo operational daily forecast with geomorphic slope-saturation correlation.
 */
export async function fetch7DayRiskForecast(latitude, longitude, terrain = {}) {
  const {
    slope = 24,
    soilMoisture = 65,
    historicalLandslides = 1,
    ndvi = 0.65,
    elevation = 1000,
  } = terrain;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return [];
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,precipitation_sum,precipitation_hours,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata&forecast_days=7`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error(`Weather API returned ${response.status}`);

    const data = await response.json();
    const daily = data.daily || {};
    const times = daily.time || [];
    const precips = daily.precipitation_sum || [];
    const maxTemps = daily.temperature_2m_max || [];
    const minTemps = daily.temperature_2m_min || [];
    const codes = daily.weather_code || [];

    let runningAccumulation = 0;
    const days = times.map((tStr, i) => {
      const d = new Date(tStr);
      const isToday = i === 0;
      const dayName = isToday ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' });
      const dateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const rain = Number((precips[i] || 0).toFixed(1));

      // Antecedent moisture tracking (75% retention from previous days)
      runningAccumulation = Number((runningAccumulation * 0.75 + rain).toFixed(1));

      // Geotechnical risk factors calculation
      const rfScore = Math.min(1.0, rain / 120.0) * 35.0;
      const slopeScore = Math.min(1.0, Number(slope) / 45.0) * 25.0;
      const adjustedSm = Math.min(98, Math.round(Number(soilMoisture) * 0.7 + (runningAccumulation / 110) * 30));
      const smScore = Math.min(1.0, adjustedSm / 100.0) * 20.0;
      const histScore = Number(historicalLandslides) > 0 ? 12.0 : 2.0;
      const vegScore = Math.max(0.0, (0.88 - Number(ndvi)) / 0.88) * 8.0;

      const rawScore = Math.round(rfScore + slopeScore + smScore + histScore + vegScore);
      const score = Math.max(10, Math.min(98, rawScore));

      let level = 'Low';
      if (score > 75) level = 'Critical';
      else if (score > 50) level = 'High';
      else if (score > 25) level = 'Moderate';

      const conditionDesc = WMO_CODES[codes[i]] || (rain > 10 ? 'Rain' : 'Partly Cloudy');

      return {
        dateStr: tStr,
        dayName,
        dateLabel,
        date: dateLabel,
        precipitation: rain,
        accumulatedRain: runningAccumulation,
        maxTemp: Math.round(maxTemps[i] || 24),
        minTemp: Math.round(minTemps[i] || 16),
        condition: conditionDesc,
        score,
        risk: score,
        level,
        low: 25,
        moderate: 50,
        high: 75,
        isLive: true,
      };
    });

    return days;
  } catch (err) {
    console.warn('Live 7-day forecast fetch failed, generating offline projection:', err);
    // Safe deterministic fallback when network/API is unreachable
    const now = new Date();
    const fallback = [];
    let acc = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' });
      const dateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const rain = i === 2 ? 45 : i === 3 ? 65 : i === 4 ? 30 : i === 0 ? 12 : 5;
      acc = Number((acc * 0.75 + rain).toFixed(1));

      const score = Math.max(15, Math.min(95, Math.round((slope / 45) * 28 + (soilMoisture / 100) * 20 + Math.min(45, (acc / 80) * 45))));
      let level = 'Low';
      if (score > 75) level = 'Critical';
      else if (score > 50) level = 'High';
      else if (score > 25) level = 'Moderate';

      fallback.push({
        dateStr: d.toISOString().slice(0, 10),
        dayName,
        dateLabel,
        date: dateLabel,
        precipitation: rain,
        accumulatedRain: acc,
        maxTemp: 23 + (i % 3),
        minTemp: 16,
        condition: rain > 20 ? 'Heavy Rain' : 'Showers',
        score,
        risk: score,
        level,
        low: 25,
        moderate: 50,
        high: 75,
        isLive: false,
      });
    }
    return fallback;
  }
}


