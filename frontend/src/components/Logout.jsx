import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  LockKeyhole,
  RotateCcw,
  UserPlus,
  PhoneCall,
  Clock,
  Compass,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Pause,
  Play
} from 'lucide-react';
import './Auth.css';

export default function Logout({ session, onLoginAgain, onSwitchAccount }) {
  const [countdown, setCountdown] = useState(15);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-redirect timer
  useEffect(() => {
    if (isPaused) return;

    if (countdown <= 0) {
      if (session?.user?.email) {
        onLoginAgain(session.user.email);
      } else {
        onSwitchAccount();
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isPaused, session, onLoginAgain, onSwitchAccount]);

  const operator = session?.user || {
    name: 'Disaster Analyst',
    email: 'operator@disasterguard.gov.in',
    role: 'Disaster Operations Lead',
    agency: 'National Disaster Management Authority (NDMA)',
    avatar: '🛡️',
    clearance: 'Level 4 (Executive)'
  };

  const durationText = session?.sessionDuration || '18 minutes';
  const visitedCount = session?.visitedCount || 4;
  const criticalAlertsCount = session?.criticalAlertsCount || 2;
  const logoutTimestamp = session?.logoutTime || new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';

  const progressPercent = Math.max(0, Math.min(100, ((15 - countdown) / 15) * 100));

  return (
    <div className="logout-shell">
      {/* Background Decor */}
      <div className="auth-bg-decor" aria-hidden="true">
        <div className="auth-bg-grid" />
        <div className="auth-bg-glow-orb auth-orb-1" />
        <div className="auth-bg-glow-orb auth-orb-2" />
      </div>

      {/* Top Banner */}
      <header className="auth-top-header">
        <div className="auth-brand-badge">
          <div className="auth-brand-icon">
            <ShieldCheck size={22} />
          </div>
          <span className="auth-brand-text">
            NELRMS<em> NER</em>
          </span>
        </div>

        <div className="auth-status-pill" style={{ background: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.3)', color: '#38bdf8' }}>
          <span>NODE NER-GHY-04 &middot; SESSION CONCLUDED</span>
        </div>
      </header>

      {/* Logout Main Card */}
      <main className="logout-card" role="main" aria-label="Signed Out Confirmation">
        <div className="logout-card-body">
          {/* Glowing Shield Check Hero */}
          <div className="logout-hero-status">
            <div className="logout-shield-circle">
              <ShieldCheck size={42} />
            </div>
            <h1>Safely Signed Out</h1>
            <p>
              Your operator terminal session has been closed securely. Active prediction streams were preserved and local authentication tokens purged.
            </p>
          </div>

          {/* Security Verification Bar */}
          <div className="logout-security-badge">
            <span>
              <CheckCircle2 size={16} />
              Session Terminated &middot; Encryption Tokens Cleared
            </span>
            <code>{logoutTimestamp}</code>
          </div>

          {/* Session Debrief Summary Card */}
          <div className="session-debrief-box">
            <div className="debrief-header">
              <div className="debrief-operator">
                <div className="debrief-avatar">
                  {operator.avatar || '👤'}
                </div>
                <div className="debrief-operator-info">
                  <strong>{operator.name}</strong>
                  <span>{operator.role} &middot; {operator.agency}</span>
                </div>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{operator.email}</span>
            </div>

            <div className="debrief-metrics-grid">
              <div className="debrief-metric-item">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', color: '#38bdf8' }}>
                  <Clock size={16} />
                </div>
                <strong>{durationText}</strong>
                <span>Active Duty</span>
              </div>

              <div className="debrief-metric-item">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', color: '#10b981' }}>
                  <Compass size={16} />
                </div>
                <strong>{visitedCount} Sites</strong>
                <span>Monitored</span>
              </div>

              <div className="debrief-metric-item">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', color: '#ef4444' }}>
                  <AlertTriangle size={16} />
                </div>
                <strong>{criticalAlertsCount} Alerts</strong>
                <span>Tracked</span>
              </div>
            </div>
          </div>

          {/* Auto-Redirect Progress Bar */}
          <div className="logout-redirect-wrap">
            <div className="redirect-bar-label">
              <span>
                {isPaused
                  ? 'Auto-redirect paused'
                  : `Redirecting to login portal in ${countdown}s...`}
              </span>
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                {isPaused ? <Play size={12} /> : <Pause size={12} />}
                {isPaused ? 'Resume Timer' : 'Pause'}
              </button>
            </div>
            <div className="redirect-bar-track">
              <div className="redirect-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Action Buttons Stack */}
          <div className="logout-actions-stack">
            <button
              type="button"
              className="logout-relogin-btn"
              onClick={() => onLoginAgain(operator.email)}
            >
              <RotateCcw size={16} />
              <span>Sign Back In as {operator.name.split(' ')[0]}</span>
            </button>

            <button
              type="button"
              className="logout-switch-btn"
              onClick={onSwitchAccount}
            >
              <UserPlus size={16} />
              <span>Switch Operator / Choose Another Profile</span>
            </button>
          </div>

          {/* Emergency Hotline Reference Widget */}
          <div className="emergency-hotline-card">
            <div className="emergency-info">
              <div className="emergency-icon">
                <PhoneCall size={16} />
              </div>
              <div className="emergency-text">
                <strong>NDMA National Emergency Hotline</strong>
                <span>Toll-Free 24/7 Disaster Evacuation & SOS</span>
              </div>
            </div>
            <a href="tel:1078" className="emergency-dial-btn" title="Call Emergency Helpline">
              <span>Call 1078</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
