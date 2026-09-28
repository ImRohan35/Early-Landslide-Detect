import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  RefreshCw,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  BarChart3,
  FileText,
  SlidersHorizontal,
  Download,
  Activity,
  Layers,
  CloudRain,
  Droplets,
  Mountain,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts';
import { riskLocations, riskColors } from '../data/riskLocations';
import { fetchLiveWeather, formatISTDate, formatISTTime } from '../services/weather';
import MapView from './Map';
import PredictiveRiskTimeline from './PredictiveRiskTimeline';

// 7-Day Trend data matching Image 2
const TREND_DATA = [
  { date: '11 Sep', rain: 20, soil: 40, risk: 45 },
  { date: '12 Sep', rain: 35, soil: 55, risk: 52 },
  { date: '13 Sep', rain: 28, soil: 52, risk: 58 },
  { date: '14 Sep', rain: 45, soil: 62, risk: 61 },
  { date: '15 Sep', rain: 40, soil: 60, risk: 59 },
  { date: '16 Sep', rain: 60, soil: 70, risk: 66 },
  { date: '17 Sep', rain: 68, soil: 78, risk: 68 },
];

// Donut data matching Image 2 (Total = 68)
const PIE_DATA = [
  { name: 'Low', value: 35, pct: '51%', color: '#10b981' },
  { name: 'Moderate', value: 18, pct: '26%', color: '#eab308' },
  { name: 'High', value: 10, pct: '15%', color: '#f97316' },
  { name: 'Critical', value: 5, pct: '8%', color: '#ef4444' },
];

export default function InteractiveMapPage({
  selectedLocation,
  onLocationSelect,
  onNavigate,
  theme = 'light',
  mapLayer = 'satellite',
  selectedState = 'All States',
  onStateSelect,
}) {
  const [currentLoc, setCurrentLoc] = useState(() => {
    return (
      selectedLocation ||
      riskLocations.find((l) => l.id === 'shillong') ||
      riskLocations[0]
    );
  });

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => formatISTTime());
  const [currentTimestamp, setCurrentTimestamp] = useState(() => `${formatISTDate()}, ${formatISTTime()}`);
  const [geoLoading, setGeoLoading] = useState(false);

  // Sync prop changes for selectedLocation
  useEffect(() => {
    if (selectedLocation) {
      setCurrentLoc(selectedLocation);
    }
  }, [selectedLocation]);

  // Sync prop changes for selectedState: focus first station in that state
  useEffect(() => {
    if (selectedState && selectedState !== 'All States') {
      const match = riskLocations.find(
        (l) => l.state.toLowerCase() === selectedState.toLowerCase()
      );
      if (match) {
        setCurrentLoc(match);
        if (onLocationSelect) onLocationSelect(match);
      }
    }
  }, [selectedState, onLocationSelect]);

  // Load live weather via Open-Meteo
  const loadLiveWeather = useCallback(async (loc) => {
    if (!loc) return;
    setWeatherLoading(true);
    try {
      const data = await fetchLiveWeather(loc.latitude, loc.longitude, loc.locationName);
      setWeatherData(data);
      const timeStr = formatISTTime();
      setLastUpdated(timeStr);
      setCurrentTimestamp(`${formatISTDate()}, ${timeStr}`);
    } catch {
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveWeather(currentLoc);
  }, [currentLoc, loadLiveWeather]);

  const handleSelectLocation = (loc) => {
    setCurrentLoc(loc);
    if (onLocationSelect) onLocationSelect(loc);
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const { latitude, longitude } = pos.coords;
        let closest = riskLocations[0];
        let minDist = Infinity;
        riskLocations.forEach((l) => {
          const d = Math.hypot(l.latitude - latitude, l.longitude - longitude);
          if (d < minDist) {
            minDist = d;
            closest = l;
          }
        });
        handleSelectLocation(closest);
      },
      () => {
        setGeoLoading(false);
        alert('Could not retrieve GPS coordinates.');
      }
    );
  };

  // CSV download function for Quick Actions
  const handleDownloadData = () => {
    const headers = 'ID,Location,State,District,Latitude,Longitude,Elevation,Slope,Rainfall,SoilMoisture,RiskScore,RiskLevel\n';
    const rows = riskLocations
      .map(
        (l) =>
          `"${l.id}","${l.locationName}","${l.state}","${l.district || ''}",${l.latitude},${l.longitude},${l.elevation || 1000},${l.slope || 25},${l.rainfall || 15},${l.soilMoisture || 60},${l.riskScore},"${l.riskLevel}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NER_Landslide_Data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayRain = weatherData?.precipitation !== undefined ? `${weatherData.precipitation} mm` : `${currentLoc.rainfall || 15} mm`;
  const displaySoil = weatherData?.soil_moisture !== undefined ? `${Math.round(weatherData.soil_moisture)}%` : `${currentLoc.soilMoisture || 82}%`;
  const displaySlope = `${currentLoc.slope || 28}°`;
  const displayElevation = `${(currentLoc.elevation || 1486).toLocaleString()} m`;
  const displayTemp = weatherData?.temperature !== undefined ? `${Math.round(weatherData.temperature)}°C` : `${currentLoc.temperature || 22}°C`;
  const displayWeather = weatherData?.weather_desc || currentLoc.weatherCondition || 'Light Rain';

  return (
    <div
      style={{
        background: theme === 'dark' ? '#071610' : '#f8faf9',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        padding: '24px 28px 48px',
        minHeight: 'calc(100vh - 64px)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        {/* Top Header Row with Title & Quick Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: theme === 'dark' ? '#ffffff' : '#0d2818',
                margin: '0 0 4px',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Interactive <span style={{ color: '#e05626' }}>Risk Map</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
              Explore landslide risk across the North Eastern Region using real-time and historical data.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Use Current Location Button */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: theme === 'dark' ? '#143828' : '#ffffff',
                border: '1px solid #fed7aa',
                borderRadius: 12,
                padding: '9px 16px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#ea580c',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
              }}
            >
              <MapPin size={15} color="#ea580c" />
              <span>{geoLoading ? 'Locating...' : 'Use Current Location'}</span>
            </button>

            {/* Last Updated Timestamp Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: theme === 'dark' ? '#143828' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
                borderRadius: 12,
                padding: '9px 16px',
                fontSize: '0.82rem',
                color: '#64748b',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <Clock size={15} color="#94a3b8" />
              <span>Last Updated <b>{currentTimestamp}</b></span>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Map (65%) + Right Live Data & Recent Alerts (35%) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.75fr) minmax(360px, 420px)',
            gap: 20,
            marginBottom: 24,
          }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          {/* Map Container */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              height: 520,
              minHeight: 520,
              position: 'relative',
            }}
          >
            <MapView
              selectedLocation={currentLoc}
              onLocationSelect={handleSelectLocation}
              theme={theme}
              mapType={mapLayer}
              selectedState={selectedState}
              onInspectDetails={() => onNavigate && onNavigate('Analysis')}
            />
          </div>

          {/* Right Column: Live Data (Top) + Recent Alerts (Bottom) */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 20,
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 520,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            {/* Top Live Data Section */}
            <div>
              {/* Header with Refresh */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  borderLeft: '3.5px solid #f97316',
                  paddingLeft: 10,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1rem', color: theme === 'dark' ? '#ffffff' : '#0f172a' }}>
                  Live Data
                </div>
                <button
                  onClick={() => loadLiveWeather(currentLoc)}
                  disabled={weatherLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'transparent',
                    border: 'none',
                    color: '#ea580c',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={14} className={weatherLoading ? 'loading-spinner' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Location Name & Scenic Photo Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={16} color="#f97316" />
                    <span>{currentLoc.locationName}, {currentLoc.state}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2, paddingLeft: 21 }}>
                    {currentTimestamp}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, paddingLeft: 6 }}>
                    <CloudRain size={26} color="#38bdf8" />
                    <div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{displayTemp}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{displayWeather}</div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    width: 100,
                    height: 72,
                    borderRadius: 12,
                    backgroundImage: `url('/meghalaya-hills.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid rgba(0,0,0,0.08)',
                    flexShrink: 0,
                  }}
                />
              </div>

              {/* 4 Mini Stat Boxes (2x2 Grid) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <div style={{ background: theme === 'dark' ? '#091e16' : '#f8fafc', padding: '8px 10px', borderRadius: 10, textAlign: 'center' }}>
                  <Droplets size={14} color="#38bdf8" style={{ margin: '0 auto 2px' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{displayRain}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Rainfall (24h)</div>
                </div>

                <div style={{ background: theme === 'dark' ? '#091e16' : '#f8fafc', padding: '8px 10px', borderRadius: 10, textAlign: 'center' }}>
                  <Activity size={14} color="#10b981" style={{ margin: '0 auto 2px' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{displaySoil}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Soil Moisture</div>
                </div>

                <div style={{ background: theme === 'dark' ? '#091e16' : '#f8fafc', padding: '8px 10px', borderRadius: 10, textAlign: 'center' }}>
                  <AlertTriangle size={14} color="#f59e0b" style={{ margin: '0 auto 2px' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{displaySlope}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Slope (avg)</div>
                </div>

                <div style={{ background: theme === 'dark' ? '#091e16' : '#f8fafc', padding: '8px 10px', borderRadius: 10, textAlign: 'center' }}>
                  <Mountain size={14} color="#3b82f6" style={{ margin: '0 auto 2px' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{displayElevation}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Elevation</div>
                </div>
              </div>
            </div>

            {/* Bottom Recent Alerts Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  borderLeft: '3.5px solid #f97316',
                  paddingLeft: 10,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.94rem' }}>Recent Alerts</div>
                <button
                  onClick={() => onNavigate && onNavigate('Alerts')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ea580c',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View All →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  {
                    icon: AlertTriangle,
                    color: '#ef4444',
                    bg: 'rgba(239, 68, 68, 0.1)',
                    title: 'High risk in Meghalaya',
                    desc: 'Heavy rainfall expected in next 24 hours.',
                    time: '2 hours ago',
                  },
                  {
                    icon: Flame,
                    color: '#f59e0b',
                    bg: 'rgba(245, 158, 11, 0.1)',
                    title: 'Moderate risk in Assam',
                    desc: 'Increased soil moisture detected.',
                    time: '5 hours ago',
                  },
                  {
                    icon: AlertTriangle,
                    color: '#dc2626',
                    bg: 'rgba(220, 38, 38, 0.12)',
                    title: 'Critical risk in Arunachal Pradesh',
                    desc: 'High slope and rainfall combination.',
                    time: '8 hours ago',
                  },
                  {
                    icon: CheckCircle2,
                    color: '#10b981',
                    bg: 'rgba(16, 185, 129, 0.1)',
                    title: 'Low risk in Mizoram',
                    desc: 'No immediate risk detected.',
                    time: '12 hours ago',
                  },
                ].map((alert, i) => (
                  <div
                    key={i}
                    onClick={() => onNavigate && onNavigate('Alerts')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: theme === 'dark' ? '#091e16' : '#f8fafc',
                      cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: alert.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <alert.icon size={15} color={alert.color} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{alert.title}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{alert.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {alert.time} &gt;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Multi-Day Predictive Landslide Risk Timeline */}
        <PredictiveRiskTimeline selectedLocation={currentLoc} theme={theme} />

        {/* Bottom Section: 4 Cards Grid Matching Image 2 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1fr) minmax(280px, 1.4fr) minmax(220px, 1.1fr) minmax(180px, 0.9fr)',
            gap: 18,
          }}
          className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Card 1: Risk Statistics (NER) */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 14px' }}>
              Risk Statistics (NER)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', marginBottom: 2 }}>
                  <AlertTriangle size={15} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>12</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Active Alerts</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', marginBottom: 2 }}>
                  <MapPin size={15} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>4</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>High Risk Areas</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3b82f6', marginBottom: 2 }}>
                  <Layers size={15} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>86</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Locations Monitored</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', marginBottom: 2 }}>
                  <CheckCircle2 size={15} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>98.5%</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>System Uptime</div>
              </div>
            </div>
          </div>

          {/* Card 2: Environmental Data Trend (Last 7 Days) */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0 }}>
                Environmental Data Trend <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>(Last 7 Days)</span>
              </h3>
            </div>

            {/* Custom Legend matching Image 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, fontSize: '0.68rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, background: '#38bdf8', borderRadius: 2 }} />
                <span>Rainfall (mm)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 2, background: '#f59e0b' }} />
                <span>Soil Moisture (%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 2, background: '#ef4444' }} />
                <span>Risk Score</span>
              </div>
            </div>

            <div style={{ width: '100%', height: 115 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={TREND_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="rain" fill="#38bdf8" radius={[3, 3, 0, 0]} barSize={12} />
                  <Line type="monotone" dataKey="soil" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} dot={{ r: 2.5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Risk Distribution Donut Chart */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 10px' }}>
              Risk Distribution
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative', width: 95, height: 95, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      dataKey="value"
                      innerRadius={28}
                      outerRadius={44}
                      paddingAngle={3}
                    >
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '1rem', fontWeight: 900, lineHeight: 1 }}>68</span>
                  <span style={{ fontSize: '0.55rem', color: '#94a3b8' }}>Total Locations</span>
                </div>
              </div>

              {/* Legend List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                {PIE_DATA.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                      <span style={{ color: '#64748b' }}>{p.name}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{p.value} ({p.pct})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: Quick Actions */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 10px' }}>
              Quick Actions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => onNavigate && onNavigate('Analysis')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#0d2818',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <BarChart3 size={13} color="#34d399" />
                <span>Analyze Risk</span>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('Reports')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                  color: theme === 'dark' ? '#ffffff' : '#334155',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <FileText size={13} color="#3b82f6" />
                <span>Generate Report</span>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('What-If Simulator')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                  color: theme === 'dark' ? '#ffffff' : '#334155',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <SlidersHorizontal size={13} color="#f97316" />
                <span>What-If Simulation</span>
              </button>

              <button
                onClick={handleDownloadData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f8fafc',
                  color: theme === 'dark' ? '#ffffff' : '#334155',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Download size={13} color="#10b981" />
                <span>Download Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
