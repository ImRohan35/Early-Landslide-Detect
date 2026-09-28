import React, { useState } from 'react';
import {
  Calendar,
  CloudRain,
  Droplets,
  Mountain,
  AlertTriangle,
  Download,
  Filter,
  Eye,
  Database,
  Radio,
  FileText,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { historicalLandslides } from '../data/historicalLandslides';

// 5-Year Historical Trends data matching Image 6
const TREND_5YR = [
  { year: '2021', rain: 300, soil: 25, events: 28 },
  { year: '2022', rain: 380, soil: 42, events: 65 },
  { year: '2023', rain: 420, soil: 35, events: 45 },
  { year: '2024', rain: 440, soil: 48, events: 68 },
  { year: '2025', rain: 390, soil: 55, events: 58 },
];

// Event Distribution Donut Data matching Image 6 (Total = 156)
const EVENT_DIST = [
  { name: 'Low', count: 42, pct: '27%', color: '#10b981' },
  { name: 'Moderate', count: 58, pct: '37%', color: '#eab308' },
  { name: 'High', count: 38, pct: '24%', color: '#f97316' },
  { name: 'Critical', count: 18, pct: '12%', color: '#ef4444' },
];

const HISTORICAL_TABLE = [
  { date: '15 Aug 2026', loc: 'Mawlynnong', state: 'Meghalaya', sev: 'High', rain: 220, cause: 'Heavy Rainfall' },
  { date: '02 Jul 2026', loc: 'Cherrapunji', state: 'Meghalaya', sev: 'Critical', rain: 380, cause: 'Rainfall + Slope' },
  { date: '18 Jun 2026', loc: 'Shillong', state: 'Meghalaya', sev: 'Moderate', rain: 150, cause: 'Soil Moisture' },
  { date: '28 May 2026', loc: 'Sohra', state: 'Meghalaya', sev: 'High', rain: 310, cause: 'Continuous Rain' },
  { date: '12 Apr 2026', loc: 'Tura', state: 'Meghalaya', sev: 'Low', rain: 85, cause: 'Local Instability' },
];

export default function HistoricalAnalysisView({
  theme = 'light',
  onNavigate,
}) {
  const [selectedState, setSelectedState] = useState('Meghalaya');
  const [selectedDistrict, setSelectedDistrict] = useState('East Khasi Hills');
  const [selectedLocation, setSelectedLocation] = useState('Shillong');
  const [dateRange, setDateRange] = useState('Jan 2020 - Sep 2026');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleDownloadCSV = () => {
    const headers = 'Date,Location,State,Severity,Rainfall_mm,Cause\n';
    const rows = HISTORICAL_TABLE.map(
      (r) => `"${r.date}","${r.loc}","${r.state}","${r.sev}",${r.rain},"${r.cause}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NER_Historical_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        {/* Header with Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
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
              Historical Data & <span style={{ color: '#8b5cf6' }}>Analysis</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b' }}>
              Explore past landslide events, weather trends and environmental data to understand risk patterns.
            </p>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('Home')}>Home</span> &gt; <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Historical Data</span>
          </div>
        </div>

        {/* Filters Row Matching Image 6 */}
        <div
          style={{
            background: theme === 'dark' ? '#0d281e' : '#ffffff',
            borderRadius: 16,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 20,
            border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            flexWrap: 'wrap',
          }}
        >
          {/* State */}
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: theme === 'dark' ? '#143828' : '#f8fafc',
                color: theme === 'dark' ? '#ffffff' : '#0f172a',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            >
              {['Meghalaya', 'Assam', 'Arunachal Pradesh', 'Manipur', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: theme === 'dark' ? '#143828' : '#f8fafc',
                color: theme === 'dark' ? '#ffffff' : '#0f172a',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            >
              {['East Khasi Hills', 'West Khasi Hills', 'Dima Hasao', 'Kamrup', 'West Kameng', 'Aizawl'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: theme === 'dark' ? '#143828' : '#f8fafc',
                color: theme === 'dark' ? '#ffffff' : '#0f172a',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            >
              {['Shillong', 'Cherrapunji', 'Mawlynnong', 'Sohra', 'Tura', 'Guwahati'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div style={{ flex: 1.2, minWidth: 180 }}>
            <label style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>Date Range</label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: theme === 'dark' ? '#143828' : '#f8fafc',
                fontSize: '0.84rem',
              }}
            >
              <Calendar size={14} color="#8b5cf6" />
              <span>{dateRange}</span>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={() => alert(`Filters applied for ${selectedLocation}, ${selectedDistrict}`)}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#ffffff',
                padding: '9px 20px',
                borderRadius: 10,
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
              }}
            >
              <Filter size={14} />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 20,
          }}
          className="grid-cols-2 md:grid-cols-4"
        >
          {/* KPI 1 */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 16,
              padding: '16px 18px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(239, 68, 68, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={22} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, lineHeight: 1.1 }}>156</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Total Landslide Events</div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: 2 }}>
                ↑ 12% <span style={{ color: '#94a3b8', fontWeight: 400 }}>(vs previous period)</span>
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 16,
              padding: '16px 18px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(59, 130, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CloudRain size={22} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, lineHeight: 1.1 }}>2,436 mm</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Average Annual Rainfall</div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: 2 }}>
                ↑ 8%
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 16,
              padding: '16px 18px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Droplets size={22} color="#10b981" />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, lineHeight: 1.1 }}>78%</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Avg. Soil Moisture</div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: 2 }}>
                ↑ 6%
              </div>
            </div>
          </div>

          {/* KPI 4 */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 16,
              padding: '16px 18px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mountain size={22} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, lineHeight: 1.1 }}>32°</div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Average Slope</div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: 2 }}>
                ↑ 4%
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Historical Map (Left) + 5-Year Trends Chart (Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            marginBottom: 20,
          }}
          className="grid-cols-1 lg:grid-cols-2"
        >
          {/* Historical Events Map */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ color: '#8b5cf6', fontSize: '1.1rem' }}>⚛</span>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: 0 }}>
                Landslide Events Map <span style={{ fontWeight: 400, color: '#64748b' }}>(Historical)</span>
              </h3>
            </div>

            {/* Satellite Map Mockup with Pins matching Image 6 */}
            <div
              style={{
                height: 260,
                borderRadius: 14,
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: `url('/meghalaya-hills.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              {/* Overlay with labels & pins */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(5, 20, 13, 0.45)' }} />

              {/* State labels */}
              <div style={{ position: 'absolute', top: 20, left: 90, color: '#ffffff', fontSize: 11, fontWeight: 700 }}>Sikkim</div>
              <div style={{ position: 'absolute', top: 15, right: 120, color: '#ffffff', fontSize: 11, fontWeight: 700 }}>Arunachal Pradesh</div>
              <div style={{ position: 'absolute', top: 90, left: 160, color: '#ffffff', fontSize: 11, fontWeight: 700 }}>Assam</div>
              <div style={{ position: 'absolute', top: 130, right: 110, color: '#ffffff', fontSize: 11, fontWeight: 700 }}>Nagaland</div>
              <div style={{ position: 'absolute', bottom: 60, left: 120, color: '#ffffff', fontSize: 11, fontWeight: 700 }}>Meghalaya</div>
              <div style={{ position: 'absolute', bottom: 50, right: 140, color: '#ffffff', fontSize: 11, fontWeight: 700 }}>Manipur</div>
              <div style={{ position: 'absolute', bottom: 20, right: 160, color: '#ffffff', fontSize: 11, fontWeight: 700 }}>Mizoram</div>

              {/* Floating Severity Legend on Map */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  right: 12,
                  background: 'rgba(7, 24, 17, 0.88)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: 10,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Event Severity</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                    <span>Low</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#eab308' }} />
                    <span>Moderate</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f97316' }} />
                    <span>High</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />
                    <span>Critical</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Trends (Shillong, Meghalaya) */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#8b5cf6', fontSize: '1.1rem' }}>📈</span>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: 0 }}>
                  Historical Trends <span style={{ fontWeight: 400, color: '#64748b' }}>(Shillong, Meghalaya)</span>
                </h3>
              </div>
              <select
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '4px 8px',
                  fontSize: '0.76rem',
                  outline: 'none',
                }}
              >
                <option>Last 5 Years</option>
                <option>Last 10 Years</option>
              </select>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8, fontSize: '0.72rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, background: '#38bdf8', borderRadius: 2 }} />
                <span>Rainfall (mm)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 2, background: '#f59e0b' }} />
                <span>Soil Moisture (%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 2, background: '#ef4444' }} />
                <span>Landslide Events</span>
              </div>
            </div>

            <div style={{ width: '100%', height: 215 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={TREND_5YR} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 500]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="rain" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={26} />
                  <Line type="monotone" dataKey="soil" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="events" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row: Historical Records (50%) + Event Distribution (25%) + Data Sources (25%) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(240px, 0.75fr) minmax(220px, 0.75fr)',
            gap: 20,
          }}
          className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Historical Landslide Records Table */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: 0 }}>
                Historical Landslide Records
              </h3>
              <button
                onClick={handleDownloadCSV}
                style={{
                  background: '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <Download size={13} />
                <span>Download CSV</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '8px 6px' }}>Date</th>
                    <th style={{ padding: '8px 6px' }}>Location</th>
                    <th style={{ padding: '8px 6px' }}>State</th>
                    <th style={{ padding: '8px 6px' }}>Severity</th>
                    <th style={{ padding: '8px 6px' }}>Rainfall (mm)</th>
                    <th style={{ padding: '8px 6px' }}>Cause</th>
                    <th style={{ padding: '8px 6px' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {HISTORICAL_TABLE.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <td style={{ padding: '8px 6px', fontWeight: 600 }}>{row.date}</td>
                      <td style={{ padding: '8px 6px' }}>{row.loc}</td>
                      <td style={{ padding: '8px 6px', color: '#64748b' }}>{row.state}</td>
                      <td style={{ padding: '8px 6px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 9999,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            background:
                              row.sev === 'Critical'
                                ? '#fee2e2'
                                : row.sev === 'High'
                                ? '#ffedd5'
                                : row.sev === 'Moderate'
                                ? '#fef9c3'
                                : '#dcfce7',
                            color:
                              row.sev === 'Critical'
                                ? '#b91c1c'
                                : row.sev === 'High'
                                ? '#c2410c'
                                : row.sev === 'Moderate'
                                ? '#a16207'
                                : '#15803d',
                          }}
                        >
                          {row.sev}
                        </span>
                      </td>
                      <td style={{ padding: '8px 6px', fontWeight: 600 }}>{row.rain}</td>
                      <td style={{ padding: '8px 6px', color: '#64748b' }}>{row.cause}</td>
                      <td style={{ padding: '8px 6px' }}>
                        <button
                          onClick={() => setSelectedRecord(row)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#8b5cf6',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Event Distribution Donut */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 12px' }}>
              Event Distribution
            </h3>

            <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={EVENT_DIST}
                    dataKey="count"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                  >
                    {EVENT_DIST.map((entry, index) => (
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
                <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1 }}>156</span>
                <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Total Events</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {EVENT_DIST.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                    <span style={{ color: '#64748b' }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>{item.count} ({item.pct})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div
            style={{
              background: theme === 'dark' ? '#0d281e' : '#ffffff',
              borderRadius: 18,
              padding: '18px 20px',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : '#e2e8f0'}`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 14px' }}>
              Data Sources
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CloudRain size={16} color="#3b82f6" />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>IMD Weather Data</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Rainfall, Temperature, Humidity</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={16} color="#a855f7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Satellite Imagery</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Sentinel, Landsat (NDVI, Terrain)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(249, 115, 22, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color="#f97316" />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Government Records</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Past Landslide Events</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Radio size={16} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>Field Sensors</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Soil Moisture, Slope Data</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal when user clicks "View" on any record */}
        {selectedRecord && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                background: theme === 'dark' ? '#0d281e' : '#ffffff',
                borderRadius: 20,
                padding: 24,
                maxWidth: 440,
                width: '100%',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Incident Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }}
                >
                  ✕
                </button>
              </div>
              <div style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
                <p><b>Date:</b> {selectedRecord.date}</p>
                <p><b>Location:</b> {selectedRecord.loc}, {selectedRecord.state}</p>
                <p><b>Severity:</b> <span style={{ color: '#ef4444', fontWeight: 700 }}>{selectedRecord.sev}</span></p>
                <p><b>Rainfall Accumulation:</b> {selectedRecord.rain} mm/24h</p>
                <p><b>Primary Trigger:</b> {selectedRecord.cause}</p>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 10 }}>
                  Verified by GSI Landslide Atlas &amp; State Disaster Management Authority records.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
