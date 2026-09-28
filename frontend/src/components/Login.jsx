import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mountain,
  Leaf,
  Layers,
  Activity,
  Compass,
  Check,
} from 'lucide-react';
import { loginApi, signUpApi } from '../services/api';

export default function Login({ onLogin, onBackToHome, initialMode = 'login' }) {
  const [isSignup, setIsSignup] = useState(initialMode === 'signup');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNotice, setForgotNotice] = useState('');

  // Quick credentials handlers
  const handleQuickAdmin = () => {
    setIsSignup(false);
    setLoginEmail('admin');
    setLoginPassword('admin123');
    setError('');
  };

  const handleQuickAnalyst = () => {
    setIsSignup(false);
    setLoginEmail('analyst@nelrms.gov.in');
    setLoginPassword('nelrms@2026');
    setError('');
  };

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const email = loginEmail.trim();
    const password = loginPassword;

    if (!email) {
      setError('Please enter your email address or username.');
      return;
    }
    if (email.includes('@') && !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      if (response && response.user) {
        if (rememberMe) {
          localStorage.setItem('nelrms-remember', email);
        }
        onLogin(response.user);
      } else {
        setError('Login failed. Please verify your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Signup
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const name = signupName.trim();
    const email = signupEmail.trim();
    const password = signupPassword;
    const confirmPassword = signupConfirmPassword;

    if (!name || name.length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUpApi({
        name,
        email,
        password,
        confirm_password: confirmPassword,
        agency: 'Regional Disaster Management Cell',
      });
      if (res && res.user) {
        setSuccessMsg('Account created successfully! Signing in...');
        setTimeout(() => {
          onLogin(res.user);
        }, 800);
      } else {
        setError('Could not create account. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        display: 'flex',
        background: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
      id="auth-fullscreen-container"
    >
      {/* ================= LEFT SIDE: DEEP FOREST GREEN GRADIENT (50% WIDTH) ================= */}
      <div
        style={{
          flex: '1 1 50%',
          width: '50%',
          background: 'linear-gradient(145deg, #091c11 0%, #0d2818 45%, #163b25 100%)',
          color: '#ffffff',
          padding: 'clamp(24px, 4vh, 44px) clamp(28px, 4vw, 56px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Subtle decorative background circles */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(64, 145, 108, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '-10%',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45, 106, 79, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Branding */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mountain size={20} style={{ color: '#86efac' }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.1 }}>
                LandslideGuard <span style={{ color: '#86efac' }}>AI</span>
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                North Eastern Region
              </div>
            </div>
          </div>

          {/* Small Tag */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 100,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: '#d1fae5',
              textTransform: 'uppercase',
            }}
          >
            <Shield size={12} />
            <span>AI-BASED LANDSLIDE MONITORING</span>
          </div>
        </div>

        {/* Center Main Message */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 460 }}>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 2.3vw, 2.3rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.025em',
              margin: '0 0 12px',
              color: '#ffffff',
            }}
          >
            {isSignup ? 'Create a safer monitoring workspace.' : 'Smarter monitoring for safer hills.'}
          </h2>

          <p
            style={{
              fontSize: 'clamp(13px, 1.1vw, 14.5px)',
              lineHeight: 1.55,
              color: '#cbd5e1',
              margin: '0 0 20px',
            }}
          >
            Monitor environmental conditions, analyze landslide risk and explore location-based
            insights through one integrated platform.
          </p>

          {/* Feature Points with Green Checkmarks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'AI-based risk estimation',
              'Interactive GIS monitoring',
              'Current environmental conditions',
              'Explainable risk factors',
            ].map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'rgba(74, 222, 128, 0.2)',
                    border: '1px solid #4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#86efac',
                    flexShrink: 0,
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Research & Education Disclaimer */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: 12,
            fontSize: 11.5,
            color: '#94a3b8',
            lineHeight: 1.4,
          }}
        >
          Research & education project. Risk estimates are not official disaster warnings.
        </div>
      </div>

      {/* ================= RIGHT SIDE: CLEAN WHITE FORM (50% WIDTH, FULL HEIGHT) ================= */}
      <div
        style={{
          flex: '1 1 50%',
          width: '50%',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'clamp(16px, 2.5vh, 28px) clamp(24px, 4vw, 56px)',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
        id="auth-form-side"
      >
        {/* Inner Centered Form Container */}
        <div style={{ width: '100%', maxWidth: 440, margin: 'auto 0' }}>
          {/* Back to Home button */}
          <button
            type="button"
            onClick={onBackToHome}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              padding: '2px 0',
              marginBottom: 14,
              transition: 'color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#0d2818')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#475569')}
            id="auth-back-to-home-btn"
          >
            <ArrowLeft size={15} />
            <span>Back to home</span>
          </button>

          {/* Form Header */}
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0d2818', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              {isSignup
                ? 'Register to access your landslide monitoring workspace.'
                : 'Sign in to access your landslide monitoring workspace.'}
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: 13,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#15803d',
                fontSize: 13,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= LOGIN FORM ================= */}
          {!isSignup ? (
            <form onSubmit={handleLoginSubmit}>
              {/* Email / Username field */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Email address or username
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '8px 12px',
                  }}
                >
                  <Mail size={16} style={{ color: '#64748b', marginRight: 8, flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="e.g. admin or analyst@nelrms.gov.in"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: 13.5,
                      color: '#0f172a',
                    }}
                    id="login-email-input"
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2d6a4f',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '8px 12px',
                  }}
                >
                  <Lock size={16} style={{ color: '#64748b', marginRight: 8, flexShrink: 0 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: 13.5,
                      color: '#0f172a',
                    }}
                    id="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 12.5, color: '#475569' }}>
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#0d2818', cursor: 'pointer' }}
                />
                <label htmlFor="remember-me" style={{ cursor: 'pointer' }}>
                  Remember me on this device
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#0d2818',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 9,
                  padding: '10px 18px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 3px 10px rgba(13, 40, 24, 0.2)',
                  transition: 'background 0.2s',
                  marginBottom: 14,
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#163b25')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#0d2818')}
                id="login-submit-btn"
              >
                {loading ? 'Signing in...' : 'Sign in securely'}
              </button>

              {/* Quick Fill Credentials Bar */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '9px 12px',
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                  Quick Demo Testing Credentials
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleQuickAdmin}
                    style={{
                      background: '#fef3c7',
                      border: '1px solid #f59e0b',
                      color: '#92400e',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                    id="login-quick-admin-btn"
                  >
                    👑 Fill Admin (admin / admin123)
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickAnalyst}
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      color: '#166534',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                    id="login-quick-analyst-btn"
                  >
                    🛡️ Fill Analyst
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* ================= SIGNUP FORM ================= */
            <form onSubmit={handleSignupSubmit}>
              {/* Full Name */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 3 }}>
                  Full Name
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '7px 11px',
                  }}
                >
                  <User size={15} style={{ color: '#64748b', marginRight: 8, flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="e.g. Dr. A. Sharma"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: 13,
                      color: '#0f172a',
                    }}
                    id="signup-name-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 3 }}>
                  Email Address
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '7px 11px',
                  }}
                >
                  <Mail size={15} style={{ color: '#64748b', marginRight: 8, flexShrink: 0 }} />
                  <input
                    type="email"
                    placeholder="analyst@domain.gov.in"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: 13,
                      color: '#0f172a',
                    }}
                    id="signup-email-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 3 }}>
                  Password
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '7px 11px',
                  }}
                >
                  <Lock size={15} style={{ color: '#64748b', marginRight: 8, flexShrink: 0 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: 13,
                      color: '#0f172a',
                    }}
                    id="signup-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 3 }}>
                  Confirm Password
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '7px 11px',
                  }}
                >
                  <Lock size={15} style={{ color: '#64748b', marginRight: 8, flexShrink: 0 }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: 13,
                      color: '#0f172a',
                    }}
                    id="signup-confirm-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#0d2818',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 9,
                  padding: '10px 18px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 3px 10px rgba(13, 40, 24, 0.2)',
                  transition: 'background 0.2s',
                  marginBottom: 14,
                }}
                id="signup-submit-btn"
              >
                {loading ? 'Creating account...' : 'Create secure account'}
              </button>
            </form>
          )}

          {/* Toggle between Sign In and Sign Up */}
          <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b' }}>
            {!isSignup ? (
              <span>
                New to LandslideGuard AI?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(true);
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2d6a4f',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  id="auth-switch-to-signup"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(false);
                    setError('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2d6a4f',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  id="auth-switch-to-login"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
          Secure authentication using PBKDF2-HMAC-SHA256 salted hashing.
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              maxWidth: 440,
              width: '100%',
              padding: 28,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0d2818', margin: '0 0 8px' }}>
              Reset Password
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
              Enter your registered email address to receive password reset instructions.
            </p>

            <input
              type="email"
              placeholder="analyst@nelrms.gov.in"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                marginBottom: 14,
              }}
            />

            {forgotNotice && (
              <div style={{ fontSize: 12.5, color: '#16a34a', marginBottom: 14 }}>
                {forgotNotice}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotNotice('');
                }}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setForgotNotice('Password reset link dispatched to official inbox.')}
                style={{
                  background: '#0d2818',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
