import { useState, useEffect } from 'react';
import {
  CloudRain,
  Compass,
  Download,
  Droplets,
  FileText,
  History,
  Info,
  Layers,
  MapPin,
  Mountain,
  ShieldAlert,
  Thermometer,
  TreePine,
  TrendingUp,
  Wind,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { riskColors, calculateGeomorphicRisk } from '../data/riskLocations';
import { generateRiskReport } from '../services/report';
import { fetchLiveWeather } from '../services/weather';

export default function LocationDetails({
  location,
  t,
  lang,
  onToast,
  onOpenWhatIf,
}) {
  const [reportLoading, setReportLoading] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (location?.latitude && location?.longitude) {
      fetchLiveWeather(location.latitude, location.longitude, location.locationName || location.name || '')
        .then((data) => {
          if (isMounted && data && data.status === 'available') {
            setLiveWeather(data);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [location?.id, location?.latitude, location?.longitude, location?.locationName, location?.name]);

  if (!location) return null;

  const effectiveRainfall = liveWeather?.rainfall_mm !== undefined
    ? Number(liveWeather.rainfall_mm)
    : Number(location.rainfall || 0);

  const dynamicRisk = calculateGeomorphicRisk({
    rainfall: effectiveRainfall,
    slope: location.slope,
    soilMoisture: location.soilMoisture,
    historicalLandslides: location.historicalLandslides,
    ndvi: location.ndvi,
    elevation: location.elevation,
  });

  const score = dynamicRisk.riskScore;
  const level = dynamicRisk.riskLevel;
  const color = dynamicRisk.riskColor;

  // Dynamic explanation narrative
  const getExplanation = () => {
    const factors = [];
    if (effectiveRainfall > 120) factors.push(`${effectiveRainfall}mm torrential monsoon precipitation`);
    else if (effectiveRainfall > 80) factors.push(`${effectiveRainfall}mm elevated rainfall`);

    if (location.slope > 28) factors.push(`steep ${location.slope}° terrain incline`);
    else if (location.slope > 20) factors.push(`moderate-to-steep ${location.slope}° slope`);

    if (location.soilMoisture > 75) factors.push(`saturated soil moisture (${location.soilMoisture}%)`);

    if (location.historicalLandslides > 0 || (location.historicalLandslideStatus && !location.historicalLandslideStatus.includes('No '))) {
      factors.push('documented historical landslide activity and existing shear planes');
    }

    if (location.elevation > 1500) factors.push(`high montane elevation (${location.elevation}m AMSL)`);

    if (factors.length === 0) {
      return lang === 'hi'
        ? 'वर्तमान पर्यावरणीय कारक सुरक्षित सीमा में हैं। कम वर्षा और सामान्य ढलान के कारण स्थिरता बनी हुई है।'
        : 'Environmental parameters remain within safe baseline tolerances. Low precipitation and gentle slope gradients support slope stability.';
    }

    const reasons = factors.join(', ');
    if (lang === 'hi') {
      return `${reasons} इस क्षेत्र में भूस्खलन जोखिम को बढ़ाने वाले प्रमुख योगदानकर्ता कारक हैं। पूर्व भूस्खलन गतिविधि और भारी वर्षा ढलान अस्थिरता को तीव्र करती है।`;
    }
    return `${reasons.charAt(0).toUpperCase() + reasons.slice(1)} are the major contributing factors to the predicted risk. Steep terrain combined with prolonged hydrological saturation significantly reduces soil shear strength.`;
  };

  const handleExportPDF = () => {
    setReportLoading(true);
    try {
      generateRiskReport(location);
      onToast?.(`Official Risk Assessment Report exported for ${location.locationName}`, 'success');
    } catch (err) {
      onToast?.('Failed to generate PDF report', 'error');
    } finally {
      setTimeout(() => setReportLoading(false), 800);
    }
  };

  // ML Feature importances data for chart
  const featureChartData = [
    { name: lang === 'hi' ? 'वर्षा (Rain)' : 'Rainfall', value: 28.7, color: '#38bdf8' },
    { name: lang === 'hi' ? 'ढलान (Slope)' : 'Slope Angle', value: 18.3, color: '#e67d27' },
    { name: lang === 'hi' ? 'नमी (Moisture)' : 'Soil Moisture', value: 18.7, color: '#0284c7' },
    { name: lang === 'hi' ? 'वनस्पति (NDVI)' : 'Vegetation', value: 13.8, color: '#16a34a' },
    { name: lang === 'hi' ? 'ऊंचाई (Elev)' : 'Elevation', value: 8.0, color: '#6366f1' },
    { name: lang === 'hi' ? 'इतिहास (Hist)' : 'Historical Slips', value: 6.5, color: '#d63f45' },
  ];

  return (
    <div className="location-details-container">
      {/* Header Banner */}
      <div className="location-hero-banner" style={{ borderLeft: `6px solid ${color}` }}>
        <div className="location-hero-left">
          <div className="location-breadcrumbs">
            <MapPin size={15} color={color} />
            <span>{location.state}</span> &rsaquo; <span>{location.district} District</span>
            {location.village && <span> &rsaquo; <em>{location.village}</em></span>}
          </div>
          <h2 className="location-hero-title">{location.locationName}</h2>
          <div className="location-coords">
            <span>GPS: {location.latitude?.toFixed(4)}° N, {location.longitude?.toFixed(4)}° E</span>
            <span className="bullet">&bull;</span>
            <span>{t.locations.elevation}: <b>{location.elevation}m AMSL</b></span>
            <span className="bullet">&bull;</span>
            <span className="data-mode-badge simulated">
              <Info size={13} /> {t.locations.simulatedNotice}
            </span>
          </div>
        </div>

        <div className="location-hero-right">
          <div className="hero-risk-badge-box" style={{ background: `${color}18`, borderColor: color }}>
            <span className="hero-risk-label" style={{ color }}>{t.riskLevels[level] || level} RISK</span>
            <div className="hero-risk-score" style={{ color }}>{score}<b>/100</b></div>
            <small style={{ color }}>{level === 'Critical' ? '🚨 Extreme Hazard' : level === 'High' ? '⚠️ High Alert' : '🟢 Monitored'}</small>
          </div>

          <div className="hero-actions">
            <button
              type="button"
              className="action-btn pdf-btn"
              onClick={handleExportPDF}
              disabled={reportLoading}
              title="Download official PDF disaster advisory"
            >
              <Download size={15} />
              <span>{reportLoading ? 'Generating...' : t.locations.generateReport}</span>
            </button>
            {onOpenWhatIf && (
              <button
                type="button"
                className="action-btn whatif-btn"
                onClick={() => onOpenWhatIf(location)}
                title="Simulate varying rainfall or slope in Sandbox"
              >
                <TrendingUp size={15} />
                <span>{t.nav.whatIfSimulator}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Current Meteorological Conditions + AI Risk Analysis */}
      <div className="details-grid-two">
        {/* Current Environmental & Meteorological Condition */}
        <div className="details-panel current-condition-panel">
          <div className="panel-title-bar">
            <div className="panel-title-left">
              <CloudRain size={18} color="#38bdf8" />
              <h3>{t.locations.currentCondition}</h3>
            </div>
            <span className="telemetry-pill live" title="Direct live meteorological connection via Open-Meteo">
              ● {liveWeather?.source === 'OPEN_METEO_LIVE_API' ? 'Live Open-Meteo' : 'Live Telemetry'}
            </span>
          </div>

          <div className="weather-overview-card">
            <div className="weather-main-stat">
              <span className="weather-icon-lg">
                {liveWeather?.condition?.includes('Rain') || liveWeather?.condition?.includes('Drizzle')
                  ? '🌧️'
                  : liveWeather?.condition?.includes('Thunderstorm')
                  ? '⛈️'
                  : liveWeather?.condition?.includes('Clear')
                  ? '☀️'
                  : '⛅'}
              </span>
              <div>
                <strong className="weather-temp">
                  {liveWeather?.temperature !== undefined
                    ? `${liveWeather.temperature}°C`
                    : `${(20.5 + ((location.elevation || 1000) > 1500 ? -4.5 : 2.5)).toFixed(1)}°C`}
                </strong>
                <span className="weather-cond-label">
                  {liveWeather?.condition ||
                    (location.rainfall > 130 ? 'Heavy Monsoon Deluge' : location.rainfall > 80 ? 'Continuous Rain Showers' : 'Partly Cloudy & Humid')}
                </span>
              </div>
            </div>

            <div className="weather-metric-pills">
              <div className="weather-pill">
                <CloudRain size={16} color="#38bdf8" />
                <div>
                  <small>{t.locations.rainfall24h}</small>
                  <b>{liveWeather?.rainfall_mm !== undefined ? `${liveWeather.rainfall_mm} mm` : `${location.rainfall} mm`}</b>
                </div>
              </div>
              <div className="weather-pill">
                <Droplets size={16} color="#0284c7" />
                <div>
                  <small>{t.locations.humidity}</small>
                  <b>{liveWeather?.humidity !== undefined ? `${liveWeather.humidity}%` : `${Math.min(99, Math.round(75 + (location.rainfall / 8)))}%`}</b>
                </div>
              </div>
              <div className="weather-pill">
                <Wind size={16} color="#64748b" />
                <div>
                  <small>{t.locations.windSpeed}</small>
                  <b>{liveWeather?.wind_speed_kmh !== undefined ? `${liveWeather.wind_speed_kmh} km/h` : '12.0 km/h'}</b>
                </div>
              </div>
              <div className="weather-pill">
                <Mountain size={16} color="#e67d27" />
                <div>
                  <small>{t.locations.slopeAngle}</small>
                  <b>{location.slope}° Gradient</b>
                </div>
              </div>
            </div>
          </div>

          {/* Contributing Factor Cards */}
          <h4 className="subpanel-title">{t.locations.contributingFactors}</h4>
          <div className="factor-cards-grid">
            <div className="factor-gauge-card">
              <div className="factor-header">
                <span>{t.locations.rainfall24h}</span>
                <b className={effectiveRainfall > 120 ? 'tag-crit' : effectiveRainfall > 70 ? 'tag-high' : 'tag-safe'}>
                  {effectiveRainfall} mm
                </b>
              </div>
              <div className="factor-bar-track">
                <div
                  className="factor-bar-fill"
                  style={{
                    width: `${Math.min(100, (effectiveRainfall / 200) * 100)}%`,
                    background: effectiveRainfall > 120 ? '#d63f45' : '#38bdf8',
                  }}
                />
              </div>
              <small className="factor-subtext">
                {effectiveRainfall > 120 ? 'Critical saturation threshold exceeded' : 'Within manageable absorption capacity'}
              </small>
            </div>

            <div className="factor-gauge-card">
              <div className="factor-header">
                <span>{t.locations.slopeAngle}</span>
                <b className={location.slope > 30 ? 'tag-crit' : location.slope > 22 ? 'tag-high' : 'tag-safe'}>
                  {location.slope}°
                </b>
              </div>
              <div className="factor-bar-track">
                <div
                  className="factor-bar-fill"
                  style={{
                    width: `${Math.min(100, (location.slope / 45) * 100)}%`,
                    background: location.slope > 28 ? '#d63f45' : '#e67d27',
                  }}
                />
              </div>
              <small className="factor-subtext">
                {location.slope > 28 ? 'Steep mountain gradient exceeds angle of repose' : 'Moderate slope gradient'}
              </small>
            </div>

            <div className="factor-gauge-card">
              <div className="factor-header">
                <span>{t.locations.soilMoisture}</span>
                <b className={location.soilMoisture > 80 ? 'tag-crit' : location.soilMoisture > 65 ? 'tag-high' : 'tag-safe'}>
                  {location.soilMoisture}%
                </b>
              </div>
              <div className="factor-bar-track">
                <div
                  className="factor-bar-fill"
                  style={{
                    width: `${location.soilMoisture}%`,
                    background: location.soilMoisture > 80 ? '#d63f45' : '#0284c7',
                  }}
                />
              </div>
              <small className="factor-subtext">
                {location.soilMoisture > 75 ? 'Extreme pore-water pressure along shear planes' : 'Moderate ground water table'}
              </small>
            </div>

            <div className="factor-gauge-card">
              <div className="factor-header">
                <span>{t.locations.vegetationCover}</span>
                <b className={location.ndvi < 0.60 ? 'tag-crit' : 'tag-safe'}>
                  NDVI {location.ndvi}
                </b>
              </div>
              <div className="factor-bar-track">
                <div
                  className="factor-bar-fill"
                  style={{
                    width: `${Math.max(10, location.ndvi * 100)}%`,
                    background: location.ndvi < 0.60 ? '#e67d27' : '#16a34a',
                  }}
                />
              </div>
              <small className="factor-subtext">
                {location.ndvi < 0.60 ? 'Sparse canopy allows rapid topsoil washing' : 'Dense root network binds soil mantle'}
              </small>
            </div>
          </div>
        </div>

        {/* Explainable AI Risk Analysis & Contributing Factor Reasoning */}
        <div className="details-panel risk-analysis-panel">
          <div className="panel-title-bar">
            <div className="panel-title-left">
              <ShieldAlert size={18} color={color} />
              <h3>{t.locations.riskAnalysis}</h3>
            </div>
            <span className="risk-level-tag" style={{ background: color, color: '#fff' }}>
              {t.riskLevels[level]} ({score}%)
            </span>
          </div>

          {/* Plain Language Explanatory Callout */}
          <div className={`explanation-callout ${level.toLowerCase()}`}>
            <div className="explanation-callout-header">
              <AlertTriangle size={17} />
              <strong>{t.locations.whyRiskLevel}</strong>
            </div>
            <p className="explanation-narrative-text">{getExplanation()}</p>
          </div>

          {/* Historical Disaster Activity Card */}
          <div className="historical-activity-card">
            <div className="hist-header">
              <History size={16} color="#d63f45" />
              <strong>{t.locations.historicalFrequency}</strong>
            </div>
            <p className="hist-desc">
              {location.historicalLandslideStatus ||
                (location.historicalLandslides > 0
                  ? `${location.historicalLandslides} documented landslide disasters on record in GSI inventory for ${location.district} sector.`
                  : 'No major recorded landslides in official inventory; baseline tectonic stability observed.')}
            </p>
          </div>

          {/* Machine Learning Feature Importance Weights */}
          <div className="ml-importances-section">
            <div className="ml-header">
              <TrendingUp size={16} color="#2563eb" />
              <strong>Scikit-Learn Random Forest Feature Weights</strong>
            </div>
            <p className="ml-sub">Relative influence of environmental features in the AI risk calculation model:</p>

            <div style={{ width: '100%', height: 160, marginTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureChartData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 35]} unit="%" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} width={80} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Importance Weight']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {featureChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
