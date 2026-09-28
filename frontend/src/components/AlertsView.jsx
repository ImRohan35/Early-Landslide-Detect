import { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Compass,
  Info,
  Sliders,
  Trash2,
} from 'lucide-react';
import { getAlerts, markAlertReadApi, markAllAlertsReadApi, clearAlertsApi } from '../services/api';

export default function AlertsView({
  onSelectLocation,
  onRunPrediction,
  showToast,
}) {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch {
      showToast('Error loading notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAlertReadApi(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: 1 } : a))
      );
      showToast('Notification marked as read', 'success');
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAlertsReadApi();
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: 1 })));
      showToast('All notifications marked as read', 'success');
    } catch {}
  };

  const handleClearAll = async () => {
    try {
      await clearAlertsApi();
      setAlerts([]);
      showToast('Notifications cleared', 'info');
    } catch {}
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'All') return true;
    return (a.severity || '').toLowerCase() === severityFilter.toLowerCase();
  });

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  const getRiskBadgeClass = (lvl) => {
    const l = (lvl || '').toUpperCase();
    if (l === 'CRITICAL') return 'badge-critical';
    if (l === 'HIGH') return 'badge-high';
    if (l === 'MODERATE') return 'badge-moderate';
    return 'badge-low';
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0d2818', margin: 0 }}>
            Risk Monitoring Alerts
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: '4px 0 0' }}>
            AI-generated risk estimate &mdash; not an official emergency warning. Automated triggers based on rainfall and slope indices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleMarkAllRead}
              id="mark-all-alerts-read-btn"
            >
              <CheckCheck size={16} />
              Mark All Read ({unreadCount})
            </button>
          )}
          {alerts.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearAll}
              id="clear-all-alerts-btn"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Advisory Guidelines Reference Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-app)', borderLeft: '3px solid var(--risk-low)' }}>
          <strong style={{ fontSize: 12, color: 'var(--risk-low)', display: 'block' }}>LOW RISK</strong>
          <small style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Routine monitoring recommended.</small>
        </div>
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-app)', borderLeft: '3px solid var(--risk-moderate)' }}>
          <strong style={{ fontSize: 12, color: 'var(--risk-moderate)', display: 'block' }}>MODERATE RISK</strong>
          <small style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Monitor rainfall and soil moisture.</small>
        </div>
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-app)', borderLeft: '3px solid var(--risk-high)' }}>
          <strong style={{ fontSize: 12, color: 'var(--risk-high)', display: 'block' }}>HIGH RISK</strong>
          <small style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Increase monitoring during heavy rainfall.</small>
        </div>
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-app)', borderLeft: '3px solid var(--risk-critical)' }}>
          <strong style={{ fontSize: 12, color: 'var(--risk-critical)', display: 'block' }}>CRITICAL RISK</strong>
          <small style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Maintain close monitoring and follow official local authority advisories.</small>
        </div>
      </div>

      <div
        style={{
          padding: '8px 14px',
          borderRadius: 6,
          background: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          color: '#854d0e',
          fontSize: 12,
          marginBottom: 16,
        }}
      >
        ℹ️ <b>Advisory Disclaimer:</b> These alerts are AI model estimates for monitoring and decision-support. This system does not issue official government disaster warnings. Always follow official directives from local disaster management authorities (NDMA, SDMA, District Administration).
      </div>

      {/* Advisory Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}
      >
        <Info size={18} style={{ color: 'var(--forest-600)', flexShrink: 0 }} />
        <span>
          <b>System Notice:</b> These alerts are analytical estimates produced by the machine learning model from environmental and historical data. They represent advisory risk probability, not live emergency warnings.
        </span>
      </div>

      {/* Severity Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['All', 'Critical', 'High', 'Moderate'].map((sev) => (
          <button
            key={sev}
            type="button"
            className={`btn ${severityFilter === sev ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: 12.5 }}
            onClick={() => setSeverityFilter(sev)}
          >
            {sev === 'All' ? `All (${alerts.length})` : sev}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p>Loading notifications...</p>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Bell size={32} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>No Notifications</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {severityFilter === 'All'
              ? 'There are currently no active risk notifications in the system.'
              : `No notifications found matching the "${severityFilter}" filter.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="card"
              style={{
                borderLeft: `4px solid ${
                  (alert.severity || '').toUpperCase() === 'CRITICAL'
                    ? 'var(--risk-critical)'
                    : (alert.severity || '').toUpperCase() === 'HIGH'
                    ? 'var(--risk-high)'
                    : 'var(--risk-moderate)'
                }`,
                opacity: alert.is_read ? 0.75 : 1,
                background: alert.is_read ? 'var(--bg-app)' : 'var(--bg-card)',
                transition: 'all 0.18s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ fontSize: 17, color: 'var(--text-primary)', margin: 0 }}>
                      {alert.location_name}
                    </h3>
                    <span className={`badge ${getRiskBadgeClass(alert.severity)}`}>
                      {alert.severity} RISK ({alert.probability || 75}%)
                    </span>
                    {!alert.is_read && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--risk-critical)',
                          display: 'inline-block',
                        }}
                        title="Unread notification"
                      />
                    )}
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2, display: 'block' }}>
                    State: <b>{alert.state}</b> • Generated: {alert.created_at || 'Recent session'}
                  </small>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {!alert.is_read && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: 12 }}
                      onClick={() => handleMarkRead(alert.id)}
                      title="Mark as read"
                      id={`mark-read-btn-${alert.id}`}
                    >
                      <Check size={13} /> Mark Read
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '5px 12px', fontSize: 12 }}
                    onClick={() => {
                      if (onRunPrediction) {
                        onRunPrediction({
                          location_name: alert.location_name,
                          state: alert.state,
                          id: alert.location_id,
                        });
                      }
                    }}
                    title="Open in prediction studio"
                    id={`predict-alert-btn-${alert.id}`}
                  >
                    <Sliders size={13} /> Run Prediction
                  </button>
                </div>
              </div>

              {/* Reason */}
              <p style={{ fontSize: 13.5, color: 'var(--text-primary)', margin: '6px 0 10px', lineHeight: 1.5 }}>
                <b>Risk Cause: </b>{alert.reason}
              </p>

              {/* Recommended Action */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-elevated)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                }}
              >
                <strong style={{ color: 'var(--text-primary)' }}>Recommended Action: </strong>
                {alert.recommended_action}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
