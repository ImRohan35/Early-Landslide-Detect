import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Calendar,
  Clock,
  CloudRain,
  TrendingUp,
  Radio,
  CheckCircle2,
  Droplets,
  Thermometer,
  ShieldCheck,
  Sun,
  Cloud,
  Car,
  BarChart3,
  Info,
} from 'lucide-react';
import { fetchHourlyPrecipitationForecast, fetch7DayRiskForecast } from '../services/weather';
import { getRiskLevelFromScore } from '../data/riskLocations';

export default function PredictiveRiskTimeline({ selectedLocation, theme = 'light' }) {
  const loc = selectedLocation || {};
  // View mode: 'cards' (Easy Day Cards), '24hr' (Hourly), 'graph' (Risk Bars)
  const [mode, setMode] = useState('cards');
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

  // Fetch 7-day daily forecast & 24hr hourly forecast
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

  const activeDataset = mode === '24hr' ? hourlyData : dailyData;

  // Find peak forecasted risk point
  let peakPoint = activeDataset[0];
  activeDataset.forEach((p) => {
    if (!peakPoint || p.score > peakPoint.score) {
      peakPoint = p;
    }
  });

  const activePoint = selectedPoint || peakPoint || activeDataset[0];

  const getRiskColor = (score) => {
    if (score <= 30) return '#10b981'; // Green (Safe)
    if (score <= 50) return '#f59e0b'; // Yellow (Moderate)
    if (score <= 75) return '#ea580c'; // Orange (High)
    return '#dc2626'; // Red (Danger)
  };

  const getSimpleRiskLabel = (score) => {
    if (score <= 30) return { title: 'SAFE', text: 'Low Risk', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (score <= 50) return { title: 'NORMAL', text: 'Moderate', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    if (score <= 75) return { title: 'CAUTION', text: 'Elevated Risk', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.15)' };
    return { title: 'HIGH RISK', text: 'Critical Risk', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)' };
  };

  const getRainDescription = (rain) => {
    if (rain === 0) return { text: 'No Rain (Dry)', icon: Sun };
    if (rain < 2.5) return { text: 'Light Drizzle', icon: CloudRain };
    if (rain < 15) return { text: 'Moderate Rain', icon: CloudRain };
    return { text: 'Heavy Rain', icon: CloudRain };
  };

  const getHumanAdvice = (score, rain) => {
    if (score <= 30) {
      return {
        verdict: '🟢 Safe for Travel & Work',
        details: 'Weather and mountain terrain are stable. Roads are clear with no significant landslide hazard expected.',
      };
    }
    if (score <= 50) {
      return {
        verdict: '🟡 Moderate Conditions',
        details: 'Light precipitation may cause minor slippery surfaces. Maintain normal driving caution along hill corridors.',
      };
    }
    if (score <= 75) {
      return {
        verdict: '🟠 Caution: Hill Slopes Vulnerable',
        details: 'Elevated precipitation increases ground saturation. Exercise caution along steep highway cuts and bends.',
      };
    }
    return {
      verdict: '🔴 Danger: Avoid Hill Travel',
      details: 'High slope instability hazard detected. Avoid unnecessary hill transit and monitor official disaster management advisories.',
    };
  };

  // Weekly Stats Summary
  const safeDaysCount = dailyData.filter((d) => d.score <= 35).length;
  const maxRainDay = dailyData.reduce((prev, curr) => (curr.precipitation > (prev?.precipitation || 0) ? curr : prev), dailyData[0]);

  const isDark = theme === 'dark';

  return (
    <div
      style={{
        background: isDark ? '#0d281e' : '#ffffff',
        borderRadius: 20,
        padding: '24px 26px',
        border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        marginBottom: 24,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Header: Title, Location & Mode Switcher */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: isDark ? '#ffffff' : '#0f172a',
                  margin: 0,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                7-Day Landslide & Weather Forecast
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '2px 8px',
                  borderRadius: 9999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Radio size={10} className="animate-pulse" />
                Live Satellite Feed
              </span>
            </div>
            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.82rem', margin: '3px 0 0' }}>
              7-Day precipitation & landslide vulnerability forecast &middot;{' '}
              <b>{loc.name || loc.locationName || 'Monitoring Station'}</b> ({loc.state || 'Meghalaya'})
            </p>
          </div>
        </div>

        {/* View Toggle Tabs */}
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
            type="button"
            onClick={() => {
              setMode('cards');
              if (dailyData.length > 0) setSelectedPoint(dailyData[0]);
            }}
            style={{
              background: mode === 'cards' ? '#10b981' : 'transparent',
              color: mode === 'cards' ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
              border: 'none',
              borderRadius: 9,
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Calendar size={14} />
            <span>7-Day Easy Cards</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('graph');
              if (dailyData.length > 0) setSelectedPoint(dailyData[0]);
            }}
            style={{
              background: mode === 'graph' ? '#10b981' : 'transparent',
              color: mode === 'graph' ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
              border: 'none',
              borderRadius: 9,
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <BarChart3 size={14} />
            <span>Risk Bars</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('24hr');
              if (hourlyData.length > 0) setSelectedPoint(hourlyData[0]);
            }}
            style={{
              background: mode === '24hr' ? '#10b981' : 'transparent',
              color: mode === '24hr' ? '#ffffff' : isDark ? '#94a3b8' : '#64748b',
              border: 'none',
              borderRadius: 9,
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Clock size={14} />
            <span>24-Hour</span>
          </button>
        </div>
      </div>

      {/* 1. WEEKLY EASY SUMMARY BANNER (Aam Bhasha me Summary) */}
      <div
        style={{
          background: isDark ? '#082318' : '#f0fdf4',
          border: '1px solid rgba(52, 211, 153, 0.35)',
          borderRadius: 14,
          padding: '12px 18px',
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={22} color="#10b981" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isDark ? '#ffffff' : '#065f46' }}>
              Weekly Safety Overview:
            </div>
            <div style={{ fontSize: '0.82rem', color: isDark ? '#a7f3d0' : '#047857', marginTop: 2 }}>
              {safeDaysCount >= 5
                ? `${safeDaysCount} out of the next 7 days show low landslide vulnerability.`
                : 'Caution advised on vulnerable hill slopes over the next several days due to anticipated precipitation.'}
              {maxRainDay && maxRainDay.precipitation > 0
                ? ` Peak rainfall expected on ${maxRainDay.dayName} (${maxRainDay.precipitation} mm).`
                : ' Weather is projected to remain predominantly dry and stable.'}
            </div>
          </div>
        </div>

        {peakPoint && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? '#051810' : '#ffffff',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              padding: '6px 12px',
              borderRadius: 10,
              fontSize: '0.78rem',
            }}
          >
            <TrendingUp size={14} color={getRiskColor(peakPoint.score)} />
            <span>
              Highest Risk Day: <b>{peakPoint.dayName}</b> (
              <strong style={{ color: getRiskColor(peakPoint.score) }}>{peakPoint.score}%</strong>)
            </span>
          </div>
        )}
      </div>

      {/* 2. MODE: 'cards' -> CLEAN, EASY TO UNDERSTAND 7-DAY CARDS */}
      {mode === 'cards' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 10,
            marginBottom: 18,
          }}
        >
          {dailyData.map((pt, i) => {
            const isSelected = activePoint?.dateStr === pt.dateStr;
            const riskInfo = getSimpleRiskLabel(pt.score);
            const rainInfo = getRainDescription(pt.precipitation);
            const isToday = i === 0;

            return (
              <div
                key={pt.dateStr || i}
                onClick={() => setSelectedPoint(pt)}
                style={{
                  background: isSelected
                    ? isDark
                      ? '#103726'
                      : '#e6f7ef'
                    : isDark
                    ? '#071811'
                    : '#f8fafc',
                  border: isSelected
                    ? '2px solid #10b981'
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                  borderRadius: 16,
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  boxShadow: isSelected ? '0 6px 18px rgba(16, 185, 129, 0.2)' : 'none',
                  position: 'relative',
                }}
              >
                {/* Today Badge */}
                {isToday && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      background: '#10b981',
                      color: '#ffffff',
                      padding: '1px 5px',
                      borderRadius: 6,
                      letterSpacing: '0.04em',
                    }}
                  >
                    TODAY
                  </span>
                )}

                {/* Day Name & Date */}
                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    color: isDark ? '#ffffff' : '#0f172a',
                    marginTop: isToday ? 8 : 0,
                  }}
                >
                  {pt.dayName}
                </span>
                <span style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: 10 }}>
                  {pt.dateLabel}
                </span>

                {/* Simple Risk Badge */}
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: riskInfo.color,
                    background: riskInfo.bg,
                    border: `1px solid ${riskInfo.color}40`,
                    padding: '3px 8px',
                    borderRadius: 8,
                    marginBottom: 10,
                    width: '90%',
                  }}
                >
                  {riskInfo.title}
                </div>

                {/* Rain with Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <CloudRain size={14} color={pt.precipitation > 5 ? '#f59e0b' : '#38bdf8'} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
                    {pt.precipitation} mm
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: 8 }}>
                  {rainInfo.text}
                </span>

                {/* Temperature High / Low */}
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: isDark ? '#cbd5e1' : '#475569',
                    fontWeight: 600,
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
                    paddingTop: 6,
                    width: '100%',
                  }}
                >
                  {pt.maxTemp}° <span style={{ color: '#94a3b8', fontWeight: 400 }}>/ {pt.minTemp}°</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. MODE: 'graph' -> VISUAL RISK BARS */}
      {mode === 'graph' && (
        <div style={{ margin: '14px 0 18px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${dailyData.length || 7}, minmax(0, 1fr))`,
              gap: 8,
              background: isDark ? '#071811' : '#f8fafc',
              padding: '16px 14px 12px',
              borderRadius: 14,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
              overflowX: 'auto',
            }}
          >
            {dailyData.map((pt, i) => {
              const isSelected = activePoint?.dateStr === pt.dateStr;
              const barHeight = Math.max(22, (pt.score / 100) * 85);
              const color = getRiskColor(pt.score);

              return (
                <div
                  key={pt.dateStr || i}
                  onClick={() => setSelectedPoint(pt)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px 4px',
                    borderRadius: 10,
                    background: isSelected ? (isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.08)') : 'transparent',
                    border: isSelected ? '1.5px solid #10b981' : '1.5px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#10b981' : isDark ? '#ffffff' : '#0f172a' }}>
                    {pt.dayName}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: isDark ? '#64748b' : '#94a3b8', marginBottom: 8 }}>
                    {pt.dateLabel}
                  </span>

                  <div style={{ height: 90, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 8 }}>
                    <div
                      style={{
                        width: isSelected ? 22 : 16,
                        height: barHeight,
                        background: color,
                        borderRadius: '6px 6px 2px 2px',
                        transition: 'all 0.25s ease',
                        opacity: isSelected ? 1 : 0.85,
                        position: 'relative',
                      }}
                    >
                      <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: '0.68rem', fontWeight: 800, color }}>
                        {pt.score}%
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8' }}>
                    {pt.precipitation}mm
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MODE: '24hr' -> HOURLY VIEW */}
      {mode === '24hr' && (
        <div style={{ margin: '14px 0 18px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${hourlyData.length || 24}, minmax(68px, 1fr))`,
              gap: 8,
              background: isDark ? '#071811' : '#f8fafc',
              padding: '16px 14px 12px',
              borderRadius: 14,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
              overflowX: 'auto',
            }}
          >
            {hourlyData.map((pt, i) => {
              const isSelected = activePoint?.time === pt.time;
              const color = getRiskColor(pt.score);

              return (
                <div
                  key={pt.time || i}
                  onClick={() => setSelectedPoint(pt)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px 4px',
                    borderRadius: 10,
                    background: isSelected ? (isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.08)') : 'transparent',
                    border: isSelected ? '1.5px solid #10b981' : '1.5px solid transparent',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
                    {pt.label}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color, margin: '6px 0' }}>
                    {pt.score}%
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>
                    {pt.precipitation}mm
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SELECTED DAY IN-DEPTH EXPLANATION (Human-Friendly Advice Box) */}
      {activePoint && (
        <div
          style={{
            background: isDark ? '#071811' : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(52, 211, 153, 0.25)' : '#e2e8f0'}`,
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.86rem',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* Left info: Day, Safety verdict & plain explanation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${getRiskColor(activePoint.score)}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Car size={22} color={getRiskColor(activePoint.score)} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', fontSize: '0.98rem' }}>
                  📍 {activePoint.dayName} ({activePoint.dateLabel || activePoint.dateStr}):
                </span>
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    background: getRiskColor(activePoint.score),
                    padding: '3px 10px',
                    borderRadius: 6,
                  }}
                >
                  {getSimpleRiskLabel(activePoint.score).title} ({activePoint.score}%)
                </span>
              </div>

              {/* Friendly Everyday Advice */}
              <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#334155', marginTop: 4, lineHeight: 1.4 }}>
                {getHumanAdvice(activePoint.score, activePoint.precipitation).details}
              </div>
            </div>
          </div>

          {/* Right info metrics: Rain, Temp, Condition */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              color: isDark ? '#cbd5e1' : '#475569',
              fontSize: '0.82rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CloudRain size={16} color="#38bdf8" />
              <span>
                Precipitation: <b>{activePoint.precipitation} mm</b>
              </span>
            </div>

            {activePoint.maxTemp !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Thermometer size={16} color="#f59e0b" />
                <span>
                  Temperature: <b>{activePoint.maxTemp}°C</b> {activePoint.minTemp ? `(${activePoint.minTemp}°)` : ''}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={16} color="#10b981" />
              <span>
                Weather: <b>{activePoint.condition || 'Clear Sky'}</b>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
