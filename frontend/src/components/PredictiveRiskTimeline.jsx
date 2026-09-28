import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  CloudRain,
  TrendingUp,
  Zap,
  Radio,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Thermometer,
} from 'lucide-react';
import { fetchHourlyPrecipitationForecast, fetch7DayRiskForecast } from '../services/weather';
import { getRiskLevelFromScore } from '../data/riskLocations';

export default function PredictiveRiskTimeline({ selectedLocation, theme = 'light' }) {
  const loc = selectedLocation || {};
  const [mode, setMode] = useState('7day'); // '7day' | '24hr'
  const [dailyData, setDailyData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const baselineSlope = Number(loc.slope || 24);
  const baselineSm = Number(loc.soil_moisture || loc.soilMoisture || 65);
  const baselineHist = Number(loc.historical_landslides || loc.historicalLandslides || 1);
  const baselineElevation = Number(loc.elevation || 1000);
  const baselineNdvi = Number(loc.ndvi || 0.65);
  const baselineScore = Number(loc.riskScore ?? loc.risk_score ?? 55);

  // Fetch 7-day daily forecast
  useEffect(() => {
    if (!loc.latitude || !loc.longitude) return;

    let isMounted = true;
    setLoading(true);

    const terrain = {
      slope: baselineSlope,
      soilMoisture: baselineSm,
      historicalLandslides: baselineHist,
      elevation: baselineElevation,
      ndvi: baselineNdvi,
    };

    Promise.all([
      fetch7DayRiskForecast(loc.latitude, loc.longitude, terrain),
      fetchHourlyPrecipitationForecast(loc.latitude, loc.longitude),
    ])
      .then(([sevenDayRes, hourlyRes]) => {
        if (!isMounted) return;

        // Process 7-day data
        setDailyData(sevenDayRes || []);

        // Process 24-hr hourly data
        if (hourlyRes && hourlyRes.length > 0) {
          let runningAcc = 0;
          const processedHourly = hourlyRes.slice(0, 24).map((pt, idx) => {
            runningAcc = Number((runningAcc * 0.88 + pt.precipitation).toFixed(1));
            const terrainFactor = (baselineSlope / 45) * 28 + (baselineHist > 0 ? 12 : 2);
            const moistureFactor = (baselineSm / 100) * 20;
            const rainImpact = Math.min(45, (runningAcc / 55) * 45);

            let score = Math.round(terrainFactor + moistureFactor + rainImpact);
            if (idx === 0) score = baselineScore;
            score = Math.max(12, Math.min(96, score));
            const level = getRiskLevelFromScore(score);

            return {
              ...pt,
              dateLabel: pt.label,
              dayName: pt.label,
              score,
              risk: score,
              level,
              accumulatedRain: runningAcc,
            };
          });
          setHourlyData(processedHourly);
        }

        // Set default selected point to today
        if (sevenDayRes && sevenDayRes.length > 0) {
          setSelectedPoint(sevenDayRes[0]);
        }
      })
      .catch((err) => {
        console.warn('Forecast fetch error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    loc.id,
    loc.latitude,
    loc.longitude,
    baselineSlope,
    baselineSm,
    baselineHist,
    baselineElevation,
    baselineNdvi,
    baselineScore,
  ]);

  const activeDataset = mode === '7day' ? dailyData : hourlyData;

  // Find peak forecasted risk point in active dataset
  let peakPoint = activeDataset[0];
  activeDataset.forEach((p) => {
    if (!peakPoint || p.score > peakPoint.score) {
      peakPoint = p;
    }
  });

  const activePoint = selectedPoint || peakPoint || activeDataset[0];

  const getRiskColor = (score) => {
    if (score <= 25) return '#10b981';
    if (score <= 50) return '#f59e0b';
    if (score <= 75) return '#ea580c';
    return '#dc2626';
  };

  const isDark = theme === 'dark';

  return (
    <div
      style={{
        background: isDark ? '#0d281e' : '#ffffff',
        borderRadius: 20,
        padding: '22px 24px',
        border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        marginBottom: 22,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Top Header Row with Title, Live Badge & Mode Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(234, 88, 12, 0.12)',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={19} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: isDark ? '#ffffff' : '#0f172a',
                  margin: 0,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Multi-Day Predictive Landslide Risk Timeline
              </h3>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '2px 7px',
                  borderRadius: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Radio size={10} className="animate-pulse" />
                Live Open-Meteo Satellite Feed
              </span>
            </div>
            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', margin: '2px 0 0' }}>
              Real-time precipitation forecast combined with geotechnical slope saturation &middot;{' '}
              <b>{loc.name || loc.locationName || 'Monitoring Station'}</b> ({loc.state || 'NER'})
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs (7-Day vs 24-Hour) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'inline-flex',
              background: isDark ? '#071811' : '#f1f5f9',
              borderRadius: 12,
              padding: 3,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            }}
          >
            <button
              onClick={() => {
                setMode('7day');
                if (dailyData.length > 0) setSelectedPoint(dailyData[0]);
              }}
              style={{
                background: mode === '7day' ? '#ea580c' : 'transparent',
                color: mode === '7day' ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
                border: 'none',
                borderRadius: 9,
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Calendar size={13} />
              <span>7-Day Forecast</span>
            </button>

            <button
              onClick={() => {
                setMode('24hr');
                if (hourlyData.length > 0) setSelectedPoint(hourlyData[0]);
              }}
              style={{
                background: mode === '24hr' ? '#ea580c' : 'transparent',
                color: mode === '24hr' ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
                border: 'none',
                borderRadius: 9,
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Clock size={13} />
              <span>24-Hour Timeline</span>
            </button>
          </div>

          {peakPoint && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: peakPoint.score > 50 ? 'rgba(220, 38, 38, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: `1px solid ${peakPoint.score > 50 ? 'rgba(220, 38, 38, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                padding: '6px 12px',
                borderRadius: 10,
                fontSize: '0.78rem',
              }}
            >
              <TrendingUp size={14} style={{ color: getRiskColor(peakPoint.score) }} />
              <span style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                <b>Peak Risk:</b> {peakPoint.dayName || peakPoint.dateLabel} (
                <strong style={{ color: getRiskColor(peakPoint.score) }}>
                  {peakPoint.score}% {peakPoint.level}
                </strong>
                )
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Forecast Grid / Bar Curve */}
      <div style={{ margin: '14px 0 16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${activeDataset.length || 7}, minmax(0, 1fr))`,
            gap: 8,
            background: isDark ? '#071811' : '#f8fafc',
            padding: '16px 14px 12px',
            borderRadius: 14,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
            overflowX: 'auto',
          }}
        >
          {activeDataset.map((pt, i) => {
            const isSelected = activePoint?.dateStr === pt.dateStr || activePoint?.time === pt.time;
            const barHeight = Math.max(22, (pt.score / 100) * 85);
            const color = getRiskColor(pt.score);

            return (
              <div
                key={pt.dateStr || pt.time || i}
                onClick={() => setSelectedPoint(pt)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 4px',
                  borderRadius: 10,
                  background: isSelected ? (isDark ? 'rgba(234, 88, 12, 0.16)' : 'rgba(234, 88, 12, 0.08)') : 'transparent',
                  border: isSelected ? '1.5px solid #ea580c' : '1.5px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                title={`${pt.dayName} (${pt.dateLabel}): ${pt.score}% Risk (${pt.level}) | Rain: ${pt.precipitation}mm`}
              >
                {/* Day name */}
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? '#ea580c' : isDark ? '#94a3b8' : '#64748b',
                    marginBottom: 2,
                  }}
                >
                  {pt.dayName}
                </span>

                {/* Date / Time label */}
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: isDark ? '#64748b' : '#94a3b8',
                    marginBottom: 8,
                  }}
                >
                  {mode === '7day' ? pt.dateLabel : pt.label}
                </span>

                {/* Visual Bar Container */}
                <div
                  style={{
                    height: 90,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: isSelected ? 22 : 16,
                      height: barHeight,
                      background: color,
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'all 0.25s ease',
                      opacity: isSelected ? 1 : 0.8,
                      boxShadow: isSelected ? `0 4px 12px ${color}55` : 'none',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: -18,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color,
                      }}
                    >
                      {pt.score}%
                    </span>
                  </div>
                </div>

                {/* Rainfall expectation pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: pt.precipitation > 20 ? '#ef4444' : pt.precipitation > 5 ? '#f59e0b' : isDark ? '#94a3b8' : '#64748b',
                    background: isDark ? '#0d281e' : '#ffffff',
                    padding: '2px 6px',
                    borderRadius: 6,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
                  }}
                >
                  <CloudRain size={10} color={pt.precipitation > 15 ? '#ef4444' : '#38bdf8'} />
                  <span>{pt.precipitation}mm</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spotlight / Detailed Inspection for Selected Day/Hour */}
      {activePoint && (
        <div
          style={{
            background: isDark ? '#071811' : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
            borderRadius: 14,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.84rem',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${getRiskColor(activePoint.score)}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={20} color={getRiskColor(activePoint.score)} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.94rem' }}>
                  📍 {activePoint.dayName} ({activePoint.dateLabel || activePoint.dateStr}):
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    background: getRiskColor(activePoint.score),
                    padding: '3px 9px',
                    borderRadius: 6,
                  }}
                >
                  {activePoint.score}% &middot; {activePoint.level} Risk
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 2 }}>
                Condition: <b>{activePoint.condition || 'Precipitation'}</b> &middot;{' '}
                {activePoint.score > 50
                  ? '⚠️ High slope instability anticipated due to accumulated moisture pore-pressure.'
                  : '🟢 Stable conditions expected within safe geotechnical limits.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, color: isDark ? '#cbd5e1' : '#475569', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CloudRain size={16} color="#38bdf8" />
              <span>
                Rain: <b>{activePoint.precipitation} mm</b>
              </span>
            </div>

            {activePoint.accumulatedRain !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Droplets size={16} color="#34d399" />
                <span>
                  Antecedent Moisture: <b>{activePoint.accumulatedRain} mm</b>
                </span>
              </div>
            )}

            {activePoint.maxTemp !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Thermometer size={16} color="#f59e0b" />
                <span>
                  Temp: <b>{activePoint.maxTemp}°C</b> {activePoint.minTemp ? `(${activePoint.minTemp}° min)` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
