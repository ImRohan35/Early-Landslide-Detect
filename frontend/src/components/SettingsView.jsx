import { useState } from 'react';
import { Bell, LogOut, Moon, Shield, Sun, Volume2, VolumeX } from 'lucide-react';

export default function SettingsView({
  theme,
  onToggleTheme,
  onLogout,
  onNavigateToProfile,
  showToast,
}) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('nelrms-notifications') !== 'false';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('nelrms-sound') === 'true';
  });

  const handleToggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    localStorage.setItem('nelrms-notifications', String(next));
    showToast(`System notifications ${next ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('nelrms-sound', String(next));
    showToast(`Audio alerts ${next ? 'enabled' : 'muted'}`, 'info');
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>System Settings & Preferences</h2>
          <p>Configure interface appearance, notification alerts, and operational preferences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Appearance Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Appearance & Theme</h3>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Select your preferred visual style. Both modes use our natural disaster monitoring color palette.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div
              onClick={() => theme !== 'light' && onToggleTheme()}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${theme === 'light' ? 'var(--forest-700)' : 'var(--border-subtle)'}`,
                background: '#ffffff',
                color: '#1e2321',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: theme === 'light' ? '0 0 0 3px var(--primary-focus)' : 'none',
              }}
              id="settings-theme-light-card"
            >
              <Sun size={28} style={{ color: '#d97706', marginBottom: 8 }} />
              <strong style={{ display: 'block', fontSize: 14 }}>Light Mode</strong>
              <small style={{ fontSize: 11, color: '#576560' }}>Clean natural cream</small>
            </div>

            <div
              onClick={() => theme !== 'dark' && onToggleTheme()}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${theme === 'dark' ? 'var(--forest-500)' : 'var(--border-subtle)'}`,
                background: '#18201c',
                color: '#f2f5f3',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: theme === 'dark' ? '0 0 0 3px var(--primary-focus)' : 'none',
              }}
              id="settings-theme-dark-card"
            >
              <Moon size={28} style={{ color: '#52b788', marginBottom: 8 }} />
              <strong style={{ display: 'block', fontSize: 14 }}>Dark Mode</strong>
              <small style={{ fontSize: 11, color: '#95a59c' }}>Deep forest slate</small>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Risk Alerts & Notifications</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block' }}>
                  System Risk Notifications
                </strong>
                <small style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Receive system alerts when critical regional thresholds are reached
                </small>
              </div>
              <button
                type="button"
                className={`btn ${notificationsEnabled ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: 12 }}
                onClick={handleToggleNotifications}
                id="toggle-notifications-btn"
              >
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
              <div>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)', display: 'block' }}>
                  Audible Chimes
                </strong>
                <small style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Sound alerts on critical vulnerability updates
                </small>
              </div>
              <button
                type="button"
                className={`btn ${soundEnabled ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: 12 }}
                onClick={handleToggleSound}
                id="toggle-sound-btn"
              >
                {soundEnabled ? 'Active' : 'Muted'}
              </button>
            </div>
          </div>
        </div>

        {/* Account & Session Controls */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Account & Security</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 13.5, color: 'var(--text-primary)', display: 'block' }}>
                  Security Credentials
                </strong>
                <small style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Update password or analyst profile metadata
                </small>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onNavigateToProfile}
              >
                Profile Settings
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 13.5, color: 'var(--text-primary)', display: 'block' }}>
                  Session Termination
                </strong>
                <small style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Sign out and return to the login interface
                </small>
              </div>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onLogout}
                id="settings-logout-btn"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
