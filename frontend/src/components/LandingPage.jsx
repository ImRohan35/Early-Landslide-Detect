import React, { useState } from 'react';
import {
  CloudRain,
  Brain,
  Map as LucideMap,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  UserPlus,
  ArrowRight,
  Sun,
  Moon,
  Shield,
  Layers,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function LandingPage({
  onNavigate,
  onLoginSuccess,
  theme = 'light',
  onToggleTheme,
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('rohan.research@iitg.ac.in');
  const [password, setPassword] = useState('rohan@2026');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'login') {
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }
      if (onLoginSuccess) {
        onLoginSuccess({
          name: email.toLowerCase().includes('rohan') ? 'Rohan Singh' : email.split('@')[0],
          role: 'Student',
          email: email || 'rohan.research@iitg.ac.in',
          avatar: 'R',
        });
      } else if (onNavigate) {
        onNavigate('Map');
      }
    } else {
      // Sign Up validation
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      if (onLoginSuccess) {
        onLoginSuccess({
          name: fullName.trim(),
          role: 'Researcher',
          email: email,
          avatar: fullName.charAt(0).toUpperCase(),
        });
      } else if (onNavigate) {
        onNavigate('Map');
      }
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        backgroundImage: `linear-gradient(to right, rgba(8, 26, 18, 0.72) 0%, rgba(8, 26, 18, 0.5) 50%, rgba(8, 26, 18, 0.85) 100%), url('/hero-mountains.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 40px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      {/* Top Right Theme Toggle */}
      <div style={{ position: 'absolute', top: 24, right: 36, zIndex: 30 }}>
        <button
          onClick={onToggleTheme}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: 9999,
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <Sun size={15} color="#fcd34d" />
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ffffff' }} />
          <Moon size={15} color="#e2e8f0" />
        </button>
      </div>

      <div
        style={{
          maxWidth: 1320,
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(380px, 460px)',
          gap: 50,
          alignItems: 'center',
        }}
        className="grid-cols-1 lg:grid-cols-2"
      >
        {/* Left Column: Brand Hero & Features */}
        <div style={{ color: '#ffffff' }}>
          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BrandLogo size={32} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.28rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                LandslideGuard <span style={{ color: '#f97316' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', letterSpacing: '0.04em' }}>
                Monitor · Analyze · Stay Ahead
              </div>
            </div>
          </div>

          {/* Pill Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 9999,
              padding: '6px 16px',
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              marginBottom: 20,
              backdropFilter: 'blur(8px)',
              textTransform: 'uppercase',
              color: '#f8fafc',
            }}
          >
            AI-POWERED LANDSLIDE RISK MONITORING
          </div>

          {/* Big Hero Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              margin: '0 0 18px',
              fontFamily: "'Outfit', sans-serif",
              color: '#ffffff',
            }}
          >
            Safer Regions.
            <br />
            Stronger
            <br />
            Communities.
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.02rem',
              lineHeight: 1.6,
              color: '#e2e8f0',
              maxWidth: 580,
              margin: '0 0 32px',
            }}
          >
            LandslideGuard AI combines real-time environmental data, satellite imagery and machine learning to monitor and estimate landslide risk across the North Eastern Region of India.
          </p>

          {/* 4 Feature Cards (2x2 Grid) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 16,
              maxWidth: 560,
              marginBottom: 36,
            }}
          >
            {/* Card 1: Real-time Data */}
            <div
              style={{
                background: 'rgba(15, 35, 25, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: 16,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(249, 115, 22, 0.2)',
                  border: '1px solid rgba(249, 115, 22, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CloudRain size={20} color="#fb923c" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Real-time Data</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>Weather · Soil · Terrain</div>
              </div>
            </div>

            {/* Card 2: AI Risk Prediction */}
            <div
              style={{
                background: 'rgba(15, 35, 25, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: 16,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Brain size={20} color="#c084fc" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>AI Risk Prediction</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>Machine Learning Models</div>
              </div>
            </div>

            {/* Card 3: Interactive GIS Maps */}
            <div
              style={{
                background: 'rgba(15, 35, 25, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: 16,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LucideMap size={20} color="#34d399" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Interactive GIS Maps</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>Explore Vulnerable Areas</div>
              </div>
            </div>

            {/* Card 4: Community Safety */}
            <div
              style={{
                background: 'rgba(15, 35, 25, 0.65)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: 16,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={20} color="#60a5fa" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Community Safety</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 2 }}>Informed & Resilient Regions</div>
              </div>
            </div>
          </div>

          {/* 4 Stat Counters */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              flexWrap: 'wrap',
              marginBottom: 32,
            }}
          >
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f97316' }}>8</div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>NER States</div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>120+</div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Monitoring Locations</div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>2.3M+</div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>People in Vulnerable Areas</div>
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c084fc' }}>500+</div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Landslide Events Analysed</div>
            </div>
          </div>

          {/* Bottom Handwritten Quote */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 3.5, height: 36, background: '#f97316', borderRadius: 2 }} />
            <div
              style={{
                fontFamily: "'Caveat', 'Segoe Script', cursive, sans-serif",
                fontSize: '1.25rem',
                color: '#f8fafc',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              "Mountains are home. Let's keep them safe."
            </div>
          </div>
        </div>

        {/* Right Column: Floating Welcome Back Login Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px)',
            borderRadius: 28,
            padding: '36px 32px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            color: '#0f172a',
          }}
        >
          {/* Logo at Card Top */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
            <BrandLogo size={28} />
            <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
              LandslideGuard <span style={{ color: '#f97316' }}>AI</span>
            </span>
          </div>

          <h2
            style={{
              textAlign: 'center',
              fontSize: '1.65rem',
              fontWeight: 800,
              margin: '0 0 6px',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Welcome Back
          </h2>
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.82rem',
              color: '#64748b',
              margin: '0 0 22px',
            }}
          >
            Login to access your account and continue monitoring landslide risk.
          </p>

          {/* Segmented Toggle: Login / Sign Up */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#f1f5f9',
              padding: 4,
              borderRadius: 14,
              marginBottom: 20,
              gap: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: authMode === 'login' ? '#f97316' : 'transparent',
                color: authMode === 'login' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: authMode === 'login' ? '0 2px 8px rgba(249, 115, 22, 0.35)' : 'none',
              }}
            >
              <User size={15} />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: authMode === 'signup' ? '#f97316' : 'transparent',
                color: authMode === 'signup' ? '#ffffff' : '#64748b',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: authMode === 'signup' ? '0 2px 8px rgba(249, 115, 22, 0.35)' : 'none',
              }}
            >
              <UserPlus size={15} />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Error / Success Notices */}
          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: '0.82rem',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{errorMessage}</span>
            </div>
          )}

          {resetSent && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: '0.82rem',
                marginBottom: 12,
              }}
            >
              Password reset link sent to <b>{email}</b>.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Full Name Field (Only in Sign Up Mode) */}
            {authMode === 'signup' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <User size={17} color="#94a3b8" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                  }}
                />
              </div>
            )}

            {/* Email Field */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '12px 14px',
              }}
            >
              <Mail size={17} color="#94a3b8" />
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                }}
              />
            </div>

            {/* Password Field */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '12px 14px',
              }}
            >
              <Lock size={17} color="#94a3b8" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={authMode === 'login' ? 'Enter your password' : 'Create password (min 6 chars)'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
              </button>
            </div>

            {/* Confirm Password Field (Only in Sign Up Mode) */}
            {authMode === 'signup' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <Lock size={17} color="#94a3b8" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            )}

            {/* Remember Me & Forgot Password (In Login Mode) */}
            {authMode === 'login' ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#475569' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#f97316' }}
                  />
                  <span>Remember me</span>
                </label>

                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setResetSent(true);
                    setTimeout(() => setResetSent(false), 5000);
                  }}
                  style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}
                >
                  Forgot Password?
                </a>
              </div>
            ) : null}

            {/* Login Action Button */}
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#ffffff',
                padding: '13px',
                borderRadius: 12,
                fontSize: '0.96rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 6,
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>{authMode === 'login' ? 'Login' : 'Create Account'}</span>
              <ArrowRight size={17} strokeWidth={2.4} />
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 10,
              fontSize: '0.74rem',
              color: '#64748b',
            }}
          >
            <span>Quick fill:</span>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setEmail('rohan.research@iitg.ac.in');
                setPassword('rohan@2026');
                setErrorMessage('');
              }}
              style={{
                background: 'rgba(249, 115, 22, 0.08)',
                border: '1px solid #fed7aa',
                borderRadius: 6,
                padding: '3px 8px',
                color: '#c2410c',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            >
              Rohan Singh (Student)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setEmail('analyst@nelrms.gov.in');
                setPassword('nelrms@2026');
                setErrorMessage('');
              }}
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid #a7f3d0',
                borderRadius: 6,
                padding: '3px 8px',
                color: '#047857',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            >
              Geologist (Analyst)
            </button>
          </div>

          {/* OR Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '18px 0',
              color: '#94a3b8',
              fontSize: '0.76rem',
              fontWeight: 700,
            }}
          >
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span>OR</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Social Login Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 10px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#334155',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 10px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#334155',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#181717">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Secure Access Bottom Notice */}
          <div
            style={{
              background: '#fff7ed',
              border: '1px solid #ffedd5',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(249, 115, 22, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={17} color="#ea580c" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9a3412' }}>Secure Access</div>
              <div style={{ fontSize: '0.7rem', color: '#c2410c', lineHeight: 1.3, marginTop: 1 }}>
                Your data is protected and used only for academic and research purposes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
