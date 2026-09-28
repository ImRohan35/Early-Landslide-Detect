import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Compass,
  FileText,
  History,
  MapPin,
  Mountain,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { getStateDetail } from '../services/api';

export default function StateDetailView({
  stateName,
  onBack,
  onRunPrediction,
  onGenerateReport,
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stateName) {
      setLoading(true);
      getStateDetail(stateName).then((res) => {
        setDetail(res);
        setLoading(false);
      });
    }
  }, [stateName]);

  if (loading) {
    return (
      <div className="view-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading {stateName} state assessment...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="view-container">
        <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to States
        </button>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>State Not Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>State data is not available for "{stateName}".</p>
        </div>
      </div>
    );
  }

  const getRiskBadgeClass = (lvl) => {
    const l = (lvl || '').toUpperCase();
    if (l === 'CRITICAL') return 'badge-critical';
    if (l === 'HIGH') return 'badge-high';
    if (l === 'MODERATE') return 'badge-moderate';
    return 'badge-low';
  };

  return (
    <div className="view-container">
      {/* Back Button */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          id="back-to-states-btn"
        >
          <ArrowLeft size={16} />
          Back to All North-East States
        </button>
      </div>

      {/* State Profile Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--forest-900), var(--forest-800))',
          color: '#ffffff',
          marginBottom: 24,
          padding: '28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--forest-400)', fontWeight: 700 }}>
              North-Eastern Region State Profile
            </span>
            <h2 style={{ fontSize: 32, color: '#ffffff', marginTop: 4, marginBottom: 8 }}>
              {detail.state}
            </h2>
            <p style={{ fontSize: 14, color: '#d8e5df', maxWidth: 750, lineHeight: 1.6 }}>
              {detail.description}
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.08)', padding: '14px 20px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <span style={{ fontSize: 11, color: 'var(--forest-400)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Capital / Center
            </span>
            <strong style={{ fontSize: 18, color: '#ffffff', display: 'block', marginTop: 2 }}>
              {detail.capital || 'Regional Center'}
            </strong>
          </div>
        </div>

        {detail.vulnerable_corridors && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.12)', fontSize: 13, color: '#e8f0ec' }}>
            <strong style={{ color: 'var(--forest-400)' }}>High-Risk Sectors & Transit Corridors: </strong>
            {detail.vulnerable_corridors}
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box forest">
            <Compass size={22} />
          </div>
          <div className="kpi-meta">
            <small>Monitored Sites</small>
            <strong>{detail.total_locations}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box critical">
            <Mountain size={22} />
          </div>
          <div className="kpi-meta">
            <small>Critical Sites</small>
            <strong>{detail.critical_locations}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box high">
            <Mountain size={22} />
          </div>
          <div className="kpi-meta">
            <small>High Risk Sites</small>
            <strong>{detail.high_locations}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box moderate">
            <History size={22} />
          </div>
          <div className="kpi-meta">
            <small>Historical Disasters</small>
            <strong>{detail.historical_events.length}</strong>
          </div>
        </div>
      </div>

      {/* Monitored Locations Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">Monitored Geographical Locations in {detail.state}</h3>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {detail.locations.length} Stations Available
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Station / Hill Section</th>
                <th style={{ padding: '10px 12px' }}>District</th>
                <th style={{ padding: '10px 12px' }}>Rainfall</th>
                <th style={{ padding: '10px 12px' }}>Slope</th>
                <th style={{ padding: '10px 12px' }}>Soil Saturation</th>
                <th style={{ padding: '10px 12px' }}>Risk Level</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {detail.locations.map((loc) => (
                <tr key={loc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {loc.name || loc.locationName}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                    {loc.district}
                  </td>
                  <td style={{ padding: '12px' }}>{loc.rainfall} mm</td>
                  <td style={{ padding: '12px' }}>{loc.slope}°</td>
                  <td style={{ padding: '12px' }}>{loc.soil_moisture || loc.soilMoisture}%</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${getRiskBadgeClass(loc.risk_level || loc.riskLevel)}`}>
                      {loc.risk_level || loc.riskLevel}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '5px 10px', fontSize: 12 }}
                      onClick={() => onRunPrediction(loc)}
                      title="Run ML prediction for this location"
                    >
                      <Sliders size={13} /> Predict
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documented Historical Events in this State */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={18} style={{ color: 'var(--primary)' }} />
            <h3 className="card-title">Verified Historical Landslide Events ({detail.state})</h3>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Documented GSI & NDMA Disasters
          </span>
        </div>

        {detail.historical_events.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
            No major catastrophic disaster events recorded in the primary dataset for {detail.state}.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {detail.historical_events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>
                      {evt.location} ({evt.district})
                    </strong>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span>Date: {evt.date}</span>
                      <span>Recorded Rainfall: {evt.rainfall_recorded_mm} mm</span>
                      <span>Casualties: {evt.casualties || 0}</span>
                    </div>
                  </div>
                  <span className={`badge ${getRiskBadgeClass(evt.severity)}`}>
                    {evt.severity}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0' }}>
                  {evt.description}
                </p>
                <small style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Source: {evt.source}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
