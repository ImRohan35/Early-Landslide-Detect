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

const INITIAL_ALERTS = [
  {
    id: 'alt-1',
    level: 'High Risk',
    title: 'Heavy rainfall expected in Meghalaya',
    desc: 'Rainfall: 75 mm predicted in next 24 hours. High risk of landslides.',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    time: '2 hours ago',
    badgeColor: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.12)',
    icon: <AlertTriangle size={18} color="#ef4444" />,
    details: 'Heavy orographic monsoon cloudburst detected along Cherrapunji-Shillong axis. Continuous precipitation is saturating slope regolith and increasing pore-water pressure along NH-6.',
  },
  {
    id: 'alt-2',
    level: 'Moderate Risk',
    title: 'Increased soil moisture in Assam',
    desc: 'Soil moisture: 68%. Conditions stable but monitor closely.',
    state: 'Assam',
    district: 'Dima Hasao',
    time: '5 hours ago',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    icon: <Flame size={18} color="#f59e0b" />,
    details: 'Precipitation accumulation in Haflong and surrounding railway hill cuttings. Ground saturation index reaching critical threshold.',
  },
  {
    id: 'alt-3',
    level: 'Critical Risk',
    title: 'Landslide reported in Arunachal Pradesh',
    desc: 'Landslide near NH-13. Avoid travel in the affected area.',
    state: 'Arunachal Pradesh',
    district: 'West Kameng',
    time: '8 hours ago',
    badgeColor: '#dc2626',
    badgeBg: 'rgba(220, 38, 38, 0.15)',
    icon: <AlertTriangle size={18} color="#dc2626" />,
    details: 'Active debris flow reported between Bhalukpong and Tenga Valley on Trans-Arunachal Highway (NH-13). Border Roads Organisation (BRO) clearing crews deployed.',
  },
  {
    id: 'alt-4',
    level: 'Low Risk',
    title: 'Conditions stable in Mizoram',
    desc: 'No immediate risk detected.',
    state: 'Mizoram',
    district: 'Aizawl',
    time: '12 hours ago',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    icon: <CheckCircle2 size={18} color="#10b981" />,
    details: 'Clear to partly cloudy weather observed over Aizawl and Lunglei ridges. Antecedent soil moisture within safe geotechnical tolerances.',
  },
  {
    id: 'alt-5',
    level: 'Moderate Risk',
    title: 'Elevated risk in Nagaland',
    desc: 'Persistent rainfall may increase risk. Monitor conditions.',
    state: 'Nagaland',
    district: 'Kohima',
    time: '1 day ago',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    icon: <Flame size={18} color="#f59e0b" />,
    details: 'Intermittent precipitation causing minor gravel washouts along NH-29 Kohima-Phesama corridor. State Disaster Management Authority (NSDMA) issued travel advisory.',
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
          <h1
            style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              color: theme === 'dark' ? '#ffffff' : '#0d2818',
              margin: '0 0 6px',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Alerts & Notifications
          </h1>
          <p
            style={{
              fontSize: '0.94rem',
              color: theme === 'dark' ? '#94a3b8' : '#64748b',
              margin: 0,
            }}
          >
            Stay informed with real-time alerts and safety updates.
          </p>
        </div>

        {/* Top Filter Controls Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
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
          {/* Left Column: Filterable List of Alert Cards */}
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
                  alignItems: 'center',
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
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: alt.badgeBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {alt.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
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
                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                      {alt.desc}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
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

            <div
              style={{
                background: theme === 'dark' ? '#091e16' : '#f8fafc',
                padding: '12px 14px',
                borderRadius: 12,
                fontSize: '0.82rem',
                color: '#64748b',
                marginBottom: 18,
              }}
            >
              📍 Location: {selectedAlert.district}, {selectedAlert.state}
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
