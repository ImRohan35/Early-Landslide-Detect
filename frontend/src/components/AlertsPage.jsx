import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ChevronRight,
  Filter,
  Smartphone,
  Mail,
  MessageSquare,
  Shield,
  Clock,
  MapPin,
  Check,
  X,
  Share2,
} from 'lucide-react';

import { roadsData } from '../data/roadsData';
import {
  Navigation,
  Route,
  Car,
  Compass,
  ShieldAlert,
} from 'lucide-react';

const INITIAL_ALERTS = [
  {
    id: 'alt-1',
    level: 'High Risk',
    title: 'Heavy rainfall & slope saturation in Meghalaya',
    desc: 'Rainfall: 145 mm predicted in next 24 hours. High risk of landslides along hill cuttings.',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    highway: 'NH-6 (Shillong – Jowai – Silchar Highway)',
    roadStatus: '⛔ BLOCKED (Sonapur Tunnel Sector)',
    roadStatusColor: '#ef4444',
    roadStatusBg: 'rgba(239, 68, 68, 0.12)',
    mlRiskScore: '86% Critical Hazard',
    mlAccuracy: '95.0%',
    bestRoute: 'Best Safe Travel Route: Use Shillong – Nongstoin – Mawshynrut – Panchgram corridor, or proceed via Umkiang bypass during daylight hours (08:00 - 16:00 IST). Avoid Sonapur tunnel till BRO debris clearance.',
    time: '2 hours ago',
    badgeColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    icon: <AlertTriangle size={18} color="#ef4444" />,
    details: 'Heavy orographic monsoon cloudburst detected along Cherrapunji-Shillong axis. Continuous precipitation is saturating slope regolith and increasing pore-water pressure along NH-6. BRO clearance machinery actively operating at Sonapur mouth.',
  },
  {
    id: 'alt-2',
    level: 'Moderate Risk',
    title: 'Increased soil moisture & railway cuttings in Assam',
    desc: 'Soil moisture: 68%. Hill slopes vulnerable to sliding under additional showers.',
    state: 'Assam',
    district: 'Dima Hasao',
    highway: 'Haflong – Jatinga Valley Hill Artery',
    roadStatus: '⚠️ CAUTION (Single Lane Traffic)',
    roadStatusColor: '#f59e0b',
    roadStatusBg: 'rgba(245, 158, 11, 0.12)',
    mlRiskScore: '64% Moderate Hazard',
    mlAccuracy: '95.0%',
    bestRoute: 'Best Safe Travel Route: Lumding – Lanka – Dabaka bypass road for inter-district commercial transport. Commercial heavy vehicles restricted along old Jatinga hill cuts.',
    time: '5 hours ago',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    icon: <Flame size={18} color="#f59e0b" />,
    details: 'Precipitation accumulation in Haflong and surrounding railway hill cuttings. Ground saturation index reaching critical threshold. Light vehicles permitted with 25 km/h limit.',
  },
  {
    id: 'alt-3',
    level: 'Critical Risk',
    title: 'Active landslide & rockfall in Arunachal Pradesh',
    desc: 'Active debris flow near NH-13 Trans-Arunachal Highway. Avoid travel.',
    state: 'Arunachal Pradesh',
    district: 'West Kameng',
    highway: 'NH-13 (Trans-Arunachal Highway / Bhalukpong-Tenga)',
    roadStatus: '⛔ BLOCKED (Active Rockfall at Bhalukpong)',
    roadStatusColor: '#dc2626',
    roadStatusBg: 'rgba(220, 38, 38, 0.15)',
    mlRiskScore: '92% Extreme Hazard',
    mlAccuracy: '95.0%',
    bestRoute: 'Best Safe Travel Route: Divert to Orang – Kalaktang – Shergaon – Rupa bypass (OKSR Road), which bypasses the unstable Bhalukpong slide zone completely.',
    time: '8 hours ago',
    badgeColor: '#dc2626',
    badgeBg: 'rgba(220, 38, 38, 0.15)',
    icon: <AlertTriangle size={18} color="#dc2626" />,
    details: 'Active debris flow reported between Bhalukpong and Tenga Valley on Trans-Arunachal Highway (NH-13). Border Roads Organisation (BRO) clearing crews deployed. Convoys halted at check-posts.',
  },
  {
    id: 'alt-4',
    level: 'Critical Risk',
    title: 'Severe mudslide on NH-10 Sikkim Highway corridor',
    desc: 'Multiple debris flows at 29th Mile. Direct corridor temporarily suspended.',
    state: 'Sikkim',
    district: 'East Sikkim',
    highway: 'NH-10 (Siliguri – Sevoke – Teesta – Gangtok)',
    roadStatus: '⛔ BLOCKED near 29th Mile',
    roadStatusColor: '#dc2626',
    roadStatusBg: 'rgba(220, 38, 38, 0.15)',
    mlRiskScore: '91% Critical Hazard',
    mlAccuracy: '95.0%',
    bestRoute: 'Best Safe Travel Route: Siliguri – Sevoke – Damdim – Gorubathan – Lava – Algarah – Kalimpong bypass to reach Singtam / Gangtok safely without entering Teesta river slide zone.',
    time: '9 hours ago',
    badgeColor: '#dc2626',
    badgeBg: 'rgba(220, 38, 38, 0.15)',
    icon: <AlertTriangle size={18} color="#dc2626" />,
    details: 'Continuous slope cutting failure between Melli and Teesta Bazaar. BRO Project Swastik excavators deployed. Police traffic advisories recommend complete diversion via Lava corridor.',
  },
  {
    id: 'alt-5',
    level: 'Moderate Risk',
    title: 'Slope subsidence along NH-29 Nagaland corridor',
    desc: 'Persistent precipitation causing gravel washouts near Paglapahar.',
    state: 'Nagaland',
    district: 'Kohima',
    highway: 'NH-29 (Dimapur – Chumukedima – Kohima Highway)',
    roadStatus: '⚠️ CAUTION (Single Lane Open, Day Transit Only)',
    roadStatusColor: '#f59e0b',
    roadStatusBg: 'rgba(245, 158, 11, 0.12)',
    mlRiskScore: '68% Moderate Hazard',
    mlAccuracy: '95.0%',
    bestRoute: 'Best Safe Travel Route: Niuland – Ghowoto – Botsa bypass road for light passenger vehicles during peak slide hours. Heavy freight convoys escorted by traffic police.',
    time: '1 day ago',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    icon: <Flame size={18} color="#f59e0b" />,
    details: 'Intermittent precipitation causing minor gravel washouts along NH-29 Kohima-Phesama corridor. State Disaster Management Authority (NSDMA) issued travel advisory.',
  },
  {
    id: 'alt-6',
    level: 'Low Risk',
    title: 'Stable road conditions in Mizoram arterial highway',
    desc: 'NH-54 / NH-306 operational with normal speeds.',
    state: 'Mizoram',
    district: 'Aizawl',
    highway: 'NH-54 / NH-306 (Silchar – Vairengte – Aizawl)',
    roadStatus: '✅ PASSABLE / OPEN (Light Caution at Kawnpui)',
    roadStatusColor: '#10b981',
    roadStatusBg: 'rgba(16, 185, 129, 0.12)',
    mlRiskScore: '24% Low Hazard',
    mlAccuracy: '95.0%',
    bestRoute: 'Best Safe Travel Route: Standard direct NH-54 corridor is clear and open. Travel recommended between 07:00 and 17:00 IST for optimal visibility.',
    time: '12 hours ago',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    icon: <CheckCircle2 size={18} color="#10b981" />,
    details: 'Clear to partly cloudy weather observed over Aizawl and Lunglei ridges. Antecedent soil moisture within safe geotechnical tolerances. Normal transit flow active.',
  },
];

export default function AlertsPage({ onNavigate, theme = 'light' }) {
  const [stateFilter, setStateFilter] = useState('All States');
  const [riskFilter, setRiskFilter] = useState('All Risk Levels');
  const [timeFilter, setTimeFilter] = useState('Last 7 Days');
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Subscription checkboxes
  const [subscribedEmail, setSubscribedEmail] = useState(true);
  const [subscribedSMS, setSubscribedSMS] = useState(true);
  const [subscribedInApp, setSubscribedInApp] = useState(true);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const filteredAlerts = useMemo(() => {
    return INITIAL_ALERTS.filter((alt) => {
      if (stateFilter !== 'All States' && alt.state.toLowerCase() !== stateFilter.toLowerCase()) {
        return false;
      }
      if (riskFilter !== 'All Risk Levels' && !alt.level.toLowerCase().includes(riskFilter.toLowerCase().replace(' risk', ''))) {
        return false;
      }
      return true;
    });
  }, [stateFilter, riskFilter]);

  const handleSubscribe = () => {
    setSubscribeSuccess(true);
    setTimeout(() => setSubscribeSuccess(false), 4000);
  };

  return (
    <div
      style={{
        background: theme === 'dark' ? '#071610' : '#f8faf9',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        padding: '24px 28px 60px',
        minHeight: 'calc(100vh - 64px)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        {/* Top Header & Subtitle */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1
              style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: theme === 'dark' ? '#ffffff' : '#0d2818',
                margin: 0,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Alerts, Road Passability & <span style={{ color: '#ea580c' }}>Safe Routes</span>
            </h1>
          </div>
          <p
            style={{
              fontSize: '0.92rem',
              color: theme === 'dark' ? '#94a3b8' : '#64748b',
              margin: 0,
            }}
          >
            Real-time road passability conditions, landslide alerts, and recommended safe alternate routes across North Eastern Region hill highways.
          </p>
        </div>

        {/* Dedicated Highway Travel Corridor & Safe Route Advisor */}
        <div
          style={{
            background: theme === 'dark' ? '#0d281e' : '#ffffff',
            borderRadius: 18,
            border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.25)' : '#fed7aa'}`,
            padding: '18px 22px',
            marginBottom: 24,
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(234, 88, 12, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass size={18} color="#ea580c" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                  Strategic Highway Travel Corridors & Best Route Advisor
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Live BRO & PWD passability updates with recommended alternate detours for safe transit
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#059669',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '4px 10px',
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              ✓ 8 Strategic Corridors Monitored
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: 14,
            }}
          >
            {roadsData.slice(0, 6).map((road) => {
              const isBlocked = road.status?.toLowerCase() === 'blocked';
              const isCaution = road.status?.toLowerCase() === 'caution';
              const bestDetour =
                road.id === 'nh-10'
                  ? 'Divert via Damdim – Gorubathan – Lava – Algarah – Kalimpong bypass to reach Sikkim safely.'
                  : road.id === 'nh-6'
                  ? 'Use Shillong – Nongstoin – Mawshynrut – Panchgram corridor, or wait for daylight BRO clearance.'
                  : road.id === 'nh-29'
                  ? 'Take Niuland – Ghowoto – Botsa bypass road for light passenger vehicles.'
                  : road.id === 'nh-13'
                  ? 'Divert to Orang – Kalaktang – Shergaon – Rupa bypass (OKSR Road) avoiding Bhalukpong.'
                  : road.id === 'nh-54'
                  ? 'Standard NH-54 open; drive with speed restriction (30 km/h) along Kawnpui cutting.'
                  : 'Direct 4-lane Asian Highway corridor is fully open with normal traffic flow.';

              return (
                <div
                  key={road.id}
                  style={{
                    background: theme === 'dark' ? '#071c14' : '#f8fafc',
                    borderRadius: 14,
                    padding: '14px 16px',
                    border: `1px solid ${isBlocked ? '#fca5a5' : isCaution ? '#fde68a' : '#bbf7d0'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: theme === 'dark' ? '#ffffff' : '#0f172a' }}>
                        {road.roadName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          borderRadius: 6,
                          padding: '2px 8px',
                          background: isBlocked ? '#fee2e2' : isCaution ? '#fef3c7' : '#dcfce7',
                          color: isBlocked ? '#dc2626' : isCaution ? '#b45309' : '#15803d',
                        }}
                      >
                        {isBlocked ? '⛔ BLOCKED' : isCaution ? '⚠️ CAUTION' : '✅ OPEN'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 6 }}>
                      <b>Corridor:</b> {road.corridor} ({road.state})
                    </div>
                    <div style={{ fontSize: '0.74rem', color: isBlocked ? '#b91c1c' : '#475569', marginBottom: 8, lineHeight: 1.35 }}>
                      <b>Condition:</b> {road.conditionNotes}
                    </div>
                  </div>

                  <div
                    style={{
                      background: theme === 'dark' ? '#0e2b20' : '#ffffff',
                      border: '1px solid #c7d2fe',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: '0.72rem',
                      color: '#3730a3',
                      lineHeight: 1.35,
                    }}
                  >
                    🧭 <b>Best Travel Route:</b> {bestDetour}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Filter Controls Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: '0.84rem',
              fontWeight: 600,
              background: theme === 'dark' ? '#0e2b20' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.25)' : '#cbd5e1'}`,
              color: theme === 'dark' ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="All States">All States</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Assam">Assam</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Manipur">Manipur</option>
            <option value="Tripura">Tripura</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: '0.84rem',
              fontWeight: 600,
              background: theme === 'dark' ? '#0e2b20' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.25)' : '#cbd5e1'}`,
              color: theme === 'dark' ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="All Risk Levels">All Risk Levels</option>
            <option value="Critical">Critical Risk</option>
            <option value="High">High Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              fontSize: '0.84rem',
              fontWeight: 600,
              background: theme === 'dark' ? '#0e2b20' : '#ffffff',
              border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.25)' : '#cbd5e1'}`,
              color: theme === 'dark' ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 24 Hours">Last 24 Hours</option>
            <option value="All Time">All Time</option>
          </select>

          <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 'auto' }}>
            Showing <b>{filteredAlerts.length}</b> verified travel warnings
          </span>
        </div>

        {/* 2-Column Main Section: Left Alert Cards + Right "Get Instant Alerts" */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 0.9fr)',
            gap: 24,
          }}
          className="grid-cols-1 lg:grid-cols-alerts"
        >
          {/* Left Column: Filterable List of Alert Cards with Road Condition & Best Travel Route */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredAlerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => setSelectedAlert(alt)}
                style={{
                  background: theme === 'dark' ? '#0d281e' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? 'rgba(52, 211, 153, 0.18)' : '#e2e8f0'}`,
                  borderRadius: 16,
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = alt.badgeColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(52, 211, 153, 0.18)' : '#e2e8f0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: alt.badgeBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {alt.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: alt.badgeColor,
                          background: alt.badgeBg,
                          padding: '2px 8px',
                          borderRadius: 6,
                          textTransform: 'uppercase',
                        }}
                      >
                        {alt.level}
                      </span>
                      <span
                        style={{
                          fontSize: '0.94rem',
                          fontWeight: 800,
                          color: theme === 'dark' ? '#ffffff' : '#0f172a',
                        }}
                      >
                        {alt.title}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, marginBottom: 8 }}>
                      {alt.desc}
                    </div>

                    {/* Road Status, Highway & ML Risk Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      {alt.roadStatus && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: alt.roadStatusBg || '#fee2e2',
                            color: alt.roadStatusColor || '#dc2626',
                          }}
                        >
                          {alt.roadStatus}
                        </span>
                      )}
                      {alt.highway && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#2563eb',
                          }}
                        >
                          🛣️ {alt.highway}
                        </span>
                      )}
                      {alt.mlRiskScore && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#047857',
                          }}
                        >
                          🎯 {alt.mlRiskScore} (Acc: {alt.mlAccuracy})
                        </span>
                      )}
                    </div>

                    {/* Best Recommended Safe Travel Route Box */}
                    {alt.bestRoute && (
                      <div
                        style={{
                          background: theme === 'dark' ? '#092118' : '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontSize: '0.75rem',
                          color: '#166534',
                          lineHeight: 1.4,
                        }}
                      >
                        🧭 <b>Best Recommended Travel Route:</b> {alt.bestRoute}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {alt.time}
                  </span>
                  <ChevronRight size={18} color="#94a3b8" />
                </div>
              </div>
            ))}

            {filteredAlerts.length === 0 && (
              <div
                style={{
                  background: theme === 'dark' ? '#0d281e' : '#ffffff',
                  borderRadius: 16,
                  padding: 40,
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                No alerts match the selected state or risk level filters.
              </div>
            )}
          </div>

          {/* Right Column: "Get Instant Alerts" with Realistic Phone Mockup */}
          <div
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(5, 22, 15, 0.9) 0%, rgba(5, 22, 15, 0.85) 100%), url('/hero-mountains.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 22,
              padding: '28px 24px',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 520,
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
                Get Instant Alerts
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0 0 18px', lineHeight: 1.45 }}>
                Subscribe to receive real-time alerts for your preferred locations.
              </p>

              {/* Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {[
                  { id: 'email', label: 'Email Notifications', checked: subscribedEmail, setter: setSubscribedEmail },
                  { id: 'sms', label: 'SMS Alerts', checked: subscribedSMS, setter: setSubscribedSMS },
                  { id: 'app', label: 'In-App Notifications', checked: subscribedInApp, setter: setSubscribedInApp },
                ].map((item) => (
                  <label
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      color: '#e2e8f0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.setter(e.target.checked)}
                      style={{
                        accentColor: '#10b981',
                        width: 16,
                        height: 16,
                        cursor: 'pointer',
                      }}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                style={{
                  background: '#10b981',
                  color: '#062016',
                  padding: '10px 20px',
                  borderRadius: 9999,
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s ease',
                  marginBottom: 20,
                }}
              >
                {subscribeSuccess ? '✓ Subscribed Successfully!' : 'Subscribe Now'}
              </button>
            </div>

            {/* Realistic Phone Device Mockup showing Notification */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 220,
                  height: 180,
                  background: '#04120c',
                  border: '3px solid #334155',
                  borderRadius: 24,
                  boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Phone Speaker Notch */}
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 36,
                    height: 4,
                    background: '#475569',
                    borderRadius: 9999,
                  }}
                />

                {/* Mobile Notification Card */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 14,
                    padding: '10px 12px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                    color: '#0f172a',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Shield size={10} color="#fff" />
                    </div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#064e3b' }}>
                      LandslideGuard AI
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#dc2626' }}>
                    High Risk Alert
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: 2, lineHeight: 1.3 }}>
                    Heavy rainfall expected in Meghalaya. Stay safe!
                  </div>
                </div>
              </div>

              {/* Handwritten style cursive tagline */}
              <div
                style={{
                  fontFamily: "'Caveat', 'Segoe Script', cursive, sans-serif",
                  fontSize: '1.45rem',
                  color: '#6ee7b7',
                  marginTop: 12,
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                }}
              >
                "Early warnings save lives."
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 200,
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
              maxWidth: 500,
              width: '100%',
              border: `1px solid ${selectedAlert.badgeColor}`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setSelectedAlert(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: selectedAlert.badgeColor,
                  background: selectedAlert.badgeBg,
                  padding: '3px 10px',
                  borderRadius: 6,
                }}
              >
                {selectedAlert.level}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedAlert.time}</span>
            </div>

            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', fontWeight: 800 }}>
              {selectedAlert.title}
            </h3>

            <p style={{ fontSize: '0.88rem', color: theme === 'dark' ? '#cbd5e1' : '#475569', lineHeight: 1.5, marginBottom: 16 }}>
              {selectedAlert.details}
            </p>

            {selectedAlert.roadStatus && (
              <div
                style={{
                  background: selectedAlert.roadStatusBg || 'rgba(239, 68, 68, 0.1)',
                  color: selectedAlert.roadStatusColor || '#dc2626',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                Road Passability: {selectedAlert.roadStatus}
              </div>
            )}

            {selectedAlert.bestRoute && (
              <div
                style={{
                  background: theme === 'dark' ? '#072016' : '#f0fdf4',
                  border: '1px solid #86efac',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: '0.78rem',
                  color: '#166534',
                  lineHeight: 1.45,
                  marginBottom: 14,
                }}
              >
                🧭 <b>Best Recommended Travel Route / Alternate Corridor:</b>
                <div style={{ marginTop: 4 }}>{selectedAlert.bestRoute}</div>
              </div>
            )}

            <div
              style={{
                background: theme === 'dark' ? '#091e16' : '#f8fafc',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: '0.78rem',
                color: '#64748b',
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div>📍 <b>Location:</b> {selectedAlert.district}, {selectedAlert.state}</div>
              {selectedAlert.highway && <div>🛣️ <b>Highway Corridor:</b> {selectedAlert.highway}</div>}
            </div>

            <button
              onClick={() => {
                setSelectedAlert(null);
                if (onNavigate) onNavigate('Analysis');
              }}
              style={{
                width: '100%',
                background: '#10b981',
                color: '#062016',
                padding: '10px',
                borderRadius: 10,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              View Full Risk Analysis →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
