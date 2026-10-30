import { useEffect, useState, useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CloudRain,
  Compass,
  Droplets,
  FileText,
  HelpCircle,
  History,
  Info,
  Leaf,
  MapPin,
  Mountain,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from 'lucide-react';
import { calculateGeomorphicRisk, getRiskLevelFromScore, riskColors, riskLocations } from '../data/riskLocations';
import { predictRisk } from '../services/api';

const SCENARIOS = [
  {
    id: 'monsoon',
    label: '⛈️ Heavy Monsoon Downpour',
    desc: 'Simulate severe tropical rainstorm & saturated soil',
    values: { rainfall: 220, soilMoisture: 88, slope: 34, elevation: 1400, ndvi: 0.45, historicalLandslide: true },
  },
  {
    id: 'dry',
    label: '☀️ Dry Season Baseline',
    desc: 'Safe post-monsoon sunny atmospheric conditions',
    values: { rainfall: 8, soilMoisture: 32, slope: 22, elevation: 1200, ndvi: 0.72, historicalLandslide: false },
  },
  {
    id: 'deforested',
    label: '🪵 Deforested Vulnerable Slope',
    desc: 'Severe loss of vegetative root binding strength',
    values: { rainfall: 140, soilMoisture: 75, slope: 38, elevation: 1600, ndvi: 0.18, historicalLandslide: true },
  },
  {
    id: 'flashflood',
    label: '🌊 Cloudburst Extreme Hazard',
    desc: 'High-intensity cloudburst exceeding stability limits',
    values: { rainfall: 320, soilMoisture: 95, slope: 42, elevation: 1800, ndvi: 0.35, historicalLandslide: true },
  },
];

function CircularGauge({ score, label, color, size = 110 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#f0ebe1" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 800, color: '#162b1d', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
          {Math.round(score)}%
        </span>
        <span style={{ fontSize: 10, color: color, fontWeight: 700, marginTop: 2, textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function WhatIfSimulator({ selectedLocation, onNavigate, theme = 'light' }) {
  const loc = selectedLocation || riskLocations[0];

  const getInitialValues = () => ({
    rainfall: Number(loc.rainfall || 25),
    soilMoisture: Number(loc.soil_moisture || loc.soilMoisture || 65),
    slope: Number(loc.slope || 28),
    elevation: Number(loc.elevation || 1450),
    ndvi: Number(loc.ndvi || 0.45),
    historicalLandslide: Number(loc.historical_landslides || loc.historicalLandslides || 1) > 0,
  });

  const [values, setValues] = useState(getInitialValues);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  useEffect(() => {
    setValues(getInitialValues());
    setSimulation(null);
    setActiveScenario(null);
  }, [loc.id]);

  // True station-specific baseline risk
  const baselineAssessment = useMemo(() => {
    return calculateGeomorphicRisk({
      rainfall: Number(loc.rainfall || 25),
      slope: Number(loc.slope || 28),
      soilMoisture: Number(loc.soil_moisture || loc.soilMoisture || 65),
      historicalLandslides: Number(loc.historical_landslides || loc.historicalLandslides || 1) > 0 ? 1 : 0,
      ndvi: Number(loc.ndvi || 0.45),
      elevation: Number(loc.elevation || 1450),
    });
  }, [loc]);

  const currentScore = baselineAssessment.riskScore;
  const currentLevel = baselineAssessment.riskLevel;

  // Real-time instantaneous dynamic calculation as sliders drag
  const liveSimulation = useMemo(() => {
    return calculateGeomorphicRisk({
      rainfall: values.rainfall,
      slope: values.slope,
      soilMoisture: values.soilMoisture,
      historicalLandslides: values.historicalLandslide ? 1 : 0,
      ndvi: values.ndvi,
      elevation: values.elevation,
    });
  }, [values]);

  const handleSlider = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: Number(val) }));
    setActiveScenario(null);
    setSimulation(null); // Instantly switches to real-time live sliding calculation
  };

  const handleScenarioClick = (sc) => {
    setActiveScenario(sc.id);
    setValues({ ...sc.values });
    setSimulation(null);
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await predictRisk({ ...loc, ...values });
      const score = Number(res.risk_score ?? res.riskScore ?? res.probability_value ?? liveSimulation.riskScore);
      const level = res.risk_level
        ? res.risk_level.charAt(0).toUpperCase() + res.risk_level.slice(1).toLowerCase()
        : getRiskLevelFromScore(score);
      setSimulation({ score, level });
    } catch {
      setSimulation({ score: liveSimulation.riskScore, level: liveSimulation.riskLevel });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues(getInitialValues());
    setSimulation(null);
    setActiveScenario(null);
  };

  const simScore = simulation ? simulation.score : liveSimulation.riskScore;
  const simLevel = simulation ? simulation.level : liveSimulation.riskLevel;
  const scoreDiff = Math.round(simScore - currentScore);

  const getColor = (level) => {
    const l = (level || 'Low').toLowerCase();
    if (l === 'critical') return '#dc2626';
    if (l === 'high') return '#ea580c';
    if (l === 'moderate') return '#f59e0b';
    return '#2e7d32';
  };

  return (
    <div
      style={{
        padding: '24px 28px 48px',
        maxWidth: 1380,
        margin: '0 auto',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #162a1c 0%, #1f3d28 100%)',
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 18,
          boxShadow: '0 10px 30px rgba(22, 42, 28, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#86efac', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            <Sparkles size={15} />
            <span>Interactive Decision Support &middot; Random Forest ML</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
            What-if Landslide Risk Simulator
          </h2>
          <p style={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.8)', margin: '6px 0 0', maxWidth: 680, lineHeight: 1.45 }}>
            Simulate how custom changes in precipitation, terrain slope, soil moisture, and deforestation directly alter slope failure probability in real-time.
          </p>
        </div>

        {/* Selected Location Pill */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: 14,
            padding: '12px 18px',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#744423', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', fontWeight: 600 }}>Active Station</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{loc.name || loc.locationName}</div>
            <small style={{ color: '#86efac', fontSize: 11.5 }}>{loc.state} &middot; Baseline: {currentScore}% ({currentLevel})</small>
          </div>
        </div>
      </div>

      {/* Preset Scenarios Quick Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
          ⚡ Quick Test Scenarios (1-Click Presets)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {SCENARIOS.map((sc) => {
            const isSelected = activeScenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => handleScenarioClick(sc)}
                style={{
                  background: isSelected ? '#f4ede4' : '#ffffff',
                  border: `1.5px solid ${isSelected ? '#744423' : '#e2ded5'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(116, 68, 35, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#b8a695';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#e2ded5';
                }}
              >
                <strong style={{ fontSize: 13.5, color: '#162b1d', display: 'block' }}>{sc.label}</strong>
                <small style={{ color: '#68776e', fontSize: 11.5, display: 'block', marginTop: 3 }}>{sc.desc}</small>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Studio Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Sliders & Controls */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            padding: '26px 28px',
            border: '1px solid #e7e2d6',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SlidersHorizontal size={19} style={{ color: '#744423' }} />
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#162b1d', margin: 0 }}>
                Environmental & Geological Controls
              </h3>
            </div>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                color: '#68776e',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
              title="Reset values to baseline"
            >
              <RotateCcw size={13} /> Reset Baseline
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Control 1: Rainfall */}
            <div style={{ background: '#fdfbf7', padding: '14px 16px', borderRadius: 12, border: '1px solid #ede8de' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13.5, color: '#162b1d' }}>
                  <CloudRain size={16} style={{ color: '#0284c7' }} /> Rainfall (Precipitation)
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 10px', borderRadius: 8 }}>
                  {values.rainfall} mm
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                step="5"
                value={values.rainfall}
                onChange={(e) => handleSlider('rainfall', e.target.value)}
                style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c9a91', marginTop: 4 }}>
                <span>0 mm (Clear)</span>
                <span>150 mm (Heavy)</span>
                <span>400 mm (Cloudburst)</span>
              </div>
            </div>

            {/* Control 2: Soil Moisture */}
            <div style={{ background: '#fdfbf7', padding: '14px 16px', borderRadius: 12, border: '1px solid #ede8de' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13.5, color: '#162b1d' }}>
                  <Droplets size={16} style={{ color: '#0ea5e9' }} /> Soil Moisture Saturation
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0ea5e9', background: '#e0f2fe', padding: '2px 10px', borderRadius: 8 }}>
                  {values.soilMoisture}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={values.soilMoisture}
                onChange={(e) => handleSlider('soilMoisture', e.target.value)}
                style={{ width: '100%', accentColor: '#0ea5e9', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c9a91', marginTop: 4 }}>
                <span>10% (Arid)</span>
                <span>60% (Moderate)</span>
                <span>100% (Super-Saturated)</span>
              </div>
            </div>

            {/* Control 3: Slope */}
            <div style={{ background: '#fdfbf7', padding: '14px 16px', borderRadius: 12, border: '1px solid #ede8de' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13.5, color: '#162b1d' }}>
                  <Mountain size={16} style={{ color: '#8b5a2b' }} /> Terrain Slope Incline
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#8b5a2b', background: '#fef3c7', padding: '2px 10px', borderRadius: 8 }}>
                  {values.slope}°
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={values.slope}
                onChange={(e) => handleSlider('slope', e.target.value)}
                style={{ width: '100%', accentColor: '#8b5a2b', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c9a91', marginTop: 4 }}>
                <span>0° (Flat)</span>
                <span>25° (Moderate Slope)</span>
                <span>60° (Sheer Cliff)</span>
              </div>
            </div>

            {/* Control 4: NDVI Vegetation */}
            <div style={{ background: '#fdfbf7', padding: '14px 16px', borderRadius: 12, border: '1px solid #ede8de' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13.5, color: '#162b1d' }}>
                  <Leaf size={16} style={{ color: '#15803d' }} /> Vegetation Cover (NDVI)
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '2px 10px', borderRadius: 8 }}>
                  {values.ndvi.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.02"
                value={values.ndvi}
                onChange={(e) => handleSlider('ndvi', e.target.value)}
                style={{ width: '100%', accentColor: '#15803d', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8c9a91', marginTop: 4 }}>
                <span>0.0 (Barren/Rock)</span>
                <span>0.5 (Moderate Canopy)</span>
                <span>1.0 (Dense Virgin Forest)</span>
              </div>
            </div>

            {/* Control 5: Historical Landslide Activity */}
            <div style={{ background: '#fdfbf7', padding: '14px 16px', borderRadius: 12, border: '1px solid #ede8de', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13.5, color: '#162b1d' }}>
                  <History size={16} style={{ color: '#d97706' }} /> Prior Landslide Activity
                </span>
                <small style={{ color: '#68776e', fontSize: 11.5 }}>Documented history of geological slope movement</small>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setValues((p) => ({ ...p, historicalLandslide: true }))}
                  style={{
                    background: values.historicalLandslide ? '#dc2626' : '#ffffff',
                    color: values.historicalLandslide ? '#ffffff' : '#4a5568',
                    border: '1px solid #d4cdc1',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setValues((p) => ({ ...p, historicalLandslide: false }))}
                  style={{
                    background: !values.historicalLandslide ? '#15803d' : '#ffffff',
                    color: !values.historicalLandslide ? '#ffffff' : '#4a5568',
                    border: '1px solid #d4cdc1',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  No
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <button
                type="button"
                onClick={runSimulation}
                disabled={loading}
                style={{
                  flex: 1,
                  background: '#744423',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 20px',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(116, 68, 35, 0.3)',
                  transition: 'background 0.2s',
                }}
                id="simulator-run-btn"
              >
                <Zap size={18} />
                {loading ? 'Running Random Forest...' : 'Simulate Risk →'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Results & Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Card 1: Comparative Gauges */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '24px 26px',
              border: '1px solid #e7e2d6',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <BarChart3 size={18} style={{ color: '#744423' }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#162b1d', margin: 0 }}>
                Comparative Risk Shift Analysis
              </h3>
            </div>

            {/* Side-by-Side Donut Comparison */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '16px 12px',
                background: '#faf7f2',
                borderRadius: 16,
                border: '1px solid #eae4d8',
              }}
            >
              {/* Baseline Gauge */}
              <div style={{ textAlign: 'center' }}>
                <CircularGauge score={currentScore} label={currentLevel} color={getColor(currentLevel)} />
                <div style={{ fontSize: 12, fontWeight: 700, color: '#162b1d', marginTop: 8 }}>Baseline Risk</div>
                <small style={{ color: '#68776e', fontSize: 11 }}>Current station telemetry</small>
              </div>

              {/* Shift Indicator in Center */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <ArrowRight size={22} style={{ color: '#9ba89f' }} />
                {simulation ? (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: scoreDiff > 0 ? '#dc2626' : scoreDiff < 0 ? '#15803d' : '#68776e',
                      background: scoreDiff > 0 ? '#fee2e2' : scoreDiff < 0 ? '#dcfce7' : '#f1f5f9',
                      padding: '4px 10px',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    {scoreDiff > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {scoreDiff > 0 ? `+${scoreDiff}%` : `${scoreDiff}%`}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: '#8c9a91', fontStyle: 'italic' }}>Ready</span>
                )}
              </div>

              {/* Simulated Gauge */}
              <div style={{ textAlign: 'center' }}>
                <CircularGauge score={simScore} label={simLevel} color={getColor(simLevel)} />
                <div style={{ fontSize: 12, fontWeight: 700, color: '#162b1d', marginTop: 8 }}>Simulated Risk</div>
                <small style={{ color: '#68776e', fontSize: 11 }}>Model prediction output</small>
              </div>
            </div>
          </div>

          {/* Card 2: Impact Explanation */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '22px 24px',
              border: '1px solid #e7e2d6',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Info size={17} style={{ color: '#2d6a4f' }} />
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#162b1d', margin: 0 }}>
                Machine Learning Sensitivity Explanation
              </h4>
            </div>

            <p style={{ fontSize: 13, color: '#2d3748', lineHeight: 1.5, margin: 0 }}>
              {simulation ? (
                scoreDiff > 0 ? (
                  <span>
                    Increasing precipitation to <b>{values.rainfall} mm</b> and slope to <b>{values.slope}°</b> shifted the estimated failure probability upward by <b>+{scoreDiff}%</b>, pushing the safety index into <b>{simLevel.toUpperCase()} RISK</b>. Soil saturation surpasses critical shear strength.
                  </span>
                ) : scoreDiff < 0 ? (
                  <span>
                    Decreasing pore-water pressure and enhancing vegetative root cover (NDVI <b>{values.ndvi}</b>) stabilized the slope equilibrium, reducing risk by <b>{scoreDiff}%</b> to <b>{simLevel.toUpperCase()} RISK</b>.
                  </span>
                ) : (
                  <span>Simulated inputs match baseline equilibrium conditions. No statistical shift observed.</span>
                )
              ) : (
                'Adjust the sliders on the left or choose a Quick Test Scenario above, then click "Simulate Risk" to benchmark the Random Forest inference against the baseline.'
              )}
            </p>
          </div>

          {/* Card 3: Actionable Safety Protocol */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '22px 24px',
              border: '1px solid #e7e2d6',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              borderLeft: `5px solid ${getColor(simLevel)}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {simLevel === 'Critical' ? (
                <AlertOctagon size={18} style={{ color: '#dc2626' }} />
              ) : (
                <CheckCircle2 size={18} style={{ color: getColor(simLevel) }} />
              )}
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#162b1d', margin: 0 }}>
                Operational Protocol &middot; {simLevel} Level
              </h4>
            </div>
            <p style={{ fontSize: 12.5, color: '#4a5568', margin: 0, lineHeight: 1.45 }}>
              {simLevel === 'Critical'
                ? 'Issue immediate red alert advisory. Restrict movement across connecting ghat passes, alert District Disaster Management, and inspect safe evacuation bypasses.'
                : simLevel === 'High'
                ? 'Heightened monitoring required. Advise vehicles against heavy transit during storm peaks and keep emergency road clearing machinery on standby.'
                : simLevel === 'Moderate'
                ? 'Standard rain surveillance. Inspect hillside drainage culverts and road cut slopes for minor rock displacements.'
                : 'Safe baseline stability. Regular scheduled telemetry monitoring.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
